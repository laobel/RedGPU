/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.21 15:32:29
 *
 */

"use strict";
import UTIL from "./util/UTIL.js"
import TypeSize from "./resources/TypeSize.js";
import ShareGLSL from "./base/ShareGLSL.js"
import PostEffect from "./postEffect/PostEffect.js";
import RedGPUContext from "./RedGPUContext.js";
import UUID from "./base/UUID.js";

export default class View extends UUID {
	get viewRect() {
		return this.#viewRect;
	}
	#redGPUContext;
	#scene;
	#camera;
	_x = 0;
	_y = 0;
	#width = '100%';
	#height = '100%';
	#viewRect = [];
	systemUniformInfo_vertex;
	systemUniformInfo_fragment;
	projectionMatrix;
	//
	baseAttachment;
	baseAttachmentView;
	baseAttachment_ResolveTarget;
	baseAttachment_ResolveTargetView;
	baseAttachment_mouseColorID;
	baseAttachment_mouseColorIDView;
	baseAttachment_mouseColorID_ResolveTarget;
	baseAttachment_mouseColorID_ResolveTargetView;
	baseDepthStencilAttachment;
	baseDepthStencilAttachmentView;
	//
	#systemUniformInfo_vertex_data;
	#systemUniformInfo_fragment_data;
	#postEffect;
	//
	mouseX = 0;
	mouseY = 0;

	constructor(redGPUContext, scene, camera) {
		super();
		this.#redGPUContext = redGPUContext;
		this.camera = camera;
		this.scene = scene;
		this.systemUniformInfo_vertex = this.#makeSystemUniformInfo_vertex(redGPUContext.device);
		this.systemUniformInfo_fragment = this.#makeSystemUniformInfo_fragment(redGPUContext.device);
		this.projectionMatrix = mat4.create();
		this.#postEffect = new PostEffect(redGPUContext);

	}

