/*
 * Copyright 2017-2022 Elyra Authors
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

/* eslint no-lonely-if: "off" */

import CanvasUtils from "./common-canvas-utils.js";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_LEFT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_CURVE, LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP,
	NORTH, SOUTH, EAST, WEST }
	from "./constants/canvas-constants";

const CLOCKWISE = false;
const ANTI_CLOCKWISE = true;
const ONE_EIGHTY_DEGREES_IN_RADIANS = Math.PI;

export default class SvgCanvasLinks {
	constructor(config, canvasLayout, nodeUtils, commentUtils) {
		this.canvasLayout = canvasLayout;
		this.config = config;
		this.nodeUtils = nodeUtils;
		this.commentUtils = commentUtils;
	}

	// Returns an object containing the x and y coordinates of the start position
	// of a straight line which extends from the source comment passed in to the
	// end position which is an x, y cordinate.
	getNewStraightCommentLinkStartPos(srcComment, endPos) {
		return CanvasUtils.getOuterCoord(
			srcComment.x_pos,
			srcComment.y_pos,
			srcComment.width,
			srcComment.height,
			this.canvasLayout.linkGap,
			this.commentUtils.getCommentCenterPosX(srcComment),
			this.commentUtils.getCommentCenterPosY(srcComment),
			endPos.x,
			endPos.y);
	}

	// Returns an object containing the x and y coordinates of the start position
	// of a straight line which extends from the node passed in to the
	// end position which is also an x, y coordinate. If an originInfo object is
	// passed in we use it to offset the origin position for the line.
	getNewStraightNodeLinkStartPos(node, endPos, originInfo) {
		let originX;
		let originY;

		if (node.layout.drawNodeLinkLineFromTo === "image_center" && !CanvasUtils.isExpanded(node)) {
			originX = this.nodeUtils.getNodeImageCenterPosX(node);
			originY = this.nodeUtils.getNodeImageCenterPosY(node);
		} else {
			if (originInfo) {
				({ x: originX, y: originY } = this.getCenterOffset(node, originInfo));
			} else {
				originX = this.nodeUtils.getNodeCenterPosX(node);
				originY = this.nodeUtils.getNodeCenterPosY(node);
			}
		}

		return CanvasUtils.getOuterCoord(
			node.x_pos,
			node.y_pos,
			node.width,
			node.height,
			this.canvasLayout.linkGap,
			originX,
			originY,
			endPos.x,
			endPos.y);
	}

	// Returns the lineArray passed in with connection path info added to it.
	addConnectionPaths(links) {
		links.forEach((link) => {
			link.pathInfo = this.getConnectorPathInfo(link);
		});
		return links;
	}

	// Returns an SVG path string for the link (described by the line passed in)
	// based on the connection and link type in the layout info.
	getConnectorPathInfo(link, drawingNewLinkMinInitialLine) {
		const minInitialLine = this.getMinInitialLine(link, drawingNewLinkMinInitialLine);

		// If its a very short line to be drawn just draw a straight line instead
		// of zig-zagging in a very small space.
		if (Math.abs(link.x1 - link.x2) < 20 &&
				Math.abs(link.y1 - link.y2) < 20) {
			return this.getStraightPath(link);

		} else if (link.type === NODE_LINK) {

			if (this.canvasLayout.linkType === LINK_TYPE_CURVE ||
					this.canvasLayout.linkType === LINK_TYPE_ELBOW) {
				return this.getPortLinkPath(link, minInitialLine);
			}

		} else if (link.type === ASSOCIATION_LINK &&
								this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
			return this.getAssociationCurvePath(link, minInitialLine);
		}

		return this.getStraightPath(link);
	}

	// Returns the minInitialLine layout variable that will be either zero for a
	// comment link or from the link-data object (if the size has been
	// pre-calculated for elbow style connections) or from the source node
	// object (data.src) if we are drawing an existing connection or from
	// this.drawingNewLinkData.minInitialLine if we are dynamically drawing
	// a new link.
	getMinInitialLine(link, drawingNewLinkMinInitialLine) {
		let minInitialLine;
		if (link.type === COMMENT_LINK) {
			minInitialLine = 0;
		} else if (link.minInitialLineForElbow) {
			minInitialLine = link.minInitialLineForElbow;
		} else if (link.srcObj && link.srcObj.layout) {
			minInitialLine = link.srcObj.layout.minInitialLine;
		} else if (drawingNewLinkMinInitialLine) {
			minInitialLine = drawingNewLinkMinInitialLine;
		} else {
			minInitialLine = 10;
		}
		return minInitialLine;
	}

