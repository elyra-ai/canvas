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

var d3 = Object.assign({}, require("./d3-zoom-extension/src"));

export default class SvgCanvasZoom {
	constructor(renderer) {
		this.renderer = renderer;
	}

	zoomConstrain(transform, previousScale, viewPort) {
		if (this.renderer.config.enableZoomType === "Regular") {
			return this.zoomConstrainRegular(transform, previousScale, viewPort);

		} else if (this.renderer.config.enableZoomType === "HideNegativeSpace-1") {
			return this.zoomConstrainHideNegSpace1(transform, previousScale, viewPort);

		} else if (this.renderer.config.enableZoomType === "HideNegativeSpace-2") {
			return this.zoomConstrainHideNegSpace2(transform, previousScale, viewPort);
		}
		return transform;
	}

	zoomConstrainRegular(transform, previousScale, viewPort) {
		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv = this.renderer.getCanvasDimensionsAdjustedForScale(k, this.renderer.getZoomToFitPadding());


		if (x > (viewPort.width - (canv.width * 0.25))) {
			x = viewPort.width - (canv.width * 0.25);

		} else if (x < -(canv.width * 0.75)) {
			x = -(canv.width * 0.75);
		}

		if (y > (viewPort.height - (canv.height * 0.25))) {
			y = viewPort.height - (canv.height * 0.25);

		} else if (y < -(canv.height * 0.75)) {
			y = -(canv.height * 0.75);
		}

		return d3.zoomIdentity.translate(x, y).scale(k);
	}

	zoomConstrainHideNegSpace1(transform, previousScale, viewPort) {
		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv = this.renderer.getCanvasDimensionsAdjustedForScale(k, this.renderer.getZoomToFitPadding());
		const canvasAtZoomOne = this.renderer.getCanvasDimensionsAdjustedForScale(1, this.renderer.getZoomToFitPadding());
		const scaleX = viewPort.width / canvasAtZoomOne.right;
		const scaleY = viewPort.height / canvasAtZoomOne.bottom;

		const kInc = transform.k - previousScale.k;
		const kRangeX = scaleX - previousScale.k;
		const kRangeY = scaleY - previousScale.k;
		const ratioX = kInc / kRangeX;
		const ratioY = kInc / kRangeY;

		// If we are zooming make sure the zoom doesn't reveal negative coordinate
		// space. Also, when zooming out (kInc < 0) scroll the canvas towards the
		// origin position.
		if (transform.k !== previousScale.k) {
			if (x > 0 || canv.right < viewPort.width) {
				x = 0;

			} else if (kInc < 0 && x > -(canvasAtZoomOne.right / 4)) {
				x -= (x * ratioX);
			}

			if (y > 0 || canv.bottom < viewPort.height) {
				y = 0;
			} else if (kInc < 0 && y > -(canvasAtZoomOne.bottom / 4)) {
				y -= (y * ratioY);
			}
		}

		// If we are panning or zooming make sure we don't pan into negative
		// coordinate space and also that we do not pan a maximum of 3/4 of the
		// canvas width/height.
		if (x > 0) {
			x = 0;
		} else if (x < -(canv.width * 0.75)) {
			x = -(canv.width * 0.75);
		}

		if (y > 0) {
			y = 0;
		} else if (y < -(canv.height * 0.75)) {
			y = -(canv.height * 0.75);
		}

		return d3.zoomIdentity.translate(x, y).scale(k);
	}

	zoomConstrainHideNegSpace2(transform, previousScale, viewPort) {
		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv = this.renderer.getCanvasDimensionsAdjustedForScale(k, this.renderer.getZoomToFitPadding());


		if (x > (viewPort.width - (canv.width * 0.25))) {
			x = viewPort.width - (canv.width * 0.25);

		} else if (x < -(canv.width * 0.75)) {
			x = -(canv.width * 0.75);
		}

		if (y > (viewPort.height - (canv.height * 0.25))) {
			y = viewPort.height - (canv.height * 0.25);

		} else if (y < -(canv.height * 0.75)) {
			y = -(canv.height * 0.75);
		}

		if (x > 0) {
			x = 0;
		}

		if (y > 0) {
			y = 0;
		}

		return d3.zoomIdentity.translate(x, y).scale(k);
	}
}
