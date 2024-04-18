/*
 * Copyright 2017-2023 Elyra Authors
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

import { has } from "lodash";
import { DEC_LINK, TEXT_AREA_BORDER_ADJUSTMENT } from "./constants/canvas-constants";

export default class SvgCanvasDecs {
	constructor(canvasLayout) {
		this.canvasLayout = canvasLayout;
	}

	getDec(id, decorations) {
		if (decorations) {
			const dec = decorations.find((nd) => nd.id === id);
			return dec;
		}
		return null;
	}

	getDecLabelClass(dec, objType) {
		const lineTypeClass = dec.label_single_line ? " d3-label-single-line" : " d3-label-multi-line";
		const justificationClass = dec.label_align === "center" ? " d3-label-center" : "";
		return this.getDecClass(dec, `d3-${objType}-dec-label`) + lineTypeClass + justificationClass;
	}

	getDecLabelTextAreaClass(dec) {
		const lineTypeClass = dec.label_single_line ? " d3-label-single-line" : " d3-label-multi-line-entry";
		const justificationClass = dec.label_align === "center" ? " d3-label-center" : "";
		return "d3-dec-label-entry" + lineTypeClass + justificationClass;
	}

	getDecTransform(dec, d, objType) {
		return `translate(${this.getDecPosX(dec, d, objType)}, ${this.getDecPosY(dec, d, objType)})`;
	}

	getDecPosX(dec, data, objType) {
		if (objType === DEC_LINK) {
			return this.getLinkDecPosX(dec, data, objType);
		}
		return this.getNodeDecPosX(dec, data);
	}

	getNodeDecPosX(dec, node) {
		const position = dec.position || "topLeft";
		let x = 0;
		if (position === "topLeft" || position === "middleLeft" || position === "bottomLeft") {
			x = typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorLeftX;
		} else if (position === "topCenter" || position === "middleCenter" || position === "bottomCenter") {
			x = (node.width / 2) + (typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorCenterX);
		} else if (position === "topRight" || position === "middleRight" || position === "bottomRight") {
			x = node.width + (typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorRightX);
		}
		return x;
	}

	getLinkDecPosX(dec, link, objType) {
		const position = dec.position || "middle";
		let x = 0;
		if (position === "middle") {
			x = link.pathInfo.centerPoint ? link.pathInfo.centerPoint.x : link.x1 + ((link.x2 - link.x1) / 2);
		} else if (position === "source") {
			x = link.pathInfo.sourcePoint ? link.pathInfo.sourcePoint.x : link.x1;
		} else if (position === "target") {
			x = link.pathInfo.targetPoint ? link.pathInfo.targetPoint.x : link.x2;
		}
		x = typeof dec.x_pos !== "undefined" ? x + Number(dec.x_pos) : x;

		// 'angle' will only be available when displaying straight link lines so
		//  distance field is only applicable with straight lines.
		// 'angle' may be 0 so use has to check that it is not undefined.
		if (dec.distance && has(link, "pathInfo.angle")) {
			x += Math.cos(link.pathInfo.angle) * dec.distance;
		}

		// Subtract half the width for center aligned labels.
		if (dec.label_align === "center") {
			x -= this.getDecWidth(dec, link, objType) / 2;
		}
		return x;
	}

	getDecPosY(dec, data, objType) {
		if (objType === DEC_LINK) {
			return this.getLinkDecPosY(dec, data);
		}
		return this.getNodeDecPosY(dec, data);
	}

	getNodeDecPosY(dec, node) {
		const position = dec.position || "topLeft";
		let y = 0;
		if (position === "topLeft" || position === "topCenter" || position === "topRight") {
			y = typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorTopY;
		} else if (position === "middleLeft" || position === "middleCenter" || position === "middleRight") {
			y = (node.height / 2) + (typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorMiddleY);
		} else if (position === "bottomLeft" || position === "bottomCenter" || position === "bottomRight") {
			y = node.height + (typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorBottomY);
		}
		return y;
	}

	getLinkDecPosY(dec, link) {
		const position = dec.position || "middle";
		let y = 0;
		if (position === "middle") {
			y = link.pathInfo.centerPoint ? link.pathInfo.centerPoint.y : link.y1 + ((link.y2 - link.y1) / 2);
		} else if (position === "source") {
			y = link.pathInfo.sourcePoint ? link.pathInfo.sourcePoint.y : link.y1;
		} else if (position === "target") {
			y = link.pathInfo.targetPoint ? link.pathInfo.targetPoint.y : link.y2;
		}
		y = typeof dec.y_pos !== "undefined" ? y + Number(dec.y_pos) : y;

		// 'angle' will only be available when displaying straight link lines so
		// distance field is only applicable with straight lines.
		// 'angle' may be 0 so use has to check that it is not undefined.
		if (dec.distance && has(link, "pathInfo.angle")) {
			y += Math.sin(link.pathInfo.angle) * dec.distance;
		}

		return y;
	}

	getDecPadding(dec, obj, objType) {
		// If outline is set to false we don't pad the decorator image.
		if (dec.outline === false) {
			return 0;
		}
		if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorPadding;
		}
		return obj.layout.decoratorPadding;
	}

	getDecWidth(dec, obj, objType) {
		if (typeof dec.width !== "undefined") {
			return Number(dec.width);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorWidth;
		}
		return obj.layout.decoratorWidth;
	}

	getDecHeight(dec, obj, objType) {
		if (typeof dec.height !== "undefined") {
			return Number(dec.height);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorHeight;
		}
		return obj.layout.decoratorHeight;
	}

	getDecClass(dec, inClassName) {
		let className = inClassName;
		if (dec && dec.class_name) {
			className += " " + dec.class_name;
		}
		return className;
	}

	getDecImage(dec) {
		if (dec) {
			return dec.image;
		}
		return "";
	}

	getDecLabelEditIconTranslate(dec, obj, objType, spanObj, zoomScale) {
		return `translate(${this.getDecLabelEditIconPosX(dec, obj, objType, spanObj, zoomScale)}, ${this.getDecLabelEditIconPosY(dec)})`;
	}

	getDecLabelEditIconPosX(dec, obj, objType, spanObj, zoomScale) {
		const minWidth = Math.min(spanObj.getBoundingClientRect().width, this.getDecLabelWidth(dec, obj, objType));
		if (dec.label_align === "center") {
			const halfWid = this.getDecLabelWidth(dec, obj, objType) / 2;
			return halfWid + (minWidth / 2) / zoomScale;
		}
		return minWidth / zoomScale;
	}

	getDecLabelEditIconPosY(dec) {
		return 0;
	}

	getDecLabelWidth(dec, obj, objType) {
		if (typeof dec.width !== "undefined") {
			return Number(dec.width);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorLabelWidth;
		}
		return obj.layout.decoratorLabelWidth;
	}

	getDecLabelHeight(dec, obj, objType) {
		if (typeof dec.height !== "undefined") {
			return Number(dec.height);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorLabelHeight;
		}
		return obj.layout.decoratorLabelHeight;
	}

	getDecLabelTextAreaWidth(dec, obj, objType) {
		return this.getDecLabelWidth(dec, obj, objType) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	getDecLabelTextAreaHeight(dec, obj, objType) {
		return this.getDecLabelHeight(dec, obj, objType) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	getDecLabelTextAreaPosX() {
		return -TEXT_AREA_BORDER_ADJUSTMENT;
	}

	getDecLabelTextAreaPosY() {
		return -(TEXT_AREA_BORDER_ADJUSTMENT - 1);
	}
}
