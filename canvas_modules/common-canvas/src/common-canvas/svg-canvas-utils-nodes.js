/*
 * Copyright 2021 Elyra Authors
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

import { SUPER_NODE } from "./constants/canvas-constants";

// Diff between border for node label div (2px) and node label text area (6px)
const TEXT_AREA_BORDER_ADJUSTMENT = 4;

export default class SvgCanvasNodes {
	constructor(config, canvasLayout) {
		this.config = config;
		this.canvasLayout = canvasLayout;
	}

	getNodeImagePosX(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImagePosX;
		}
		return this.getElementPosX(node.width, node.layout.imagePosX, node.layout.imagePosition);
	}

	getNodeImagePosY(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImagePosY;
		}
		return this.getElementPosY(node.height, node.layout.imagePosY, node.layout.imagePosition);
	}

	getNodeImageWidth(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImageWidth;
		}
		return node.layout.imageWidth;
	}

	getNodeImageHeight(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImageHeight;
		}
		return node.layout.imageHeight;
	}

	getNodeLabelPosX(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeLabelPosX;
		}
		const x = this.getElementPosX(node.width, node.layout.labelPosX, node.layout.labelPosition);
		return node.layout.labelAlign === "center" ? x - (node.layout.labelWidth / 2) : x;
	}

	getNodeLabelPosY(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeLabelPosY;
		}
		return this.getElementPosY(node.height, node.layout.labelPosY, node.layout.labelPosition);
	}

	getNodeLabelWidth(node) {
		if (this.isExpandedSupernode(node)) {
			return node.width - this.canvasLayout.supernodeLabelPosX + this.canvasLayout.supernodeErrorPosX;
		}
		return node.layout.labelWidth;
	}

	getNodeLabelHeight(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeLabelHeight;
		}
		return node.layout.labelHeight;
	}

	getNodeLabelEditIconTranslate(node, spanObj, zoomScale, fullLabelOnHover) {
		return `translate(${this.getNodeLabelEditIconPosX(node, spanObj, zoomScale, fullLabelOnHover)}, ${this.getNodeLabelEditIconPosY(node)})`;
	}

	getNodeLabelEditIconPosX(node, spanObj, zoomScale, fullLabelOnHover) {
		const labelWidth = fullLabelOnHover ? this.getNodeLabelHoverWidth(node) : this.getNodeLabelWidth(node);
		const posX = fullLabelOnHover ? this.getNodeLabelHoverPosX(node) : this.getNodeLabelPosX(node);
		const spanWidth = spanObj.getBoundingClientRect().width;

		if (node.layout.labelAlign === "center" && !this.isExpandedSupernode(node)) {
			const halfLabelWidth = labelWidth / 2;
			const xCenterPosition = posX + halfLabelWidth;
			const xOffsetFromCenter = Math.min(halfLabelWidth, ((spanWidth / zoomScale) / 2));
			return xCenterPosition + xOffsetFromCenter + 5;
		}
		const xOffsetFromStart = Math.min(labelWidth, (spanWidth / zoomScale));
		return this.getNodeLabelPosX(node) + xOffsetFromStart + 5;
	}

	getNodeLabelEditIconPosY(node) {
		return this.getNodeLabelPosY(node);
	}

	getNodeLabelHoverPosX(node) {
		if (node.layout.labelAlign === "center") {
			return this.getNodeLabelPosX(node) - 250;
		}
		return this.getNodeLabelPosX(node);
	}

	getNodeLabelHoverWidth(node) {
		if (node.layout.labelAlign === "center") {
			return node.layout.labelWidth + 500;
		}
		return node.layout.labelWidth + 40;
	}

	getNodeLabelTextAreaWidth(node) {
		return this.getNodeLabelWidth(node) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	getNodeLabelTextAreaHeight(node) {
		return this.getNodeLabelHeight(node) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	getNodeLabelTextAreaPosX(node) {
		return this.getNodeLabelPosX(node) - TEXT_AREA_BORDER_ADJUSTMENT;
	}

	getNodeLabelTextAreaPosY(node) {
		return this.getNodeLabelPosY(node) - TEXT_AREA_BORDER_ADJUSTMENT;
	}

	getNodeEllipsisTranslate(node) {
		return `translate(${this.getNodeEllipsisPosX(node)}, ${this.getNodeEllipsisPosY(node)})`;
	}

	getNodeEllipsisWidth(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeEllipsisWidth;
		}
		return node.layout.ellipsisWidth;
	}

	getNodeEllipsisHeight(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeEllipsisHeight;
		}
		return node.layout.ellipsisHeight;
	}

	getNodeEllipsisIconWidth(node) {
		return this.getNodeEllipsisWidth(node) - (2 * node.layout.ellipsisHoverAreaPadding);
	}

	getNodeEllipsisIconHeight(node) {
		return this.getNodeEllipsisHeight(node) - (2 * node.layout.ellipsisHoverAreaPadding);
	}

	getNodeEllipsisPosX(node) {
		if (this.isExpandedSupernode(node)) {
			return node.width + this.canvasLayout.supernodeEllipsisPosX;
		}

		return this.getElementPosX(node.width, node.layout.ellipsisPosX, node.layout.ellipsisPosition);
	}

	getNodeEllipsisPosY(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeEllipsisPosY;
		}

		return this.getElementPosY(node.height, node.layout.ellipsisPosY, node.layout.ellipsisPosition);
	}

	getNodeExpansionIconTranslate(node) {
		const posX = node.width + this.canvasLayout.supernodeExpansionIconPosX;
		return `translate(${posX}, ${this.canvasLayout.supernodeExpansionIconPosY})`;
	}

	getNodeErrorPosX(node) {
		if (this.isExpandedSupernode(node)) {
			return node.width + this.canvasLayout.supernodeErrorPosX;
		}
		return this.getElementPosY(node.width, node.layout.errorXPos, node.layout.errorPosition);
	}

	getNodeErrorPosY(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorPosY;
		}
		return this.getElementPosY(node.height, node.layout.errorYPos, node.layout.errorPosition);
	}

	getNodeErrorWidth(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorWidth;
		}
		return node.layout.errorWidth;
	}

	getNodeErrorHeight(node) {
		if (this.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorHeight;
		}
		return node.layout.errorHeight;
	}

	getElementPosX(width, xOffset = 0, position = "topLeft") {
		let x = 0;

		if (position.endsWith("Center")) {
			x += (width / 2);
		} else if (position.endsWith("Right")) {
			x += width;
		}
		return x + Number(xOffset);
	}

	getElementPosY(height, yOffset = 0, position = "topLeft") {
		let y = 0;

		if (position.startsWith("middle")) {
			y += (height / 2);
		} else if (position.startsWith("bottom")) {
			y += height;
		}
		return y + Number(yOffset);
	}

	isExpandedSupernode(node) {
		return this.isSupernode(node) && this.isExpanded(node);
	}

	isExpanded(node) {
		return node.is_expanded === true;
	}

	isSupernode(node) {
		return node.type === SUPER_NODE;
	}

}
