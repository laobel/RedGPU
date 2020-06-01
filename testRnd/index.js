/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2020.3.26 14:41:31
 *
 */
import RedGPU from "../src/RedGPU.js";

const cvs = document.createElement('canvas');


let testMat_color, testMat_colorPhong, testMat_bitmap, testMat_standard_diffuse, testMat_standard_diffuse_normal,
	testMat_standard_diffuse_normal_displacement, testMat_colorPhongTexture_normal,
	testMat_colorPhongTexture_normal_displacement,
	testMat_environment;
console.time('초기화 속도')

new RedGPU.RedGPUContext(
	cvs,
	function (v) {
		console.log('뭐가오는데', v)
		if (!v) alert('죽었다')
		console.timeEnd('초기화 속도')
		document.body.appendChild(cvs);
		console.time('텍스쳐 로딩속도')
		RedGPU.Debugger.visible(true)
		let textureLoader = new RedGPU.TextureLoader(
			this,
			[
				'../assets/UV_Grid_Sm.jpg',
				'../assets/Brick03_col.jpg',
				'../assets/Brick03_nrm.jpg',
				'../assets/crate.png',
				'../assets/Brick03_disp.jpg',
				'../assets/specular.png',
				'../assets/emissive.jpg'
			],
			_ => {
				console.log('텍스쳐 로딩완료', textureLoader)
				console.timeEnd('텍스쳐 로딩속도')
				console.log('로딩완료된 시점의 시간은? 어찌됨?', performance.now())
				let MAX = 3000;
				let i = MAX;
				let tView, tView2;
				let tScene = new RedGPU.Scene();
				let tScene2 = new RedGPU.Scene();
				console.log('여기까지 시간은 어찌됨?', performance.now())
				let tGrid = new RedGPU.Grid(this)
				console.log('그리드만들고난뒤 시간은 어찌됨?', performance.now())
				let tAxis = new RedGPU.Axis(this)
				console.log('Axis만들고난뒤 시간은 어찌됨?', performance.now())
				let tCamera = new RedGPU.ObitController(this)
				let tCamera2 = new RedGPU.ObitController(this)
				// tGrid.centerColor = '#ff0000'
				tScene2.backgroundColor = '#ff0000'
				tScene2.backgroundColorAlpha = 0.5

				tView = new RedGPU.View(this, tScene, tCamera)
				tView2 = new RedGPU.View(this, tScene2, tCamera2)
				tView2.setSize(512, 300)
				tView2.setLocation(0, 0)


				tCamera.targetView = tView // optional
				tCamera2.targetView = tView2 // optional
				tCamera.distance = 10
				tCamera.speedDistance = 100

				// tScene.grid = tGrid;
				// tScene.axis = tAxis;
				let tLight
				tLight = new RedGPU.DirectionalLight(this, '#0000ff', 0.5)
				tLight.x = 10
				tLight.y = 10
				tLight.z = 10
				// tLight.useDebugMesh = true
				tScene.addLight(tLight)

				tLight = new RedGPU.DirectionalLight(this, '#ff0000', 0.5)
				tLight.x = -10
				tLight.y = -10
				tLight.z = -10
				// tLight.useDebugMesh = true
				tScene.addLight(tLight)

				tLight = new RedGPU.DirectionalLight(this, '#00ff00', 0.5)
				tLight.x = -10
				tLight.y = 20
				tLight.z = 20
				// tLight.useDebugMesh = true
				tScene.addLight(tLight)


				// let i2 = 0
				// let testColor = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00']
				// while (i2--) {
				// 	let tLight = new RedGPU.PointLight(this, testColor[i2 % testColor.length], 1, 1, 500)
				// 	tLight.useDebugMesh=true
				// 	tLight.x = Math.random()*3000-1500
				// 	tLight.y = Math.random()*3000-1500
				// 	tLight.z = Math.random()*3000-1500
				// 	tScene.addLight(tLight)
				// }

				this.addView(tView)
				let tEffect
				tEffect = new RedGPU.PostEffect_Bloom(this);
				tEffect.bloomStrength = 0.5
				tView.postEffect.addEffect(tEffect)

				// tEffect = new RedGPU.PostEffect_DoF(this);
				// tEffect.focusLength = 1000
				// tView.postEffect.addEffect(tEffect)
				// console.log('여기까지 시간은 어찌됨?', performance.now())
				// tEffect = new RedGPU.PostEffect_Gray(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Invert(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Threshold(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_HueSaturation(this)
				// tEffect.saturation = 100
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_BrightnessContrast(this)
				// tEffect.contrast = -100
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Blur(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_BlurX(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_BlurY(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_GaussianBlur(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_ZoomBlur(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_HalfTone(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Pixelize(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Convolution(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Film(this)
				// tView.postEffect.addEffect(tEffect)
				//
				// tEffect = new RedGPU.PostEffect_Vignetting(this)
				// tView.postEffect.addEffect(tEffect)


				this.addView(tView2)
				tView2.setLocation(100, 200)


				let testCubeTexture = new RedGPU.BitmapCubeTexture(this, [
					'../assets/cubemap/SwedishRoyalCastle/px.jpg',
					'../assets/cubemap/SwedishRoyalCastle/nx.jpg',
					'../assets/cubemap/SwedishRoyalCastle/py.jpg',
					'../assets/cubemap/SwedishRoyalCastle/ny.jpg',
					'../assets/cubemap/SwedishRoyalCastle/pz.jpg',
					'../assets/cubemap/SwedishRoyalCastle/nz.jpg'
				])

				testMat_environment = new RedGPU.EnvironmentMaterial(this, textureLoader.getTextureByIndex(1), testCubeTexture)
				testMat_color = new RedGPU.ColorMaterial(this, '#ffff12');
				testMat_colorPhong = new RedGPU.ColorPhongMaterial(this, '#ffffff');
				testMat_colorPhongTexture_normal = new RedGPU.ColorPhongTextureMaterial(this, '#fff253', 1, textureLoader.getTextureByIndex(2))
				testMat_colorPhongTexture_normal_displacement = new RedGPU.ColorPhongTextureMaterial(this, '#341fff', 1, textureLoader.getTextureByIndex(2), textureLoader.getTextureByIndex(5), textureLoader.getTextureByIndex(6), textureLoader.getTextureByIndex(4))

				testMat_bitmap = new RedGPU.BitmapMaterial(this, textureLoader.getTextureByIndex(0));
				testMat_standard_diffuse = new RedGPU.StandardMaterial(this, textureLoader.getTextureByIndex(1), null, textureLoader.getTextureByIndex(5), textureLoader.getTextureByIndex(6));
				testMat_standard_diffuse_normal = new RedGPU.StandardMaterial(this, textureLoader.getTextureByIndex(0), textureLoader.getTextureByIndex(2), textureLoader.getTextureByIndex(5), textureLoader.getTextureByIndex(6));
				testMat_standard_diffuse_normal_displacement = new RedGPU.StandardMaterial(this, textureLoader.getTextureByIndex(1), textureLoader.getTextureByIndex(2), textureLoader.getTextureByIndex(5), textureLoader.getTextureByIndex(6), textureLoader.getTextureByIndex(4));
				testMat_standard_diffuse_normal_displacement.displacementPower = 1
				testMat_standard_diffuse_normal_displacement.displacementFlowSpeedX = 0.1
				testMat_standard_diffuse_normal_displacement.displacementFlowSpeedY = 0.1

				testMat_colorPhongTexture_normal_displacement.displacementPower = 1
				testMat_colorPhongTexture_normal_displacement.displacementFlowSpeedX = 0.01
				testMat_colorPhongTexture_normal_displacement.displacementFlowSpeedY = 0.01


				let mats = [testMat_color, testMat_colorPhong, testMat_bitmap, testMat_standard_diffuse, testMat_standard_diffuse_normal, testMat_standard_diffuse_normal_displacement]
				let changeNum = 0
				// setInterval(_ => {
				// 	let tChildren = tView.scene._children
				// 	let i = tChildren.length;
				// 	changeNum++
				// 	console.log('안오냐',mats[changeNum%mats.length])
				//
				// 	while (i--) {
				//
				// 		tChildren[i].material = mats[changeNum%mats.length]
				// 	}
				// }, 2500)

				let randomGeometry = _ => {
					// return new RedGPU.Sphere(this, 0.5, 16, 16, 16)
					return Math.random() > 0.5
						? new RedGPU.Sphere(this, 0.5, 16, 16, 16) :
						Math.random() > 0.5
							? new RedGPU.Cylinder(this, 0, 1, 2, 16, 16) :
							Math.random() > 0.5 ? new RedGPU.Box(this, 1, 1, 1, 16, 16, 16) : new RedGPU.Plane(this, 1, 1, 16, 16)
				}
				let i3 = 100
				while (i3--) {
					let testMesh = new RedGPU.Mesh(
						this,
						new RedGPU.Box(this),
						testMat_bitmap
					);
					testMesh.x = Math.random() * 30 - 15
					testMesh.y = Math.random() * 30 - 15
					testMesh.z = Math.random() * 30 - 15
					testMesh.addEventListener('down', function () {
						var tValue =  3
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('up', function () {
						var tValue =  2
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('over', function () {
						var tValue =  2
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('out', function () {
						var tValue =  1
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					tScene2.addChild(testMesh)
				}
				// let testMesh = new RedGPU.Mesh(
				// 	this,
				// 	new RedGPU.Sphere(this, 0.5, 16, 16, 16),
				// 	testMat_standard_diffuse
				// );
				// testMesh.scaleX = testMesh.scaleY = testMesh.scaleZ = 20
				// testMesh.x = -25
				// tScene.addChild(testMesh)

				// testMesh.addEventListener('down', function () {
				// 	var tValue = 50 * 3
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('up', function () {
				// 	var tValue = 50 * 2
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('over', function () {
				// 	var tValue = 50 * 2
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('out', function () {
				// 	var tValue = 50 * 1
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })

				// testMesh = new RedGPU.Mesh(
				// 	this,
				// 	new RedGPU.Sphere(this, 0.5, 16, 16, 16),
				// 	testMat_environment
				// );
				// testMesh.scaleX = testMesh.scaleY = testMesh.scaleZ = 20
				// testMesh.x = 25
				// tScene.addChild(testMesh)
				// testMesh.addEventListener('down', function () {
				// 	var tValue = 50 * 3
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('up', function () {
				// 	var tValue = 50 * 2
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('over', function () {
				// 	var tValue = 50 * 2
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })
				// testMesh.addEventListener('out', function () {
				// 	var tValue = 50 * 1
				// 	TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
				// })


				let division = MAX / 8
				while (i--) {
					let testMesh = new RedGPU.Mesh(
						this,
						randomGeometry(),
						i > division * 7 ? testMat_color
							: i > division * 6 ? testMat_colorPhong
							: i > division * 5 ? testMat_bitmap
								: i > division * 4 ? testMat_standard_diffuse
									: i > division * 3 ? testMat_standard_diffuse_normal
										: i > division * 2 ? testMat_standard_diffuse_normal_displacement
											: i > division * 1 ? testMat_colorPhongTexture_normal : testMat_colorPhongTexture_normal_displacement
					);
					testMesh.addEventListener('down', function () {
						var tValue = 50 * 3
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('up', function () {
						var tValue = 50 * 2
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('over', function () {
						var tValue = 50 * 2.5
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.addEventListener('out', function () {
						var tValue = 50 * 1
						TweenMax.to(this, 0.5, {scaleX: tValue, scaleY: tValue, scaleZ: tValue, ease: Back.easeOut});
					})
					testMesh.x = Math.random() * 5000 - 2500;
					testMesh.y = Math.random() * 5000 - 2500;
					testMesh.z = Math.random() * 5000 - 2500;
					testMesh.rotationX = testMesh.rotationY = testMesh.rotationZ = Math.random() * 360;
					testMesh.scaleX = testMesh.scaleY = testMesh.scaleZ = 100;
					tScene.addChild(testMesh)


					let testBox;
					testBox = new RedGPU.Mesh(this, randomGeometry(), testMat_colorPhong)
					testBox.scaleX = testBox.scaleY = testBox.scaleZ = 0.3
					testBox.x = 1.5
					// testBox.primitiveTopology = 'line-strip'
					testMesh.addChild(testBox)
					// testMesh.material = testMesh._parent.material

					// //
					// let testMesh2 = new RedGPU.Mesh(
					// 	this,
					// 	new RedGPU.Sphere(this, 1, 16, 16, 16),
					// 	testMat_colorPhong
					// );
					// testMesh2.x = 2
					// testMesh2.scaleX = testMesh2.scaleY = testMesh2.scaleZ = 0.5;
					// testMesh.addChild(testMesh2)
					//
					// let testMesh3 = new RedGPU.Mesh(
					// 	this,
					// 	new RedGPU.Sphere(this),
					// 	testMat_bitmap
					// );
					// testMesh3.x = 2
					// testMesh3.scaleX = testMesh3.scaleY = testMesh3.scaleZ = 0.5;
					// testMesh2.addChild(testMesh3)

				}
				console.log('여기까지 시간은 어찌됨?', performance.now())
				var addLine_random, addLine_circle;
				// 60번 포인트를 랜덤으로 정의하고 라인추가
				addLine_random = function (redGPUContext, color) {
					var tLine;
					var tX, tY, tZ;
					var i = 25;
					// 라인객체 생성
					tLine = new RedGPU.Line(redGPUContext, color, RedGPU.Line.CATMULL_ROM);

					tX = tY = tZ = 0
					while (i--) {
						tX += Math.random() - 0.5;
						tY += Math.random() - 0.5;
						tZ += Math.random() - 0.5;
						// 라인에 포인트 추가
						tLine.addPoint(Math.random() * 200 - 50, Math.random() * 200 - 50, Math.random() * 200 - 50, i % 3 == 0 ? color : i % 3 == 1 ? '#ff0000' : '#00ff00', Math.max(Math.random(), 0.5));
					}
					tScene.addChild(tLine);
					tLine.tension = 1
					tLine.distance = 0.1
					tLine.x = Math.random() * 1500 - 750;
					tLine.y = Math.random() * 1500 - 750;
					tLine.z = Math.random() * 1500 - 750;
					// setInterval(_ => {
					// 	tLine.addPoint(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100)
					// }, 1000)

				};
				i = 5
				while (i--) {
					addLine_random(this, '#0000ff');
				}

				i = 50
				let tText
				let tTextList = []
				while (i--) {
					tText = new RedGPU.Text(this, 256, 34)
					tText.x = Math.random() * 200 - 100;
					tText.y = Math.random() * 200 - 100;
					tText.z = Math.random() * 200 - 100;
					// tText.rotationX = tText.rotationY = tText.rotationZ = Math.random() * 360;
					tText.scaleX = tText.scaleY = Math.random() * 20 + 20
					tText.fontSize = 34
					tText.fontWeight = 'bold'
					tText.rotationX = Math.random() * 360
					tText.rotationY = Math.random()* 360
					tText.rotationZ = Math.random()* 360
					tText.color = i % 2 ? '#fff' : '#ff2255'
					tText.text = i % 2 ? '가나다라마바사' : 'ABCDEFG'
					tScene.addChild(tText)
					tTextList.push(tText)
				}


				let renderer = new RedGPU.Render();
				let render = time => {
					tLight.x = Math.sin(time / 1000)
					tLight.y = Math.cos(time / 500)
					tLight.z = Math.cos(time / 750)
					renderer.render(time, this);
					testMat_standard_diffuse_normal.emissivePower = testMat_standard_diffuse_normal_displacement.emissivePower = testMat_colorPhongTexture_normal_displacement.emissivePower = Math.abs(Math.sin(time / 250))
					testMat_colorPhongTexture_normal_displacement.displacementPower = testMat_standard_diffuse_normal_displacement.displacementPower = Math.sin(time / 1000) * 25
					testMat_standard_diffuse.normalPower = testMat_standard_diffuse_normal.normalPower = testMat_standard_diffuse_normal_displacement.normalPower = Math.abs(Math.sin(time / 1000)) + 1
					testMat_standard_diffuse.shininess = testMat_standard_diffuse.shininess = testMat_standard_diffuse_normal.shininess = Math.abs(Math.sin(time / 1000)) * 64 + 8
					testMat_standard_diffuse.specularPower = Math.abs(Math.sin(time / 1000)) * 5
					testMat_colorPhong.shininess = 8
					let viewRect = tView2.viewRect;
					let tW = window.innerWidth;
					let tH = window.innerHeight;
					tView2.setLocation(Math.sin(time / 500) * viewRect[2] / 3 + tW / 2 - viewRect[2] / 2, Math.cos(time / 500) * viewRect[3] / 3 + tH / 2 - viewRect[3] / 2);

					let tChildren = tView.scene.pointLightList
					let i = tChildren.length;


					tChildren = tView.scene._children
					i = tChildren.length
					let tMesh

					// while (i--) {
					// 	tMesh = tChildren[i]
					// 	tMesh._rotationX += 1
					// 	tMesh._rotationY += 1
					// 	tMesh._rotationZ += 1
					// 	tMesh.dirtyTransform = 1
					// }

					requestAnimationFrame(render);
				};
				requestAnimationFrame(render);
				setTestUI(this, tView, tScene, testCubeTexture)
			},
			function (e) {
				console.log('progress', this, e)
			}
		)

	}
);

let setTestUI = function (redGPUContextContext, tView, tScene, testCubeTexture) {

	let tFolder;

	let skyBox = new RedGPU.SkyBox(redGPUContextContext, testCubeTexture)
	tScene.skyBox = skyBox
	let testSceneUI = new dat.GUI({});
	let testSceneData = {
		useSkyBox: true,
		useGrid: true,
	}
	testSceneUI.width = 350
	tFolder = testSceneUI.addFolder('Scene')
	tFolder.open()
	tFolder.add(testSceneData, 'useSkyBox').onChange(v => tScene.skyBox = v ? skyBox : null)
	tFolder.add(testSceneData, 'useGrid').onChange(v => tScene.grid = v ? new RedGPU.Grid(redGPUContextContext) : null)
	tFolder.addColor(tScene, 'backgroundColor')
	tFolder.add(tScene, 'backgroundColorAlpha', 0, 1, 0.01)
	tFolder = testSceneUI.addFolder('View')
	tFolder.open()
	let viewTestData = {
		useFrustumCulling: true,
		setLocationTest1: function () {
			tView.setLocation(0, 0)
		},
		setLocationTest2: function () {
			tView.setLocation(100, 100)
		},
		setLocationTest3: function () {
			tView.setLocation('50%', 100)
		},
		setLocationTest4: function () {
			tView.setLocation('40%', '40%')
		},
		setSizeTest1: function () {
			tView.setSize(200, 200)
		},
		setSizeTest2: function () {
			tView.setSize('50%', '100%')
		},
		setSizeTest3: function () {
			tView.setSize('50%', '50%')
		},
		setSizeTest4: function () {
			tView.setSize('20%', '20%')
		},
		setSizeTest5: function () {
			tView.setSize('100%', '100%')
		}
	}
	tFolder.add(viewTestData, 'useFrustumCulling').onChange(v => {
		tView.useFrustumCulling = v
	})
	tFolder.add(viewTestData, 'setLocationTest1').name('setLocation(0,0)');
	tFolder.add(viewTestData, 'setLocationTest2').name('setLocation(100,100)');
	tFolder.add(viewTestData, 'setLocationTest3').name('setLocation(50%,100)');
	tFolder.add(viewTestData, 'setLocationTest4').name('setLocation(40%,40%)');
	tFolder.add(viewTestData, 'setSizeTest1').name('setSize(200,200)');
	tFolder.add(viewTestData, 'setSizeTest2').name('setSize(50%,100%)');
	tFolder.add(viewTestData, 'setSizeTest3').name('setSize(50%,50%)');
	tFolder.add(viewTestData, 'setSizeTest4').name('setSize(20%,20%)');
	tFolder.add(viewTestData, 'setSizeTest5').name('setSize(100%,100%)');

	let testUI = new dat.GUI({});
	let testData = {
		useFloatMode: false,
		depthWriteEnabled: true,

		depthCompare: "less",
		cullMode: "back",
		primitiveTopology: "triangle-list"
	};
	tFolder = testUI.addFolder('Test Material option')
	tFolder.add(testData, 'useFloatMode').onChange(v => {
		testMat_color,
			testMat_colorPhong.useFlatMode = v
		testMat_standard_diffuse.useFlatMode = v
		testMat_standard_diffuse_normal.useFlatMode = v
		testMat_standard_diffuse_normal_displacement.useFlatMode = v
		testMat_colorPhongTexture_normal.useFlatMode = v
		testMat_colorPhongTexture_normal_displacement.useFlatMode = v

	});

	tFolder = testUI.addFolder('Mesh')
	tFolder.open()


	tFolder.add(testData, 'depthWriteEnabled').onChange(v => tScene._children.forEach(tMesh => tMesh.depthWriteEnabled = v));

	tFolder.add(testData, 'depthCompare', [
		"never",
		"less",
		"equal",
		"less-equal",
		"greater",
		"not-equal",
		"greater-equal",
		"always"
	]).onChange(v => tScene._children.forEach(tMesh => tMesh.depthCompare = v));
	tFolder.add(testData, 'cullMode', [
		"none",
		"front",
		"back"
	]).onChange(v => tScene._children.forEach(tMesh => tMesh.cullMode = v));

	// tFolder.add(testData, 'primitiveTopology', [
	// 	"point-list",
	// 	"line-list",
	// 	"line-strip",
	// 	"triangle-list",
	// 	"triangle-strip"
	// ]).onChange(v => tScene._children.forEach(tMesh => tMesh.primitiveTopology = v));
}
