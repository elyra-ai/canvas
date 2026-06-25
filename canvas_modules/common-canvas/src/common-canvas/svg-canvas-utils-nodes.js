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
import { ERROR, WARNING, NODE_ERROR_ICON, NODE_WARNING_ICON,
	TEXT_AREA_BORDER_ADJUSTMENT, USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON } from "./constants/canvas-constants";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";
import SUPERNODE_EXT_ICON from "../../assets/images/supernode_ext.svg";

// Map defining the display order of node child elements
// Lower numbers are rendered first (appear behind higher numbers)
const NODE_ELEMENT_ORDER = new Map([
	["d3-focus-path", 1],
	["d3-node-sizing", 2],
	["d3-node-selection-highlight", 3],
	["d3-node-body-outline", 4],
	["d3-foreign-object-external-node", 5],
	["d3-node-image", 6],
	["d3-foreign-object-node-label", 7],
	["d3-node-ellipsis-group", 8],
	["d3-node-super-expand-icon-group", 9],
	["d3-node-port-input", 10],
	["d3-node-port-output", 10], // Ports have same priority
	["d3-svg-canvas-underlay", 11], // Supernode contents
	["d3-node-error-marker", 12],
	["d3-node-dec-group", 13]
]);

const DEFAULT_ELEMENT_INDEX = 999;
export default class SvgCanvasNodes {
	// Returns the element before which a new node element should be inserted to
	// maintain the correct display order. The order is:
	// 1. focus outline, 2. sizing area, 3. selection highlighting, 4. node body,
	// 5. foreign object for React object, 6. node image, 7. node label,
	// 8. ellipsis icon, 9. supernode expansion icon, 10. ports, 11. supernode contents,
	// 12. error marker, 13. decorations
	static getBeforeElement(nodeGrp, newElementClass) {
		if (!nodeGrp?.children) {
			return null;
		}

		const newElementIndex = NODE_ELEMENT_ORDER.get(newElementClass) ?? DEFAULT_ELEMENT_INDEX;

		// Find the first child element that should come after the new element
		return this.getNextChildElement(nodeGrp, newElementIndex);
	}

	// Get the next child, if one exists, in the nodeGrp's children after
	// the one at newElementIndex
	static getNextChildElement(nodeGrp, newElementIndex) {
		const childrenArray = Array.from(nodeGrp.children);
		const found = childrenArray.find((child) =>
			this.shouldChildComeAfter(child, newElementIndex));

		return found ?? null;
	}

	// Returns true if the child element should come after an element with the given order
	static shouldChildComeAfter(child, targetOrder) {
		const classList = child.classList;
		for (const className of classList) {
			const order = NODE_ELEMENT_ORDER.get(className);
			if (typeof order !== "undefined" && order > targetOrder) {
				return true;
			}
		}
		return false;
	}

	static isPointInNodeBoundary(pos, node) {
		return pos.x >= node.x_pos &&
			pos.x <= node.x_pos + node.width &&
			pos.y >= node.y_pos &&
			pos.y <= node.y_pos + node.height;
	}

	static getNodeLabelClass(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return "d3-node-label d3-label-single-line " + this.getMessageLabelClass(node.messages);
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-label-single-line" : " d3-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-label-center" : "";
		return "d3-node-label " + this.getMessageLabelClass(node.messages) + lineTypeClass + justificationClass;
	}

	static getNodeLabelTextAreaClass(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return "d3-node-label-entry d3-label-single-line";
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-label-single-line" : " d3-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-label-center" : "";
		return "d3-node-label-entry" + lineTypeClass + justificationClass;
	}

	static getErrorMarkerIcon(data) {
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

	static getMessageLevel(messages) {
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

	static getMessageLabelClass(messages) {
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

	static getErrorMarkerClass(messages) {
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
	static getNodeCenterPosX(node) {
		return node.x_pos + (node.width / 2);
	}

	// Returns the absolute y coordinate of the center of the node.  If node is
	// an expanded supernode, its expanded height is in the 'height' field.
	static getNodeCenterPosY(node) {
		return node.y_pos + (node.height / 2);
	}

	// Returns the absolute x coordinate of the center of the node image
	static getNodeImageCenterPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.x_pos + node.layout.supernodeImagePosX + (node.layout.supernodeImageWidth / 2);
		}
		return node.x_pos +
			CanvasUtils.getElementPosX(node.width, node.layout.imagePosX, node.layout.imagePosition) +
			(node.layout.imageWidth / 2);
	}

	// Returns the absolute y coordinate of the center of the node image
	static getNodeImageCenterPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.y_pos + node.layout.supernodeImagePosY + (node.layout.supernodeImageHeight / 2);
		}
		return node.y_pos +
			CanvasUtils.getElementPosY(node.height, node.layout.imagePosY, node.layout.imagePosition) +
			(node.layout.imageHeight / 2);
	}

