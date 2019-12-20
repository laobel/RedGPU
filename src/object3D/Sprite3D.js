/*
 *   RedGPU - MIT License
 *   Copyright (c) 2019 ~ By RedCamel( webseon@gmail.com )
 *   issue : https://github.com/redcamel/RedGPU/issues
 *   Last modification time of this file - 2019.12.20 12:21:28
 *
 */
"use strict";
import BaseObject3D from "../base/BaseObject3D.js";
import Sprite3DMaterial from "../material/Sprite3DMaterial.js";
import UTIL from "../util/UTIL.js";

export default class Sprite3D extends BaseObject3D {
	perspectiveScale = true;
	constructor(redGPUContext, geometry, material) {
		super(redGPUContext);
		this.geometry = geometry;
		this.material = material;
		this.cullMode = 'none';
	}
	addChild(child) {
		// Sprite3D에는 추가불가
	}
	set material(v) {
		if(v instanceof Sprite3DMaterial){
			this._material = v;
			this.dirtyPipeline = true;
		}else{
			UTIL.throwFunc(`addChild - only allow Sprite3DMaterial Instance. - inputValue : ${v} { type : ${typeof v} }`);
		}

	}
	get rotationX() {return this._rotationX;}
	set rotationX(v) {}
	get rotationY() {return this._rotationY;}
	set rotationY(v) {}
	get rotationZ() {return this._rotationZ;}
	set rotationZ(v) {}
}