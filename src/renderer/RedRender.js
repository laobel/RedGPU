/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.11.30 16:32:22
 *
 */
let renderScene = (redGPU, redView, passEncoder, parent, children, parentDirty) => {
	let i;

	let tGeometry;
	let tMaterial;
	let tMesh;
	let tDirtyTransform, tDirtyPipeline;
	let tMaterialChanged;
	let tPipeline;
	let prevPipeline_UUID;
	let prevVertexBuffer_UUID;
	let prevIndexBuffer_UUID;
	let prevMaterial_UUID;
	let tMVMatrix, tNMatrix;
	let tLocalMatrix;
	let parentMTX;
	let aSx, aSy, aSz, aCx, aCy, aCz, aX, aY, aZ,
		a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33,
		b0, b1, b2, b3,
		b00, b01, b02, b10, b11, b12, b20, b21, b22;
	// sin,cos 관련
	let tRadian, CPI, CPI2, C225, C127, C045, C157;
	let CONVERT_RADIAN = Math.PI / 180;
	CPI = 3.141592653589793, CPI2 = 6.283185307179586, C225 = 0.225, C127 = 1.27323954, C045 = 0.405284735, C157 = 1.5707963267948966;
	i = children.length;
	while (i--) {
		tMesh = children[i];
		tMaterial = tMesh._material;
		tGeometry = tMesh._geometry;
		tDirtyTransform = tMesh.dirtyTransform;
		tDirtyPipeline = tMesh.dirtyPipeline;
		tPipeline = tMesh.pipeline;

		tMaterialChanged = tMesh._prevMaterialUUID != tMaterial._UUID;
		if (tDirtyPipeline || tMaterialChanged) {
			tPipeline.updatePipeline(redGPU, redView);
			// const renderBundleEncoder = redGPU.device.createRenderBundleEncoder({
			// 	colorFormats: [redGPU.swapChainFormat],
			// 	depthStencilFormat :["depth24plus-stencil8"],
			// 	sampleCount:4
			// });
			// renderBundleEncoder.setPipeline(tPipeline.GPURenderPipeline);
			// renderBundleEncoder.setVertexBuffer(0, tGeometry.interleaveBuffer.GPUBuffer);
			// if(tGeometry.indexBuffer) renderBundleEncoder.setIndexBuffer(tGeometry.indexBuffer.GPUBuffer);
			// renderBundleEncoder.setBindGroup(0, redView.systemUniformInfo_vertex.GPUBindGroup);
			// renderBundleEncoder.setBindGroup(1, redView.systemUniformInfo_fragment.GPUBindGroup);
			// renderBundleEncoder.setBindGroup(2, tMesh.GPUBindGroup); // 메쉬 바인딩 그룹
			// renderBundleEncoder.setBindGroup(3, tMaterial.uniformBindGroup_material.GPUBindGroup); // 젲;ㄹ 빙;ㄴㄷ;ㅇ ㄱ,릅
			// if (tGeometry.indexBuffer) renderBundleEncoder.drawIndexed(tGeometry.indexBuffer.indexNum, 1, 0, 0, 0);
			// else renderBundleEncoder.draw(tGeometry.interleaveBuffer.vertexCount, 1, 0, 0, 0);
			//
			// const renderBundle = renderBundleEncoder.finish();
			// tMesh.renderBundle = renderBundle
		}

		// passEncoder.executeBundles([tMesh.renderBundle]);
		if (prevPipeline_UUID != tPipeline._UUID) {
			passEncoder.setPipeline(tPipeline.GPURenderPipeline);
			prevPipeline_UUID = tPipeline._UUID
		}
		if (prevVertexBuffer_UUID != tGeometry.interleaveBuffer._UUID) {
			passEncoder.setVertexBuffer(0, tGeometry.interleaveBuffer.GPUBuffer);
			prevVertexBuffer_UUID = tGeometry.interleaveBuffer._UUID
		}
		if (tGeometry.indexBuffer && prevIndexBuffer_UUID != tGeometry.indexBuffer._UUID) {
			passEncoder.setIndexBuffer(tGeometry.indexBuffer.GPUBuffer);
			prevIndexBuffer_UUID = tGeometry.indexBuffer._UUID
		}
		passEncoder.setBindGroup(2, tMesh.GPUBindGroup); // 메쉬 바인딩 그룹는 매그룹마다 다르니 또 업데이트 해줘야함 -_-
		passEncoder.setBindGroup(3, tMaterial.uniformBindGroup_material.GPUBindGroup);
		if (tGeometry.indexBuffer) passEncoder.drawIndexed(tGeometry.indexBuffer.indexNum, 1, 0, 0, 0);
		else passEncoder.draw(tGeometry.interleaveBuffer.vertexCount, 1, 0, 0, 0);

		// materialPropertyCheck
		////////////////////////


		prevMaterial_UUID = tMesh._prevMaterialUUID = tMaterial._UUID;
		if (tMesh.children.length) renderScene(redGPU, passEncoder, tMesh, tMesh.children, parentDirty || tDirtyTransform);
		if (tDirtyTransform || parentDirty) {
			// TODO 매트릭스 계산부분을 여기로 나중에 다들고 오는게 성능에 좋음...

			tMVMatrix = tMesh.matrix;
			tLocalMatrix = tMesh.localMatrix;
			parentMTX = parent ? parent.matrix : null;

			/////////////////////////////////////
			a00 = 1, a01 = 0, a02 = 0,
				a10 = 0, a11 = 1, a12 = 0,
				a20 = 0, a21 = 0, a22 = 1,
				// tLocalMatrix translate
				tLocalMatrix[12] = tMesh._x ,
				tLocalMatrix[13] = tMesh._y,
				tLocalMatrix[14] = tMesh._z,
				tLocalMatrix[15] = 1,
				// tLocalMatrix rotate
				aX = tMesh._rotationX * CONVERT_RADIAN, aY = tMesh._rotationY * CONVERT_RADIAN, aZ = tMesh._rotationZ * CONVERT_RADIAN;
			/////////////////////////
			tRadian = aX % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aSx = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				tRadian = (aX + C157) % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aCx = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				tRadian = aY % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aSy = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				tRadian = (aY + C157) % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aCy = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				tRadian = aZ % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aSz = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				tRadian = (aZ + C157) % CPI2,
				tRadian < -CPI ? tRadian = tRadian + CPI2 : tRadian > CPI ? tRadian = tRadian - CPI2 : 0,
				tRadian = tRadian < 0 ? C127 * tRadian + C045 * tRadian * tRadian : C127 * tRadian - C045 * tRadian * tRadian,
				aCz = tRadian < 0 ? C225 * (tRadian * -tRadian - tRadian) + tRadian : C225 * (tRadian * tRadian - tRadian) + tRadian,
				/////////////////////////
				b00 = aCy * aCz, b01 = aSx * aSy * aCz - aCx * aSz, b02 = aCx * aSy * aCz + aSx * aSz,
				b10 = aCy * aSz, b11 = aSx * aSy * aSz + aCx * aCz, b12 = aCx * aSy * aSz - aSx * aCz,
				b20 = -aSy, b21 = aSx * aCy, b22 = aCx * aCy,
				// tLocalMatrix scale
				aX = tMesh._scaleX, aY = tMesh._scaleY , aZ = tMesh._scaleZ,
				tLocalMatrix[0] = (a00 * b00 + a10 * b01 + a20 * b02) * aX,
				tLocalMatrix[1] = (a01 * b00 + a11 * b01 + a21 * b02) * aX,
				tLocalMatrix[2] = (a02 * b00 + a12 * b01 + a22 * b02) * aX,
				tLocalMatrix[3] = tLocalMatrix[3] * aX,
				tLocalMatrix[4] = (a00 * b10 + a10 * b11 + a20 * b12) * aY,
				tLocalMatrix[5] = (a01 * b10 + a11 * b11 + a21 * b12) * aY,
				tLocalMatrix[6] = (a02 * b10 + a12 * b11 + a22 * b12) * aY,
				tLocalMatrix[7] = tLocalMatrix[7] * aY,
				tLocalMatrix[8] = (a00 * b20 + a10 * b21 + a20 * b22) * aZ,
				tLocalMatrix[9] = (a01 * b20 + a11 * b21 + a21 * b22) * aZ,
				tLocalMatrix[10] = (a02 * b20 + a12 * b21 + a22 * b22) * aZ,
				tLocalMatrix[11] = tLocalMatrix[11] * aZ;

			// 부모가 있으면 곱처리함

			parentMTX ?
				(
					// 부모매트릭스 복사
					// 매트립스 곱
					a00 = parentMTX[0], a01 = parentMTX[1], a02 = parentMTX[2], a03 = parentMTX[3],
						a10 = parentMTX[4], a11 = parentMTX[5], a12 = parentMTX[6], a13 = parentMTX[7],
						a20 = parentMTX[8], a21 = parentMTX[9], a22 = parentMTX[10], a23 = parentMTX[11],
						a30 = parentMTX[12], a31 = parentMTX[13], a32 = parentMTX[14], a33 = parentMTX[15],
						b0 = tLocalMatrix[0], b1 = tLocalMatrix[1], b2 = tLocalMatrix[2], b3 = tLocalMatrix[3],
						tMVMatrix[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
						tMVMatrix[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
						tMVMatrix[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
						tMVMatrix[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
						b0 = tLocalMatrix[4], b1 = tLocalMatrix[5], b2 = tLocalMatrix[6], b3 = tLocalMatrix[7],
						tMVMatrix[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
						tMVMatrix[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
						tMVMatrix[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
						tMVMatrix[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
						b0 = tLocalMatrix[8], b1 = tLocalMatrix[9], b2 = tLocalMatrix[10], b3 = tLocalMatrix[11],
						tMVMatrix[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
						tMVMatrix[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
						tMVMatrix[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
						tMVMatrix[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
						b0 = tLocalMatrix[12], b1 = tLocalMatrix[13], b2 = tLocalMatrix[14], b3 = tLocalMatrix[15],
						tMVMatrix[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30,
						tMVMatrix[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31,
						tMVMatrix[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32,
						tMVMatrix[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
				)
				: (
					tMVMatrix[0] = tLocalMatrix[0], tMVMatrix[1] = tLocalMatrix[1], tMVMatrix[2] = tLocalMatrix[2], tMVMatrix[3] = tLocalMatrix[3],
						tMVMatrix[4] = tLocalMatrix[4], tMVMatrix[5] = tLocalMatrix[5], tMVMatrix[6] = tLocalMatrix[6], tMVMatrix[7] = tLocalMatrix[7],
						tMVMatrix[8] = tLocalMatrix[8], tMVMatrix[9] = tLocalMatrix[9] , tMVMatrix[10] = tLocalMatrix[10], tMVMatrix[11] = tLocalMatrix[11],
						tMVMatrix[12] = tLocalMatrix[12], tMVMatrix[13] = tLocalMatrix[13], tMVMatrix[14] = tLocalMatrix[14], tMVMatrix[15] = tLocalMatrix[15]
				);
			// normal calc

			tNMatrix = tMesh.normalMatrix;
			a00 = tMVMatrix[0], a01 = tMVMatrix[1], a02 = tMVMatrix[2], a03 = tMVMatrix[3],
				a10 = tMVMatrix[4], a11 = tMVMatrix[5], a12 = tMVMatrix[6], a13 = tMVMatrix[7],
				a20 = tMVMatrix[8], a21 = tMVMatrix[9], a22 = tMVMatrix[10], a23 = tMVMatrix[11],
				a31 = tMVMatrix[12], a32 = tMVMatrix[13], a33 = tMVMatrix[14], b0 = tMVMatrix[15],
				a30 = a00 * a11 - a01 * a10,
				b1 = a00 * a12 - a02 * a10, b2 = a00 * a13 - a03 * a10, b3 = a01 * a12 - a02 * a11,
				b00 = a01 * a13 - a03 * a11, b01 = a02 * a13 - a03 * a12, b02 = a20 * a32 - a21 * a31,
				b10 = a20 * a33 - a22 * a31, b11 = a20 * b0 - a23 * a31, b12 = a21 * a33 - a22 * a32,
				b20 = a21 * b0 - a23 * a32, b12 = a22 * b0 - a23 * a33, b22 = a30 * b12 - b1 * b20 + b2 * b12 + b3 * b11 - b00 * b10 + b01 * b02,
				b22 = 1 / b22,

				tNMatrix[0] = (a11 * b12 - a12 * b20 + a13 * b12) * b22,
				tNMatrix[4] = (-a01 * b12 + a02 * b20 - a03 * b12) * b22,
				tNMatrix[8] = (a32 * b01 - a33 * b00 + b0 * b3) * b22,
				tNMatrix[12] = (-a21 * b01 + a22 * b00 - a23 * b3) * b22,
				tNMatrix[1] = (-a10 * b12 + a12 * b11 - a13 * b10) * b22,
				tNMatrix[5] = (a00 * b12 - a02 * b11 + a03 * b10) * b22,
				tNMatrix[9] = (-a31 * b01 + a33 * b2 - b0 * b1) * b22,
				tNMatrix[13] = (a20 * b01 - a22 * b2 + a23 * b1) * b22,
				tNMatrix[2] = (a10 * b20 - a11 * b11 + a13 * b02) * b22,
				tNMatrix[6] = (-a00 * b20 + a01 * b11 - a03 * b02) * b22,
				tNMatrix[10] = (a31 * b00 - a32 * b2 + b0 * a30) * b22,
				tNMatrix[14] = (-a20 * b00 + a21 * b2 - a23 * a30) * b22,
				tNMatrix[3] = (-a10 * b12 + a11 * b10 - a12 * b02) * b22,
				tNMatrix[7] = (a00 * b12 - a01 * b10 + a02 * b02) * b22,
				tNMatrix[11] = (-a31 * b3 + a32 * b1 - a33 * a30) * b22,
				tNMatrix[15] = (a20 * b3 - a21 * b1 + a22 * a30) * b22,
				// tMesh.calcTransform(parent);
				// tMesh.updateUniformBuffer();
				tMesh.uniformBuffer_mesh.GPUBuffer.setSubData(0, tMesh.matrix);
			tMesh.uniformBuffer_mesh.GPUBuffer.setSubData(64, tMesh.normalMatrix);
		}
		tMesh.dirtyPipeline = false;
		tMesh.dirtyTransform = false;
	}
};
export default class RedRender {
	#redGPU;
	#swapChainTexture;
	#swapChainTextureView;
	#renderView = (redGPU, redView) => {
		let tScene, tSceneBackgroundColor_rgba;
		tScene = redView.scene;
		tSceneBackgroundColor_rgba = tScene.backgroundColorRGBA;
		redView.camera.update();
		// console.log(swapChain.getCurrentTexture())
		if (!redView.baseAttachmentView) {
			redView.resetTexture(redGPU)
		}

		const renderPassDescriptor = {
			colorAttachments: [{
				attachment: redView.baseAttachmentView,
				resolveTarget: redView.baseResolveTargetView,
				loadValue: {
					r: tSceneBackgroundColor_rgba[0],
					g: tSceneBackgroundColor_rgba[1],
					b: tSceneBackgroundColor_rgba[2],
					a: tSceneBackgroundColor_rgba[3]
				}
			}],
			depthStencilAttachment: {
				attachment: redView.baseDepthStencilAttachmentView,
				depthLoadValue: 1.0,
				depthStoreOp: "store",
				stencilLoadValue: 0,
				stencilStoreOp: "store",
			}
		};
		const commandEncoder = this.#redGPU.device.createCommandEncoder();
		const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

		// 시스템 유니폼 업데이트
		redView.updateSystemUniform(passEncoder, redGPU);
		if (tScene.skyBox) {
			tScene.skyBox['scaleX'] = tScene.skyBox['scaleY'] = tScene.skyBox['scaleZ'] = redView.camera['farClipping'] * 0.6;
			renderScene(redGPU, redView, passEncoder, null, [tScene.skyBox]);
		}
		if (tScene.grid) renderScene(redGPU, redView, passEncoder, null, [tScene.grid]);
		renderScene(redGPU, redView, passEncoder, null, tScene.children);
		passEncoder.endPass();
		let tX = redView.viewRect[0];
		let tY = redView.viewRect[1];
		let tW = redView.viewRect[2] + redView.viewRect[0] > this.#redGPU.canvas.width ? redView.viewRect[2] - redView.viewRect[0] : redView.viewRect[2];
		let tH = redView.viewRect[3] + redView.viewRect[1] > this.#redGPU.canvas.height ? redView.viewRect[3] - redView.viewRect[1] : redView.viewRect[3];
		if (tW > this.#redGPU.canvas.width) tW = this.#redGPU.canvas.width - tX;
		if (tH > this.#redGPU.canvas.height) tH = this.#redGPU.canvas.height - tX;
		commandEncoder.copyTextureToTexture(
			{
				texture: redView.baseResolveTarget
			},
			{
				texture: this.#swapChainTexture,
				origin: {
					x: tX,
					y: tY,
					z: 0
				}
			},
			{
				width: tW,
				height: tH,
				depth: 1
			}
		);
		this.#redGPU.device.defaultQueue.submit([commandEncoder.finish()]);
	};


	render(time, redGPU) {
		this.#redGPU = redGPU;
		this.#swapChainTexture = redGPU.swapChain.getCurrentTexture();
		this.#swapChainTextureView = this.#swapChainTexture.createView();
		let i = 0, len = redGPU.viewList.length;
		for (i; i < len; i++) this.#renderView(redGPU, redGPU.viewList[i])
		// console.log(cacheTable)
	}
}