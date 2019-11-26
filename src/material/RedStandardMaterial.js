"use strict";
import RedTypeSize from "../resources/RedTypeSize.js";
import RedBaseMaterial from "../base/RedBaseMaterial.js";
import RedUUID from "../base/RedUUID.js";
import RedShareGLSL from "../base/RedShareGLSL.js";
import RedUniformBufferDescriptor from "../buffer/RedUniformBufferDescriptor.js";
import RedUtil from "../util/RedUtil.js";

export default class RedStandardMaterial extends RedBaseMaterial {


	static vertexShaderGLSL = `
	#version 450
    ${RedShareGLSL.GLSL_SystemUniforms_vertex.systemUniforms}
    layout(set = 2,binding = 0) uniform Uniforms {
        mat4 modelMTX;
        mat4 normalMTX;
        float displacementFlowSpeedX;
        float displacementFlowSpeedY;
        float displacementPower;
    } uniforms;
         
	layout(location = 0) in vec3 position;
	layout(location = 1) in vec3 normal;
	layout(location = 2) in vec2 uv;
	layout(location = 0) out vec3 vNormal;
	layout(location = 1) out vec2 vUV;
	layout(location = 2) out vec4 vVertexPosition;	
	layout(set = 2, binding = 2) uniform sampler uSampler;
	//#RedGPU#displacementTexture# layout(set = 2, binding = 6) uniform texture2D uDisplacementTexture;
	void main() {
		
		vVertexPosition = uniforms.modelMTX * vec4(position, 1.0);
		vNormal = (uniforms.normalMTX * vec4(normal,1.0)).xyz;
		

		
		//#RedGPU#displacementTexture# vVertexPosition.xyz += normalize(vNormal) * texture(sampler2D(uDisplacementTexture, uSampler), uv + vec2(
		//#RedGPU#displacementTexture#    uniforms.displacementFlowSpeedX * (systemUniforms.time/1000.0),
		//#RedGPU#displacementTexture#    uniforms.displacementFlowSpeedY * (systemUniforms.time/1000.0)
		//#RedGPU#displacementTexture# )).x * uniforms.displacementPower ;
	
	
		gl_Position = systemUniforms.perspectiveMTX * systemUniforms.cameraMTX * vVertexPosition;
	
		vUV = uv;
	}
	`;
	static fragmentShaderGLSL = `
	#version 450
	${RedShareGLSL.GLSL_SystemUniforms_fragment.systemUniformsWithLight}
	layout(set=2,binding = 1) uniform Uniforms {
        float normalPower;
        float shininess; 
        float specularPower;
	    vec4 specularColor;
    } uniforms;

	layout(location = 0) in vec3 vNormal;
	layout(location = 1) in vec2 vUV;
	layout(location = 2) in vec4 vVertexPosition;
	layout(set = 2, binding = 3) uniform sampler uSampler;
	//#RedGPU#diffuseTexture# layout(set = 2, binding = 4) uniform texture2D uDiffuseTexture;
	//#RedGPU#normalTexture# layout(set = 2, binding = 5) uniform texture2D uNormalTexture;
	layout(location = 0) out vec4 outColor;
		
	${RedShareGLSL.GLSL_SystemUniforms_fragment.cotangent_frame}
	${RedShareGLSL.GLSL_SystemUniforms_fragment.perturb_normal}
	
	void main() {
		vec4 diffuseColor = vec4(0.0);
		//#RedGPU#diffuseTexture# diffuseColor = texture(sampler2D(uDiffuseTexture, uSampler), vUV) ;
		
	    vec3 N = normalize(vNormal);
		vec4 normalColor = vec4(0.0);
		//#RedGPU#normalTexture# normalColor = texture(sampler2D(uNormalTexture, uSampler), vUV) ;
		//#RedGPU#normalTexture# N = perturb_normal(N, vVertexPosition.xyz, vUV, normalColor.rgb, uniforms.normalPower) ;

		vec4 ld = vec4(0.0, 0.0, 0.0, 1.0);
		vec4 la = vec4(0.0, 0.0, 0.0, 0.2);
		vec4 ls = vec4(0.0, 0.0, 0.0, 1.0);
		
		vec4 calcColor = calcDirectionalLight(
			diffuseColor,
			N,
			ld,
			ls,
			systemUniforms.directionalLightCount,
			systemUniforms.directionalLight,
			uniforms.shininess,
			uniforms.specularPower,
			uniforms.specularColor
		);
		    
	
	    vec4 finalColor = la + calcColor;
		
		outColor = finalColor;
	}
`;
	static PROGRAM_OPTION_LIST = ['diffuseTexture', 'normalTexture', 'displacementTexture'];
	static uniformsBindGroupLayoutDescriptor = {
		bindings: [
			{
				binding: 0,
				visibility: GPUShaderStage.VERTEX,
				type: "uniform-buffer"
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				type: "uniform-buffer"
			},
			{
				binding: 2,
				visibility: GPUShaderStage.VERTEX,
				type: "sampler"
			},
			{
				binding: 3,
				visibility: GPUShaderStage.FRAGMENT,
				type: "sampler"
			},
			{
				binding: 4,
				visibility: GPUShaderStage.FRAGMENT,
				type: "sampled-texture"
			},
			{
				binding: 5,
				visibility: GPUShaderStage.FRAGMENT,
				type: "sampled-texture"
			},
			{
				binding: 6,
				visibility: GPUShaderStage.VERTEX,
				type: "sampled-texture"
			}
		]
	};
	static uniformBufferDescriptor_vertex = new RedUniformBufferDescriptor(
		[
			{size: RedTypeSize.mat4, valueName: 'matrix'},
			{size: RedTypeSize.mat4, valueName: 'normalMatrix'},
			{
				size: RedTypeSize.float,
				valueName: 'displacementFlowSpeedX',
				targetKey: 'material'
			},
			{
				size: RedTypeSize.float,
				valueName: 'displacementFlowSpeedY',
				targetKey: 'material'
			},
			{
				size: RedTypeSize.float,
				valueName: 'displacementPower',
				targetKey: 'material'
			}
		]
	);
	static uniformBufferDescriptor_fragment = new RedUniformBufferDescriptor(
		[
			{size: RedTypeSize.float, valueName: 'normalPower', targetKey: 'material'},
			{size: RedTypeSize.float, valueName: 'shininess', targetKey: 'material'},
			{size: RedTypeSize.float, valueName: 'specularPower', targetKey: 'material'},
			{
				size: RedTypeSize.float4,
				valueName: 'specularColorRGBA',
				targetKey: 'material'
			}

		]
	);
	// 	{
	// 	size: RedTypeSize.float4 * 2,
	// 	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	// 	redStruct: [
	// 		{offset: 0, valueName: 'shininess', targetKey: 'material'},
	// 		{offset: RedTypeSize.float, valueName: 'specularPower', targetKey: 'material'},
	// 		{
	// 			offset: RedTypeSize.float4,
	// 			valueName: 'specularColor',
	// 			targetKey: 'material'
	// 		},
	// 	]
	// };


