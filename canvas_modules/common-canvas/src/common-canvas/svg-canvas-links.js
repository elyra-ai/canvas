/*
 * Copyright 2020 IBM Corporation
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

import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_LEFT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_CURVE, LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP }
	from "./constants/canvas-constants";

const CLOCKWISE = false;
const ANTI_CLOCKWISE = true;

export default class SvgCanvasLinks {
	constructor(canvasLayout, config) {
		this.canvasLayout = canvasLayout;
		this.config = config;
	}

	// Returns a start point for a new link when a straight line is being dragged
	// out from a comment or a node.
	getNewStraightCommentLinkStartPos(srcComment, transPos) {
		return this.getOuterCoord(
			srcComment.x_pos - this.canvasLayout.linkGap,
			srcComment.y_pos - this.canvasLayout.linkGap,
			srcComment.width + (this.canvasLayout.linkGap * 2),
			srcComment.height + (this.canvasLayout.linkGap * 2),
			(srcComment.width / 2) + this.canvasLayout.linkGap,
			(srcComment.height / 2) + this.canvasLayout.linkGap,
			transPos.x,
			transPos.y);
	}

	getNewStraightNodeLinkStartPos(srcNode, transPos) {
		let srcCenterX;
		let srcCenterY;

		if (srcNode.layout.drawNodeLinkLineFromTo === "image_center") {
			srcCenterX = srcNode.layout.imagePosX + (srcNode.layout.imageWidth / 2) + this.canvasLayout.linkGap;
			srcCenterY = srcNode.layout.imagePosY + (srcNode.layout.imageHeight / 2) + this.canvasLayout.linkGap;
		} else {
			srcCenterX = (srcNode.width / 2) + this.canvasLayout.linkGap;
			srcCenterY = (srcNode.height / 2) + this.canvasLayout.linkGap;
		}

		return this.getOuterCoord(
			srcNode.x_pos - this.canvasLayout.linkGap,
			srcNode.y_pos - this.canvasLayout.linkGap,
			srcNode.width + (this.canvasLayout.linkGap * 2),
			srcNode.height + (this.canvasLayout.linkGap * 2),
			srcCenterX,
			srcCenterY,
			transPos.x,
			transPos.y);
	}

	// Returns the lineArray passed in with connection path info added to it.
	addConnectionPaths(lineArray) {
		lineArray.forEach((line) => {
			line.pathInfo = this.getConnectorPathInfo(line);
		});
		return lineArray;
	}

	// Returns an SVG path string for the link (described by the line passed in)
	// based on the connection and link type in the layout info.
	getConnectorPathInfo(line, drawingNewLinkMinInitialLine) {
		const minInitialLine = this.getMinInitialLine(line, drawingNewLinkMinInitialLine);

		// If its a very short line to be drawn just draw a straight line instead
		// of zig-zagging in a very small space.
		if (Math.abs(line.x1 - line.x2) < 20 &&
				Math.abs(line.y1 - line.y2) < 20) {
			return this.getStraightPath(line);

		} else if (this.canvasLayout.connectionType === "ports" &&
				line.type === NODE_LINK) {

			if (this.canvasLayout.linkType === LINK_TYPE_CURVE) {
				return this.getCurvePath(line, minInitialLine);

			} else	if (this.canvasLayout.linkType === LINK_TYPE_ELBOW) {
				return this.getElbowPath(line, minInitialLine);
			}

		} else if (line.type === ASSOCIATION_LINK &&
								this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
			return this.getAssociationCurvePath(line, minInitialLine);
		}

		return this.getStraightPath(line);
	}

	// Returns the minInitialLine layout variable that will be either zero for a
	// comment link or from the link-data object (if the size has been
	// pre-calculated for elbow style connections) or from the source node
	// object (data.src) if we are drawing an existing connection or from
	// this.drawingNewLinkData.minInitialLine if we are dynamically drawing
	// a new link.
	getMinInitialLine(line, drawingNewLinkMinInitialLine) {
		let minInitialLine;
		if (line.type === COMMENT_LINK) {
			minInitialLine = 0;
		} else if (line.minInitialLineForElbow) {
			minInitialLine = line.minInitialLineForElbow;
		} else if (line.src && line.src.layout) {
			minInitialLine = line.src.layout.minInitialLine;
		} else {
			minInitialLine = drawingNewLinkMinInitialLine;
		}
		return minInitialLine;
	}

	getLinkCoords(linkType, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation) {
		let coords = null;
		if (linkType === NODE_LINK) {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				coords = this.getNodeLinkCoordsForStraightLine(srcObj, trgNode);
			} else {
				coords = this.getNodeLinkCoordsForPorts(srcObj, srcPortId, trgNode, trgPortId);
			}
		} else if (linkType === ASSOCIATION_LINK) {
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

	getNodeLinkCoordsForStraightLine(srcNode, trgNode) {
		let srcCenterX;
		let srcCenterY;
		let trgCenterX;
		let trgCenterY;

		if (srcNode.layout.drawNodeLinkLineFromTo === "image_center") {
			srcCenterX = srcNode.layout.imagePosX + (srcNode.layout.imageWidth / 2) + this.canvasLayout.linkGap;
			srcCenterY = srcNode.layout.imagePosY + (srcNode.layout.imageHeight / 2) + this.canvasLayout.linkGap;
		} else {
			srcCenterX = (srcNode.width / 2) + this.canvasLayout.linkGap;
			srcCenterY = (srcNode.height / 2) + this.canvasLayout.linkGap;
		}

		if (trgNode.layout.drawNodeLinkLineFromTo === "image_center") {
			trgCenterX = trgNode.layout.imagePosX + (trgNode.layout.imageWidth / 2) + this.canvasLayout.linkGap;
			trgCenterY = trgNode.layout.imagePosY + (trgNode.layout.imageHeight / 2) + this.canvasLayout.linkGap;
		} else {
			trgCenterX = (trgNode.width / 2) + this.canvasLayout.linkGap;
			trgCenterY = (trgNode.height / 2) + this.canvasLayout.linkGap;
		}

		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.canvasLayout.linkGap,
			srcNode.y_pos - this.canvasLayout.linkGap,
			srcNode.width + (this.canvasLayout.linkGap * 2),
			srcNode.height + (this.canvasLayout.linkGap * 2),
			srcCenterX,
			srcCenterY,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.canvasLayout.linkGap,
			trgNode.y_pos - this.canvasLayout.linkGap,
			trgNode.width + (this.canvasLayout.linkGap * 2),
			trgNode.height + (this.canvasLayout.linkGap * 2),
			trgCenterX,
			trgCenterY,
			srcNode.x_pos + (srcNode.width / 2),
			srcNode.y_pos + (srcNode.height / 2));

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
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
		const startPos = this.getOuterCoord(
			srcComment.x_pos - this.canvasLayout.linkGap,
			srcComment.y_pos - this.canvasLayout.linkGap,
			srcComment.width + (this.canvasLayout.linkGap * 2),
			srcComment.height + (this.canvasLayout.linkGap * 2),
			(srcComment.width / 2) + this.canvasLayout.linkGap,
			(srcComment.height / 2) + this.canvasLayout.linkGap,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		var centerX;
		var centerY;

		if (trgNode.layout.drawCommentLinkLineTo === "image_center") {
			centerX = trgNode.layout.imagePosX + (trgNode.layout.imageWidth / 2) + this.canvasLayout.linkGap;
			centerY = trgNode.layout.imagePosY + (trgNode.layout.imageHeight / 2) + this.canvasLayout.linkGap;
		} else {
			centerX = (trgNode.width / 2) + this.canvasLayout.linkGap;
			centerY = (trgNode.height / 2) + this.canvasLayout.linkGap;
		}

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.canvasLayout.linkGap,
			trgNode.y_pos - this.canvasLayout.linkGap,
			trgNode.width + (this.canvasLayout.linkGap * 2),
			trgNode.height + (this.canvasLayout.linkGap * 2),
			centerX,
			centerY,
			srcComment.x_pos + (srcComment.width / 2),
			srcComment.y_pos + (srcComment.height / 2));

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
	}

	getOuterCoord(xPos, yPos, width, height, innerCenterX, innerCenterY, outerCenterX, outerCenterY) {
		const topLeft = { x: xPos, y: yPos };
		const topRight = { x: xPos + width, y: yPos };
		const botLeft = { x: xPos, y: yPos + height };
		const botRight = { x: xPos + width, y: yPos + height };
		const center = { x: innerCenterX + xPos, y: innerCenterY + yPos };

		var startPointX;
		var startPointY;

		// Outer point is to the right of center
		if (outerCenterX > center.x) {
			const topRightRatio = (center.y - topRight.y) / (center.x - topRight.x);
			const botRightRatio = (center.y - botRight.y) / (center.x - botRight.x);
			const ratioRight = (center.y - outerCenterY) / (center.x - outerCenterX);

			// North
			if (ratioRight < topRightRatio) {
				startPointX = center.x - (innerCenterY / ratioRight);
				startPointY = yPos;
			// South
			} else if (ratioRight > botRightRatio) {
				startPointX = center.x + ((height - innerCenterY) / ratioRight);
				startPointY = yPos + height;
			// East
			} else {
				startPointX = xPos + width;
				startPointY = center.y + (innerCenterX * ratioRight);
			}
		// Outer point is to the left of center
		} else {
			const topLeftRatio = (center.y - topLeft.y) / (center.x - topLeft.x);
			const botLeftRatio = (center.y - botLeft.y) / (center.x - botLeft.x);
			const ratioLeft = (center.y - outerCenterY) / (center.x - outerCenterX);

			// North
			if (ratioLeft > topLeftRatio) {
				startPointX = center.x - (innerCenterY / ratioLeft);
				startPointY = yPos;
			// South
			} else if (ratioLeft < botLeftRatio) {
				startPointX = center.x + ((height - innerCenterY) / ratioLeft);
				startPointY = yPos + height;
			// West
			} else {
				startPointX = xPos;
				startPointY = center.y - (innerCenterX * ratioLeft);
			}
		}

		return { x: startPointX, y: startPointY };
	}


	// Returns the path info, for the object passed in, which describes a
	// curved connector line. The pathInfo contains:
	// path - an SVG path string describing the elbow line
	// centerPoint - the center point of the line used for decoration placement
	// sourcePoint - the point of the line used for decoration placement near the source node
	// targetPoint - the point of the line used for decoration placement near the target node
	getCurvePath(data, minInitialLine) {
		let newData = data;

		// When dragging out a new link we will not have src nor trg nodes
		let topSrc = data.y1;
		let topTrg = data.y2;
		let bottomSrc = data.y1;
		let bottomTrg = data.y2;

		// When drawing a link from node to node we will have src and trg nodes.
		if (data.src && data.trg) {
			if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
				topSrc = -(data.src.x_pos + data.src.width);
				bottomSrc = -(data.src.x_pos);
				topTrg = -(data.trg.x_pos + data.trg.width);
				bottomTrg = -(data.trg.x_pos);

			} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
				topSrc = data.src.x_pos;
				bottomSrc = data.src.x_pos + data.src.width;
				topTrg = data.trg.x_pos;
				bottomTrg = data.trg.x_pos + data.trg.width;

			} else {
				topSrc = data.src.y_pos;
				bottomSrc = data.src.y_pos + data.src.height;
				topTrg = data.trg.y_pos;
				bottomTrg = data.trg.y_pos + data.trg.height;
			}
		}

		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			newData = this.rotateData90Degrees(newData, ANTI_CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			newData = this.rotateData90Degrees(newData, CLOCKWISE);
		}

		const pathInfo = this.getCurvePathInfo(newData, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg);

		// For TB and BT link directions rotate the path elements from Left-Right
		// back to the appropriate orientation.
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, CLOCKWISE);
			pathInfo.sourcePoint = this.rotatePoint90Degrees(pathInfo.sourcePoint.x, pathInfo.sourcePoint.y, CLOCKWISE);
			pathInfo.targetPoint = this.rotatePoint90Degrees(pathInfo.targetPoint.x, pathInfo.targetPoint.y, CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);
			pathInfo.sourcePoint = this.rotatePoint90Degrees(pathInfo.sourcePoint.x, pathInfo.sourcePoint.y, ANTI_CLOCKWISE);
			pathInfo.targetPoint = this.rotatePoint90Degrees(pathInfo.targetPoint.x, pathInfo.targetPoint.y, ANTI_CLOCKWISE);
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
	// sourcePoint - an object with x, y coordinate for the source of the line
	// targetPoint - an object with x, y coordinate for the target of the line
	// centerPoint, sourcePoint and targetPoint are used for decoration placement.
	getCurvePathInfo(data, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg) {
		// Declare points for decorator positioning. CenterPoint will be the
		// middle of the line.
		const centerPoint = { x: 0, y: 0 };
		const sourcePoint = { x: data.x1, y: data.y1 };
		const targetPoint = { x: data.x2, y: data.y2 };

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

			elements.push({ p: "C", x: corner1X, y: corner1Y, x2: corner2X, y2: corner2Y, x3: data.x2, y3: data.y2 });
			// path += " C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
			centerPoint.x = corner1X;
			centerPoint.y = corner1Y + ((corner2Y - corner1Y) / 2);

		} else {
			let yDiff = data.y2 - data.y1;

			let midY = 0;
			if (topTrg >= bottomSrc + this.canvasLayout.wrapAroundNodePadding) {
				midY = bottomSrc + ((topTrg - bottomSrc) / 2);
			} else if (bottomTrg <= topSrc - this.canvasLayout.wrapAroundNodePadding) {
				midY = bottomTrg + ((topSrc - bottomTrg) / 2);
				yDiff = -yDiff;
			} else {
				if (data.y1 > data.y2) {
					midY = Math.min(topSrc, topTrg) - this.canvasLayout.wrapAroundSpacing;
					yDiff = -yDiff;
				} else {
					midY = Math.max(bottomSrc, bottomTrg) + this.canvasLayout.wrapAroundSpacing;
				}
			}

			// Calculate an offset for the start points of the straight line. This
			// will be relative to the start and end point of the curve. This needs
			// to be based on the X gap between the source and target nodes but also
			// dependent on the Y gap between those nodes because, as the Y gap
			// increases, we want the straight line to decrease in size.
			const offsetForStraightLine = Math.min((yDiff / 2), -(xDiff - minInitialLine / 2));

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

		return { elements, centerPoint, sourcePoint, targetPoint };
	}

	// Returns the path info, for the object passed in, which describes an
	// elbow connector line. The pathInfo contains:
	// path - an SVG path string describing the elbow line
	// centerPoint - the center point of the line used for decoration placement
	// sourcePoint - the point of the line used for decoration placement near the source node
	// targetPoint - the point of the line used for decoration placement near the target node
	getElbowPath(data, minInitialLine) {
		let newData = data;

		// For TB and BT link directions rotate the start and end coords into
		// the Left-Right orientation.
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			newData = this.rotateData90Degrees(newData, ANTI_CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			newData = this.rotateData90Degrees(newData, CLOCKWISE);
		}

		const pathInfo = this.getElbowPathInfo(newData, minInitialLine);

		// For TB and BT link directions rotate the path elements from Left-Right
		// back to the appropriate orientation.
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, CLOCKWISE);
			pathInfo.sourcePoint = this.rotatePoint90Degrees(pathInfo.sourcePoint.x, pathInfo.sourcePoint.y, CLOCKWISE);
			pathInfo.targetPoint = this.rotatePoint90Degrees(pathInfo.targetPoint.x, pathInfo.targetPoint.y, CLOCKWISE);

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);
			pathInfo.sourcePoint = this.rotatePoint90Degrees(pathInfo.sourcePoint.x, pathInfo.sourcePoint.y, ANTI_CLOCKWISE);
			pathInfo.targetPoint = this.rotatePoint90Degrees(pathInfo.targetPoint.x, pathInfo.targetPoint.y, ANTI_CLOCKWISE);
		}

		pathInfo.path = this.createPath(pathInfo.elements);

		return pathInfo;
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
		let path = "";
		elements.forEach((el) => {
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
		});
		return path;
	}

	// Returns a pathInfo object describing an elbow conneciton line based on the
	// data object and minInitialLine passed in. The output object contains the
	// following fields:
	// elements - an array of path elements describing the line
	// centerPoint - an object with x, y coordinate for the center of the line
	// sourcePoint - an object with x, y coordinate for the source of the line
	// targetPoint - an object with x, y coordinate for the target of the line
	// centerPoint, sourcePoint and targetPoint are used for decoration placement.
	getElbowPathInfo(data, minInitialLine) {
		// Record centerPoint which can be used by the link decorations
		const centerPoint = { x: 0, y: 0 };
		const sourcePoint = { x: data.x1, y: data.y1 };
		const targetPoint = { x: data.x2, y: data.y2 };

		const corner1X = data.x1 + minInitialLine;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;
		let elbowYOffset = yDiff / 2;

		if (yDiff > (2 * this.canvasLayout.elbowSize)) {
			elbowYOffset = this.canvasLayout.elbowSize;

		} else if (yDiff < -(2 * this.canvasLayout.elbowSize)) {
			elbowYOffset = -this.canvasLayout.elbowSize;
		}

		// The minimum size of the line entering the target port. When
		// dynamically drawing a new connection we will not have a target node
		// so use a fixed value for this.
		const minFinalLine = data.trg ? data.trg.layout.minFinalLine : 30;

		// This is a special case where the source and target handles are very
		// close together.
		if (xDiff < (minInitialLine + minFinalLine) &&
				(yDiff < (4 * this.canvasLayout.elbowSize) &&
					yDiff > -(4 * this.canvasLayout.elbowSize))) {
			elbowYOffset = yDiff / 4;
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
			const centerLineY = corner2Y - (corner2Y - corner1Y) / 2;

			elements.push(
				{ p: "L", x: corner1X, y: (centerLineY - elbowYOffset) },
				{ p: "Q", x: corner1X, y: centerLineY, x2: (corner1X - elbowXOffset), y2: centerLineY },
				{ p: "L", x: (corner2X + elbowXOffset), y: centerLineY },
				{ p: "Q", x: corner2X, y: centerLineY, x2: corner2X, y2: (centerLineY + elbowYOffset) },
				{ p: "L", x: corner2X, y: (corner2Y - elbowYOffset) }
			);

			centerPoint.x = corner1X;
			centerPoint.y = centerLineY;
		}

		elements.push(
			{ p: "Q", x: corner2X, y: corner2Y, x2: (corner2X + this.canvasLayout.elbowSize), y2: corner2Y },
			{ p: "L", x: data.x2, y: data.y2 }
		);

		return { elements, centerPoint, sourcePoint, targetPoint };
	}

	// Returns the path string for the object passed in which describes a
	// simple straight connector line from source to target. This is used for
	// connectors from comments to data nodes.
	getStraightPath(data) {
		const path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;
		const centerPoint = {
			x: data.x1 + ((data.x2 - data.x1) / 2),
			y: data.y1 + ((data.y2 - data.y1) / 2)
		};
		return { path, centerPoint };
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
