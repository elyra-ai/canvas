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

/* eslint no-lonely-if: "off" */

import * as d3Drag from "d3-drag";
import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Drag, d3Selection);

import { cloneDeep } from "lodash";

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import { LINK_SELECTION_DETACHABLE, NORTH, SOUTH, EAST, WEST } from "./constants/canvas-constants.js";


// This utility files provides a drag handler which manages drag operations on
// the start and end points of detached links.  Also, it provides utility functions
// to handle those same operations performed by the keyboard user.

export default class SVGCanvasUtilsDragDetLink {
	constructor(renderer) {
		this.ren = renderer;

		this.logger = new Logger("SVGCanvasUtilsDragDetLink");

		// Object to store variables for dynamically drawing detached links.
		this.draggingLinkData = null;

		// Create a drag handler that can be used with draggable ends of
		// detached links.
		this.dragDetLinkHandler = d3.drag()
			.on("start", this.dragStartDetLinkHandle.bind(this))
			.on("drag", this.dragMoveDetLinkHandle.bind(this))
			.on("end", this.dragEndDetLinkHandle.bind(this));

	}

	// Returns the dragResizeObjectHandler
	getDragDetachedLinkHandler() {
		return this.dragDetLinkHandler;
	}

	// Returns true if a detached link (start or end) is currently being dragged.
	isDragging() {
		return this.draggingLinkData;
	}

	// Returns true if the link passed in is currently being dragged.
	isLinkBeingDragged(link) {
		return this.draggingLinkData && this.draggingLinkData.link.id === link.id;
	}

	// Begins the dragging of a link handle of a detachable link.
	dragStartDetLinkHandle(d3Event, d) {
		this.logger.logStartTimer("dragStartDetLinkHandle");
		this.startHandleMoving(d, d3Event.sourceEvent.currentTarget);
		this.logger.logEndTimer("dragStartDetLinkHandle", true);
	}

	// Display a link when its handle is being dragged.
	dragMoveDetLinkHandle(d3Event) {
		this.logger.logStartTimer("dragMoveDetLinkHandle");
		const transPos = this.ren.getTransformedMousePos(d3Event);
		this.moveHandle(transPos);
		this.logger.logEndTimer("dragMoveDetLinkHandle", true);
	}

	// Completes the dragging of a link handle.
	dragEndDetLinkHandle(d3Event) {
		this.logger.logStartTimer("dragEndLinkHandle");

		const pos = this.ren.getMousePosFromEvent(d3Event);

		this.completeDraggedDetLink(pos);
		this.logger.logEndTimer("dragEndLinkHandle", true);
	}

	// Starts the moving action for link handle.
	// Can be called when the mouse is dragging the handle OR when a
	// keyboard event moves the handle.
	startHandleMoving(d, currentTarget) {
		this.ren.closeContextMenuIfOpen();

		const handleSelection = d3.select(currentTarget);
		const link = this.ren.activePipeline.getLink(d.id);
		const oldLink = cloneDeep(link);

		const linkGrpSelector = this.ren.getLinkGroupSelectionById(d.id);

		this.draggingLinkData = {
			lineInfo: d,
			link: link,
			oldLink: oldLink,
			linkGrpSelection: d3.select(linkGrpSelector)
		};

		if (handleSelection.attr("class").includes("d3-link-handle-end")) {
			this.draggingLinkData.endBeingDragged = "end";

		} else if (handleSelection.attr("class").includes("d3-link-handle-start")) {
			this.draggingLinkData.endBeingDragged = "start";
		}

		if (this.ren.config.enableHighlightUnavailableNodes) {
			if (this.draggingLinkData.endBeingDragged === "end") {
				const links = this.ren.activePipeline.links.filter((lnk) => lnk.id !== link.id);
				this.ren.setUnavailableTargetNodesHighlighting(
					this.ren.activePipeline.getNode(this.draggingLinkData.link.srcNodeId),
					this.draggingLinkData.link.srcNodePortId,
					links
				);
			} else if (this.draggingLinkData.endBeingDragged === "start") {
				const links = this.ren.activePipeline.links.filter((lnk) => lnk.id !== link.id);
				this.ren.setUnavailableSourceNodesHighlighting(
					this.ren.activePipeline.getNode(this.draggingLinkData.oldLink.trgNodeId),
					this.draggingLinkData.link.trgNodePortId,
					links
				);
			}
		}
	}