	#diffuseTexture;
	#normalTexture;
	#displacementTexture;

	#normalPower = 1;
	#shininess = 64;
	#specularPower = 1;
	#specularColor = '#ffffff';
	#specularColorRGBA = new Float32Array([1, 1, 1, 1]);
	#displacementFlowSpeedX = 0.0;
	#displacementFlowSpeedY = 0.0;
	#displacementPower = 0.1;

	constructor(redGPU, diffuseTexture, normalTexture, displacementTexture) {
		super(redGPU);
		console.log(diffuseTexture, normalTexture);
		this.diffuseTexture = diffuseTexture;
		this.normalTexture = normalTexture;
		this.displacementTexture = displacementTexture
	}

	checkTexture(texture, textureName) {
		this.bindings = null;
		if (texture) {
			if (texture.GPUTexture) {
				switch (textureName) {
					case 'diffuseTexture' :
						this.#diffuseTexture = texture;
						break;
					case 'normalTexture' :
						this.#normalTexture = texture;
						break;
					case 'displacementTexture' :
						this.#displacementTexture = texture;
						break
				}
				console.log(textureName, texture.GPUTexture);
				this.resetBindingInfo()
			} else {
				texture.addUpdateTarget(this, textureName)
			}

		} else {
			this.resetBindingInfo()
		}
	}

	set diffuseTexture(texture) {
		this.#diffuseTexture = null;
		this.checkTexture(texture, 'diffuseTexture')
	}

	get diffuseTexture() {
		return this.#diffuseTexture
	}

	set normalTexture(texture) {
		this.#normalTexture = null;
		this.checkTexture(texture, 'normalTexture')
	}

	get normalTexture() {
		return this.#normalTexture
	}

	set displacementTexture(texture) {
		this.#displacementTexture = null;
		this.checkTexture(texture, 'displacementTexture')
	}

	get displacementTexture() {
		return this.#displacementTexture
	}


	get displacementFlowSpeedY() {
		return this.#displacementFlowSpeedY;
	}

	set displacementFlowSpeedY(value) {
		this.#displacementFlowSpeedY = value;
	}

	get displacementFlowSpeedX() {
		return this.#displacementFlowSpeedX;
	}

	set displacementFlowSpeedX(value) {
		this.#displacementFlowSpeedX = value;
	}

	get displacementPower() {
		return this.#displacementPower;
	}

	set displacementPower(value) {
		this.#displacementPower = value;
	}

	get normalPower() {
		return this.#normalPower;
	}

	set normalPower(value) {
		this.#normalPower = value;
	}

	get specularColorRGBA() {
		return this.#specularColorRGBA;
	}

	get specularColor() {
		return this.#specularColor;
	}

	set specularColor(value) {
		this.#specularColor = hex;
		let rgb = RedUtil.hexToRGB_ZeroToOne(value);
		this.#specularColorRGBA[0] = rgb[0];
		this.#specularColorRGBA[1] = rgb[1];
		this.#specularColorRGBA[2] = rgb[2];
		this.#specularColorRGBA[3] = 1;
	}

	get specularPower() {
		return this.#specularPower;
	}

	set specularPower(value) {
		this.#specularPower = value;
	}

	get shininess() {
		return this.#shininess;
	}

	set shininess(value) {
		this.#shininess = value;
	}

	resetBindingInfo() {
		this.bindings = null;
		this.searchModules();
		this.bindings = [
			{
				binding: 0,
				resource: {
					buffer: null,
					offset: 0,
					size: this.uniformBufferDescriptor_vertex.size
				}
			},
			{
				binding: 1,
				resource: {
					buffer: null,
					offset: 0,
					size: this.uniformBufferDescriptor_fragment.size
				}
			},
			{
				binding: 2,
				resource: this.sampler.GPUSampler,
			},
			{
				binding: 3,
				resource: this.sampler.GPUSampler,
			},
			{
				binding: 4,
				resource: this.#diffuseTexture ? this.#diffuseTexture.GPUTextureView : this.redGPU.state.emptyTextureView,
			},
			{
				binding: 5,
				resource: this.#normalTexture ? this.#normalTexture.GPUTextureView : this.redGPU.state.emptyTextureView,
			},
			{
				binding: 6,
				resource: this.#displacementTexture ? this.#displacementTexture.GPUTextureView : this.redGPU.state.emptyTextureView,
			}
		];
		this.setUniformBindGroupDescriptor();
		this._UUID = RedUUID.makeUUID()
	}
}