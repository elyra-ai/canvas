/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var d3 = Object.assign({}, require("./d3-zoom-trackpad/src"));

export default class SvgCanvasZoom {
	constructor(renderer) {
		this.renderer = renderer;
		this.previousZoom = { x: 0, y: 0, k: 1 };

		this.zoomConstrainReset();
	}

	zoomConstrain(transform, extent) {
		if (this.renderer.config.enableZoomType === "Regular") {
			return this.zoomConstrain0(transform, extent);
		} else if (this.renderer.config.enableZoomType === "HideNegativeSpace") {
			return this.zoomConstrain1(transform, extent);
		}
		return transform;
	}

	zoomConstrainReset() {
		if (this.renderer.config.enableZoomType === "Regular") {
			this.zoomConstrain0Reset();
		} else if (this.renderer.config.enableZoomType === "HideNegativeSpace") {
			this.zoomConstrain1Reset();
		}
	}

	zoomConstrain0(transform, extent) {
		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv = this.renderer.getCanvasDimensionsAdjustedForScale(k, this.renderer.getZoomToFitPadding());

		const vpWidth = extent[1][0] - extent[0][0];
		const vpHeight = extent[1][1] - extent[0][1];


		if (this.previousZoom.k === k) {
			if (canv && canv.width < vpWidth) {
				x = Math.max(-canv.left, Math.min(x, vpWidth - canv.width - canv.left));
			}

			if (canv && canv.height < vpHeight) {
				y = Math.max(-canv.top, Math.min(y, vpHeight - canv.height - canv.top));
			}
		}

		// if (x < -(canv.width - 200)) {
		// 	x = -(canv.width - 200);
		//
		// } else if (x > vpWidth - 200) {
		//
		// 	x = vpWidth - 200;
		// }
		//
		// if (y < -(canv.height - 200)) {
		// 	y = -(canv.height - 200);
		//
		// } else if (x > vpHeight - 200) {
		// 	x = vpHeight - 200;
		// }

		this.previousZoom = { x, y, k };

		return d3.zoomIdentity.translate(x, y).scale(k);
	}

	zoomConstrain0Reset(transform) {
		this.constrainX = 0;
		this.constrainY = 0;
	}

	zoomConstrain1(transform, extent) {
		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv = this.renderer.getCanvasDimensionsAdjustedForScale(k, this.renderer.getZoomToFitPadding());

		const vpWidth = extent[1][0] - extent[0][0];
		const vpHeight = extent[1][1] - extent[0][1];

		// console.log("zoomConstrain2 = transform.x = " + transform.x);
		// console.log("zoomConstrain2 = transform.y = " + transform.y);
		// console.log("zoomConstrain2 = transform.k = " + transform.k);
		//
		// console.log("zoomConstrain2 = previousZoom.x = " + this.previousZoom.x);
		// console.log("zoomConstrain2 = previousZoom.y = " + this.previousZoom.y);
		// console.log("zoomConstrain2 = previousZoom.k = " + this.previousZoom.k);
		//
		//
		// console.log("vpWidth  = " + vpWidth);
		// console.log("canv.width  = " + canv.right);

		console.log("zoomConstrain2 = constrainX = " + this.constrainX);
		console.log("zoomConstrain2 = constrainY = " + this.constrainY);


		if (this.previousZoom && this.previousZoom.x === 0 && canv.right < vpWidth) {
			this.constrainX = x;
			x = 0;

		} else if (x < -(canv.width - 200)) {
			x = -(canv.width - 200);

		} else {
			x -= this.constrainX;
		}

		if (x > 0) {
			this.constrainX = x;
			x = 0;
		}

		if (this.previousZoom && this.previousZoom.y === 0 && canv.bottom < vpHeight) {
			this.constrainY = y;
			y = 0;

		} else if (y < -(canv.height - 200)) {
			y = -(canv.height - 200);

		} else {
			y -= this.constrainY;
		}

		if (y > 0) {
			this.constrainY = y;
			y = 0;
		}

		this.previousZoom = { x, y, k };

		// console.log("zoomConstrain2 = result = x = " + x);
		// console.log("zoomConstrain2 = result = y = " + y);

		return d3.zoomIdentity.translate(x, y).scale(k);
	}

	zoomConstrain1Reset() {
		this.constrainX = 0;
		this.constrainY = 0;
	}
}
