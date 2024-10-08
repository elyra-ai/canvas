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

/* eslint no-bitwise: "off" */

// This class contains utility functions that may be used for both the canvas
// objects stored in redux and also the copy of canvas objects maintained by
// the CanvasRender objects.

import { get, has, isNumber, set } from "lodash";
import { ASSOCIATION_LINK, ASSOC_STRAIGHT, COMMENT_LINK, NODE_LINK,
	LINK_TYPE_STRAIGHT, SUPER_NODE, NORTH, SOUTH, EAST, WEST }
	from "../common-canvas/constants/canvas-constants.js";

export default class CanvasUtils {

	static getObjectPositions(objects) {
		const objectPositions = {};
		objects.forEach((obj) => {
			objectPositions[obj.id] = { x_pos: obj.x_pos, y_pos: obj.y_pos };
		});
		return objectPositions;
	}

	static getLinkPositions(links) {
		const positions = {};
		links.forEach((l) => {
			if (l.srcPos) {
				set(positions[l.id], "srcPos.x_pos", l.srcPos.x_pos);
				set(positions[l.id], "srcPos.y_pos", l.srcPos.y_pos);
			}
			if (l.trgPos) {
				if (!positions[l.id]) {
					positions[l.id] = {};
				}
				set(positions[l.id], "trgPos.x_pos", l.trgPos.x_pos);
				set(positions[l.id], "trgPos.y_pos", l.trgPos.y_pos);
			}
		});
		return positions;
	}

	static moveSurroundingObjects(supernode, objects, nodeSizingDirection, newWidth, newHeight, updateNodePos) {
		const newObjectPositions = {};
		const incWidth = newWidth - supernode.width;
		const incHeight = newHeight - supernode.height;
		const superCenterX = supernode.x_pos + (supernode.width / 2);
		const superCenterY = supernode.y_pos + (supernode.height / 2);

		objects.forEach((obj) => {
			if (obj.id === supernode.id) {
				return; // Ignore the supernode
			}

			const deltas = this.getMoveDeltas(
				obj.x_pos + (obj.width / 2), // Center of obj horizontally
				obj.y_pos + (obj.height / 2), // Center of obj vertically
				nodeSizingDirection, superCenterX, superCenterY, incWidth, incHeight);

			if (deltas.xDelta !== 0 || deltas.yDelta !== 0) {
				newObjectPositions[obj.id] = {
					id: obj.id,
					x_pos: obj.x_pos + deltas.xDelta,
					y_pos: obj.y_pos + deltas.yDelta,
					width: obj.width,
					height: obj.height
				};

				if (updateNodePos) {
					obj.x_pos += deltas.xDelta;
					obj.y_pos += deltas.yDelta;
				}
			}
		});
		return newObjectPositions;
	}

	static moveSurroundingDetachedLinks(supernode, links, nodeSizingDirection, newWidth, newHeight, updateLinkPos) {
		const newLinkPositions = {};
		const incWidth = newWidth - supernode.width;
		const incHeight = newHeight - supernode.height;
		const superCenterX = supernode.x_pos + (supernode.width / 2);
		const superCenterY = supernode.y_pos + (supernode.height / 2);

		links.forEach((link) => {
			// If link has 'srcPos' it is detached at source end.
			if (link.srcPos) {
				const deltas = this.getMoveDeltas(link.srcPos.x_pos, link.srcPos.y_pos,
					nodeSizingDirection, superCenterX, superCenterY, incWidth, incHeight);

				if (deltas.xDelta !== 0 || deltas.yDelta !== 0) {
					if (!newLinkPositions[link.id]) {
						newLinkPositions[link.id] = { id: link.id };
					}
					set(newLinkPositions[link.id], "srcPos.x_pos", link.srcPos.x_pos + deltas.xDelta);
					set(newLinkPositions[link.id], "srcPos.y_pos", link.srcPos.y_pos + deltas.yDelta);

					if (updateLinkPos) {
						link.srcPos.x_pos += deltas.xDelta;
						link.srcPos.y_pos += deltas.yDelta;
					}
				}
			}

			// If link has 'trgPos' it is detached at target end.
			if (link.trgPos) {
				const deltas = this.getMoveDeltas(link.trgPos.x_pos, link.trgPos.y_pos,
					nodeSizingDirection, superCenterX, superCenterY, incWidth, incHeight);

				if (deltas.xDelta !== 0 || deltas.yDelta !== 0) {
					if (!newLinkPositions[link.id]) {
						newLinkPositions[link.id] = { id: link.id };
					}
					set(newLinkPositions[link.id], "trgPos.x_pos", link.trgPos.x_pos + deltas.xDelta);
					set(newLinkPositions[link.id], "trgPos.y_pos", link.trgPos.y_pos + deltas.yDelta);
				}
				if (updateLinkPos) {
					link.trgPos.x_pos += deltas.xDelta;
					link.trgPos.y_pos += deltas.yDelta;
				}
			}
		});

		return newLinkPositions;
	}

	static getMoveDeltas(xPos, yPos, nodeSizingDirection, superCenterX, superCenterY, incWidth, incHeight) {
		let xDelta = 0;
		let yDelta = 0;

		if (nodeSizingDirection.indexOf("n") > -1 && yPos < superCenterY - 20) {
			yDelta = -incHeight;

		} else if (nodeSizingDirection.indexOf("s") > -1 && yPos > superCenterY + 20) {
			yDelta = incHeight;
		}

		if (nodeSizingDirection.indexOf("w") > -1 && xPos < superCenterX - 20) {
			xDelta = -incWidth;

		} else if (nodeSizingDirection.indexOf("e") > -1 && xPos > superCenterX + 20) {
			xDelta = incWidth;
		}
		return { xDelta, yDelta };
	}

	// Returns the expanded width for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended width to
	// change based on the node type selected (this is more for use in the test
	// harness than in a real application).
	static getSupernodeExpandedWidth(supernode, canvasLayout) {
		return supernode.expanded_width ? supernode.expanded_width : Math.max(canvasLayout.supernodeDefaultWidth, supernode.width);
	}

	// Returns the expanded height for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended height to
	// change based on the node type selected (this is more for use in the test
	// harness than in a real application).
	static getSupernodeExpandedHeight(supernode, canvasLayout) {
		return supernode.expanded_height ? supernode.expanded_height : Math.max(canvasLayout.supernodeDefaultHeight, supernode.height);
	}

	// ---------------------------------------------------------------------------
	// The methods below calculate the padding needed to display connection lines
	// ---------------------------------------------------------------------------

	// Returns the maximum padding needed to display any elbow lines, that emanate
	// from the node passed in, to the set of target nodes passed in.
	static getNodePaddingToTargetNodes(node, targetNodes, links, linkType) {
		let padding = 0;
		if (linkType === "Elbow") {
			const maxIncrement = this.getCountOfLinksToTargetNodes(node, targetNodes, links) * node.layout.minInitialLineIncrement;
			padding = node.layout.minInitialLine + node.layout.minFinalLine + maxIncrement;
		} else {
			padding = 2 * node.layout.minInitialLine;
		}
		return padding;
	}

