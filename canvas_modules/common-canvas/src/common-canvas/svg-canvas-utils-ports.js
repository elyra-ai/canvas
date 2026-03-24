/*
 * Copyright 2017-2026 Elyra Authors
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
import { LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP, PORT_WIDTH_DEFAULT, PORT_HEIGHT_DEFAULT } from "./constants/canvas-constants";

export default class SvgCanvasPorts {

	/**
	 * Gets the X position of a port based on position info.
	 */
	static getNodePortPosX(posInfo, node) {
		return CanvasUtils.getElementPosX(node.width, posInfo.x_pos, posInfo.pos);
	}

	/**
	 * Gets the Y position of a port based on position info.
	 */
	static getNodePortPosY(posInfo, node) {
		return CanvasUtils.getElementPosY(node.height, posInfo.y_pos, posInfo.pos);
	}

	/**
	 * Gets link coordinates for a connection between two nodes using their ports.
	 * Returns absolute canvas coordinates for the link endpoints.
	 */
	static getNodeLinkCoordsForPortsConnection(srcNode, srcPortId, trgNode, trgPortId) {
		let srcX;
		let srcY;
		let trgX;
		let trgY;
		let srcDir;
		let trgDir;

		if (srcNode.outputs && srcNode.outputs.length > 0) {
			const srcPort = srcNode.outputs.find((output) => output.id === srcPortId);
			srcX = srcPort.cx;
			srcY = srcPort.cy;
			srcDir = srcPort.dir;

		} else {
			srcX = this.getNodePortPosX(srcNode.layout.outputPortPositions[0], srcNode);
			srcY = this.getNodePortPosY(srcNode.layout.outputPortPositions[0], srcNode);
			srcDir = CanvasUtils.getPortDir(srcX, srcY, srcNode);
		}

		if (trgNode.inputs && trgNode.inputs.length > 0) {
			const trgPort = trgNode.inputs.find((input) => input.id === trgPortId);
			trgX = trgPort.cx;
			trgY = trgPort.cy;
			trgDir = trgPort.dir;

		} else {
			trgX = this.getNodePortPosX(trgNode.layout.inputPortPositions[0], trgNode);
			trgY = this.getNodePortPosY(trgNode.layout.inputPortPositions[0], trgNode);
			trgDir = CanvasUtils.getPortDir(srcX, srcY, srcNode);
		}

		return {
			x1: srcNode.x_pos + srcX,
			y1: srcNode.y_pos + srcY,
			x2: trgNode.x_pos + trgX,
			y2: trgNode.y_pos + trgY,
			srcDir: srcDir,
			trgDir: trgDir
		};
	}

	/**
	 * Sets port positions and sizes for a node based on the link direction and layout configuration.
	 * This modifies the ports array in place, setting cx, cy, dir, width, and height properties.
	 *
	 * @param {Object} node - The node object containing layout information and ports
	 * @param {Object} canvasLayout - Canvas layout configuration
	 * @param {number} zoomScale - Current zoom scale (for binding nodes)
	 */
	static setPortPositionsAndSizesForNode(node, canvasLayout, zoomScale = 1) {
		const enableSingleOutputPortDisplay = node.layout.singleOutputPortDisplay;

		if (canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM ||
				canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			this.setPortPositionsVertical(
				node, node.inputs, node.inputPortsWidth,
				node.layout.inputPortPositions,
				node.layout.inputPortAutoPosition,
				false,
				canvasLayout,
				zoomScale);
			this.setPortPositionsVertical(
				node, node.outputs, node.outputPortsWidth,
				node.layout.outputPortPositions,
				node.layout.outputPortAutoPosition,
				enableSingleOutputPortDisplay,
				canvasLayout,
				zoomScale);

		} else {
			this.setPortPositionsHoriz(
				node, node.inputs, node.inputPortsHeight,
				node.layout.inputPortPositions,
				node.layout.inputPortAutoPosition,
				false,
				canvasLayout,
				zoomScale);
			this.setPortPositionsHoriz(
				node, node.outputs, node.outputPortsHeight,
				node.layout.outputPortPositions,
				node.layout.outputPortAutoPosition,
				enableSingleOutputPortDisplay,
				canvasLayout,
				zoomScale);
		}

		// Set width and height for all ports
		this.setPortSizes(node.inputs, node.layout.inputPortDisplayObjects);
		this.setPortSizes(node.outputs, node.layout.outputPortDisplayObjects);
	}

	/**
	 * Sets width and height properties on ports based on display objects.
	 *
	 * @param {Array} ports - Array of port objects
	 * @param {Array} displayObjects - Array of display object configurations
	 */
	static setPortSizes(ports, displayObjects) {
		if (ports && displayObjects) {
			ports.forEach((port, i) => {
				const idx = (i < displayObjects.length) ? i : displayObjects.length - 1;
				const portObj = displayObjects[idx];
				port.width = portObj.width || PORT_WIDTH_DEFAULT;
				port.height = portObj.height || PORT_HEIGHT_DEFAULT;
			});
		}
	}

	/**
		* Sets port positions for vertical link direction (top-bottom or bottom-top).
		* Modifies the ports array in place.
		*/
	static setPortPositionsVertical(node, ports, portsWidth, portPositions, autoPosition, displaySinglePort, canvasLayout, zoomScale) {
		if (ports && ports.length > 0) {
			const xPos = this.getNodePortPosX(portPositions[0], node);
			const yPos = this.getNodePortPosY(portPositions[0], node);

			if (node.width <= node.layout.defaultNodeWidth &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
				ports[0].dir = CanvasUtils.getPortDir(ports[0].cx, ports[0].cy, node);
			// If we are only going to display a single port, we set all the
			// port positions to be the same as if there is only one port.
			} else if (displaySinglePort) {
				this.setPortPositionsVerticalDisplaySingle(node, ports, xPos, yPos, canvasLayout);

			} else if (autoPosition || CanvasUtils.isExpandedSupernode(node)) {
				this.setPortPositionsVerticalAuto(node, ports, portsWidth, yPos, canvasLayout, zoomScale);

			} else {
				this.setPortPositionsCustom(ports, portPositions, node, xPos, yPos);
			}
		}
	}

	/**
	 * If only a single port is to be displayed, this method sets the x and y
	 * coordinates of all the ports to the same values appropriately for either
	 * regular nodes or expanded supernodes.
	 */
	static setPortPositionsVerticalDisplaySingle(node, ports, xPos, yPos, canvasLayout) {
		let xPosition = 0;
		if (CanvasUtils.isExpandedSupernode(node)) {
			const widthSvgArea = node.width - (2 * canvasLayout.supernodeSVGAreaPadding);
			xPosition = widthSvgArea / 2;

		} else {
			xPosition = xPos;
		}

		ports.forEach((p) => {
			p.cx = xPosition;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}

	/**
	 * Sets the ports x and y coordinates for regular and expanded supernodes
	 * when all ports are displayed in a normal manner (as opposed to when a
	 * single port is displayed).
	 */
	static setPortPositionsVerticalAuto(node, ports, portsWidth, yPos, canvasLayout, zoomScale) {
		let xPosition = 0;

		if (CanvasUtils.isExpandedSupernode(node)) {
			const widthSvgArea = node.width - (2 * canvasLayout.supernodeSVGAreaPadding);
			const remainingSpace = widthSvgArea - portsWidth;
			xPosition = canvasLayout.supernodeSVGAreaPadding + (remainingSpace / 2);

		} else if (portsWidth < node.width) {
			xPosition = (node.width - portsWidth) / 2;
		}

		xPosition += node.layout.portArcOffset;

		// Sub-flow binding node ports need to be spaced by the inverse of the
		// zoom amount so that, after zoomToFit on the in-place sub-flow the
		// binding node ports line up with those on the supernode. This is only
		// necessary with binding nodes with multiple ports.
		let multiplier = 1;
		if (CanvasUtils.isSuperBindingNode(node)) {
			multiplier = 1 / zoomScale;
		}
		ports.forEach((p) => {
			xPosition += (node.layout.portArcRadius * multiplier);
			p.cx = xPosition;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
			xPosition += ((node.layout.portArcRadius + node.layout.portArcSpacing) * multiplier);
		});
	}

	/**
	 * Sets port positions for horizontal link direction (left-right or right-left).
	 * Modifies the ports array in place.
	 */
	static setPortPositionsHoriz(node, ports, portsHeight, portPositions, autoPosition, displaySinglePort, canvasLayout, zoomScale) {
		if (ports && ports.length > 0) {
			const xPos = this.getNodePortPosX(portPositions[0], node);
			const yPos = this.getNodePortPosY(portPositions[0], node);

			if (node.height <= node.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
				ports[0].dir = CanvasUtils.getPortDir(ports[0].cx, ports[0].cy, node);

			// If we are only going to display a single port, we set all the
			// port positions to be the same as if there is only one port.
			} else if (displaySinglePort) {
				this.setPortPositionsHorizDisplaySingle(node, ports, xPos, yPos, canvasLayout);

			} else if (autoPosition || CanvasUtils.isExpandedSupernode(node)) {
				this.setPortPositionsHorizAuto(node, ports, portsHeight, xPos, canvasLayout, zoomScale);

			} else {
				this.setPortPositionsCustom(ports, portPositions, node, xPos, yPos);
			}
		}
	}

	/**
	 * If only a single port is to be displayed, this method sets the x and y
	 * coordinates of all the ports to the same values appropriately for either
	 * regular nodes or expanded supernodes.
	 */
	static setPortPositionsHorizDisplaySingle(node, ports, xPos, yPos, canvasLayout) {
		let yPosition = 0;
		if (CanvasUtils.isExpandedSupernode(node)) {
			const heightSvgArea = node.height - canvasLayout.supernodeTopAreaHeight - canvasLayout.supernodeSVGAreaPadding;
			yPosition = canvasLayout.supernodeTopAreaHeight + (heightSvgArea / 2);

		} else {
			yPosition = yPos;
		}

		ports.forEach((p) => {
			p.cx = xPos;
			p.cy = yPosition;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}

	/**
	 * Sets the ports x and y coordinates for regular and expanded supernodes
	 * when all ports are displayed in a normal manner (as opposed to when a
	 * single port is displayed).
	 */
	static setPortPositionsHorizAuto(node, ports, portsHeight, xPos, canvasLayout, zoomScale) {
		let yPosition = 0;

		if (CanvasUtils.isExpandedSupernode(node)) {
			const heightSvgArea = node.height - canvasLayout.supernodeTopAreaHeight - canvasLayout.supernodeSVGAreaPadding;
			const remainingSpace = heightSvgArea - portsHeight;
			yPosition = canvasLayout.supernodeTopAreaHeight + (remainingSpace / 2);

		} else if (portsHeight < node.height) {
			yPosition = (node.height - portsHeight) / 2;
		}

		yPosition += node.layout.portArcOffset;

		// Sub-flow binding node ports need to be spaced by the inverse of the
		// zoom amount so that, after zoomToFit on the in-place sub-flow the
		// binding node ports line up with those on the supernode. This is only
		// necessary with binding nodes with multiple ports.
		let multiplier = 1;
		if (CanvasUtils.isSuperBindingNode(node)) {
			multiplier = 1 / zoomScale;
		}
		ports.forEach((p) => {
			yPosition += (node.layout.portArcRadius * multiplier);
			p.cx = xPos;
			p.cy = yPosition;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
			yPosition += ((node.layout.portArcRadius + node.layout.portArcSpacing) * multiplier);
		});
	}

	/**
	 * Sets the node's port positions based on the custom positions provided
	 * by the application in the portPositions array.
	 */
	static setPortPositionsCustom(ports, portPositions, node, zerothX, zerothY) {
		let xPos = zerothX;
		let yPos = zerothY;

		ports.forEach((p, i) => {
			// No need to recalculate the zeroth position AND if there are more
			// ports than portPositions just use the last port position for all
			// subsequent ports.
			if (i > 0 && i < portPositions.length) {
				xPos = this.getNodePortPosX(portPositions[i], node);
				yPos = this.getNodePortPosY(portPositions[i], node);
			}
			p.cx = xPos;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}
}

// Made with Bob
