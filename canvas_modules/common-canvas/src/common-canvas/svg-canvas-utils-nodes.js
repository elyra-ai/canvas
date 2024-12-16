/*
 * Copyright 2017-2025 Elyra Authors
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

import CanvasUtils from "./common-canvas-utils.js";
import { ERROR, WARNING, NODE_ERROR_ICON, NODE_WARNING_ICON,
	TEXT_AREA_BORDER_ADJUSTMENT } from "./constants/canvas-constants";

export default class SvgCanvasNodes {
	constructor(canvasLayout) {
		this.canvasLayout = canvasLayout;
	}

	isPointInNodeBoundary(pos, node) {
		return pos.x >= node.x_pos &&
			pos.x <= node.x_pos + node.width &&
			pos.y >= node.y_pos &&
			pos.y <= node.y_pos + node.height;
	}

	getNodeLabelClass(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return "d3-node-label d3-label-single-line " + this.getMessageLabelClass(node.messages);
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-label-single-line" : " d3-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-label-center" : "";
		return "d3-node-label " + this.getMessageLabelClass(node.messages) + lineTypeClass + justificationClass;
	}

	getNodeLabelTextAreaClass(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return "d3-node-label-entry d3-label-single-line";
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-label-single-line" : " d3-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-label-center" : "";
		return "d3-node-label-entry" + lineTypeClass + justificationClass;
	}

	getErrorMarkerIcon(data) {
		const messageLevel = this.getMessageLevel(data.messages);
		let iconPath = "";
		switch (messageLevel) {
		case ERROR:
			iconPath = NODE_ERROR_ICON;
			break;
		case WARNING:
			iconPath = NODE_WARNING_ICON;
			break;
		default:
			break;
		}
		return iconPath;
	}

	getMessageLevel(messages) {
		let messageLevel = "";
		if (messages && messages.length > 0) {
			for (const message of messages) {
				if (message.type === ERROR) {
					return message.type;
				} else if (message.type === WARNING) {
					messageLevel = message.type;
				}
			}
		}
		return messageLevel;
	}

	getMessageLabelClass(messages) {
		const messageLevel = this.getMessageLevel(messages);
		let labelClass = "";
		switch (messageLevel) {
		case ERROR:
			labelClass = "d3-node-error-label";
			break;
		case WARNING:
			labelClass = "d3-node-warning-label";
			break;
		default:
			break;
		}
		return labelClass;
	}

	getErrorMarkerClass(messages) {
		const messageLevel = this.getMessageLevel(messages);
		let labelClass = "d3-error-circle-off";
		switch (messageLevel) {
		case ERROR:
			labelClass = "d3-error-circle";
			break;
		case WARNING:
			labelClass = "d3-warning-circle";
			break;
		default:
			break;
		}
		return labelClass;
	}

	// Returns the absolute x coordinate of the center of the node. If node is
	// an expanded supernode, its expanded width is in the 'width' field.
	getNodeCenterPosX(node) {
		return node.x_pos + (node.width / 2);
	}

	// Returns the absolute y coordinate of the center of the node.  If node is
	// an expanded supernode, its expanded height is in the 'height' field.
	getNodeCenterPosY(node) {
		return node.y_pos + (node.height / 2);
	}

	// Returns the absolute x coordinate of the center of the node image
	getNodeImageCenterPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.x_pos + this.canvasLayout.supernodeImagePosX + (this.canvasLayout.supernodeImageWidth / 2);
		}
		return node.x_pos +
			this.getElementPosX(node.width, node.layout.imagePosX, node.layout.imagePosition) +
			(node.layout.imageWidth / 2);
	}

	// Returns the absolute y coordinate of the center of the node image
	getNodeImageCenterPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.y_pos + this.canvasLayout.supernodeImagePosY + (this.canvasLayout.supernodeImageHeight / 2);
		}
		return node.y_pos +
			this.getElementPosY(node.height, node.layout.imagePosY, node.layout.imagePosition) +
			(node.layout.imageHeight / 2);
	}

	getNodeImagePosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImagePosX;
		}
		return this.getElementPosX(node.width, node.layout.imagePosX, node.layout.imagePosition);
	}

	getNodeImagePosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImagePosY;
		}
		return this.getElementPosY(node.height, node.layout.imagePosY, node.layout.imagePosition);
	}

	getNodeImageWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImageWidth;
		}
		return node.layout.imageWidth;
	}

	getNodeImageHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeImageHeight;
		}
		return node.layout.imageHeight;
	}

	getNodeLabelPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeLabelPosX;
		}
		const x = this.getElementPosX(node.width, node.layout.labelPosX, node.layout.labelPosition);
		return node.layout.labelAlign === "center" ? x - (node.layout.labelWidth / 2) : x;
	}

	getNodeLabelPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeLabelPosY;
		}
		return this.getElementPosY(node.height, node.layout.labelPosY, node.layout.labelPosition);
	}

	getNodeLabelWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width - this.canvasLayout.supernodeLabelPosX + this.canvasLayout.supernodeErrorPosX;
		}
		return node.layout.labelWidth;
	}

	getNodeLabelHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
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

		if (node.layout.labelAlign === "center" && !CanvasUtils.isExpandedSupernode(node)) {
			const halfLabelWidth = labelWidth / 2;
			const xCenterPosition = posX + halfLabelWidth;
			const xOffsetFromCenter = Math.min(halfLabelWidth, ((spanWidth / zoomScale) / 2));
			return xCenterPosition + xOffsetFromCenter;
		}
		const xOffsetFromStart = Math.min(labelWidth, (spanWidth / zoomScale));
		return this.getNodeLabelPosX(node) + xOffsetFromStart;
	}

	getNodeLabelEditIconPosY(node) {
		return this.getNodeLabelPosY(node);
	}

	getNodeLabelHoverPosX(node) {
		if (node.layout.labelSingleLine &&
				node.layout.labelAlign === "center") {
			return this.getNodeLabelPosX(node) - 250;
		}
		return this.getNodeLabelPosX(node);
	}

	getNodeLabelHoverWidth(node) {
		if (node.layout.labelSingleLine) {
			if (node.layout.labelAlign === "center") {
				return node.layout.labelWidth + 500;
			}
			return node.layout.labelWidth + 40;
		}
		return node.layout.labelWidth;
	}

	getNodeLabelHoverHeight(node, spanObj, zoomScale) {
		if (node.layout.labelSingleLine) {
			return node.layout.labelHeight;
		}
		const calcHeight = spanObj.getBoundingClientRect().height / zoomScale;
		return Math.max(calcHeight, node.layout.labelHeight);
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
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeEllipsisWidth;
		}
		return node.layout.ellipsisWidth;
	}

	getNodeEllipsisHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
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
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width + this.canvasLayout.supernodeEllipsisPosX;
		}

		return this.getElementPosX(node.width, node.layout.ellipsisPosX, node.layout.ellipsisPosition);
	}

	getNodeEllipsisPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeEllipsisPosY;
		}

		return this.getElementPosY(node.height, node.layout.ellipsisPosY, node.layout.ellipsisPosition);
	}

	getNodeExpansionIconTranslate(node) {
		const posX = node.width + this.canvasLayout.supernodeExpansionIconPosX;
		return `translate(${posX}, ${this.canvasLayout.supernodeExpansionIconPosY})`;
	}

	getNodeErrorPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width + this.canvasLayout.supernodeErrorPosX;
		}
		return this.getElementPosX(node.width, node.layout.errorXPos, node.layout.errorPosition);
	}

	getNodeErrorPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorPosY;
		}
		return this.getElementPosY(node.height, node.layout.errorYPos, node.layout.errorPosition);
	}

	getNodeErrorWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorWidth;
		}
		return node.layout.errorWidth;
	}

	getNodeErrorHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.canvasLayout.supernodeErrorHeight;
		}
		return node.layout.errorHeight;
	}

	getNodePortPosX(posInfo, node) {
		return this.getElementPosX(node.width, posInfo.x_pos, posInfo.pos);
	}

	getNodePortPosY(posInfo, node) {
		return this.getElementPosY(node.height, posInfo.y_pos, posInfo.pos);
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

	// Returns the X offset for the port which references the nodeId passed in
	// based on the precalculated X coordinate of the port.
	getSupernodePortXOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cx - this.canvasLayout.supernodeSVGAreaPadding;
		}
		return 0;
	}

	// Returns the Y offset for the port which references the nodeId passed in
	// based on the pre-calculated Y coordinate of the port.
	getSupernodePortYOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cy;
		}
		return 0;
	}
}