	// Returns the count of links from the node passed in to the set of target
	// nodes passed in.
	static getCountOfLinksToTargetNodes(node, targetNodes, links) {
		let count = 0;
		if (node.outputs && node.outputs.length > 0) {
			node.outputs.forEach((output) => {
				if (this.isNodeOutputLinkedToTargetNodes(node, output, targetNodes, links)) {
					count++;
				}
			});
		}
		return count;
	}

	// Returns true if the node and output passed in are linked to any of the
	// target nodes passed in.
	static isNodeOutputLinkedToTargetNodes(node, output, targetNodes, links) {
		let state = false;
		links.forEach((link) => {
			if (link.srcNodeId === node.id && link.srcNodePortId === output.id && this.isTargetNode(link.trgNodeId, targetNodes)) {
				state = true;
			}
		});
		return state;
	}

	// Returns true if the node identified by targetNodeId is in the set
	// of target nodes passed in.
	static isTargetNode(trgNodeId, targetNodes) {
		return targetNodes.findIndex((tn) => tn.id === trgNodeId) > -1;
	}

	// Returns an array of decorations that is a combination of the two input
	// arrays where the decorations from the overlayDecs array are overlaid on
	// top of those from the baseDecs array.
	static getCombinedDecorations(baseDecs = [], overlayDecs = []) {
		const decs = baseDecs.map((bd) => {
			const objDec = overlayDecs.find((od) => od.id === bd.id);
			if (objDec) {
				return Object.assign({}, bd, objDec);
			}
			return bd;
		});

		if (overlayDecs) {
			overlayDecs.forEach((od) => {
				const index = baseDecs.findIndex((bd) => bd.id === od.id);
				if (index === -1) {
					decs.push(od);
				}
			});
		}

		return decs;
	}

	// Returns true if either the Command Key on Mac or Control key on Windows
	// is pressed. evnt can be either a regular event object OR the
	// d3event object provided by d3.
	static isCmndCtrlPressed(evnt) {
		if (this.isMacintosh()) {
			return evnt.metaKey;
		}
		return evnt.ctrlKey;
	}

	// Returns whether user platform is Mac.
	static isMacintosh() {
		return navigator.platform.indexOf("Mac") > -1;
	}

	// Stops propagation of events and prevents any default behavior from
	// being executed. evnt can be either a regular event object OR the
	// d3event object provided by d3.
	static stopPropagationAndPreventDefault(evnt) {
		evnt.stopPropagation();
		evnt.preventDefault();
	}

	// Returns a snap-to-grid value for the value passed in based on a grid
	// size defined by the gridSize passed in.
	static snapToGrid(value, gridSize) {
		const div = value / gridSize;
		let abs = Math.trunc(div);
		const remainder = div - abs;

		if (remainder > 0.5) {
			abs++;
		}

		return abs * gridSize;
	}

	// Returns the coordinate position along the edge of a rectangle where a
	// straight line should be drawn from. The line's direction originates from an
	// arbitrary point (origin) within the rectangle and goes to an arbitrary
	// point (end) outside the rectangle. The rectangle is described by the
	// first four paramters. The gap is an additional spacing around the
	// rectangle used to separate the start of the line from the
	// rectangle/node boundary. The origin of the line's direction is described by
	// originX and originY. The end point of the line is described by endX and endY.
	static getOuterCoord(x, y, w, h, gap, originX, originY, endX, endY) {
		const topEdge = y - gap;
		const leftEdge = x - gap;
		const rightEdge = x + w + gap;
		const bottomEdge = y + h + gap;

		// The origin may not be in the center of the node rectangle so offset left
		// and right may be different and also top and bottom.
		const originTopOffsetY = originY - topEdge;
		const originLeftOffsetX = originX - leftEdge;
		const originRightOffsetX = rightEdge - originX;
		const originBottomOffsetY = bottomEdge - originY;

		const originToEndX = originX - endX;
		const originToEndY = originY - endY;

		var startPointX;
		var startPointY;
		let dir = NORTH;

		if (originToEndX === 0) {
			startPointX = originX;
			startPointY = (endY < originY) ? topEdge : bottomEdge;
			dir = originToEndY > 0 ? NORTH : SOUTH;

		} else if (endX > originX) {
			const topRightRatio = originTopOffsetY / (originX - rightEdge);
			const botRightRatio = (originY - bottomEdge) / (originX - rightEdge);
			const ratioRight = originToEndY / originToEndX;

			// North
			if (ratioRight < topRightRatio) {
				startPointX = originX - (originTopOffsetY / ratioRight);
				startPointY = topEdge;
			// South
			} else if (ratioRight > botRightRatio) {
				startPointX = originX + (originBottomOffsetY / ratioRight);
				startPointY = bottomEdge;
				dir = SOUTH;
			// East
			} else {
				startPointX = rightEdge;
				startPointY = originY + (originRightOffsetX * ratioRight);
				dir = EAST;
			}
		// End point is to the left of center
		} else {
			const topLeftRatio = originTopOffsetY / originLeftOffsetX;
			const botLeftRatio = (originY - bottomEdge) / originLeftOffsetX;
			const ratioLeft = originToEndY / originToEndX;

			// North
			if (ratioLeft > topLeftRatio) {
				startPointX = originX - (originTopOffsetY / ratioLeft);
				startPointY = topEdge;
			// South
			} else if (ratioLeft < botLeftRatio) {
				startPointX = originX + (originBottomOffsetY / ratioLeft);
				startPointY = bottomEdge;
				dir = SOUTH;
			// West
			} else {
				startPointX = leftEdge;
				startPointY = originY - (originLeftOffsetX * ratioLeft);
				dir = WEST;
			}
		}

		return { x: startPointX, y: startPointY, originX, originY, dir };
	}

	// Assisted by WCA@IBM
	// Latest GenAI contribution: ibm/granite-20b-code-instruct-v2
	// Returns the angle between two points where the angle
	// returned is always positive. The angle starts at the 3 o'clock
	// position which is 0 degrees and increases in a clock-wise
	// direction.
	static calculateAngle(x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const angle = Math.atan2(dy, dx);
		let angleInDegrees = angle * (180 / Math.PI);
		if (angleInDegrees < 0) {
			angleInDegrees += 360;
		}
		return angleInDegrees;
	}

	// Returns a direction NORTH, SOUTH, EAST or WEST which is the direction
	// from the origin position within the rectangle described by x, y, w and h
	// to the end position described by endX and endY.
	static getDir(x, y, w, h, originX, originY, endX, endY) {
		const bottomEdge = y + h;

		// The origin may not be in the center of the node rectangle so offset left
		// and right may be different and also top and bottom.
		const originTopOffsetY = originY - y;
		const originLeftOffsetX = originX - x;

		const originToEndX = originX - endX;
		const originToEndY = originY - endY;

		let dir = "";

		if (originToEndX === 0) {
			dir = (endY < originY) ? NORTH : SOUTH;

		} else if (endX > originX) {
			const rightEdge = x + w;
			const topRightRatio = originTopOffsetY / (originX - rightEdge);
			const botRightRatio = (originY - bottomEdge) / (originX - rightEdge);
			const ratioRight = originToEndY / originToEndX;

			if (ratioRight < topRightRatio) {
				dir = NORTH;
			} else if (ratioRight > botRightRatio) {
				dir = SOUTH;
			} else {
				dir = EAST;
			}
		// End point is to the left of center
		} else {
			const topLeftRatio = originTopOffsetY / originLeftOffsetX;
			const botLeftRatio = (originY - bottomEdge) / originLeftOffsetX;
			const ratioLeft = originToEndY / originToEndX;

			if (ratioLeft > topLeftRatio) {
				dir = NORTH;
			} else if (ratioLeft < botLeftRatio) {
				dir = SOUTH;
			} else {
				dir = WEST;
			}
		}

		return dir;
	}

