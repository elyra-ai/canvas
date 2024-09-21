/*
 * Copyright 2017-2024 Elyra Authors
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
/* eslint no-else-return: "off" */

import CanvasUtils from "./common-canvas-utils.js";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_LEFT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT, LINK_TYPE_PARALLAX,
	LINK_METHOD_FREEFORM,
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
	// of a freeform line which extends from the node passed in to the
	// end position which is also an x, y coordinate. If an originInfo object is
	// passed in we use it to offset the origin position for the line.
	getNewFreeformNodeLinkStartPos(node, endPos, originInfo) {
		let originX;
		let originY;

		if (node.layout.drawNodeLinkLineFromTo === "image_center" && !CanvasUtils.isExpanded(node)) {
			originX = this.nodeUtils.getNodeImageCenterPosX(node);
			originY = this.nodeUtils.getNodeImageCenterPosY(node);
		} else {
			if (originInfo) {
				({ x: originX, y: originY } = this.getCenterOffset(node, originInfo, false));
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

	getLinkCoords(link, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation) {
		let coords = null;
		if (link.type === NODE_LINK) {
			if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
				coords = this.getNodeLinkCoordsForFreeform(srcObj, trgNode, link);
			} else {
				coords = this.getNodeLinkCoordsForPortsConnection(srcObj, srcPortId, trgNode, trgPortId);
			}
		} else if (link.type === ASSOCIATION_LINK) {
			if (this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
				coords = this.getAssociationCurveLinkCoords(srcObj, trgNode, assocLinkVariation);
			} else {
				coords = this.getAssociationLinkCoords(srcObj, trgNode);
			}
		} else {
			coords = this.getCommentLinkCoords(srcObj, trgNode);
		}
		return coords;
	}

	getNodeLinkCoordsForFreeform(srcNode, trgNode, link) {
		const selfRefLink = srcNode.id === trgNode.id;
		let srcCenterX;
		let srcCenterY;
		let trgCenterX;
		let trgCenterY;

		if (srcNode.layout.drawNodeLinkLineFromTo === "image_center" &&
				this.canvasLayout.linkType === LINK_TYPE_STRAIGHT &&
				!CanvasUtils.isExpanded(srcNode)) {
			srcCenterX = this.nodeUtils.getNodeImageCenterPosX(srcNode);
			srcCenterY = this.nodeUtils.getNodeImageCenterPosY(srcNode);
		} else {
			if (link && link.srcFreeformInfo) {
				({ x: srcCenterX, y: srcCenterY } = this.getCenterOffset(srcNode, link.srcFreeformInfo, selfRefLink));
			} else {
				srcCenterX = this.nodeUtils.getNodeCenterPosX(srcNode);
				srcCenterY = this.nodeUtils.getNodeCenterPosY(srcNode);
			}
		}

		if (trgNode.layout.drawNodeLinkLineFromTo === "image_center" &&
				this.canvasLayout.linkType === LINK_TYPE_STRAIGHT &&
				!CanvasUtils.isExpanded(trgNode)) {
			trgCenterX = this.nodeUtils.getNodeImageCenterPosX(trgNode);
			trgCenterY = this.nodeUtils.getNodeImageCenterPosY(trgNode);
		} else {
			if (link && link.trgFreeformInfo) {
				({ x: trgCenterX, y: trgCenterY } = this.getCenterOffset(trgNode, link.trgFreeformInfo, selfRefLink));
			} else {
				trgCenterX = this.nodeUtils.getNodeCenterPosX(trgNode);
				trgCenterY = this.nodeUtils.getNodeCenterPosY(trgNode);
			}
		}

		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT && !selfRefLink) {
			const startPos = CanvasUtils.getOuterCoord(
				srcNode.x_pos,
				srcNode.y_pos,
				srcNode.width,
				srcNode.height,
				this.canvasLayout.linkGap,
				srcCenterX, // OriginX
				srcCenterY, // OriginY
				trgCenterX, // EndX
				trgCenterY); // EndY

			const endPos = CanvasUtils.getOuterCoord(
				trgNode.x_pos,
				trgNode.y_pos,
				trgNode.width,
				trgNode.height,
				this.canvasLayout.linkGap,
				trgCenterX, // OriginX
				trgCenterY, // OriginY
				srcCenterX, // EndX
				srcCenterY); // EndY

			return {
				originX: startPos.originX, originY: startPos.originY,
				x1: startPos.x, y1: startPos.y,
				x2: endPos.x, y2: endPos.y,
				srcDir: startPos.dir,
				trgDir: endPos.dir
			};
		} else {
			let x1;
			let y1;
			let x2;
			let y2;
			if (link.srcFreeformInfo.dir === EAST) {
				x1 = srcCenterX + this.canvasLayout.linkGap;
				y1 = srcCenterY;
			} else if (link.srcFreeformInfo.dir === WEST) {
				x1 = srcCenterX - this.canvasLayout.linkGap;
				y1 = srcCenterY;
			} else if (link.srcFreeformInfo.dir === SOUTH) {
				x1 = srcCenterX;
				y1 = srcCenterY + this.canvasLayout.linkGap;
			} else if (link.srcFreeformInfo.dir === NORTH) {
				x1 = srcCenterX;
				y1 = srcCenterY - this.canvasLayout.linkGap;
			}
			if (link.trgFreeformInfo.dir === EAST) {
				x2 = trgCenterX + this.canvasLayout.linkGap;
				y2 = trgCenterY;
			} else if (link.trgFreeformInfo.dir === WEST) {
				x2 = trgCenterX - this.canvasLayout.linkGap;
				y2 = trgCenterY;
			} else if (link.trgFreeformInfo.dir === SOUTH) {
				x2 = trgCenterX;
				y2 = trgCenterY + this.canvasLayout.linkGap;
			} else if (link.trgFreeformInfo.dir === NORTH) {
				x2 = trgCenterX;
				y2 = trgCenterY - this.canvasLayout.linkGap;
			}
			return {
				originX: 0, originY: 0,
				x1: x1, y1: y1,
				x2: x2, y2: y2,
				srcDir: link.srcFreeformInfo.dir,
				trgDir: link.trgFreeformInfo.dir
			};
		}
	}

	// Returns the "center" position for a node to/from which a freeform
	// link will be drawn using the originInfo provided. The previously
	// calculated originInfo object indicates how many links are going
	// to or from the node on a particular side of the node: top (NORTH),
	// bottom (SOUTH), left (WEST) or right (EAST).
	getCenterOffset(node, originInfo, selfRefLink) {
		const parts = originInfo.len + 1;
		const index = originInfo.idx + 1;

		let x = 0;
		let y = 0;

		if (originInfo.dir === NORTH ||
				originInfo.dir === SOUTH) {
			x = node.x_pos + ((node.width / parts) * index);
			y = this.getYPosForCenterOffset(node, originInfo.dir, selfRefLink);

		} else if (originInfo.dir === EAST ||
					originInfo.dir === WEST) {
			x = this.getXPosForCenterOffset(node, originInfo.dir, selfRefLink);
			y = node.y_pos + ((node.height / parts) * index);
		}

		return { x, y };
	}

	// Returns the vertical "center" position for node to/from which
	// a link will be drawn. This is different for Straight links
	// than other types of freeform links. This is becuase Straight
	// links are drawn directly towards the center of the node whereas
	// other freeform link type (Elbow, Curve, Parallax) are drawn to the
	// edges of the node.
	getYPosForCenterOffset(node, dir, selfRefLink) {
		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT && !selfRefLink) {
			return this.nodeUtils.getNodeCenterPosY(node);
		} else if (dir === SOUTH) {
			return node.y_pos + node.height;
		}
		return node.y_pos;
	}

	// Returns the horizontal "center" position for node to/from which
	// a link will be drawn. This is different for Straight links
	// than other types of freeform links. This is becuase Straight
	// links are drawn directly towards the center of the node whereas
	// other freeform link type (Elbow, Curve, Parallax) are drawn to the
	// edges of the node.
	getXPosForCenterOffset(node, dir, selfRefLink) {
		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT && !selfRefLink) {
			return this.nodeUtils.getNodeCenterPosX(node);
		} else if (dir === EAST) {
			return node.x_pos + node.width;
		}
		return node.x_pos;
	}

	getNodeLinkCoordsForPortsConnection(srcNode, srcPortId, trgNode, trgPortId) {
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
			srcX = this.nodeUtils.getNodePortPosX(srcNode.layout.outputPortPositions[0], srcNode);
			srcY = this.nodeUtils.getNodePortPosY(srcNode.layout.outputPortPositions[0], srcNode);
			srcDir = CanvasUtils.getPortDir(srcX, srcY, srcNode);
		}

		if (trgNode.inputs && trgNode.inputs.length > 0) {
			const trgPort = trgNode.inputs.find((input) => input.id === trgPortId);
			trgX = trgPort.cx;
			trgY = trgPort.cy;
			trgDir = trgPort.dir;

		} else {
			trgX = this.nodeUtils.getNodePortPosX(trgNode.layout.inputPortPositions[0], trgNode);
			trgY = this.nodeUtils.getNodePortPosY(trgNode.layout.inputPortPositions[0], trgNode);
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

	getAssociationCurveLinkCoords(srcNode, trgNode, assocLinkVariation) {
		let srcX = 0;
		let trgX = 0;

		if (assocLinkVariation === ASSOC_VAR_CURVE_RIGHT) {
			srcX = srcNode.width;
			trgX = 0;

		} else if (assocLinkVariation === ASSOC_VAR_CURVE_LEFT) {
			srcX = 0;
			trgX = trgNode.width;

		} else if (assocLinkVariation === ASSOC_VAR_DOUBLE_BACK_LEFT) {
			srcX = 0;
			trgX = 0;

		} else {
			srcX = srcNode.width;
			trgX = trgNode.width;
		}

		return {
			x1: srcNode.x_pos + srcX,
			y1: srcNode.y_pos + this.nodeUtils.getNodePortPosY(srcNode.layout.outputPortPositions[0], srcNode),
			x2: trgNode.x_pos + trgX,
			y2: trgNode.y_pos + this.nodeUtils.getNodePortPosY(trgNode.layout.inputPortPositions[0], trgNode)
		};
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

	getAssociationLinkCoords(srcNode, trgNode) {
		const srcCenterX = this.nodeUtils.getNodeCenterPosX(srcNode);
		const srcCenterY = this.nodeUtils.getNodeCenterPosY(srcNode);

		const trgCenterX = this.nodeUtils.getNodeCenterPosX(trgNode);
		const trgCenterY = this.nodeUtils.getNodeCenterPosY(trgNode);

		const startPos = CanvasUtils.getOuterCoord(
			srcNode.x_pos,
			srcNode.y_pos,
			srcNode.width,
			srcNode.height,
			this.canvasLayout.linkGap,
			srcCenterX, // OriginX
			srcCenterY, // OriginY
			trgCenterX, // EndX
			trgCenterY); // EndY

		const endPos = CanvasUtils.getOuterCoord(
			trgNode.x_pos,
			trgNode.y_pos,
			trgNode.width,
			trgNode.height,
			this.canvasLayout.linkGap,
			trgCenterX, // OriginX
			trgCenterY, // OriginY
			srcCenterX, // EndX
			srcCenterY); // EndY

		return {
			originX: startPos.originX, originY: startPos.originY,
			x1: startPos.x, y1: startPos.y,
			x2: endPos.x, y2: endPos.y,
			srcDir: startPos.dir,
			trgDir: endPos.dir
		};
	}

	// Returns the lineArray passed in with connection path info added to it.
	addConnectionPaths(links) {
		links.forEach((link) => {
			// Only necessary to get the path info, if the start and end coords of
			// the link have changed.
			if (link.coordsUpdated) {
				link.pathInfo = this.getConnectorPathInfo(link);
			}
		});
		return links;
	}

	// Returns an SVG path string for the link (described by the line passed in)
	// based on the connection and link type in the layout info.
	getConnectorPathInfo(link, drawingNewLinkMinInitialLine) {
		const minInitialLine = this.getMinInitialLine(link, drawingNewLinkMinInitialLine);

		if (link.type === NODE_LINK) {
			if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM &&
					this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				return this.getStraightPath(link, minInitialLine);
			}
			return this.getNodeLinkPathInfo(link, minInitialLine);

		} else if (link.type === ASSOCIATION_LINK &&
								this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
			return this.getAssociationCurvePath(link, minInitialLine);
		}

		return this.getStraightPath(link, minInitialLine);
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
			minInitialLine = 30;
		}
		return minInitialLine;
	}

	// Returns the path info, for the link passed in, which describes either a
	// Elbow, Curve, Parallax or Straight connector line. This method can be called
	// either for drawing a connection line between nodes or for a new link line
	// being drawn out from a source node towards a target node. It is used for
	// drawing links between specific ports on the source and target nodes or
	// freeform links drawn from points on the boundaries of the source and
	// target nodes. This method handles  links drawn from any direction at
	// the source end ("n", "s", "e" or "w") to any direction at the target
	// end ("n", "s", "e" or "w").
	// It does this by rotating any link which has a source end of "n", "s" or "w"
	// so that the link line is calculated as if it has a source end of "e". This
	// entails rotating the coordinates for the boundaries of the source and tareget
	// nodes as well as the target direction for the link. After the link elements
	// have been created, this method rotates then back again to their original
	// orientation.
	// The pathInfo returned contains:
	//   path - an SVG path string describing the Elbow/Curve/Parallax/Straight line
	//   centerPoint - the center point of the line used for decoration placement
	getNodeLinkPathInfo(inLink, minInitialLine) {
		let topSrc;
		let topTrg;
		let bottomSrc;
		let bottomTrg;
		let link = inLink;

		// When drawing a link from node to node we will have src and trg nodes.
		if (link.srcObj && link.trgNode) {
			// Rotate anti-clockwise by 90 degrees
			if (link.srcDir === SOUTH) {
				topSrc = -(link.srcObj.x_pos + link.srcObj.width);
				bottomSrc = -(link.srcObj.x_pos);
				topTrg = -(link.trgNode.x_pos + link.trgNode.width);
				bottomTrg = -(link.trgNode.x_pos);

			// Rotate clockwise by 90 degrees
			} else if (link.srcDir === NORTH) {
				topSrc = link.srcObj.x_pos;
				bottomSrc = link.srcObj.x_pos + link.srcObj.width;
				topTrg = link.trgNode.x_pos;
				bottomTrg = link.trgNode.x_pos + link.trgNode.width;

			// Rotate by 180 dgrees
			} else if (link.srcDir === WEST) {
				topSrc = -(link.srcObj.y_pos + link.srcObj.height);
				bottomSrc = -(link.srcObj.y_pos);
				topTrg = -(link.trgNode.y_pos + link.trgNode.height);
				bottomTrg = -(link.trgNode.y_pos);

			// Don't rotate
			} else {
				topSrc = link.srcObj.y_pos;
				bottomSrc = link.srcObj.y_pos + link.srcObj.height;
				topTrg = link.trgNode.y_pos;
				bottomTrg = link.trgNode.y_pos + link.trgNode.height;
			}
		// When dragging out a new link we will not have src nor trg nodes so we
		// make a best guess at the node dimensions.
		} else {
			// Rotate anti-clockwise by 90 degrees
			if (link.srcDir === SOUTH) {
				topSrc = -link.x1;
				topTrg = -link.x2;
				bottomSrc = -link.x1;
				bottomTrg = -link.x2;

			// Rotate clockwise by 90 degrees
			} else if (link.srcDir === NORTH) {
				topSrc = link.x1;
				topTrg = link.x2;
				bottomSrc = link.x1;
				bottomTrg = link.x2;

			// Rotate by 180 dgrees
			} else if (link.srcDir === WEST) {
				topSrc = -link.y1;
				topTrg = -link.y2;
				bottomSrc = -link.y1;
				bottomTrg = -link.y2;

			// Don't rotate
			} else {
				topSrc = link.y1;
				topTrg = link.y2;
				bottomSrc = link.y1;
				bottomTrg = link.y2;
			}
		}

		// Rotate the input data for TB and BT link configurations to be Left->Right
		if (link.srcDir === SOUTH) {
			link = this.rotateData90Degrees(link, ANTI_CLOCKWISE);

		} else if (link.srcDir === NORTH) {
			link = this.rotateData90Degrees(link, CLOCKWISE);

		} else if (link.srcDir === WEST) {
			// Rotate by 180 degrees
			link = this.rotateData90Degrees(link, CLOCKWISE);
			link = this.rotateData90Degrees(link, CLOCKWISE);
		}

		link.trgDir = this.getRotatedTrgDir(link);
		const saveSrcDir = link.srcDir;
		link.srcDir = EAST;

		const pathInfo = this.getPathInfo({ link, minInitialLine, topSrc, topTrg, bottomSrc, bottomTrg });

		// Restore source direction.
		link.srcDir = saveSrcDir;

		// For TB and BT link directions rotate the path elements from Left-Right
		// back to the appropriate orientation.
		if (link.srcDir === SOUTH) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, CLOCKWISE);

		} else if (link.srcDir === NORTH) {
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);

		} else if (link.srcDir === WEST) {
			// Rotate back by 180 degrees
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.elements = this.rotateElements90Degrees(pathInfo.elements, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);
			pathInfo.centerPoint = this.rotatePoint90Degrees(pathInfo.centerPoint.x, pathInfo.centerPoint.y, ANTI_CLOCKWISE);
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
		return { ...data, x1: newPoint1.x, y1: newPoint1.y, x2: newPoint2.x, y2: newPoint2.y };
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

	// Returns a target direction which is rotated by an appropriate amount
	// based on the source direction. This allows us to create a link as if it
	// was drawn from an EAST direction port.
	getRotatedTrgDir(link) {
		// Rotate anti-clockwise by 90 dgrees
		if (link.srcDir === SOUTH) {
			switch (link.trgDir) {
			case SOUTH:
				return EAST;
			case NORTH:
				return WEST;
			case WEST:
				return SOUTH;
			default:
			case EAST:
				return NORTH;
			}

		// Rotate clockwise by 90 dgrees
		} else if (link.srcDir === NORTH) {
			switch (link.trgDir) {
			case SOUTH:
				return WEST;
			case NORTH:
				return EAST;
			case WEST:
				return NORTH;
			default:
			case EAST:
				return SOUTH;
			}

		// Rotate 180 degrees
		} else if (link.srcDir === WEST) {
			switch (link.trgDir) {
			case SOUTH:
				return NORTH;
			case NORTH:
				return SOUTH;
			case WEST:
				return EAST;
			default:
			case EAST:
				return WEST;
			}
		}

		// If link.srcDir is "e", don't rotate, keep target
		// dir as-is.
		return link.trgDir;
	}

	// Returns an object containing the path string, center position and angle
	// for the line object passed in which describes a simple straight connector
	// line from source to target.
	getStraightPath(link, minInitialLine) {
		// Self-referencing link.
		if (link.srcNodeId && link.trgNodeId && link.srcNodeId === link.trgNodeId) {
			return this.selfRefLinkPath(link, minInitialLine);
		}

		const path = "M " + link.x1 + " " + link.y1 + " L " + link.x2 + " " + link.y2;
		const xDiff = link.x2 - link.x1;
		const yDiff = link.y2 - link.y1;
		const centerPoint = {
			x: link.x1 + (xDiff / 2),
			y: link.y1 + (yDiff / 2)
		};
		let angle = Math.atan(yDiff / xDiff); // Atan(Opposite / Adjacent) = Angle in Radians

		if (xDiff < 0) {
			angle = ONE_EIGHTY_DEGREES_IN_RADIANS + angle;
		}

		return { path, centerPoint, angle };
	}

	// Returns path info for a self-referencing
	// straight link.
	selfRefLinkPath(link, minInitialLine) {
		const topInc = link.y2 - minInitialLine;
		const rightInc = link.x1 + minInitialLine;

		const path = "M " + link.x1 + " " + link.y1 +
			" L " +
			rightInc + " " + link.y1 + " " +
			rightInc + " " + topInc + " " +
			link.x2 + "  " + topInc + " " +
			link.x2 + " " + link.y2;

		const centerPoint = {
			x: link.x2 + ((rightInc - link.x2) / 2),
			y: topInc
		};

		const angle = 180;
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
		const centerPointX = CanvasUtils.getCenterPointCubicBezier(data.x1, corner1X, corner2X, data.x2);
		const centerPointY = CanvasUtils.getCenterPointCubicBezier(data.y1, corner1Y, corner2Y, data.y2);
		const centerPoint = { x: centerPointX, y: centerPointY };
		return { path, centerPoint };
	}

	// Returns a pathInfo object describing an elbow connection line based on the
	// data object and minInitialLine passed in. The output object contains the
	// following fields:
	// elements - an array of path elements describing the line
	// centerPoint - an object with x, y coordinates for the center of the line
	//               used for decoration placement.
	getPathInfo(data) {
		// The minimum size of the line entering the target port. When
		// dynamically drawing a new connection we will not have a target node
		// so use a fixed value for this.
		data.minFinalLine = data.link.trgNode ? data.link.trgNode.layout.minFinalLine : 30;

		switch (data.link.trgDir) {
		case NORTH:
			return this.getPathInfoEN(data);
		case SOUTH:
			return this.getPathInfoES(data);
		case EAST:
			return this.getPathInfoEE(data);
		case WEST:
		default:
			return this.getPathInfoEW(data);
		}
	}

	// Returns an object describing the elements and center point for
	// a link line running from an East source port to West target port.
	getPathInfoEW(data) {
		const pad = this.canvasLayout.wrapAroundNodePadding;
		const xDiff = data.link.x2 - data.link.x1;

		if (xDiff > data.minInitialLine + data.minFinalLine ||
			(xDiff > 0 && data.topSrc - pad < data.bottomTrg && data.bottomSrc + pad > data.topTrg)) {

			const corner1 = {};
			const corner2 = {};

			corner1.x = data.link.x1 + data.minInitialLine;
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = data.link.y2;

			if (xDiff > 0) {
				const minXDiff = (2 * data.minInitialLine) - xDiff;
				if (minXDiff > 0) {
					corner1.x = data.link.x1 + data.minInitialLine - (minXDiff / 2);
					corner2.x = corner1.x;
				}
			}

			return this.get3PartLink(data, corner1, corner2);

		} else {
			const corner1 = {};
			const corner2 = {};
			const corner3 = {};
			const corner4 = {};

			const midY = this.calculateMidY(data.link, data.topSrc, data.bottomSrc, data.topTrg, data.bottomTrg);

			corner1.x = data.link.x1 + data.minInitialLine;
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = midY;
			corner3.x = data.link.x2 - data.minFinalLine;
			corner3.y = corner2.y;
			corner4.x = corner3.x;
			corner4.y = data.link.y2;

			return this.get5PartLink(data, corner1, corner2, corner3, corner4);
		}
	}

	// Returns an object describing the elements and center point for
	// a link line running from an East source port to East target port.
	getPathInfoEE(data) {
		const pad = this.canvasLayout.wrapAroundNodePadding;

		if (data.topTrg - pad < data.link.y1 && data.bottomTrg + pad > data.link.y1) {
			const corner1 = {};
			const corner2 = {};
			const corner3 = {};
			const corner4 = {};

			corner1.x = data.link.x1 + data.minInitialLine;
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = data.link.x1 >= data.link.x2 ? data.link.y1 + ((data.link.y2 - data.link.y1) / 2) : (data.topTrg - pad);
			corner3.x = data.link.x2 + data.minFinalLine;
			corner3.y = corner2.y;
			corner4.x = corner3.x;
			corner4.y = data.link.y2;

			if (data.link.x2 < data.link.x1) {
				corner2.y = data.topSrc - pad;
				corner3.y = corner2.y;
			}

			return this.get5PartLink(data, corner1, corner2, corner3, corner4);

		} else {
			const corner1 = {};
			const corner2 = {};

			corner1.x = Math.max(data.link.x1 + data.minInitialLine, data.link.x2 + data.minFinalLine);
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = data.link.y2;

			return this.get3PartLink(data, corner1, corner2);
		}
	}

	// Returns an object describing the elements and center point for
	// a link line running from an East source port to North target port.
	getPathInfoEN(data) {
		if (data.link.y2 > data.link.y1 + data.minFinalLine &&
			data.link.x2 > data.link.x1 + data.minInitialLine) {
			const corner1 = {};

			corner1.x = data.link.x2;
			corner1.y = data.link.y1;

			return this.get2PartLink(data, corner1);
		} else {
			const corner1 = {};
			const corner2 = {};
			const corner3 = {};

			let midY = data.link.y2 - data.minFinalLine;

			if (data.link.x2 < data.link.x1) {
				if (data.topTrg > data.bottomSrc + data.minFinalLine + this.canvasLayout.wrapAroundNodePadding) {
					midY = data.topTrg - data.minFinalLine;

				} else if (data.topTrg > data.topSrc) {
					midY = data.topSrc - this.canvasLayout.wrapAroundNodePadding;
				}
			}

			corner1.x = data.link.x1 + data.minInitialLine;
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = midY;
			corner3.x = data.link.x2;
			corner3.y = corner2.y;

			return this.get4PartLink(data, corner1, corner2, corner3);
		}
	}

	// Returns an object describing the elements and center point for
	// a link line running from an East source port to South target port.
	getPathInfoES(data) {
		if (data.link.y1 > data.link.y2 + data.minFinalLine &&
			data.link.x2 > data.link.x1) {
			const corner1 = {};

			corner1.x = data.link.x2;
			corner1.y = data.link.y1;

			return this.get2PartLink(data, corner1);
		} else {
			const corner1 = {};
			const corner2 = {};
			const corner3 = {};

			let midY = data.link.y2 + data.minFinalLine;

			if (data.link.x2 < data.link.x1) {
				if (data.bottomTrg < data.topSrc - data.minFinalLine - this.canvasLayout.wrapAroundNodePadding) {
					midY = data.bottomTrg + data.minFinalLine;

				} else if (data.bottomTrg < data.bottomSrc) {
					midY = data.bottomSrc + this.canvasLayout.wrapAroundNodePadding;
				}
			}

			corner1.x = data.link.x1 + data.minInitialLine;
			corner1.y = data.link.y1;
			corner2.x = corner1.x;
			corner2.y = midY;
			corner3.x = data.link.x2;
			corner3.y = corner2.y;

			return this.get4PartLink(data, corner1, corner2, corner3);
		}
	}

	// Returns a Y coordinate for the horizontal line that joins the source and
	// target nodes (to be connected either with a curve or elbow line style) when
	// the target node is to the left of the source node. This is either the
	// center point between the source and target nodes, if there is room to draw
	// the line between them, or it is the coordinate of a wrap-around line to be
	// drawn around the outside of the source and target nodes. The direction of
	// the wrap around line is chosen based on which is the shortest route from
	// the source port to the target port.
	calculateMidY(data, topSrc, bottomSrc, topTrg, bottomTrg) {
		let midY;

		if (topTrg >= bottomSrc + this.canvasLayout.wrapAroundNodePadding) {
			midY = bottomSrc + ((topTrg - bottomSrc) / 2);

		} else if (bottomTrg <= topSrc - this.canvasLayout.wrapAroundNodePadding) {
			midY = bottomTrg + ((topSrc - bottomTrg) / 2);

		} else {
			const maxBottom = Math.max(bottomSrc, bottomTrg);
			const srcBottomInc = maxBottom - data.y1;
			const trgBottomInc = maxBottom - data.y2;

			const minTop = Math.min(topSrc, topTrg);
			const srcTopInc = data.y1 - minTop;
			const trgTopInc = data.y2 - minTop;

			// Set the mid-point based in the shortest distance from the source port
			// on the source node to the target port on the target node.
			if (srcBottomInc + trgBottomInc > srcTopInc + trgTopInc) {
				midY = minTop - this.canvasLayout.wrapAroundSpacing;
			} else {
				midY = maxBottom + this.canvasLayout.wrapAroundSpacing;
			}
		}

		return midY;
	}

	get2PartLink(data, corner1) {
		switch (this.canvasLayout.linkType) {
		case LINK_TYPE_ELBOW:
			return this.get2PartElbow(data, corner1);
		case LINK_TYPE_STRAIGHT:
			return this.get2PartStraight(data, corner1);
		case LINK_TYPE_PARALLAX:
			return this.get2PartParallax(data, corner1);
		default:
			return this.get2PartCurve(data, corner1);
		}
	}

	get3PartLink(data, corner1, corner2) {
		switch (this.canvasLayout.linkType) {
		case LINK_TYPE_ELBOW:
			return this.get3PartElbow(data, corner1, corner2);
		case LINK_TYPE_STRAIGHT:
			return this.get3PartStraight(data, corner1, corner2);
		case LINK_TYPE_PARALLAX:
			return this.get3PartParallax(data, corner1, corner2);
		default:
			return this.get3PartCurve(data, corner1, corner2);
		}
	}

	get4PartLink(data, corner1, corner2, corner3) {
		switch (this.canvasLayout.linkType) {
		case LINK_TYPE_ELBOW:
			return this.get4PartElbow(data, corner1, corner2, corner3);
		case LINK_TYPE_STRAIGHT:
			return this.get4PartStraight(data, corner1, corner2, corner3);
		case LINK_TYPE_PARALLAX:
			return this.get4PartParallax(data, corner1, corner2, corner3);
		default:
			return this.get4PartCurve(data, corner1, corner2, corner3);
		}
	}

	get5PartLink(data, corner1, corner2, corner3, corner4) {
		switch (this.canvasLayout.linkType) {
		case LINK_TYPE_ELBOW:
			return this.get5PartElbow(data, corner1, corner2, corner3, corner4);
		case LINK_TYPE_STRAIGHT:
			return this.get5PartStraight(data, corner1, corner2, corner3, corner4);
		case LINK_TYPE_PARALLAX:
			return this.get5PartParallax(data, corner1, corner2, corner3, corner4);
		default:
			return this.get5PartCurve(data, corner1, corner2, corner3, corner4);
		}
	}

	get2PartElbow(data, corner1) {
		const elbowSizeY = data.link.y2 < corner1.y
			? -this.canvasLayout.elbowSize
			: this.canvasLayout.elbowSize;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: corner1.x - this.canvasLayout.elbowSize, y: corner1.y },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1.x, y2: (corner1.y + elbowSizeY) },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: data.link.x1 + ((data.link.x2 - data.link.x1) / 2),
			y: data.link.y1
		};

		return { elements, centerPoint };
	}

	get3PartElbow(data, corner1, corner2) {
		const c1ElbowSizeX = this.canvasLayout.elbowSize;
		const c1ElbowSizeY = this.adjustElbowSize(corner2.y, corner1.y);
		const c2ElbowSizeX = data.link.x2 > corner2.x ? this.canvasLayout.elbowSize : -this.canvasLayout.elbowSize;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: (corner1.x - c1ElbowSizeX), y: corner1.y },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1.x, y2: (corner1.y + c1ElbowSizeY) },
			{ p: "L", x: corner2.x, y: (corner2.y - c1ElbowSizeY) },
			{ p: "Q", x: corner2.x, y: corner2.y, x2: (corner2.x + c2ElbowSizeX), y2: corner2.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner1.x,
			y: data.link.y1 + ((data.link.y2 - data.link.y1) / 2)
		};

		return { elements, centerPoint };
	}

	get4PartElbow(data, corner1, corner2, corner3) {
		const c1ElbowSizeX = this.canvasLayout.elbowSize;
		const c1ElbowSizeY = this.adjustElbowSize(corner2.y, corner1.y);
		const c2ElbowSizeX = this.adjustElbowSize(corner1.x, corner3.x);
		const c3ElbowSizeY = corner3.y > data.link.y2 ? this.canvasLayout.elbowSize : -this.canvasLayout.elbowSize;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: (corner1.x - c1ElbowSizeX), y: corner1.y },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1.x, y2: (corner1.y + c1ElbowSizeY) },
			{ p: "L", x: corner2.x, y: (corner2.y - c1ElbowSizeY) },
			{ p: "Q", x: corner2.x, y: corner2.y, x2: (corner2.x - c2ElbowSizeX), y2: corner2.y },
			{ p: "L", x: (corner3.x + c2ElbowSizeX), y: corner3.y },
			{ p: "Q", x: corner3.x, y: corner3.y, x2: corner3.x, y2: corner3.y - c3ElbowSizeY },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner2.x + ((corner3.x - corner2.x) / 2),
			y: corner2.y
		};

		return { elements, centerPoint };
	}

	get5PartElbow(data, corner1, corner2, corner3, corner4) {
		const c1ElbowSizeX = this.canvasLayout.elbowSize;
		const c1ElbowSizeY = this.adjustElbowSize(corner2.y, corner1.y);
		const c2ElbowSizeX = this.adjustElbowSize(corner1.x, corner3.x);
		const c3ElbowSizeY = this.adjustElbowSize(corner3.y, corner4.y);
		const c4ElbowSizeX = data.link.x2 < corner4.x ? -this.canvasLayout.elbowSize : this.canvasLayout.elbowSize;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: (corner1.x - c1ElbowSizeX), y: corner1.y },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1.x, y2: (corner1.y + c1ElbowSizeY) },
			{ p: "L", x: corner2.x, y: (corner2.y - c1ElbowSizeY) },
			{ p: "Q", x: corner2.x, y: corner2.y, x2: (corner2.x - c2ElbowSizeX), y2: corner2.y },
			{ p: "L", x: (corner3.x + c2ElbowSizeX), y: corner3.y },
			{ p: "Q", x: corner3.x, y: corner3.y, x2: corner3.x, y2: corner3.y - c3ElbowSizeY },
			{ p: "L", x: corner4.x, y: corner4.y + c3ElbowSizeY },
			{ p: "Q", x: corner4.x, y: corner4.y, x2: (corner4.x + c4ElbowSizeX), y2: corner4.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner2.x + ((corner3.x - corner2.x) / 2),
			y: corner2.y
		};

		return { elements, centerPoint };
	}

	adjustElbowSize(val1, val2) {
		let elbowSize = this.canvasLayout.elbowSize;
		const diff = val2 - val1;

		// Reduce the size of the elbow when y position of src and trg are close
		if (diff < (2 * this.canvasLayout.elbowSize) &&
			diff > -(2 * this.canvasLayout.elbowSize)) {
			elbowSize = Math.abs(diff) / 2;
		}

		// Switch the sign of the elbow size.
		elbowSize = diff > 0 ? -elbowSize : elbowSize;

		return elbowSize;
	}

	get2PartParallax(data, corner1) {
		const yInc = data.link.y2 > data.link.y1 ? -data.minFinalLine : data.minFinalLine;
		const corner0 = {};
		const corner2 = {};
		corner0.x = data.link.x1 + data.minInitialLine;
		corner0.y = corner1.y;
		corner2.x = corner1.x;
		corner2.y = data.link.y2 + yInc;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: corner0.x, y: corner1.y },
			{ p: "L", x: corner2.x, y: corner2.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const midX = corner0.x + ((corner1.x - corner0.x) / 2);
		const midY = corner0.y + ((corner2.y - corner0.y) / 2);
		const centerPoint = { x: midX, y: midY };

		return { elements, centerPoint };
	}

	get3PartParallax(data, corner1, corner2) {
		let elements;

		// Centerpoint is used to position decorations and context toolbars
		let centerPoint = { x: 0, y: 0 };

		if (data.link.x2 > corner2.x) {
			const corner2a = {};
			corner2a.x = data.link.x2 - Math.min(data.minFinalLine, data.link.x2 - corner1.x);
			corner2a.y = data.link.y2;
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: corner1.x, y: corner1.y },
				{ p: "L", x: corner2a.x, y: corner2a.y },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];

			centerPoint = {
				x: corner1.x + ((corner2a.x - corner1.x) / 2),
				y: corner1.y + ((corner2a.y - corner1.y) / 2)
			};

		} else if (data.link.x2 < data.link.x1 + data.minInitialLine) {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: corner1.x, y: corner1.y },
				{ p: "L", x: Math.max(corner2.x, data.link.x2), y: data.link.y2 },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];

			centerPoint = {
				x: data.link.x2 + ((corner2.x - data.link.x2) / 2),
				y: corner2.y
			};

		} else {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: corner1.x, y: corner1.y },
				{ p: "L", x: data.link.x2 + data.minFinalLine, y: data.link.y2 },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];
			centerPoint = {
				x: corner1.x,
				y: corner1.y + ((data.link.y2 - corner1.y) / 2)
			};
		}

		return { elements, centerPoint };
	}

	get4PartParallax(data, corner1, corner2, corner3) {
		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: (corner1.x), y: corner1.y },
			{ p: "L", x: corner2.x, y: corner2.y },
			{ p: "L", x: corner3.x, y: corner3.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner3.x + ((corner2.x - corner3.x) / 2),
			y: corner2.y
		};

		return { elements, centerPoint };
	}

	get5PartParallax(data, corner1, corner2, corner3, corner4) {
		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: corner1.x, y: corner1.y },
			{ p: "L", x: corner2.x, y: corner2.y },
			{ p: "L", x: corner3.x, y: corner3.y },
			{ p: "L", x: corner4.x, y: corner4.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner3.x + ((corner2.x - corner3.x) / 2),
			y: corner2.y
		};

		return { elements, centerPoint };
	}

	get2PartStraight(data, corner1) {
		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: data.link.x1 + ((data.link.x2 - data.link.x1) / 2),
			y: data.link.y1 + ((data.link.y2 - data.link.y1) / 2)
		};

		return { elements, centerPoint };
	}

	get3PartStraight(data, corner1, corner2) {
		let elements;
		let centerPoint = { x: 0, y: 0 };
		if (corner2.x < data.link.x2) {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];

			centerPoint = {
				x: data.link.x1 + ((data.link.x2 - data.link.x1) / 2),
				y: data.link.y1 + ((data.link.y2 - data.link.y1) / 2)
			};

		} else if (data.link.x2 < data.link.x1) {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: corner1.x, y: corner2.y },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];

			centerPoint = {
				x: data.link.x2 + ((corner2.x - data.link.x2) / 2),
				y: corner2.y
			};

		} else {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "L", x: corner1.x + data.minFinalLine, y: corner1.y },
				{ p: "L", x: data.link.x2, y: data.link.y2 }
			];

			centerPoint = {
				x: data.link.x1 + ((corner1.x - data.link.x1) / 2),
				y: data.link.y1
			};
		}

		return { elements, centerPoint };
	}

	get4PartStraight(data, corner1, corner2, corner3) {
		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: data.link.x1 + data.minInitialLine, y: corner2.y },
			{ p: "L", x: data.link.x2, y: corner2.y },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner3.x + ((corner2.x - corner3.x) / 2),
			y: corner2.y
		};

		return { elements, centerPoint };
	}

	get5PartStraight(data, corner1, corner2, corner3, corner4) {
		const xInc = corner4.x > data.link.x2 ? data.minFinalLine : -data.minFinalLine;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "L", x: corner1.x, y: corner2.y },
			{ p: "L", x: data.link.x2 + xInc, y: corner2.y },
			{ p: "L", x: data.link.x2 + xInc, y: data.link.y2 },
			{ p: "L", x: data.link.x2, y: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: corner3.x + ((corner2.x - corner3.x) / 2),
			y: corner2.y // data.link.y1 + ((corner2.y - data.link.y1) / 2)
		};

		return { elements, centerPoint };
	}

	get2PartCurve(data, corner1) {
		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: data.link.x2, y2: data.link.y2 },
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = {
			x: CanvasUtils.getCenterPointQuadBezier(data.link.x1, corner1.x, data.link.x2),
			y: CanvasUtils.getCenterPointQuadBezier(data.link.y1, corner1.y, data.link.y2)
		};

		return { elements, centerPoint };
	}

	get3PartCurve(data, corner1, corner2) {
		let elements;
		// Centerpoint is used to position decorations and context toolbars
		let centerPoint;

		if (corner1.x > data.link.x2) {
			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "C", x: corner1.x + 80, y: corner1.y, x2: corner2.x + 20, y2: corner2.y, x3: data.link.x2, y3: data.link.y2 }
			];

			centerPoint = {
				x: CanvasUtils.getCenterPointCubicBezier(data.link.x1, corner1.x + 80, corner2.x, data.link.x2),
				y: CanvasUtils.getCenterPointCubicBezier(data.link.y1, corner1.y, corner2.y, data.link.y2),
			};

		} else {
			const corner1a = {};
			corner1a.x = data.link.x1 + ((data.link.x2 - data.link.x1) / 2);

			elements = [
				{ p: "M", x: data.link.x1, y: data.link.y1 },
				{ p: "C", x: corner1a.x, y: corner1.y, x2: corner1a.x, y2: corner2.y, x3: data.link.x2, y3: data.link.y2 }
			];

			centerPoint = {
				x: corner1a.x,
				y: corner1.y + ((corner2.y - corner1.y) / 2),
			};
		}

		return { elements, centerPoint };
	}

	get4PartCurve(data, corner1, corner2, corner3) {
		const xDiff = data.link.x2 - corner1.x;
		const xSeparation = Math.min(200, Math.abs(xDiff));
		const xInc = xDiff > 0 ? -xSeparation / 2 : xSeparation / 2;

		const corner1a = {};
		const corner2a = {};
		const corner2b = {};
		corner1a.x = corner1.x;
		corner1a.y = corner1.y + ((corner2.y - corner1.y) / 2);
		corner2a.x = corner2.x - xInc;
		corner2a.y = corner2.y;
		corner2b.x = corner3.x + xInc;
		corner2b.y = corner2.y;

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1a.x, y2: corner1a.y },
			{ p: "Q", x: corner2.x, y: corner2.y, x2: corner2a.x, y2: corner2a.y },
			{ p: "L", x: corner2b.x, y: corner2b.y },
			{ p: "Q", x: corner3.x, y: corner3.y, x2: data.link.x2, y2: data.link.y2 },
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = corner2a;

		return { elements, centerPoint };
	}

	get5PartCurve(data, corner1, corner2, corner3, corner4) {
		const xDiff = corner4.x - corner1.x;
		const xSeparation = Math.min(200, Math.abs(xDiff));
		const xInc = xDiff > 0 ? -xSeparation / 2 : xSeparation / 2;

		const corner1a = {};
		const corner2a = {};
		const corner2b = {};
		const corner3a = {};
		corner1a.x = corner1.x;
		corner1a.y = corner1.y + ((corner2.y - corner1.y) / 2);
		corner2a.x = corner2.x - xInc;
		corner2a.y = corner2.y;
		corner2b.x = corner3.x + xInc;
		corner2b.y = corner2.y;
		corner3a.x = corner3.x;
		corner3a.y = data.link.y2 - ((data.link.y2 - corner3.y) / 2);

		const elements = [
			{ p: "M", x: data.link.x1, y: data.link.y1 },
			{ p: "Q", x: corner1.x, y: corner1.y, x2: corner1a.x, y2: corner1a.y },
			{ p: "Q", x: corner2.x, y: corner2.y, x2: corner2a.x, y2: corner2a.y },
			{ p: "L", x: corner2b.x, y: corner2b.y },
			{ p: "Q", x: corner3.x, y: corner3.y, x2: corner3a.x, y2: corner3a.y },
			{ p: "Q", x: corner4.x, y: corner4.y, x2: data.link.x2, y2: data.link.y2 }
		];

		// Centerpoint is used to position decorations and context toolbars
		const centerPoint = corner2a;

		return { elements, centerPoint };
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
}