	getLinkCoords(link, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation) {
		let coords = null;
		if (link.type === NODE_LINK) {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				coords = this.getNodeLinkCoordsForStraightLine(srcObj, trgNode, link);
			} else {
				coords = this.getNodeLinkCoordsForPorts(srcObj, srcPortId, trgNode, trgPortId);
			}
		} else if (link.type === ASSOCIATION_LINK) {
			if (this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
				coords = this.getAssociationCurveLinkCoords(srcObj, trgNode, assocLinkVariation);
			} else {
				coords = this.getNodeLinkCoordsForStraightLine(srcObj, trgNode);
			}
		} else {
			coords = this.getCommentLinkCoords(srcObj, trgNode);
		}
		return coords;
	}

	getNodeLinkCoordsForStraightLine(srcNode, trgNode, link) {
		let srcCenterX;
		let srcCenterY;
		let trgCenterX;
		let trgCenterY;

		if (srcNode.layout.drawNodeLinkLineFromTo === "image_center" && !CanvasUtils.isExpanded(srcNode)) {
			srcCenterX = this.nodeUtils.getNodeImageCenterPosX(srcNode);
			srcCenterY = this.nodeUtils.getNodeImageCenterPosY(srcNode);
		} else {
			if (link && link.srcOriginInfo) {
				({ x: srcCenterX, y: srcCenterY } = this.getCenterOffset(srcNode, link.srcOriginInfo));
			} else {
				srcCenterX = this.nodeUtils.getNodeCenterPosX(srcNode);
				srcCenterY = this.nodeUtils.getNodeCenterPosY(srcNode);
			}
		}

		if (trgNode.layout.drawNodeLinkLineFromTo === "image_center" && !CanvasUtils.isExpanded(trgNode)) {
			trgCenterX = this.nodeUtils.getNodeImageCenterPosX(trgNode);
			trgCenterY = this.nodeUtils.getNodeImageCenterPosY(trgNode);
		} else {
			if (link && link.trgOriginInfo) {
				({ x: trgCenterX, y: trgCenterY } = this.getCenterOffset(trgNode, link.trgOriginInfo));
			} else {
				trgCenterX = this.nodeUtils.getNodeCenterPosX(trgNode);
				trgCenterY = this.nodeUtils.getNodeCenterPosY(trgNode);
			}
		}

		const startPos = CanvasUtils.getOuterCoord(
			srcNode.x_pos,
			srcNode.y_pos,
			srcNode.width,
			srcNode.height,
			this.canvasLayout.linkGap,
			srcCenterX,
			srcCenterY,
			trgCenterX,
			trgCenterY);

		const endPos = CanvasUtils.getOuterCoord(
			trgNode.x_pos,
			trgNode.y_pos,
			trgNode.width,
			trgNode.height,
			this.canvasLayout.linkGap,
			trgCenterX,
			trgCenterY,
			srcCenterX,
			srcCenterY);

		return {
			originX: startPos.originX, originY: startPos.originY,
			x1: startPos.x, y1: startPos.y,
			x2: endPos.x, y2: endPos.y
		};
	}

	getCenterOffset(node, originInfo) {
		const parts = originInfo.len + 1;
		const index = originInfo.idx + 1;

		let x = 0;
		let y = 0;

		if (originInfo.dir === NORTH ||
				originInfo.dir === SOUTH) {
			x = node.x_pos + ((node.width / parts) * index);
			y = this.nodeUtils.getNodeCenterPosY(node);

		} else if (originInfo.dir === EAST ||
								originInfo.dir === WEST) {
			x = this.nodeUtils.getNodeCenterPosX(node);
			y = node.y_pos + ((node.height / parts) * index);
		}

		return { x, y };
	}

	getNodeLinkCoordsForPorts(srcNode, srcPortId, trgNode, trgPortId) {
		let srcX = srcNode.width + srcNode.layout.outputPortRightPosX;
		let srcY = srcNode.layout.outputPortRightPosY;
		let trgX = trgNode.layout.inputPortLeftPosX;
		let trgY = trgNode.layout.inputPortLeftPosY;

		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			srcX = srcNode.layout.outputPortBottomPosX;
			srcY = srcNode.height + srcNode.layout.outputPortBottomPosY;
			trgX = trgNode.layout.inputPortTopPosX;
			trgY = trgNode.layout.inputPortTopPosY;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			srcX = srcNode.layout.outputPortBottomPosX;
			srcY = srcNode.layout.outputPortBottomPosY;
			trgX = trgNode.layout.inputPortTopPosX;
			trgY = trgNode.height + trgNode.layout.inputPortTopPosY;
		}

		if (srcNode.outputs && srcNode.outputs.length > 0) {
			const port = srcNode.outputs.find((srcPort) => srcPort.id === srcPortId);
			srcX = port ? port.cx : srcX;
			srcY = port ? port.cy : srcY;
		}

		if (trgNode.inputs && trgNode.inputs.length > 0) {
			const port = trgNode.inputs.find((trgPort) => trgPort.id === trgPortId);
			trgX = port ? port.cx : trgX;
			trgY = port ? port.cy : trgY;
		}

		return {
			x1: srcNode.x_pos + srcX,
			y1: srcNode.y_pos + srcY,
			x2: trgNode.x_pos + trgX,
			y2: trgNode.y_pos + trgY
		};
	}

	getAssociationCurveLinkCoords(srcNode, trgNode, assocLinkVariation) {
		let x1 = 0;
		let x2 = 0;

		if (assocLinkVariation === ASSOC_VAR_CURVE_RIGHT) {
			x1 = srcNode.x_pos + srcNode.width;
			x2 = trgNode.x_pos;

		} else if (assocLinkVariation === ASSOC_VAR_CURVE_LEFT) {
			x1 = srcNode.x_pos;
			x2 = trgNode.x_pos + trgNode.width;

		} else if (assocLinkVariation === ASSOC_VAR_DOUBLE_BACK_LEFT) {
			x1 = srcNode.x_pos;
			x2 = trgNode.x_pos;

		} else {
			x1 = srcNode.x_pos + srcNode.width;
			x2 = trgNode.x_pos + trgNode.width;
		}

		return {
			x1: x1,
			y1: srcNode.y_pos + srcNode.layout.outputPortRightPosY,
			x2: x2,
			y2: trgNode.y_pos + trgNode.layout.inputPortLeftPosY };
	}

	getCommentLinkCoords(srcComment, trgNode) {
		const srcCenterX = this.commentUtils.getCommentCenterPosX(srcComment);
		const srcCenterY = this.commentUtils.getCommentCenterPosY(srcComment);
		let trgCenterX;
		let trgCenterY;

		if (trgNode.layout.drawCommentLinkLineTo === "image_center") {
			trgCenterX = this.nodeUtils.getNodeImageCenterPosX(trgNode);
			trgCenterY = this.nodeUtils.getNodeImageCenterPosY(trgNode);
		} else {
			trgCenterX = this.nodeUtils.getNodeCenterPosX(trgNode);
			trgCenterY = this.nodeUtils.getNodeCenterPosY(trgNode);
		}

		const startPos = CanvasUtils.getOuterCoord(
			srcComment.x_pos,
			srcComment.y_pos,
			srcComment.width,
			srcComment.height,
			this.canvasLayout.linkGap,
			srcCenterX,
			srcCenterY,
			trgCenterX,
			trgCenterY);

		const endPos = CanvasUtils.getOuterCoord(
			trgNode.x_pos,
			trgNode.y_pos,
			trgNode.width,
			trgNode.height,
			this.canvasLayout.linkGap,
			trgCenterX,
			trgCenterY,
			srcCenterX,
			srcCenterY);

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
	}

	// Returns the path info, for the object passed in, which describes either a
	// curved or elbow connector line. This method can be called either for
	// drawing a connection line between nodes or for a new link line being
	// drawn out from a source node towards a target node. This method handles
	// the Top->Bottom and Bottom->Top configurations by rotating the input
	// variables to make them look like a Left->Right configuration and then,
	// after calculating the link line path, rotating the path back to fit the
	// Top->Bottom or Bottom->Top configuration.
	// The pathInfo returned contains:
	// path - an SVG path string describing the curved/elbow line
	// centerPoint - the center point of the line used for decoration placement
	getPortLinkPath(link, minInitialLine) {
		let topSrc;
		let topTrg;
		let bottomSrc;
		let bottomTrg;

		// When drawing a link from node to node we will have src and trg nodes.
		if (link.srcObj && link.trgNode) {
			if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
				topSrc = -(link.srcObj.x_pos + link.srcObj.width);
				bottomSrc = -(link.srcObj.x_pos);
				topTrg = -(link.trgNode.x_pos + link.trgNode.width);
				bottomTrg = -(link.trgNode.x_pos);

			} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
				topSrc = link.srcObj.x_pos;
				bottomSrc = link.srcObj.x_pos + link.srcObj.width;
				topTrg = link.trgNode.x_pos;
				bottomTrg = link.trgNode.x_pos + link.trgNode.width;

			} else {
				topSrc = link.srcObj.y_pos;
				bottomSrc = link.srcObj.y_pos + link.srcObj.height;
				topTrg = link.trgNode.y_pos;
				bottomTrg = link.trgNode.y_pos + link.trgNode.height;
			}
		// When dragging out a new link we will not have src nor trg nodes so we
		// make a best guess at the node dimensions.
		} else {
			if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
				topSrc = -link.x1;
				topTrg = -link.x2;
				bottomSrc = -link.x1;
				bottomTrg = -link.x2;

			} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
				topSrc = link.x1;
				topTrg = link.x2;
				bottomSrc = link.x1;
				bottomTrg = link.x2;

			} else {
				topSrc = link.y1;
				topTrg = link.y2;
				bottomSrc = link.y1;
				bottomTrg = link.y2;
			}
		}

		let newData = link;
		// Rotate the input data for TB and BT link configurations to be Left->Right
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			newData = this.rotateData90Degrees(newData, ANTI_CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			newData = this.rotateData90Degrees(newData, CLOCKWISE);
		}

		const pathInfo = this.canvasLayout.linkType === LINK_TYPE_ELBOW
			? this.getElbowPathInfo(newData, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg)
			: this.getCurvePathInfo(newData, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg);

		// For TB and BT link directions rotate the path elements from Left-Right
		// back to the appropriate orientation.
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);
		}

		pathInfo.path = this.createPath(pathInfo.elements);

		return pathInfo;
	}

	// Returns a pathInfo object describing a curved conneciton line based on the
	// data object and minInitialLine passed in. topSrc, topTrg, bottomSrc,
	// bottomTrg describe the boundaries of the source and target node as they
	// would be in the left->right orientation. The output object contains the
	// following fields:
	// elements - an array of path elements describing the line
	// centerPoint - an object with x, y coordinate for the center of the line
	// centerPoint is used for decoration placement.
	getCurvePathInfo(data, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg) {
		// Declare points for decorator positioning. CenterPoint will be the
		// middle of the line.
		const centerPoint = { x: 0, y: 0 };
		const xDiff = data.x2 - data.x1;

		const elements = [];
		elements.push({ p: "M", x: data.x1, y: data.y1 });

		if (xDiff >= minInitialLine ||
				(bottomTrg > topSrc - this.canvasLayout.wrapAroundNodePadding &&
					topTrg < bottomSrc + this.canvasLayout.wrapAroundNodePadding &&
					data.x2 > data.x1)) {
			const corner1X = data.x1 + (data.x2 - data.x1) / 2;
			const corner1Y = data.y1;
			const corner2X = corner1X;
			const corner2Y = data.y2;

			elements.push(
				{ p: "C", x: corner1X, y: corner1Y, x2: corner2X, y2: corner2Y, x3: data.x2, y3: data.y2 }
			);
			centerPoint.x = corner1X;
			centerPoint.y = corner1Y + ((corner2Y - corner1Y) / 2);

		} else {
			const yDiff = data.y2 - data.y1;

			const midY = this.calculateMidY(data, topSrc, bottomSrc, topTrg, bottomTrg);

			// Calculate an offset for the start points of the straight line. This
			// will be relative to the start and end point of the curve. This needs
			// to be based on the X gap between the source and target nodes but also
			// dependent on the Y gap between those nodes because, as the Y gap
			// increases, we want the straight line to decrease in size.
			const offsetForStraightLine = Math.min((Math.abs(yDiff) / 2), -(xDiff - minInitialLine / 2));

			// Calculate an offset for the first and last corners. This allows the
			// curve to 'grow' slowly out from a straight line to a point where the
			// initial corners of the curve are a maximum of minInitialLine.
			const offsetForFirstCorner = minInitialLine - Math.max((xDiff / 2), 0);

			const corner1X = data.x1 + offsetForFirstCorner;
			const corner1Y = data.y1;

			const corner2X = corner1X;
			const corner2Y = data.y1 + ((midY - data.y1) / 2);

			const corner4X = data.x1 + ((data.x2 - data.x1) / 2);
			const corner4Y = midY;

			const corner4aX = data.x1 - offsetForStraightLine;
			const corner4aY = midY;

			const corner4bX = data.x2 + offsetForStraightLine;
			const corner4bY = midY;

			const corner5X = data.x2 - offsetForFirstCorner;
			const corner5Y = midY;

			const corner6X = corner5X;
			const corner6Y = midY + ((data.y2 - midY) / 2);

			// There is enough space we draw a straight line to join one end of the
			// curve to another. Otherwise we just draw a continuous curve with no
			// straight line.
			if (corner4aX > corner4bX) {
				elements.push(
					{ p: "Q", x: corner1X, y: corner1Y, x2: corner2X, y2: corner2Y },
					{ p: "T", x: corner4aX, y: corner4aY },
					{ p: "L", x: corner4bX, y: corner4bY },
					{ p: "Q", x: corner5X, y: corner5Y, x2: corner6X, y2: corner6Y },
					{ p: "T", x: data.x2, y: data.y2 }
				);

				centerPoint.x = corner4aX + ((corner4bX - corner4aX) / 2);
				centerPoint.y = corner4aY;
			} else {
				elements.push(
					{ p: "Q", x: corner1X, y: corner1Y, x2: corner2X, y2: corner2Y },
					{ p: "T", x: corner4X, y: corner4Y },
					{ p: "Q", x: corner5X, y: corner5Y, x2: corner6X, y2: corner6Y },
					{ p: "T", x: data.x2, y: data.y2 }
				);

				centerPoint.x = corner4X;
				centerPoint.y = corner4Y;
			}
		}

		return { elements, centerPoint };
	}

	// Returns a pathInfo object describing an elbow connection line based on the
	// data object and minInitialLine passed in. The output object contains the
	// following fields:
	// elements - an array of path elements describing the line
	// centerPoint - an object with x, y coordinates for the center of the line
	//               used for decoration placement.
	getElbowPathInfo(data, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg) {
		// The minimum size of the line entering the target port. When
		// dynamically drawing a new connection we will not have a target node
		// so use a fixed value for this.
		const minFinalLine = data.trgNode ? data.trgNode.layout.minFinalLine : 30;

		// Initalize centerPoint which can be used by the link decorations
		const centerPoint = { x: 0, y: 0 };

		const corner1X = data.x1 + minInitialLine;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;

		let elbowYOffset;

		// This is a special case where the source and target handles are very
		// close together.
		if (xDiff > 0 &&
				yDiff < (4 * this.canvasLayout.elbowSize) &&
				yDiff > -(4 * this.canvasLayout.elbowSize)) {
			if (xDiff < (minInitialLine + minFinalLine)) {
				elbowYOffset = yDiff / 4;
			} else {
				elbowYOffset = yDiff / 2;
			}

		} else {
			if (yDiff >= 0) {
				elbowYOffset = this.canvasLayout.elbowSize;
			} else {
				elbowYOffset = -this.canvasLayout.elbowSize;
			}
		}

		let elbowXOffset = this.canvasLayout.elbowSize;
		let extraSegments = false;	// Indicates need for extra elbows and lines

		if (xDiff < (minInitialLine + minFinalLine)) {
			extraSegments = true;
			corner2X = data.x2 - minFinalLine;
			elbowXOffset = Math.min(this.canvasLayout.elbowSize, -((xDiff - (minInitialLine + minFinalLine)) / 2));
		}

		const elements = [];
		elements.push(
			{ p: "M", x: data.x1, y: data.y1 },
			{ p: "L", x: (corner1X - this.canvasLayout.elbowSize), y: corner1Y },
			{ p: "Q", x: corner1X, y: corner1Y, x2: corner1X, y2: (corner1Y + elbowYOffset) }
		);

		if (extraSegments === false) {
			elements.push({ p: "L", x: corner2X, y: (corner2Y - elbowYOffset) });

			centerPoint.x = corner2X;
			centerPoint.y = corner2Y;

		} else {
			const midY = (xDiff < 0)
				? this.calculateMidY(data, topSrc, bottomSrc, topTrg, bottomTrg)
				: corner2Y - (corner2Y - corner1Y) / 2;

			let corner2Ya;
			let corner2Yb;

			if ((midY < topTrg && midY < topSrc) ||
					(midY > bottomTrg && midY > bottomSrc)) {
				corner2Ya = midY - elbowYOffset;
				corner2Yb = corner2Y + elbowYOffset;
			} else {
				corner2Ya = midY + elbowYOffset;
				corner2Yb = corner2Y - elbowYOffset;
			}

			elements.push(
				{ p: "L", x: corner1X, y: (midY - elbowYOffset) },
				{ p: "Q", x: corner1X, y: midY, x2: (corner1X - elbowXOffset), y2: midY },
				{ p: "L", x: (corner2X + elbowXOffset), y: midY },
				{ p: "Q", x: corner2X, y: midY, x2: corner2X, y2: corner2Ya },
				{ p: "L", x: corner2X, y: corner2Yb }
			);

			centerPoint.x = corner1X;
			centerPoint.y = midY;
		}

		elements.push(
			{ p: "Q", x: corner2X, y: corner2Y, x2: (corner2X + this.canvasLayout.elbowSize), y2: corner2Y },
			{ p: "L", x: data.x2, y: data.y2 }
		);

		return { elements, centerPoint };
	}

	// Returns a Y coordinate for the horizontal line that joins the source and
	// target nodes (to be connected either with a curve or elbow line style) when
	// the target node is to the left of the source node. This is either the
	// center point between the source and target nodes, if there is room to draw
	// the line between them, or it is the coordinate of a wrap-around line to be
	// drawn around the outside of the source and target nodes.
	calculateMidY(data, topSrc, bottomSrc, topTrg, bottomTrg) {
		let midY;

		if (topTrg >= bottomSrc + this.canvasLayout.wrapAroundNodePadding) {
			midY = bottomSrc + ((topTrg - bottomSrc) / 2);
		} else if (bottomTrg <= topSrc - this.canvasLayout.wrapAroundNodePadding) {
			midY = bottomTrg + ((topSrc - bottomTrg) / 2);
		} else {
			if (data.y1 > data.y2) {
				midY = Math.min(topSrc, topTrg) - this.canvasLayout.wrapAroundSpacing;
			} else {
				midY = Math.max(bottomSrc, bottomTrg) + this.canvasLayout.wrapAroundSpacing;
			}
		}

		return midY;
	}

	// Returns a new data object based on the data object passed in with its
	// x1,y1 and x2,y2 coordinates rotated 90 degrees in the clockwise direction
	// or 90 degress in the anti-clockwise dirction if the antiClockwise
	// parameter is set to true.
	rotateData90Degrees(data, antiClockwise) {
		const newPoint1 = this.rotatePoint90Degrees(data.x1, data.y1, antiClockwise);
		const newPoint2 = this.rotatePoint90Degrees(data.x2, data.y2, antiClockwise);
		return { x1: newPoint1.x, y1: newPoint1.y, x2: newPoint2.x, y2: newPoint2.y };
	}

	// Returns the array of path elements passed in rotated by 90 degrees in the
	// clockwise direction or 90 degrees in the anti-clockwise direction if the
	// antiClockwise parameter is set to true.
	rotateElements90Degrees(elements, antiClockwise) {
		let newPoint;
		elements.forEach((el) => {
			newPoint = this.rotatePoint90Degrees(el.x, el.y, antiClockwise);
			el.x = newPoint.x;
			el.y = newPoint.y;
			if (el.p === "Q" || el.p === "C") {
				newPoint = this.rotatePoint90Degrees(el.x2, el.y2, antiClockwise);
				el.x2 = newPoint.x;
				el.y2 = newPoint.y;
				if (el.p === "C") {
					newPoint = this.rotatePoint90Degrees(el.x3, el.y3, antiClockwise);
					el.x3 = newPoint.x;
					el.y3 = newPoint.y;
				}
			}
		});
		return elements;
	}

	// Returns an object containing x and y coordinate passed in rotated by 90
	// degrees in the clockwise direction or by 90 degrees anit-clockwise if the
	// antiClockwise parameter is set to true.
	// https://math.stackexchange.com/questions/1330161/how-to-rotate-points-through-90-degree
	rotatePoint90Degrees(x, y, antiClockwise) {
		if (antiClockwise) {
			return { x: y, y: -x };
		}
		return { x: -y, y: x };
	}

	// Returns an SVG path string from the array of path elements passed in.
	createPath(elements) {
		const count = elements.length - 1;
		let path = "";
		elements.forEach((el, i) => {
			if (el.p === "M") {
				path += "M " + el.x + " " + el.y;
			} else if (el.p === "L") {
				path += "L " + el.x + " " + el.y;
			} else if (el.p === "T") {
				path += "T " + el.x + " " + el.y;
			} else if (el.p === "Q") {
				path += "Q " + el.x + " " + el.y + " " + el.x2 + " " + el.y2;
			} else if (el.p === "C") {
				path += "C " + el.x + " " + el.y + " " + el.x2 + " " + el.y2 + " " + el.x3 + " " + el.y3;
			}
			if (i < count) {
				path += " ";
			}
		});
		return path;
	}

	// Returns an object containing the path string, center position and angle
	// for the line object passed in which describes a simple straight connector
	// line from source to target.
	getStraightPath(data) {
		const path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;
		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;
		const centerPoint = {
			x: data.x1 + (xDiff / 2),
			y: data.y1 + (yDiff / 2)
		};
		let angle = Math.atan(yDiff / xDiff); // Atan(Opposite / Adjacent) = Angle in Radians

		if (xDiff < 0) {
			angle = ONE_EIGHTY_DEGREES_IN_RADIANS + angle;
		}

		return { path, centerPoint, angle };
	}

	getAssociationCurvePath(data, minInitialLine) {
		if (data.assocLinkVariation === ASSOC_VAR_CURVE_LEFT) {
			return this.getCurveLeftPath(data, minInitialLine);

		} else if (data.assocLinkVariation === ASSOC_VAR_DOUBLE_BACK_LEFT) {
			return this.getDoubleBackLeft(data, minInitialLine);

		} else if (data.assocLinkVariation === ASSOC_VAR_DOUBLE_BACK_RIGHT) {
			return this.getDoubleBackRight(data, minInitialLine);

		}
		return this.getCurveRightPath(data, minInitialLine);
	}

	getCurveLeftPath(data, minInitialLine) {
		const corner1X = data.x1 - ((data.x1 - data.x2) / 2);
		return this.getCurveOutPath(data, minInitialLine, corner1X);
	}

	getCurveRightPath(data, minInitialLine) {
		const corner1X = data.x1 + ((data.x2 - data.x1) / 2);
		return this.getCurveOutPath(data, minInitialLine, corner1X);
	}

	getCurveOutPath(data, minInitialLine, corner1X) {
		const corner1Y = data.y1;
		const corner2X = corner1X;
		const corner2Y = data.y2;
		const path = "M " + data.x1 + " " + data.y1 +
			" C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
		const centerPoint = { x: corner1X, y: corner1Y + ((corner2Y - corner1Y) / 2) };
		return { path, centerPoint };
	}

	getDoubleBackLeft(data, minInitialLine) {
		const corner1X = Math.min(data.x1, data.x2) - minInitialLine - 100;
		return this.getDoubleBack(data, minInitialLine, corner1X);
	}

	getDoubleBackRight(data, minInitialLine) {
		const corner1X = Math.max(data.x1, data.x2) + minInitialLine + 100;
		return this.getDoubleBack(data, minInitialLine, corner1X);
	}

	getDoubleBack(data, minInitialLine, corner1X) {
		const corner1Y = data.y1;
		const corner2X = corner1X;
		const corner2Y = data.y2;
		const path = "M " + data.x1 + " " + data.y1 +
			" C " + corner1X + " " + corner1Y + " " +
			corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
		const centerPointX = this.calcCenterPoint(data.x1, corner1X, corner2X, data.x2);
		const centerPointY = this.calcCenterPoint(data.y1, corner1Y, corner2Y, data.y2);
		const centerPoint = { x: centerPointX, y: centerPointY };
		return { path, centerPoint };
	}

	// Returns an x or y coordinate of the center point on a bezier curve from
	// the four x or y coordinates passed in which are the coordinates of the four
	// control points that describe the curve.
	calcCenterPoint(c1, c2, c3, c4) {
		const t = 0.5;

		const part1 = Math.pow((1 - t), 3) * c1;
		const part2 = 3 * Math.pow((1 - t), 2) * t * c2;
		const part3 = 3 * Math.pow((1 - t), 2) * t * c3;
		const part4 = Math.pow(t, 3) * c4;

		return part1 + part2 + part3 + part4;
	}

}