	// Returns a direction (n, s, e or w) of a port at the
	// x, y position on a node. This is the direction that
	// would be taken by an outgoing link from a source node
	// or an incoming link to a target node.
	static getPortDir(x, y, node) {
		const halfNodeWidth = (node.width / 2);
		const halfNodeHeight = (node.height / 2);
		const xFromCenter = x - halfNodeWidth;
		const yFromCenter = y - halfNodeHeight;
		// In the center horizontally
		if (xFromCenter === 0) {
			if (yFromCenter > 0) {
				return SOUTH;
			}
			return NORTH;

		// To the right
		} else if (xFromCenter > 0) {
			const angleToRight = Math.atan(yFromCenter / xFromCenter);
			const angleToBottomRight = Math.atan(halfNodeHeight / halfNodeWidth);
			const angleTopRight = -angleToBottomRight;
			if (angleToRight === 0) {
				return EAST;
			} else if (angleToRight < angleTopRight) {
				return NORTH;
			} else if (angleToRight > angleToBottomRight) {
				return SOUTH;
			}
			return EAST;

		}
		// To the left
		const angleToLeft = Math.atan(yFromCenter / xFromCenter);
		const angleToTopLeft = Math.atan(halfNodeHeight / halfNodeWidth);
		const angleToBottomLeft = -angleToTopLeft;
		if (angleToLeft === 0) {
			return WEST;
		} else if (angleToLeft > angleToTopLeft) {
			return NORTH;
		} else if (angleToLeft < angleToBottomLeft) {
			return SOUTH;
		}
		return WEST;
	}


	// Returns true if the line described by x1, y1, x2, y2 either intersects or
	// is fully inside the rectangle described by rx1, ry1, rx2, ry2.
	static lineIntersectRectangle(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
		const insideLine = this.lineInside(x1, y1, x2, y2, rx1, ry1, rx2, ry2);
		const intersectTop = this.linesIntersect(x1, y1, x2, y2, rx1, ry1, rx2, ry1);
		const intersectLeft = this.linesIntersect(x1, y1, x2, y2, rx1, ry1, rx1, ry2);
		const intersectRight = this.linesIntersect(x1, y1, x2, y2, rx2, ry1, rx2, ry2);
		const intersectBottom = this.linesIntersect(x1, y1, x2, y2, rx1, ry2, rx2, ry2);

		return insideLine || intersectTop || intersectLeft || intersectRight || intersectBottom;
	}

	// Returns true if the line described by x1, y1, x2, y2 is inside the
	// rectangle described by rx1, ry1, rx2, ry2.
	static lineInside(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
		return x1 >= rx1 && x1 <= rx2 && y1 >= ry1 && y1 <= ry2 &&
			x2 >= rx1 && x2 <= rx2 && y2 >= ry1 && y2 <= ry2;
	}

	// Returns an object containing x, y coordinate of the intersection point
	// if the line described by x1, y1 to x2, y2 crosses the line described by
	// x3, y3 to x4, y4.  Returns a null if the lines do not cross.
	// See http://www.jeffreythompson.org/collision-detection/line-line.php
	static linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
		// calculate the distance to intersection point
		const a = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
		const b = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