	#makeSystemUniformInfo_vertex = function (device) {
		let uniformBufferSize =
			TypeSize.mat4 + // projectionMatrix
			TypeSize.mat4 +  // camera
			TypeSize.float // time
		;
		const uniformBufferDescriptor = {
			size: uniformBufferSize,
			usage: globalThis.GPUBufferUsage.UNIFORM | globalThis.GPUBufferUsage.COPY_DST,
		};
		const bindGroupLayoutDescriptor = {
			bindings: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					type: "uniform-buffer"
				}
			]
		};
		let uniformBuffer, uniformBindGroupLayout, uniformBindGroup, bindGroupDescriptor;
		this.#systemUniformInfo_vertex_data = new Float32Array(uniformBufferSize / Float32Array.BYTES_PER_ELEMENT);
		bindGroupDescriptor = {
			layout: uniformBindGroupLayout = device.createBindGroupLayout(bindGroupLayoutDescriptor),
			bindings: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer = device.createBuffer(uniformBufferDescriptor),
						offset: 0,
						size: uniformBufferSize
					}
				}
			]
		};
		uniformBindGroup = device.createBindGroup(bindGroupDescriptor);
		return {
			GPUBuffer: uniformBuffer,
			GPUBindGroupLayout: uniformBindGroupLayout,
			GPUBindGroup: uniformBindGroup
		}
	};
	#makeSystemUniformInfo_fragment = function (device) {
		let uniformBufferSize =
			TypeSize.float4 + // directionalLightCount,pointLightCount, spotLightCount
			TypeSize.float4 * 2 * ShareGLSL.MAX_DIRECTIONAL_LIGHT + // directionalLight
			TypeSize.float4 * 3 * ShareGLSL.MAX_POINT_LIGHT + // pointLight
			TypeSize.float4 * TypeSize.float4 + // ambientLight
			TypeSize.float4 * 3 * ShareGLSL.MAX_SPOT_LIGHT + // spotLight


			TypeSize.float4 +  // cameraPosition
			TypeSize.float2 // resolution
		;
		const uniformBufferDescriptor = {
			size: uniformBufferSize,
			usage: globalThis.GPUBufferUsage.UNIFORM | globalThis.GPUBufferUsage.COPY_DST,

		};
		const bindGroupLayoutDescriptor = {
			bindings: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					type: "uniform-buffer"
				}
			]
		};
		let uniformBuffer, uniformBindGroupLayout, uniformBindGroup, bindGroupDescriptor;
		this.#systemUniformInfo_fragment_data = new Float32Array(uniformBufferSize / Float32Array.BYTES_PER_ELEMENT);
		bindGroupDescriptor = {
			layout: uniformBindGroupLayout = device.createBindGroupLayout(bindGroupLayoutDescriptor),
			bindings: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer = device.createBuffer(uniformBufferDescriptor),
						offset: 0,
						size: uniformBufferSize
					}
				}
			]
		};
		uniformBindGroup = device.createBindGroup(bindGroupDescriptor);
		return {
			GPUBuffer: uniformBuffer,
			GPUBindGroupLayout: uniformBindGroupLayout,
			GPUBindGroup: uniformBindGroup
		}
	};
	resetTexture(redGPUContext) {
		this.#viewRect = this.getViewRect(redGPUContext);
		let list = ['baseAttachment', 'baseAttachment_depthColor', 'baseAttachment_mouseColorID'];
		let sizeInfo = {width: this.#viewRect[2], height: this.#viewRect[3], depth: 1};
		let usage = GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.SAMPLED;
		if (this.baseAttachment) {
			list.forEach(key => {
				this[key].destroy()
				this[key + '_ResolveTarget'].destroy()
			})
			this.baseDepthStencilAttachment.destroy();
		}
		list.forEach(key => {
			this[key] = redGPUContext.device.createTexture({
				size: sizeInfo, sampleCount: 4,
				format: redGPUContext.swapChainFormat,
				usage: usage
			});
			this[key + 'View'] = this[key].createView();
			this[key + '_ResolveTarget'] = redGPUContext.device.createTexture({
				size: sizeInfo, sampleCount: 1,
				format: redGPUContext.swapChainFormat,
				usage: usage
			});
			this[key + '_ResolveTargetView'] = this[key + '_ResolveTarget'].createView();
		});
		this.baseDepthStencilAttachment = redGPUContext.device.createTexture({
			size: sizeInfo, sampleCount: 4,
			format: "depth24plus-stencil8",
			usage: usage
		});
		this.baseDepthStencilAttachmentView = this.baseDepthStencilAttachment.createView();

	}
	updateSystemUniform(passEncoder, redGPUContext) {
		//TODO 여기도 오프셋 자동으로 계산하게 변경해야함
		let systemUniformInfo_vertex, systemUniformInfo_fragment, aspect, offset;
		let i, len;
		systemUniformInfo_vertex = this.systemUniformInfo_vertex;
		systemUniformInfo_fragment = this.systemUniformInfo_fragment;
		this.#viewRect = this.getViewRect(redGPUContext);
		passEncoder.setViewport(0, 0, this.#viewRect[2], this.#viewRect[3], 0, 1);
		passEncoder.setScissorRect(0, 0, this.#viewRect[2], this.#viewRect[3]);
		passEncoder.setBindGroup(0, systemUniformInfo_vertex.GPUBindGroup);
		passEncoder.setBindGroup(1, systemUniformInfo_fragment.GPUBindGroup);
		// update systemUniformInfo_vertex /////////////////////////////////////////////////////////////////////////////////////////////////
		offset = 0;
		aspect = Math.abs(this.#viewRect[2] / this.#viewRect[3]);
		mat4.perspective(this.projectionMatrix, (Math.PI / 180) * this.camera.fov, aspect, this.camera.nearClipping, this.camera.farClipping);
		this.#systemUniformInfo_vertex_data.set(this.projectionMatrix, offset);
		offset += TypeSize.mat4 / Float32Array.BYTES_PER_ELEMENT;
		this.#systemUniformInfo_vertex_data.set(this.camera.matrix, offset);
		offset += TypeSize.mat4 / Float32Array.BYTES_PER_ELEMENT;
		this.#systemUniformInfo_vertex_data.set([performance.now()], offset);
		offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
		// update GPUBuffer
		systemUniformInfo_vertex.GPUBuffer.setSubData(0, this.#systemUniformInfo_vertex_data);
		// update systemUniformInfo_fragment /////////////////////////////////////////////////////////////////////////////////////////////////
		offset = 0;
		// update light count
		this.#systemUniformInfo_fragment_data.set([this.scene.directionalLightList.length, this.scene.pointLightList.length, this.scene.spotLightList.length], offset);
		i = 0;
		// update directionalLightList
		offset = TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
		len = this.scene.directionalLightList.length;
		for (i; i < len; i++) {
			let tLight = this.scene.directionalLightList[i];
			if (tLight) {
				this.#systemUniformInfo_fragment_data.set(tLight.colorRGBA, offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
				this.#systemUniformInfo_fragment_data.set([tLight.x, tLight.y, tLight.z, tLight.intensity], offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
			}
		}
		// update pointLightList
		offset = (TypeSize.float4 + TypeSize.float4 * 2 * ShareGLSL.MAX_DIRECTIONAL_LIGHT) / Float32Array.BYTES_PER_ELEMENT;
		i = 0;
		len = this.scene.pointLightList.length;
		for (i; i < len; i++) {
			let tLight = this.scene.pointLightList[i];
			if (tLight) {
				this.#systemUniformInfo_fragment_data.set(tLight.colorRGBA, offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
				this.#systemUniformInfo_fragment_data.set([tLight.x, tLight.y, tLight.z, tLight.intensity], offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
				this.#systemUniformInfo_fragment_data.set([tLight.radius], offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
			}
		}
		offset = (TypeSize.float4 + TypeSize.float4 * 2 * ShareGLSL.MAX_DIRECTIONAL_LIGHT + TypeSize.float4 * 3 * ShareGLSL.MAX_POINT_LIGHT) / Float32Array.BYTES_PER_ELEMENT;
		// update ambientLight
		let tLight = this.scene.ambientLight;
		this.#systemUniformInfo_fragment_data.set(tLight ? tLight.colorRGBA : [0, 0, 0, 0], offset);
		offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
		this.#systemUniformInfo_fragment_data.set([tLight ? tLight.intensity : 1], offset);
		offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
		// update spotLightList
		i = 0;
		len = this.scene.spotLightList.length;
		for (i; i < len; i++) {
			let tLight = this.scene.spotLightList[i];
			if (tLight) {
				this.#systemUniformInfo_fragment_data.set(tLight.colorRGBA, offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
				this.#systemUniformInfo_fragment_data.set([tLight.x, tLight.y, tLight.z, tLight.intensity], offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
				this.#systemUniformInfo_fragment_data.set([tLight.cutoff, tLight.exponent], offset);
				offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
			}
		}
		offset = (TypeSize.float4 + TypeSize.float4 * 2 * ShareGLSL.MAX_DIRECTIONAL_LIGHT + TypeSize.float4 * 3 * ShareGLSL.MAX_POINT_LIGHT + TypeSize.float4 * 3 * ShareGLSL.MAX_SPOT_LIGHT + TypeSize.float4 * 2) / Float32Array.BYTES_PER_ELEMENT;
		// update camera position
		this.#systemUniformInfo_fragment_data.set([this.camera.x, this.camera.y, this.camera.z], offset);
		offset += TypeSize.float4 / Float32Array.BYTES_PER_ELEMENT;
		// update resolution
		this.#systemUniformInfo_fragment_data.set([this.#viewRect[2], this.#viewRect[3]], offset);
		// update GPUBuffer
		// console.log(this.#systemUniformInfo_fragment_data)
		systemUniformInfo_fragment.GPUBuffer.setSubData(0, this.#systemUniformInfo_fragment_data);
	}
	get postEffect() {
		return this.#postEffect;
	}
	get scene() {
		return this.#scene;
	}

	set scene(value) {
		this.#scene = value;
	}

	get camera() {
		return this.#camera;
	}

	set camera(value) {
		this.#camera = value;
	}

	get y() {
		return this._y;
	}

	get x() {
		return this._x;
	}

	get width() {
		return this.#width;
	}

	get height() {
		return this.#height;
	}

	getViewRect(redGPUContext) {
		return [
			typeof this.x == 'number' ? this.x : parseInt(this.x) / 100 * redGPUContext.canvas.width,
			typeof this.y == 'number' ? this.y : parseInt(this.y) / 100 * redGPUContext.canvas.height,
			typeof this.width == 'number' ? this.width : parseInt(parseInt(this.width) / 100 * redGPUContext.canvas.width),
			typeof this.height == 'number' ? this.height : parseInt(parseInt(this.height) / 100 * redGPUContext.canvas.height)
		]
	}

	setSize(width = this.#width, height = this.#height) {
		if (typeof width == 'number') this.#width = width < 0 ? 0 : parseInt(width);
		else {
			if (width.includes('%') && (+width.replace('%', '') >= 0)) this.#width = width;
			else UTIL.throwFunc('View setSize : width는 0이상의 숫자나 %만 허용.', width);
		}
		if (typeof height == 'number') this.#height = height < 0 ? 0 : parseInt(height);
		else {
			if (height.includes('%') && (+height.replace('%', '') >= 0)) this.#height = height;
			else UTIL.throwFunc('View setSize : height는 0이상의 숫자나 %만 허용.', height);
		}
		if (RedGPUContext.useDebugConsole) console.log(`setSize - input : ${width},${height} / result : ${this.#width}, ${this.#height}`);
		this.getViewRect(this.#redGPUContext);
		this.resetTexture(this.#redGPUContext)
	}

	setLocation(x = this._x, y = this._y) {
		if (typeof x == 'number') this._x = x < 0 ? 0 : parseInt(x);
		else {
			if (x.includes('%') && (+x.replace('%', '') >= 0)) this._x = x;
			else UTIL.throwFunc('View setLocation : x는 0이상의 숫자나 %만 허용.', x);
		}
		if (typeof y == 'number') this._y = y < 0 ? 0 : parseInt(y);
		else {
			if (y.includes('%') && (+y.replace('%', '') >= 0)) this._y = y;
			else UTIL.throwFunc('View setLocation : y는 0이상의 숫자나 %만 허용.', y);
		}
		if (RedGPUContext.useDebugConsole) console.log(`setLocation - input : ${x},${y} / result : ${this._x}, ${this._y}`);
		this.getViewRect(this.#redGPUContext)
	}

}