	// Moves the currently focused handle of the link in the the
	// direction specified. This is called when the user moves a
	// link handle using the keyboard.
	moveLinkHandle(link, dir, d3Event) {
		let xInc = 0;
		let yInc = 0;

		({ xInc, yInc } = this.getMoveIncrements(dir));

		if (this.endMove) {
			clearTimeout(this.endMove);
			this.endMove = null;
		}

		if (!this.isDragging()) {
			this.startHandleMoving(link, d3Event.currentTarget);
		}

		let x = this.draggingLinkData.endBeingDragged === "start" ? this.draggingLinkData.link.x1 : this.draggingLinkData.link.x2;
		let y = this.draggingLinkData.endBeingDragged === "start" ? this.draggingLinkData.link.y1 : this.draggingLinkData.link.y2;

		x += xInc;
		y += yInc;

		const pos = { x, y };

		this.moveHandle(pos);

		// When the handle is moved, redisplaying the link removes
		// focus from the handle. So we resore it.
		this.ren.restoreFocusToSubObject();

		this.endMove = setTimeout(() => {
			const pos2 = this.ren.convertCanvasCoordsToPageCoords(pos.x, pos.y);

			this.completeDraggedDetLink(pos2);
		}, 500);
	}

	moveHandle(pos) {
		const link = this.draggingLinkData.link;

		if (this.draggingLinkData.endBeingDragged === "start") {
			link.srcPos = { x_pos: pos.x, y_pos: pos.y };
			delete link.srcNodeId;
			delete link.srcNodePortId;
			delete link.srcObj;

		} else {
			link.trgPos = { x_pos: pos.x, y_pos: pos.y };
			delete link.trgNodeId;
			delete link.trgNodePortId;
			delete link.trgNode;
		}

		this.ren.displayMovedLinks();

		// Switch on an attribute to indicate the link is being dragged
		// towards and over a target node.
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.setDetachedLinkOverNode(pos);
		}
	}

	completeDraggedDetLink(pos) {
		const newLink = this.getNewLinkOnDrag(pos);

		// Save a local reference to this.draggingLinkData so we can set it to null before
		// calling the canvas-controller. This means the this.draggingLinkData object will
		// be null when the canvas is refreshed.
		const draggingLinkData = this.draggingLinkData;
		this.draggingLinkData = null;

		if (newLink) {
			const editSubType = this.getLinkEditSubType(draggingLinkData.oldLink, newLink);
			// If editSubType is set the user did a gesture that requires a change
			// to the object model.
			if (editSubType) {
				const success = this.ren.canvasController.editActionHandler({
					editType: "updateLink",
					editSubType: editSubType,
					editSource: "canvas",
					newLink: newLink,
					pipelineId: this.ren.activePipeline.id });

				// The call to editActionHandler might "fail" if the host app
				// uses beforeEditActionHandler to cancel the edit action. In
				// this case, we snap the link back to its old position.
				if (!success) {
					this.snapBackOldLink(draggingLinkData.oldLink);
				}
			// If editSubType is null, the user performed a gesture which should
			// not be executed as an action so draw the link back in its old position.
			} else {
				this.snapBackOldLink(draggingLinkData.oldLink);
			}
		// newLink might be null when we are dragging a link handle with
		// enableLinkSelection not set to detachable. If that's the case the
		// link needs to snap back (redrawn) to its original position.
		} else {
			this.snapBackOldLink(draggingLinkData.oldLink);
		}

		// Switch 'new link over node' highlighting off
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.ren.setLinkOverNodeCancel();
		}

		this.ren.unsetUnavailableNodesHighlighting();
	}

	// Returns the edit sub-type for the link action being performed to further
	// explain the updateLink action.
	getLinkEditSubType(oldLink, newLink) {
		if (oldLink.srcNodeId && !newLink.srcNodeId) {
			return "detachFromSrcNode";

		} else if (oldLink.trgNodeId && !newLink.trgNodeId) {
			return "detachFromTrgNode";

		} else if (!oldLink.srcNodeId && newLink.srcNodeId) {
			return "attachToSrcNode";

		} else if (!oldLink.trgNodeId && newLink.trgNodeId) {
			return "attachToTrgNode";

		} else if (!oldLink.srcNodeId && !newLink.srcNodeId &&
					(oldLink.srcPos.x_pos !== newLink.srcPos.x_pos ||
						oldLink.srcPos.y_pos !== newLink.srcPos.y_pos)) {
			return "moveSrcPosition";

		} else if (!oldLink.trgNodeId && !newLink.trgNodeId &&
					(oldLink.trgPos.x_pos !== newLink.trgPos.x_pos ||
						oldLink.trgPos.y_pos !== newLink.trgPos.y_pos)) {
			return "moveTrgPosition";

		} else if (oldLink.srcNodeId && newLink.srcNodeId &&
					oldLink.srcNodeId !== newLink.srcNodeId) {
			return "switchSrcNode";

		} else if (oldLink.trgNodeId && newLink.trgNodeId &&
							oldLink.trgNodeId !== newLink.trgNodeId) {
			return "switchTrgNode";

		} else if (oldLink.srcNodeId && newLink.srcNodeId &&
					oldLink.srcNodeId === newLink.srcNodeId &&
					oldLink.srcNodePortId !== newLink.srcNodePortId) {
			return "switchSrcNodePort";

		} else if (oldLink.trgNodeId && newLink.trgNodeId &&
					oldLink.trgNodeId === newLink.trgNodeId &&
					oldLink.trgNodePortId !== newLink.trgNodePortId) {
			return "switchTrgNodePort";
		}
		// We arrive here, in two ways:
		// 1. if the user dragged a link handle from a node/port and dropped it
		//    back on the same node/port.
		// 2. If the user clicked on the unattached end of a detached link but did
		//    not move it anywhere
		// In these cases, the updateLink action should NOT be performed and
		// consequently NO command should be added to the command stack.
		return null;
	}

	// Resets and redraws the link being dragged back to its original position.
	// This is necessary when the user performs a link drag gesture which should
	// NOT be executed as an action -- therefore the link need to be drawn back
	// in its original position.
	snapBackOldLink(oldLink) {
		this.ren.activePipeline.replaceLink(oldLink);
		this.ren.displayLinks();
	}

	// Switches on or off node port highlighting depending on the node
	// passed in and keeps track of the currently highlighted node. This is
	// called as a new link is being drawn towards a target node to highlight
	// the target node.
	setDetachedLinkOverNode(pos) {
		const nodeNearMouse = this.ren.getNodeNearPos(pos, this.ren.canvasLayout.nodeProximity);
		const highlight = nodeNearMouse && this.isDetLinkConnectionAllowedToNearbyNode(pos);
		this.ren.setHighlightingOverNode(highlight, nodeNearMouse);
	}

	// Returns true if a detached link being dragged can be attached to a node.
	isDetLinkConnectionAllowedToNearbyNode(pos) {
		if (this.draggingLinkData) {
			const newLink = this.getNewLinkOnDrag(pos, this.ren.canvasLayout.nodeProximity);
			if (newLink) {
				return true;
			}
		}
		return false;
	}

	// Returns a new link if one can be created given the current data in the
	// this.draggingLinkData object. Returns null if a link cannot be created.
	// The position (pos) passed in should be specified in page coordinates.
	getNewLinkOnDrag(pos, nodeProximity) {
		const oldLink = this.draggingLinkData.oldLink;
		const newLink = cloneDeep(oldLink);

		if (this.draggingLinkData.endBeingDragged === "start") {
			delete newLink.srcObj;
			delete newLink.srcNodeId;
			delete newLink.srcNodePortId;
			delete newLink.srcPos;

			const srcNode = nodeProximity
				? this.ren.getNodeNearPos(pos, nodeProximity)
				: this.ren.getNodeAtPos(pos);

			if (srcNode) {
				newLink.srcNodeId = srcNode.id;
				newLink.srcObj = this.ren.activePipeline.getNode(srcNode.id);
				newLink.srcNodePortId = this.ren.getOutputNodePortId(pos, srcNode);
			}	else {
				newLink.srcPos = this.draggingLinkData.link.srcPos;
			}

		} else {
			delete newLink.trgNode;
			delete newLink.trgNodeId;
			delete newLink.trgNodePortId;
			delete newLink.trgPos;

			const trgNode = nodeProximity
				? this.ren.getNodeNearPos(pos, nodeProximity)
				: this.ren.getNodeAtPos(pos);

			if (trgNode) {
				newLink.trgNodeId = trgNode.id;
				newLink.trgNode = this.ren.activePipeline.getNode(trgNode.id);
				newLink.trgNodePortId = this.ren.getInputNodePortId(pos, trgNode);
			}	else {
				newLink.trgPos = this.draggingLinkData.link.trgPos;
			}
		}

		// If links are not detachable, we cannot create a link if srcPos
		// or trgPos are set because that would create a detached link unconnected
		// to either a source node or a target node or both.
		if (this.ren.config.enableLinkSelection !== LINK_SELECTION_DETACHABLE &&
				(newLink.srcPos || newLink.trgPos)) {
			return null;
		}

		if (this.canUpdateLink(newLink, oldLink)) {
			return newLink;
		}
		return null;
	}

	getMoveIncrements(dir) {
		let xInc = 0;
		let yInc = 0;

		switch (dir) {
		case NORTH:
			xInc = 0;
			yInc = -10;
			break;
		case SOUTH:
			xInc = 0;
			yInc = 10;
			break;
		case EAST:
			xInc = 10;
			yInc = 0;
			break;
		default:
		case WEST:
			xInc = -10;
			yInc = 0;
			break;
		}
		return { xInc, yInc };
	}

	// Returns true if the old link passed in can be updated with the attributes
	// of the new link.
	canUpdateLink(newLink, oldLink) {
		const srcNode = this.ren.activePipeline.getNode(newLink.srcNodeId);
		const trgNode = this.ren.activePipeline.getNode(newLink.trgNodeId);
		const linkSrcChanged = this.hasLinkSrcChanged(newLink, oldLink);
		const linkTrgChanged = this.hasLinkTrgChanged(newLink, oldLink);
		const links = this.ren.activePipeline.links;
		let allowed = true;

		if (linkSrcChanged && srcNode &&
				!CanvasUtils.isSrcConnectionAllowedWithDetachedLinks(newLink.srcNodePortId, srcNode, links)) {
			allowed = false;
		}
		if (linkTrgChanged && trgNode &&
				!CanvasUtils.isTrgConnectionAllowedWithDetachedLinks(newLink.trgNodePortId, trgNode, links)) {
			allowed = false;
		}
		if (srcNode && trgNode &&
				!CanvasUtils.isConnectionAllowedWithDetachedLinks(newLink.srcNodePortId, newLink.trgNodePortId,
					srcNode, trgNode, links, this.ren.config.enableSelfRefLinks)) {
			allowed = false;
		}
		return allowed;
	}

	// Returns true if the source information has changed between
	// the two links.
	hasLinkSrcChanged(newLink, oldLink) {
		let linkUpdated = false;

		if (newLink.srcNodeId) {
			if (newLink.srcNodeId !== oldLink.srcNodeId) {
				linkUpdated = true;
			}

			if (newLink.srcNodePortId !== oldLink.srcNodePortId) {
				linkUpdated = true;
			}

		}	else {
			if (oldLink.srcPos) {
				if (newLink.srcPos.x_pos !== oldLink.srcPos.x_pos ||
						newLink.srcPos.y_pos !== oldLink.srcPos.y_pos) {
					linkUpdated = true;
				}
			} else {
				linkUpdated = true;
			}
		}
		return linkUpdated;
	}

	// Returns true if the target information has changed between
	// the two links.
	hasLinkTrgChanged(newLink, oldLink) {
		let linkUpdated = false;

		if (newLink.trgNodeId) {
			if (newLink.trgNodeId !== oldLink.trgNodeId) {
				linkUpdated = true;
			}

			if (newLink.trgNodePortId !== oldLink.trgNodePortId) {
				linkUpdated = true;
			}

		}	else {
			if (oldLink.trgPos) {
				if (newLink.trgPos.x_pos !== oldLink.trgPos.x_pos ||
						newLink.trgPos.y_pos !== oldLink.trgPos.y_pos) {
					linkUpdated = true;
				}
			} else {
				linkUpdated = true;
			}
		}
		return linkUpdated;
	}

}