	static getNodeImagePosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeImagePosX;
		}
		return CanvasUtils.getElementPosX(node.width, node.layout.imagePosX, node.layout.imagePosition);
	}

	static getNodeImagePosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeImagePosY;
		}
		return CanvasUtils.getElementPosY(node.height, node.layout.imagePosY, node.layout.imagePosition);
	}

	static getNodeImageWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeImageWidth;
		}
		return node.layout.imageWidth;
	}

	static getNodeImageHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeImageHeight;
		}
		return node.layout.imageHeight;
	}

	static getNodeLabelPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeLabelPosX;
		}
		const x = CanvasUtils.getElementPosX(node.width, node.layout.labelPosX, node.layout.labelPosition);
		return node.layout.labelAlign === "center" ? x - (node.layout.labelWidth / 2) : x;
	}

	static getNodeLabelPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeLabelPosY;
		}
		return CanvasUtils.getElementPosY(node.height, node.layout.labelPosY, node.layout.labelPosition);
	}

	static getNodeLabelWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width - node.layout.supernodeLabelPosX + node.layout.supernodeErrorPosX;
		}
		return node.layout.labelWidth;
	}

	static getNodeLabelHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeLabelHeight;
		}
		return node.layout.labelHeight;
	}

	static getNodeLabelEditIconTranslate(node, spanObj, zoomScale, fullLabelOnHover) {
		return `translate(${this.getNodeLabelEditIconPosX(node, spanObj, zoomScale, fullLabelOnHover)}, ${this.getNodeLabelEditIconPosY(node)})`;
	}

	static getNodeLabelEditIconPosX(node, spanObj, zoomScale, fullLabelOnHover) {
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

	static getNodeLabelEditIconPosY(node) {
		return this.getNodeLabelPosY(node);
	}

	static getNodeLabelHoverPosX(node) {
		if (node.layout.labelSingleLine &&
				node.layout.labelAlign === "center") {
			return this.getNodeLabelPosX(node) - 250;
		}
		return this.getNodeLabelPosX(node);
	}

	static getNodeLabelHoverWidth(node) {
		if (node.layout.labelSingleLine) {
			if (node.layout.labelAlign === "center") {
				return node.layout.labelWidth + 500;
			}
			return node.layout.labelWidth + 40;
		}
		return node.layout.labelWidth;
	}

	static getNodeLabelHoverHeight(node, spanObj, zoomScale) {
		if (node.layout.labelSingleLine) {
			return node.layout.labelHeight;
		}
		const calcHeight = spanObj.getBoundingClientRect().height / zoomScale;
		return Math.max(calcHeight, node.layout.labelHeight);
	}

	static getNodeLabelTextAreaWidth(node) {
		return this.getNodeLabelWidth(node) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	static getNodeLabelTextAreaHeight(node) {
		return this.getNodeLabelHeight(node) + (2 * TEXT_AREA_BORDER_ADJUSTMENT);
	}

	static getNodeLabelTextAreaPosX(node) {
		return this.getNodeLabelPosX(node) - TEXT_AREA_BORDER_ADJUSTMENT;
	}

	static getNodeLabelTextAreaPosY(node) {
		return this.getNodeLabelPosY(node) - TEXT_AREA_BORDER_ADJUSTMENT;
	}

	static getNodeEllipsisTranslate(node) {
		return `translate(${this.getNodeEllipsisPosX(node)}, ${this.getNodeEllipsisPosY(node)})`;
	}

	static getNodeEllipsisWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeEllipsisWidth;
		}
		return node.layout.ellipsisWidth;
	}

	static getNodeEllipsisHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeEllipsisHeight;
		}
		return node.layout.ellipsisHeight;
	}

	static getNodeEllipsisIconWidth(node) {
		return this.getNodeEllipsisWidth(node) - (2 * node.layout.ellipsisHoverAreaPadding);
	}

	static getNodeEllipsisIconHeight(node) {
		return this.getNodeEllipsisHeight(node) - (2 * node.layout.ellipsisHoverAreaPadding);
	}

	static getNodeEllipsisPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width + node.layout.supernodeEllipsisPosX;
		}

		return CanvasUtils.getElementPosX(node.width, node.layout.ellipsisPosX, node.layout.ellipsisPosition);
	}

	static getNodeEllipsisPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeEllipsisPosY;
		}

		return CanvasUtils.getElementPosY(node.height, node.layout.ellipsisPosY, node.layout.ellipsisPosition);
	}

	static getNodeExpansionIconTranslate(node) {
		const posX = node.width + node.layout.supernodeExpansionIconPosX;
		return `translate(${posX}, ${node.layout.supernodeExpansionIconPosY})`;
	}

	static getNodeErrorPosX(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.width + node.layout.supernodeErrorPosX;
		}
		return CanvasUtils.getElementPosX(node.width, node.layout.errorXPos, node.layout.errorPosition);
	}

	static getNodeErrorPosY(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeErrorPosY;
		}
		return CanvasUtils.getElementPosY(node.height, node.layout.errorYPos, node.layout.errorPosition);
	}

	static getNodeErrorWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeErrorWidth;
		}
		return node.layout.errorWidth;
	}

	static getNodeErrorHeight(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return node.layout.supernodeErrorHeight;
		}
		return node.layout.errorHeight;
	}

	// Returns the X offset for the port which references the nodeId passed in
	// based on the precalculated X coordinate of the port.
	static getSupernodePortXOffset(nodeId, ports, node) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cx - node.layout.supernodeSVGAreaPadding;
		}
		return 0;
	}

	// Returns the Y offset for the port which references the nodeId passed in
	// based on the pre-calculated Y coordinate of the port.
	static getSupernodePortYOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cy;
		}
		return 0;
	}

	// Returns the appropriate image from the object (either node or decoration)
	// passed in.
	static getNodeImage(d) {
		if (!d.image) {
			return null;
		} else if (d.image === USE_DEFAULT_ICON) {
			if (CanvasUtils.isSupernode(d)) {
				return SUPERNODE_ICON;
			}
		} else if (d.image === USE_DEFAULT_EXT_ICON) {
			if (CanvasUtils.isSupernode(d)) {
				return SUPERNODE_EXT_ICON;
			}
		}
		return d.image;
	}

	// Returns the type of image passed in, either "svg" or "image" or
	// "jsx" or null (if no image was provided).
	// This will be used to append an svg or image element to the DOM.
	// Parameters:
	//   nodeImage - the image to check
	//   externalUtils - utility object with isValidJsxElement method
	//   config - configuration object with enableImageDisplay setting
	static getImageType(nodeImage, externalUtils, config) {
		if (nodeImage) {
			if (typeof nodeImage === "object") {
				if (externalUtils && externalUtils.isValidJsxElement(nodeImage)) {
					return "jsx";
				}
			} else if (typeof nodeImage === "string") {
				return	nodeImage.endsWith(".svg") && config?.enableImageDisplay !== "SVGAsImage" ? "svg" : "image";
			}
		}
		return null;
	}

	// Returns the node that is near the position passed in. If nodeProximity
	// is provided it will be used as additional space beyond the node boundary
	// to decide if the node is under the position.
	// Parameters:
	//   pos - object with x and y coordinates
	//   nodeProximity - additional space beyond node boundary (default 0)
	//   nodes - array of nodes to check
	static getNodeNearPos(pos, nodeProximity, nodes) {
		let node = null;
		const prox = nodeProximity || 0;
		nodes.forEach((d) => {
			if (pos.x >= d.x_pos - prox &&
					pos.x <= d.x_pos + d.width + prox &&
					pos.y >= d.y_pos - prox &&
					pos.y <= d.y_pos + d.height + prox) {
				node = d;
			}
		});
		return node;
	}

	/**
	 * Returns an SVG path that draws the shape for a rectangle node. This is
	 * drawn as a path rather than an SVG rect element to keep calling code generic.
	 * highlightGap may be a number (uniform gap on all sides) or an object with
	 * leftGap, rightGap, topGap, bottomGap properties for per-side control.
	 *
	 * @param {Object} data - Node data with width and height properties.
	 * @param {number|Object} highlightGap - Outward inflation applied to all sides.
	 * @returns {string} SVG path string.
	 */
	static getRectangleNodeShapePath(data, highlightGap = 0) {
		const gaps = typeof highlightGap === "object"
			? highlightGap
			: {
				leftGap: highlightGap,
				rightGap: highlightGap,
				topGap: highlightGap,
				bottomGap: highlightGap
			};

		const l = 0 - gaps.leftGap;
		const t = 0 - gaps.topGap;
		const r = data.width + gaps.rightGap;
		const b = data.height + gaps.bottomGap;

		return "M " + l + " " + t + " L " + r + " " + t + " " + r + " " + b + " " + l + " " + b + " Z";
	}

	/**
	 * Returns an SVG path that draws a rectangle-with-rounded-corners node shape.
	 *
	 * @param {Object} data - Node data with width and height properties.
	 * @param {number} highlightGap - Uniform outward inflation applied to all sides.
	 * @returns {string} SVG path string.
	 */
	static getRectRoundCornersShapePath(data, highlightGap = 0) {
		const c = 10; // Corner size
		const l = 0 - highlightGap;
		const t = 0 - highlightGap;
		const r = data.width + highlightGap;
		const b = data.height + highlightGap;
		const lc = l + c;
		const rc = r - c;
		const tc = t + c;
		const bc = b - c;

		return "M " + lc + " " + t + " L " + rc + " " + t + " " +
			"Q " + r + " " + t + " " + r + " " + tc + " " +
			"L " + r + " " + bc + " " +
			"Q " + r + " " + b + " " + rc + " " + b + " " +
			"L " + lc + " " + b + " " +
			"Q " + l + " " + b + " " + l + " " + bc + " " +
			"L " + l + " " + tc + " " +
			"Q " + l + " " + t + " " + lc + " " + t +
			" Z";
	}

	/**
	 * Returns an SVG path for the 'port-arcs' outline shape that encloses both
	 * the node body and all ports regardless of where the ports are positioned.
	 * The highlightGap uniformly inflates the outline away from the node and ports.
	 *
	 * The path is built by walking each side of the inflated node rectangle in
	 * order and inserting an outward circular arc bump wherever a port's arc
	 * circle protrudes through that side. Port arcs are emitted sorted along the
	 * walking direction so the path never doubles back.
	 *
	 * @param {Object} data - Node data object with width, height, inputs, outputs, layout.
	 * @param {number} highlightGap - Additional outward offset applied to the whole outline.
	 * @returns {string} SVG path string.
	 */
	static getPortArcsNodeShapePath(data, highlightGap = 0) {
		const gap = highlightGap || 0;
		const arcR = data.layout.portArcRadius;
		const allPorts = [...(data.inputs || []), ...(data.outputs || [])];

		// Inflated rectangle bounds
		const L = -gap;
		const T = -gap;
		const R = data.width + gap;
		const B = data.height + gap;

		// Returns the two y-intercepts where a port's arc circle crosses a
		// vertical edge at xEdge, or null if it does not reach the edge.
		const verticalEdgeIntercepts = (port, xEdge) => {
			const dx = xEdge - port.cx;
			const disc = (arcR * arcR) - (dx * dx);
			if (disc < 0) {
				return null;
			}
			const half = Math.sqrt(disc);
			return [port.cy - half, port.cy + half];
		};

		// Returns the two x-intercepts where a port's arc circle crosses a
		// horizontal edge at yEdge, or null if it does not reach the edge.
		const horizEdgeIntercepts = (port, yEdge) => {
			const dy = yEdge - port.cy;
			const disc = (arcR * arcR) - (dy * dy);
			if (disc < 0) {
				return null;
			}
			const half = Math.sqrt(disc);
			return [port.cx - half, port.cx + half];
		};

		// Builds the segment of the path that walks along a vertical edge
		// (left or right) inserting outward arc bumps for ports that protrude.
		// xEdge     - x coordinate of the inflated edge line.
		// fromY/toY - start and end y along the edge (fromY < toY when going
		//             downward; toY < fromY when going upward).
		// outwardSweep - SVG arc sweep-flag (1 = clockwise, 0 = anti-clockwise).
		const verticalEdgeWithBumps = (xEdge, fromY, toY, outwardSweep) => {
			const goingDown = toY > fromY;
			const exterior = goingDown ? "right" : "left";

			// Collect ports whose arc circles protrude through this edge, keeping
			// only those whose centre is on the exterior side (or on the edge
			// itself) so that interior ports don't create outward bumps.
			const bumps = [];
			allPorts.forEach((port) => {
				if (!verticalEdgeIntercepts(port, xEdge)) {
					return;
				}
				const isExterior = exterior === "right"
					? port.cx >= data.width - data.layout.portArcRadius
					: port.cx <= data.layout.portArcRadius;
				if (!isExterior) {
					return;
				}
				// Arc endpoints are always the full diameter span centred on port.cy,
				// clamped to the edge's travel range so arcs near corners don't overshoot.
				const yMin = Math.min(fromY, toY);
				const yMax = Math.max(fromY, toY);
				const entryY = Math.max(port.cy - arcR, yMin);
				const exitY = Math.min(port.cy + arcR, yMax);
				if (exitY > entryY) {
					bumps.push({ entryY, exitY, port });
				}
			});

			// Sort bumps in the direction of travel.
			bumps.sort((a, b) => (goingDown ? a.entryY - b.entryY : b.entryY - a.entryY));

			let segment = "";
			let cursor = fromY;
			bumps.forEach((bump) => {
				const bumpEntry = goingDown ? bump.entryY : bump.exitY;
				const bumpExit = goingDown ? bump.exitY : bump.entryY;
				if (goingDown ? bumpEntry > cursor : bumpEntry < cursor) {
					segment += ` L ${xEdge} ${bumpEntry}`;
				}
				segment += ` A ${arcR} ${arcR} 180 0 ${outwardSweep} ${xEdge} ${bumpExit}`;
				cursor = bumpExit;
			});

			// Final straight segment to the corner.
			if (goingDown ? cursor < toY : cursor > toY) {
				segment += ` L ${xEdge} ${toY}`;
			}
			return segment;
		};

		// Builds the segment of the path that walks along a horizontal edge
		// (top or bottom) inserting outward arc bumps for ports that protrude.
		// yEdge       - y coordinate of the inflated edge line.
		// fromX/toX   - start and end x along the edge.
		// outwardSweep - SVG arc sweep-flag (1 = clockwise, 0 = anti-clockwise).
		const horizEdgeWithBumps = (yEdge, fromX, toX, outwardSweep) => {
			const goingRight = toX > fromX;
			const exterior = goingRight ? "top" : "bottom";

			const bumps = [];
			allPorts.forEach((port) => {
				if (!horizEdgeIntercepts(port, yEdge)) {
					return;
				}
				const isExterior = exterior === "top"
					? port.cy <= data.layout.portArcRadius
					: port.cy >= data.height - data.layout.portArcRadius;
				if (!isExterior) {
					return;
				}
				// Arc endpoints are always the full diameter span centred on port.cx,
				// clamped to the edge's travel range so arcs near corners don't overshoot.
				const xMin = Math.min(fromX, toX);
				const xMax = Math.max(fromX, toX);
				const entryX = Math.max(port.cx - arcR, xMin);
				const exitX = Math.min(port.cx + arcR, xMax);
				if (exitX > entryX) {
					bumps.push({ entryX, exitX, port });
				}
			});

			bumps.sort((a, b) => (goingRight ? a.entryX - b.entryX : b.entryX - a.entryX));

			let segment = "";
			let cursor = fromX;
			bumps.forEach((bump) => {
				const bumpEntry = goingRight ? bump.entryX : bump.exitX;
				const bumpExit = goingRight ? bump.exitX : bump.entryX;
				if (goingRight ? bumpEntry > cursor : bumpEntry < cursor) {
					segment += ` L ${bumpEntry} ${yEdge}`;
				}
				segment += ` A ${arcR} ${arcR} 180 0 ${outwardSweep} ${bumpExit} ${yEdge}`;
				cursor = bumpExit;
			});

			if (goingRight ? cursor < toX : cursor > toX) {
				segment += ` L ${toX} ${yEdge}`;
			}
			return segment;
		};

		// Assemble the full closed path walking clockwise around the inflated rectangle.
		// All four edges use sweep=1 to produce outward-facing bulges. In SVG's y-down
		// coordinate system with the entry/exit reversal logic in horizEdgeWithBumps,
		// sweep=1 consistently bows away from the node centre for all sides.
		let path = `M ${L} ${T}`;
		path += horizEdgeWithBumps(T, L, R, 1); // top edge, left-to-right, bumps upward
		path += verticalEdgeWithBumps(R, T, B, 1); // right edge, top-to-bottom, bumps rightward
		path += horizEdgeWithBumps(B, R, L, 1); // bottom edge, right-to-left, bumps downward
		path += verticalEdgeWithBumps(L, B, T, 1); // left edge, bottom-to-top, bumps leftward
		path += " Z";
		return path;
	}
}