		// If a and b are between 0-1, lines intersect, so return the intersection point.
		if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
			return {
				x: x1 + (a * (x2 - x1)),
				y: y1 + (a * (y2 - y1))
			};
		}
		return null;
	}

	// Returns the distance from the start point to finsih point of the link line.
	static getLinkDistance(link) {
		const x = link.x2 - link.x1;
		const y = link.y2 - link.y1;

		return Math.sqrt((x * x) + (y * y));
	}

	// Return the center point of a quadratic bezier curve where p0 is the
	// start point, p1 is the control point and p2 is the end point.
	// This works for either the x or y coordinate.
	static getCenterPointQuadBezier(p0, p1, p2) {
		const t = 0.5;
		return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
	}

	// Return the center point of a cubic bezier curve where p0 is the
	// start point, p1 and p2 are the control points and p3 is the end point.
	// This works for either the x or y coordinate.
	static getCenterPointCubicBezier(p0, p1, p2, p3) {
		const t = 0.5;
		return (1 - t) * (1 - t) * (1 - t) * p0 + 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t * p3;
	}

	// Returns true if the node passed in should be resizeable. All nodes are resizabele
	// except binding nodes in a sub-flow when enableResizableNodes is switched on.
	static isNodeResizable(node, config) {
		if (!config.enableEditingActions ||
				this.isSuperBindingNode(node) ||
				(!config.enableResizableNodes && !this.isExpandedSupernode(node))) {
			return false;
		}
		return true;
	}

	// Returns true if a link of type `type` can be created between the two
	// node/port combinations provided given the set of current links provided.
	static isConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links, type, selfRefLinkAllowed) {
		if (type === ASSOCIATION_LINK) {
			return this.isAssocConnectionAllowed(srcNode, trgNode, links);
		}
		return this.isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed);
	}

	// Returns true if a node-node data link can be created between the two
	// node/port combinations provided on a canvas where detached links are
	// allowed, given the set of current link provided.
	static isConnectionAllowedWithDetachedLinks(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed) {
		if (srcNode && trgNode && srcNode.id === trgNode.id && !selfRefLinkAllowed) { // Cannot connect to ourselves.
			return false;
		}

		if (srcNode && trgNode && this.linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a connection is allowed to the source node and port
	// passed in given the set of current links.
	static isSrcConnectionAllowedWithDetachedLinks(srcNodePortId, srcNode, links) {
		if (srcNode && !this.doesNodeHaveOutputPorts(srcNode)) {
			return false;
		}

		if (srcNode && this.isSrcCardinalityAtMax(srcNodePortId, srcNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a connection is allowed to the target node and port
	// passed in given the set of current links.
	static isTrgConnectionAllowedWithDetachedLinks(trgNodePortId, trgNode, links) {
		if (trgNode && !this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (trgNode && this.isTrgCardinalityAtMax(trgNodePortId, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if the node has input ports.
	static doesNodeHaveInputPorts(node) {
		return node.inputs && node.inputs.length > 0;
	}

	// Returns true if the node has output ports.
	static doesNodeHaveOutputPorts(node) {
		return node.outputs && node.outputs.length > 0;
	}

	// Returns true if an existing link to the target node and port can be
	// replaced with a new link from the srcNode to the trgNode and trgPortId.
	static isDataLinkReplacementAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed) {

		if (!this.isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed)) {
			return false;
		}

		// Link replacement is only allowed when the input port has a maximum
		// cardinality of one.
		if (this.getMaxCardinality(trgNodePortId, trgNode.inputs) !== 1) {
			return false;
		}

		if (!this.isTrgCardinalityAtMax(trgNodePortId, trgNode, links)) {
			return false;
		}
		return true;
	}

	// Returns true if a regular node-node data link can be created between the
	// two node/port combinations provided, given the current set of links
	// passed in.
	static isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed) {

		if (!this.isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed)) {
			return false;
		}

		if (this.isCardinalityAtMax(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a regular node-node data link can be created between the
	// two node/port combinations provided, without checking on cardinalities of
	// the source or target nodes.
	static isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links, selfRefLinkAllowed) {

		if (!srcNode || !trgNode) { // Source or target are not valid.
			return false;
		}

		if (srcNode.id === trgNode.id && !selfRefLinkAllowed) { // Cannot connect to ourselves.
			return false;
		}

		if (!this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (this.linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if an association link can be created between two nodes
	// identified by the objects provided.
	static isAssocConnectionAllowed(srcNode, trgNode, links) {
		if (!srcNode || !trgNode) { // Source or target are not valid.
			return false;
		}

		if (srcNode.id === trgNode.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		// We don't check if the association link already exists because it makes
		// sense, for some applications, that multiple connections bewteen nodes are
		// allowed. Uncomment this code if we decide to add a config variable
		// to allow this in the future.
		// if (this.assocLinkAlreadyExists(srcNode, trgNode, links)) {
		// 	return false;
		// }

		return true;
	}

	// Note - Uncomment this function if in the future we decide to enfore
	// preventing multiple association links to be created by providing a config
	// variable..
	// Returns true if an association link already exists between the two nodes
	// passed in given the set of links passed in.
	// static assocLinkAlreadyExists(srcNode, trgNode, links) {
	// 	let exists = false;
	//
	// 	links.forEach((link) => {
	// 		if ((link.srcNodeId === srcNode.id && link.trgNodeId === trgNode.id) ||
	// 				(link.srcNodeId === trgNode.id && link.trgNodeId === srcNode.id)) {
	// 			exists = true;
	// 		}
	// 	});
	// 	return exists;
	// }

	// Returns true if the source node passed in is available to be linked to the
	// target node and port passed in. trgNode and trgPortId may be undefined if
	// the call is being made while a detached link is being manipulated.
	static isSrcNodeAvailable(srcNode, trgNode, trgNodePortId, links) {
		// Don't disable the target node
		if (trgNode && trgNode.id === srcNode.id) {
			return true;
		}

		if (!this.doesNodeHaveOutputPorts(srcNode)) {
			return false;
		}

		if (this.areAllSrcNodePortsCardinalityAtMax(srcNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if the targt node passed in is available to be linked to the
	// source node and port passed in. srcNode and srcPortId may be undefined if
	// the call is being made while a detached link is being manipulated.
	static isTrgNodeAvailable(trgNode, srcNode, srcNodePortId, links) {
		// Don't disable the source node
		if (srcNode && srcNode.id === trgNode.id) {
			return true;
		}

		if (!this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (this.areAllTrgNodePortsCardinalityAtMax(trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a link already exists from the source node and port to
	// the target node and port passed in given the set of links passd in.
	static linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {
		let exists = false;

		links.forEach((link) => {
			if (link.srcNodeId === srcNode.id &&
					(!link.srcNodePortId || link.srcNodePortId === srcNodePortId) &&
					link.trgNodeId === trgNode.id &&
					(!link.trgNodePortId || link.trgNodePortId === trgNodePortId)) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns true if all the ports of the source node are at maximum cardinality.
	static areAllSrcNodePortsCardinalityAtMax(srcNode, links) {
		if (srcNode && srcNode.outputs) {
			const index = srcNode.outputs.findIndex((output) => !this.isSrcCardinalityAtMax(output.id, srcNode, links));
			return index === -1;
		}
		return false;
	}

	// Returns true if all the ports of the target node are at maximum cardinality.
	static areAllTrgNodePortsCardinalityAtMax(trgNode, links) {
		if (trgNode && trgNode.inputs) {
			const index = trgNode.inputs.findIndex((input) => !this.isTrgCardinalityAtMax(input.id, trgNode, links));
			return index === -1;
		}
		return false;
	}

	// Returns true if the object passed in is a node which has at least one
	// input port and one output port.
	static hasInputAndOutputPorts(obj) {
		return (this.isNode(obj) && obj.inputs && obj.inputs.length > 0 && obj.outputs && obj.outputs.length > 0);
	}

	// Returns true if either the cardinality of the default input port or
	// the default output port of the node passed in is maxed out based on
	// the array of links passed in.
	static isNodeDefaultPortsCardinalityAtMax(node, links) {
		return this.isCardinalityAtMax(null, null, node, node, links);
	}

	// Returns true if the cardinality is maxed out for the source and target
	// nodes and ports passed in. This means any additional connection would
	// not be allowed from either node/port combination.
	static isCardinalityAtMax(srcPortId, trgPortId, srcNode, trgNode, links) {
		return this.isSrcCardinalityAtMax(srcPortId, srcNode, links) ||
			this.isTrgCardinalityAtMax(trgPortId, trgNode, links);
	}

	// Returns true if the cardinality is maxed out for the source node and port
	// passed in. This means any additional connection would not be allowed
	// from this source node/port combination.
	static isSrcCardinalityAtMax(portId, srcNode, links) {
		const srcPortId = portId ? portId : this.getDefaultOutputPortId(srcNode);
		var srcCount = 0;

		links.forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.srcNodeId === srcNode.id && srcPortId) {
					if (link.srcNodePortId === srcPortId ||
							(!link.srcNodePortId && this.isFirstPort(srcNode.outputs, srcPortId))) {
						srcCount++;
					}
				}
			}
		});

		const maxCard = this.getMaxCardinality(srcPortId, srcNode.outputs);
		if (maxCard !== null && // Might be 0! So test explicitley for non null.
				maxCard !== -1 && // -1 indicates an infinite numder of ports are allowed
				srcCount >= maxCard) {
			return true;
		}

		return false;
	}

	// Returns true if the cardinality is maxed out for the taget node and port
	// passed in. This means any additional connection would not be allowed
	// to this target node/port combination.
	static isTrgCardinalityAtMax(portId, trgNode, links) {
		const trgPortId = portId ? portId : this.getDefaultInputPortId(trgNode);
		var trgCount = 0;

		links.forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.trgNodeId === trgNode.id && trgPortId) {
					if (link.trgNodePortId === trgPortId ||
							(!link.trgNodePortId && this.isFirstPort(trgNode.inputs, trgPortId))) {
						trgCount++;
					}
				}
			}
		});

		const maxCard = this.getMaxCardinality(trgPortId, trgNode.inputs);
		if (maxCard !== null && // Might be 0! Yes believe it or not someone does set it to zero. So test explicitley for non null.
				maxCard !== -1 && // -1 indicates an infinite numder of ports are allowed
				trgCount >= maxCard) {
			return true;
		}

		return false;
	}

	// Returns true if the portId passed in specifies the first port in the
	// port array.
	static isFirstPort(portArray, portId) {
		const index = portArray.findIndex((port) => port.id === portId);

		if (index === 0) {
			return true;
		}
		return false;
	}

	// Returns a source port Id if one exists in the link, otherwise defaults
	// to the first available port on the source node.
	static getSourcePortId(link, srcNode) {
		var srcPortId;
		if (link.srcNodePortId) {
			srcPortId = link.srcNodePortId;
		} else if (srcNode.outputs && srcNode.outputs.length > 0) {
			srcPortId = srcNode.outputs[0].id;
		} else {
			srcPortId = null;
		}
		return srcPortId;
	}

	// Returns a target port Id if one exists in the link, otherwise defaults
	// to the first available port on the target node.
	static getTargetPortId(link, trgNode) {
		var trgPortId;
		if (link.trgNodePortId) {
			trgPortId = link.trgNodePortId;
		} else if (trgNode.inputs && trgNode.inputs.length > 0) {
			trgPortId = trgNode.inputs[0].id;
		} else {
			trgPortId = null;
		}
		return trgPortId;
	}


	// Returns the port referenced by srcPortId from the node referenced
	// by srcNode.
	static getOutputPort(srcPortId, srcNode) {
		if (srcNode && srcNode.outputs) {
			return srcNode.outputs.find((p) => p.id === srcPortId);
		}
		return null;
	}

	// Returns the port referenced by trgPortId from the node referenced
	// by trgNode.
	static getInputPort(trgPortId, trgNode) {
		if (trgNode && trgNode.inputs) {
			return trgNode.inputs.find((p) => p.id === trgPortId);
		}
		return null;
	}

	// Returns the port from the port array indicated by the portId or null
	// if no port can be found.
	static getPort(portId, portArray) {
		if (portArray && portArray.length > 0) {
			const index = portArray.findIndex((port) => port.id === portId);

			if (index > -1) {
				return portArray[index];
			}
		}
		return null;
	}

	// Returns the maximum cardinality, if one exists, for the port ID passed in
	// from the array of ports provided.
	static getMaxCardinality(portId, ports) {
		const port = this.getPort(portId, ports);
		if (port &&
				port.cardinality) {
			return Number(port.cardinality.max);
		}
		return null;
	}

	// Returns true if a connection is allowed from a comment to a target node,
	// given the set of links passed in. At the moment this is only restricted
	// if a current link exists between the two.
	static isCommentLinkConnectionAllowed(commentId, trgNodeId, links) {
		return !this.commentLinkAlreadyExists(commentId, trgNodeId, links);
	}

	// Returns true if a comment link already exists from the source comment
	// to the target node, given the set of links passed in.
	static commentLinkAlreadyExists(commentId, trgNodeId, links) {
		let exists = false;

		links.forEach((link) => {
			if (link.srcNodeId === commentId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns an object containing two arrays: old links and new links. There is
	// one new link in the new links array for each old link in the old links
	// array. The new links have their properties adjusted so they are attached
	// to the first found output or input port, that is not maxed out with respect
	// to its maximum cardinality, of the provided node. The allDataLinks
	// parameter is the array of all node-node data links on the canvas.
	static getDetachedLinksToUpdate(node, detachedLinks, allNodeDataLinks) {
		const newLinks = [];
		const oldLinks = [];
		detachedLinks.forEach((link) => {
			if (link.nodeOverSrcPos && link.srcPos && node.outputs && node.outputs.length > 0) {
				let connected = false;
				node.outputs.forEach((output) => {
					if (connected === false &&
							this.isSrcConnectionAllowedWithDetachedLinks(output.id, node, this.getReplacedLinks(allNodeDataLinks, newLinks))) {
						const newLink = Object.assign({}, link, { srcNodeId: node.id, srcNodePortId: output.id });
						delete newLink.srcPos;
						newLinks.push(newLink);
						oldLinks.push(link);
						connected = true;
					}
				});

			} else if (link.nodeOverTrgPos && link.trgPos && node.inputs && node.inputs.length > 0) {
				let connected = false;
				node.inputs.forEach((input) => {
					if (connected === false &&
							this.isTrgConnectionAllowedWithDetachedLinks(input.id, node, this.getReplacedLinks(allNodeDataLinks, newLinks))) {
						const newLink = Object.assign({}, link, { trgNodeId: node.id, trgNodePortId: input.id });
						delete newLink.trgPos;
						newLinks.push(newLink);
						oldLinks.push(link);
						connected = true;
					}
				});
			}
		});
		return { newLinks, oldLinks };
	}

	// Returns an array which is a copy of the allNodeDataLinks array but with
	// any elements replaced from the newLinks array if those elements have the same ID.
	static getReplacedLinks(allNodeDataLinks, newLinks) {
		return allNodeDataLinks.map((link) => {
			const index = newLinks.findIndex((nl) => nl.id === link.id);
			return index > -1 ? newLinks[index] : link;
		});
	}

	// Returns an array of selected object IDs for nodes, comments and links
	// that are within the region (inReg) provided. Links are only included if
	// includeLinks is truthy.
	static selectInRegion(inReg, pipeline, includeLinks, linkType, enableAssocLinkType) {
		const region = {
			x1: inReg.x,
			y1: inReg.y,
			x2: inReg.x + inReg.width,
			y2: inReg.y + inReg.height
		};

		var regionSelections = [];
		for (const node of pipeline.nodes) {
			if (!this.isSuperBindingNode(node) && // Don't include binding nodes in select
					region.x1 < node.x_pos + node.width &&
					region.x2 > node.x_pos &&
					region.y1 < node.y_pos + node.height &&
					region.y2 > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of pipeline.comments) {
			if (region.x1 < comment.x_pos + comment.width &&
					region.x2 > comment.x_pos &&
					region.y1 < comment.y_pos + comment.height &&
					region.y2 > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		if (includeLinks) {
			for (const link of pipeline.links) {
				// For straight links we check to see if the link line intersects (or
				// is fully inside) the selection region.
				if ((link.type === NODE_LINK && linkType === LINK_TYPE_STRAIGHT) ||
						link.type === COMMENT_LINK ||
						(link.type === ASSOCIATION_LINK && enableAssocLinkType === ASSOC_STRAIGHT)) {
					if (this.lineIntersectRectangle(link.x1, link.y1, link.x2, link.y2, region.x1, region.y1, region.x2, region.y2)) {
						regionSelections.push(link.id);
					}
				// For elbow and curved lines we just check to see if the start or
				// end coordinates of the lines are inside the selection region or not.
				// TODO: This approach means any selection region that only touches the
				// link line will not select the line if it is elbow or curve. If any
				// host app wants more acurate collision detection between the line and
				// the selection region with these line types, this would need to be
				// improved, perhaps using a library like this:
				// https://github.com/thelonious/kld-intersections
				} else if (this.isPosInArea({ x_pos: link.x1, y_pos: link.y1 }, region, 0) ||
										this.isPosInArea({ x_pos: link.x2, y_pos: link.y2 }, region, 0)) {
					regionSelections.push(link.id);
				}
			}
		}

		return regionSelections;
	}

	// Return true if the position provided is within the area provided.
	static isPosInArea(pos, area, pad) {
		return pos.x_pos > area.x1 - pad &&
			pos.x_pos < area.x2 + pad &&
			pos.y_pos > area.y1 - pad &&
			pos.y_pos < area.y2 + pad;
	}

	// Returns truthy if the object passed in is a node (and not a comment).
	// Comments don't have a type property.
	static isNode(obj) {
		return obj.type;
	}

	static isSupernode(node) {
		return node.type === SUPER_NODE;
	}

	static isExpanded(node) {
		return node.is_expanded === true;
	}

	static isExpandedSupernode(node) {
		return this.isSupernode(node) && this.isExpanded(node);
	}

	static isCollapsedSupernode(node) {
		return this.isSupernode(node) && !this.isExpanded(node);
	}
	// Returns true if the node passed in is a binding node in a subflow
	// for a supernode.
	static isSuperBindingNode(d) {
		return d.isSupernodeInputBinding || d.isSupernodeOutputBinding;
	}

	// Returns an object containing the dimensions of an imaginary rectangle
	// surrounding the nodes and comments and links passed in or an object with
	// all properties set to zero if no valid objects were provided.
	// nodeHighlightGap may be 0 or undefined. If it is undefined we use the
	// nodeHighlightGap in the node's layout.
	// If allLinks is set to true, we include the start and end coordinates of all
	// links passed in. If set to false (or is undefined), we only inlcude
	// the unconnected ends of semi-detached or fully-detached links. That is,
	//  where the link has a srcPos and/or a trgPos field.
	static getCanvasDimensions(nodes, comments, links, commentHighlightGap, nodeHighlightGap, allLinks) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		if (nodes) {
			nodes.forEach((d) => {
				if (this.isSuperBindingNode(d)) { // Always ignore Supernode binding nodes
					return;
				}
				const nodeGap = nodeHighlightGap === 0 ? 0 : d.layout.nodeHighlightGap;
				canvLeft = Math.min(canvLeft, d.x_pos - nodeGap);
				canvTop = Math.min(canvTop, d.y_pos - nodeGap);
				canvRight = Math.max(canvRight, d.x_pos + d.width + nodeGap);
				canvBottom = Math.max(canvBottom, d.y_pos + d.height + nodeGap);
			});
		}

		if (comments) {
			comments.forEach((d) => {
				canvLeft = Math.min(canvLeft, d.x_pos - commentHighlightGap);
				canvTop = Math.min(canvTop, d.y_pos - commentHighlightGap);
				canvRight = Math.max(canvRight, d.x_pos + d.width + commentHighlightGap);
				canvBottom = Math.max(canvBottom, d.y_pos + d.height + commentHighlightGap);
			});
		}

		// Take into account semi-detached and fully-detached links, if any.
		if (links) {
			links.forEach((link) => {
				if (allLinks) {
					canvLeft = Math.min(canvLeft, link.x1);
					canvTop = Math.min(canvTop, link.y1);
					canvRight = Math.max(canvRight, link.x1);
					canvBottom = Math.max(canvBottom, link.y1);

					canvLeft = Math.min(canvLeft, link.x2);
					canvTop = Math.min(canvTop, link.y2);
					canvRight = Math.max(canvRight, link.x2);
					canvBottom = Math.max(canvBottom, link.y2);
				} else {
					if (link.srcPos) {
						canvLeft = Math.min(canvLeft, link.srcPos.x_pos);
						canvTop = Math.min(canvTop, link.srcPos.y_pos);
						canvRight = Math.max(canvRight, link.srcPos.x_pos);
						canvBottom = Math.max(canvBottom, link.srcPos.y_pos);
					}
					if (link.trgPos) {
						canvLeft = Math.min(canvLeft, link.trgPos.x_pos);
						canvTop = Math.min(canvTop, link.trgPos.y_pos);
						canvRight = Math.max(canvRight, link.trgPos.x_pos);
						canvBottom = Math.max(canvBottom, link.trgPos.y_pos);
					}
				}
			});
		}
		const canvWidth = canvRight - canvLeft;
		const canvHeight = canvBottom - canvTop;

		if (canvLeft === Infinity || canvTop === Infinity ||
				canvRight === -Infinity || canvBottom === -Infinity) {
			return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
		}

		return {
			left: canvLeft,
			top: canvTop,
			right: canvRight,
			bottom: canvBottom,
			width: canvWidth,
			height: canvHeight
		};
	}

	// Returns a subset of links from the links passed in which connect to
	// the target node and port passed in.
	static getDataLinksConnectedTo(trgPortId, trgNode, links) {
		const defTrgPortId = this.getDefaultInputPortId(trgNode);

		return links.filter((link) => {
			if (link.type === NODE_LINK) {
				const linkTrgPortId = link.trgNodePortId || defTrgPortId;
				return link.trgNodeId === trgNode.id && linkTrgPortId === trgPortId;
			}
			return false;
		});
	}

	// Returns the default input port ID for the node, which will be the ID of
	// the first port, or null if there are no inputs.
	static getDefaultInputPortId(node) {
		return (node.inputs && node.inputs.length > 0 ? node.inputs[0].id : null);
	}

	// Returns the default output port ID for the node, which will be the ID of
	// the first port, or null if there are no outputs.
	static getDefaultOutputPortId(node) {
		return (node.outputs && node.outputs.length > 0 ? node.outputs[0].id : null);
	}

	// Returns a full style string value that can be applied as an in-line style to
	// the representation of the object in the DOM. The style is based either
	// on the 'style' or 'style_temp' property of the object.
	// Parameters:
	// d - The object
	// part - A string of the part of the object to be styled. eg 'body' or 'image'
	//        This is dependent on the style spec in eiether the 'style' or
	//        'temp_style' property.
	// type = Either 'hover' or 'default'
	static getObjectStyle(d, part, type) {
		if (!d.style && !d.style_temp) {
			return null;
		}
		let style = null;

		if (type === "hover") {
			style = this.getStyleValue(d, part, "default") + ";" + this.getStyleValue(d, part, "hover");

		} else if (type === "default") {
			style = this.getStyleValue(d, part, "default");
		}
		return style;
	}

	static getStyleValue(d, part, type) {
		const style = get(d, `style_temp.${part}.${type}`, null);
		if (style !== null) {
			return style;
		}
		return get(d, `style.${part}.${type}`, null);
	}

	// Returns a subset array of supernodes from the nodes passed in.
	static filterSupernodes(inNodes) {
		return inNodes.filter((n) => n.type === SUPER_NODE);
	}

	// Returns a source position object, with x_pos and y_pos fields, that
	// decribes where a link line would be drawn from if the link's source node
	// did not exist. This is useful when doing operations (such as delete or
	// cut/copy) that cause semi-detached or fully detached links to be created.
	static getSrcPos(link, apiPipeline) {
		let trgCenterX;
		let trgCenterY;
		if (link.trgNodeId) {
			const trgNode = apiPipeline.getNode(link.trgNodeId);
			trgCenterX = trgNode.x_pos + (trgNode.width / 2);
			trgCenterY = trgNode.y_pos + (trgNode.height / 2);
		} else {
			trgCenterX = link.trgPos.x_pos;
			trgCenterY = link.trgPos.y_pos;
		}

		const srcNode = apiPipeline.getNode(link.srcNodeId);
		let srcCenterX;
		let srcCenterY;

		if (srcNode.layout && srcNode.layout.drawNodeLinkLineFromTo === "image_center") {
			srcCenterX = srcNode.x_pos + srcNode.layout.imagePosX + (srcNode.layout.imageWidth / 2);
			srcCenterY = srcNode.y_pos + srcNode.layout.imagePosY + (srcNode.layout.imageHeight / 2);

		} else {
			srcCenterX = srcNode.x_pos + (srcNode.width / 2);
			srcCenterY = srcNode.y_pos + (srcNode.height / 2);
		}

		const startPos = this.getOuterCoord(
			srcNode.x_pos, srcNode.y_pos, srcNode.width, srcNode.height, 0,
			srcCenterX, srcCenterY, trgCenterX, trgCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}

	// Returns a target position object, with x_pos and y_pos fields, that
	// decribes where a link line would be drawn from if the link's target node
	// did not exist. This is useful when doing operations (such as delete or
	// cut/copy) that cause semi-detached or fully detached links to be created.
	static getTrgPos(link, apiPipeline) {
		let srcCenterX;
		let srcCenterY;
		if (link.srcNodeId) {
			const srcNode = apiPipeline.getNode(link.srcNodeId);
			srcCenterX = srcNode.x_pos + (srcNode.width / 2);
			srcCenterY = srcNode.y_pos + (srcNode.height / 2);
		} else {
			srcCenterX = link.srcPos.x_pos;
			srcCenterY = link.srcPos.y_pos;
		}

		const trgNode = apiPipeline.getNode(link.trgNodeId);
		let trgCenterX;
		let trgCenterY;

		if (trgNode.layout && trgNode.layout.drawNodeLinkLineFromTo === "image_center") {
			trgCenterX = trgNode.x_pos + trgNode.layout.imagePosX + (trgNode.layout.imageWidth / 2);
			trgCenterY = trgNode.y_pos + trgNode.layout.imagePosY + (trgNode.layout.imageHeight / 2);

		} else {
			trgCenterX = trgNode.x_pos + (trgNode.width / 2);
			trgCenterY = trgNode.y_pos + (trgNode.height / 2);
		}

		const startPos = this.getOuterCoord(
			trgNode.x_pos, trgNode.y_pos, trgNode.width, trgNode.height, 0,
			trgCenterX, trgCenterY, srcCenterX, srcCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}

	// Returns a concatenation of the two input arrays making sure there are no
	// duplicates (based on ID) in the returned array.
	static concatUniqueBasedOnId(newLinks, currentLinks) {
		const outLinks = currentLinks;
		newLinks.forEach((nl) => {
			if (!currentLinks.some((cl) => cl.id === nl.id)) {
				outLinks.push(nl);
			}
		});
		return outLinks;
	}

	// Returns the color class in the className parameter, if one is found,
	// otherwise returns null.
	static getBkgColorClass(className) {
		if (className === "bkg-col-white-0" ||
				className === "bkg-col-yellow-20" ||
				className === "bkg-col-gray-20" ||
				className === "bkg-col-green-20" ||
				className === "bkg-col-teal-20" ||
				className === "bkg-col-cyan-20" ||
				className === "bkg-col-red-50" ||
				className === "bkg-col-orange-40" ||
				className === "bkg-col-gray-50" ||
				className === "bkg-col-green-50" ||
				className === "bkg-col-teal-50" ||
				className === "bkg-col-cyan-50") {
			return className;
		}
		return null;
	}

	// Returns true if the hex passed in is for a dark color where 'dark'
	// is defined as a color that would require white text to be used
	// if the hex color was a background color.
	static isDarkColor(hex) {
		const c = hex.substring(1); // strip #
		const rgb = parseInt(c, 16); // convert rrggbb to decimal

		const r = (rgb >> 16) & 0xff; // extract red
		const g = (rgb >> 8) & 0xff; // extract green
		const b = (rgb >> 0) & 0xff; // extract blue

		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
		return (luma < 108);
	}

	// Applies the outlineStyle format to the D3 comment selection passed in,
	// if one exists, in the formats array passed in.
	static applyOutlineStyle(commentSel, formats) {
		if (formats?.length > 0) {
			formats.forEach((f) => {
				if (f.type === "outlineStyle") { // Only apply outline style to outer <div>
					const { field, value } = CanvasUtils.convertFormat(f);
					commentSel.style(field, value);
				}
			});
		}
	}

	// Applies all formats from the formats array, that are not outlineStyle, to the
	// D3 comment selection passed in.
	static applyNonOutlineStyle(commentSel, formats) {
		if (formats?.length > 0) {
			formats.forEach((f) => {
				if (f.type !== "outlineStyle") { // Only apply outline style to outer <div>
					const { field, value } = CanvasUtils.convertFormat(f);
					commentSel.style(field, value);
				}
			});
		}
	}

	// Returns an object contaiing the start and end positions
	// of any current selection in the domNode passed in. The
	// DOM node is expected to contain text which is stored in a
	// set of child nodes that are text objects.
	static getSelectionPositions(domNode) {
		const sel = window.getSelection();
		let anchorPos;
		let focusPos;
		let runningLen = 0;
		domNode.childNodes.forEach((cn) => {
			if (cn.nodeValue) {
				const textLen = cn.nodeValue.length;
				if (cn === sel.anchorNode) {
					anchorPos = runningLen + sel.anchorOffset;
				}
				if (cn === sel.focusNode) {
					focusPos = runningLen + sel.focusOffset;
				}
				runningLen += textLen;
			}
		});
		return { start: Math.min(anchorPos, focusPos), end: Math.max(anchorPos, focusPos) };
	}

	// Selects the entire contents of the DOM node passed in.
	static selectNodeContents(domNode) {
		var range = document.createRange();
		range.selectNodeContents(domNode);

		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}

	// Selects the range of characters in the text DOM node passed in
	// between the start and end positions passed in. The DOM node is
	// expected to contain text which is stored in a set of child nodes
	// that are text objects. selection is an optional object containing
	// the current selection which is provided by the Cypress test cases.
	static selectNodeRange(domNode, start, end, selection) {
		const range = document.createRange();

		let startTextNode;
		let endTextNode;
		let startTextPos;
		let endTextPos;
		let runningLen = 0;
		domNode.childNodes.forEach((cn) => {
			const textLen = cn.nodeValue.length;
			runningLen += textLen;
			if (start <= runningLen && !startTextNode) {
				startTextNode = cn;
				startTextPos = textLen - (runningLen - start);
			}
			if (end <= runningLen && !endTextNode) {
				endTextNode = cn;
				endTextPos = textLen - (runningLen - end);
			}
		});

		range.setStart(startTextNode, startTextPos);
		range.setEnd(endTextNode, endTextPos);

		const sel = selection ? selection : window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}

	// Returns an object containing a CSS field and value that
	// can be applied to a <div> contining text based on the
	// format type and action passed in.
	static convertFormat(format) {
		switch (format.type) {
		case "bold":
			return { field: "font-weight", value: "600" };

		case "italics":
			return { field: "font-style", value: "italic" };

		case "fontType": {
			const fontFamily = this.getFontFamily(format.value);
			return { field: "font-family", value: fontFamily };
		}

		case "textDecoration": {
			switch (format.value) {
			default:
			case "strikethrough":
				return { field: "text-decoration", value: "line-through" };
			case "underline":
				return { field: "text-decoration", value: "underline" };
			case "strikethrough underline":
			case "underline strikethrough":
				return { field: "text-decoration", value: "underline line-through" };
			}
		}

		case "textColor": {
			return { field: "color", value: format.value };
		}

		case "backgroundColor": {
			return { field: "background-color", value: format.value };
		}

		case "textSize": {
			const size = format.value.substring(10);
			return { field: "font-size", value: `${size}px` };
		}

		case "outlineStyle": {
			switch (format.value) {
			default:
			case "outline-solid":
				return { field: "border-width", value: "1px" };
			case "outline-none":
				return { field: "border-width", value: "0" };
			}
		}

		case "alignHorizontally": {
			switch (format.value) {
			default:
			case "align-left":
				return { field: "text-align", value: "left" };
			case "align-center":
				return { field: "text-align", value: "center" };
			case "align-right":
				return { field: "text-align", value: "right" };
			}
		}

		case "alignVertically": {
			switch (format.value) {
			default:
			case "align-top":
				return { field: "vertical-align", value: "top" };
			case "align-middle":
				return { field: "vertical-align", value: "middle" };
			case "align-bottom":
				return { field: "vertical-align", value: "bottom" };
			}
		}

		default:
			return { field: format.type, value: format.value };
		}
	}

	// Returns a font family for the font action passed in.
	static getFontFamily(action) {
		switch (action) {
		default:
		case ("font-ibm-plex-sans"): return "\"IBM Plex Sans\", sans-serif";
		case ("font-ibm-plex-serif"): return "\"IBM Plex Serif\", serif";
		case ("font-ibm-plex-sans-condensed"): return "IBM Plex Sans Condensed";
		case ("font-ibm-plex-mono"): return "\"IBM Plex Mono\", monospace";
		case ("font-arial"): return "\"Arial\", sans-serif";
		case ("font-comic-sans-ms"): return "\"Comic Sans MS\", sans-serif";
		case ("font-gill-sans"): return "\"Gill Sans\", sans-serif";
		case ("font-helvetica-neue"): return "\"Helvetica Neue\", sans-serif";
		case ("font-times-new-roman"): return "\"Times New Roman\", serif";
		case ("font-verdana"): return "\"Verdana\", sans-serif";
		}
	}

	// Returns the element passed in, or an ancestor of the element, if either
	// contains the classNames passed in. Otherwise it returns null if the
	// className cannot be found. For example, if this element is a child of the
	// node group object and "d3-node-group" is passed in, this function will
	// find the group element.
	static getParentElementWithClass(element, className) {
		let el = element;
		let foundElement = null;

		while (el) {
			// No need to proceed if we find either of these. Stopping at svg-area
			// prevents the search transitioning from a sub-flow to a parent flow.
			if (this.isClassNameIncluded(el, "d3-new-connection-guide") ||
					this.isClassNameIncluded(el, "svg-area")) {
				el = null;

			} else if (this.isClassNameIncluded(el, className)) {
				foundElement = el;
				el = null;
			} else {
				el = el.parentNode;
			}
		}
		return foundElement;
	}

	// Returns true if the class name passed in is one of the classes assigned
	// to the element passed in.
	static isClassNameIncluded(el, className) {
		return el.classList && el.classList.contains(className);
	}

	// Returns the ID of the pipeline referenced by the supernode
	// passed in.
	static getSupernodePipelineId(supernode) {
		if (supernode.type === SUPER_NODE &&
				has(supernode, "subflow_ref.pipeline_id_ref")) {
			return supernode.subflow_ref.pipeline_id_ref;
		}
		return null;
	}

	// Convert now deprecated layout fields to the port positions arrays. The layout fields are
	// expected to provided in pairs. For example: inputPortTopPosX and inputPortTopPosY. However,
	// if they are not and only one of the pair is provided the functions in svg-canvas-utils.nodes.js
	// that calculate a x, y coordinate for the port will default to 0 if a value provided is undefined.
	// TODO - Remove this in a future major release.
	static convertPortPosInfo(layout) {
		const newLayout = layout;

		if (!layout) {
			return newLayout;
		}

		// If custom fields exist for input ports, write the values into the
		// inputPortPositions array and delete the redundant fields.
		if (isNumber(newLayout.inputPortTopPosX) || isNumber(newLayout.inputPortTopPosY)) {
			newLayout.inputPortPositions = [
				{ x_pos: newLayout.inputPortTopPosX, y_pos: newLayout.inputPortTopPosY, pos: "topLeft" }
			];
			delete newLayout.inputPortTopPosX;
			delete newLayout.inputPortTopPosY;

		} else if (isNumber(newLayout.inputPortBottomPosX) || isNumber(newLayout.inputPortBottomPosY)) {
			newLayout.inputPortPositions = [
				{ x_pos: newLayout.inputPortBottomPosX, y_pos: newLayout.inputPortBottomPosY, pos: "bottomLeft" }
			];
			delete newLayout.inputPortBottomPosX;
			delete newLayout.inputPortBottomPosY;

		} else if (isNumber(newLayout.inputPortLeftPosX) || isNumber(newLayout.inputPortLeftPosY)) {
			newLayout.inputPortPositions = [
				{ x_pos: newLayout.inputPortLeftPosX, y_pos: newLayout.inputPortLeftPosY, pos: "topLeft" }
			];
			delete newLayout.inputPortLeftPosX;
			delete newLayout.inputPortLeftPosY;
		}

		// If custom fields exist for output ports, write the values into the
		// outputPortPositions array and delete the redundant fields.
		if (isNumber(newLayout.outputPortTopPosX) || isNumber(newLayout.outputPortTopPosY)) {
			newLayout.outputPortPositions = [
				{ x_pos: newLayout.outputPortTopPosX, y_pos: newLayout.outputPortTopPosY, pos: "topLeft" }
			];
			delete newLayout.outputPortTopPosX;
			delete newLayout.outputPortTopPosY;

		} else if (isNumber(newLayout.outputPortBottomPosX) || isNumber(newLayout.outputPortBottomPosY)) {
			newLayout.outputPortPositions = [
				{ x_pos: newLayout.outputPortBottomPosX, y_pos: newLayout.outputPortBottomPosY, pos: "bottomLeft" }
			];
			delete newLayout.outputPortBottomPosX;
			delete newLayout.outputPortBottomPosY;

		} else if (isNumber(newLayout.outputPortRightPosX) || isNumber(newLayout.outputPortRightPosY)) {
			const pos = newLayout.outputPortRightPosition || "topRight";
			newLayout.outputPortPositions = [
				{ x_pos: newLayout.outputPortRightPosX, y_pos: newLayout.outputPortRightPosY, pos: pos }
			];
			delete newLayout.outputPortRightPosX;
			delete newLayout.outputPortRightPosY;
		}
		return newLayout;
	}
}
