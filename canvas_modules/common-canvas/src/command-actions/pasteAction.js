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

/***************************************************************************/
/* WARNING:                                                                */
/* This class is exported from Common Canvas. This means host apps can     */
/* extend the class and add to, or alter, this class's member variables.   */
/* So, if the names of any internal this.xxxx variables are changed that   */
/* needs to be communicated clearly through the release notes, Slack, etc. */
/***************************************************************************/

import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import { CANVAS_FOCUS } from "../common-canvas/constants/canvas-constants.js";

export default class PasteAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.viewportDimensions = canvasController.getViewPortDimensions();
		this.areDetachableLinksInUse = canvasController.areDetachableLinksInUse();
		this.isSnapToGridInUse = canvasController.isSnapToGridInUse();
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldFocusObject = canvasController.getFocusObject();

		// Make sure objects to be pasted are in an appropriate position for them
		// to appear within the viewport.
		this.adjustObjectsPositions();

		// Clone the objects being pasted because we don't want any objects
		// with IDs the same as those already on the canvas.
		this.clones = this.objectModel.cloneObjectsToPaste(
			data.objects.nodes, data.objects.comments, data.objects.links);

		const { nodes, pipelines } = this.objectModel.extractAddDataPipelines(this.clones.clonedNodes);
		this.clones.clonedNodes = nodes;
		this.pipelines = pipelines;

		// Get the IDs of the objects to be selected after they are pasted. We
		// automatically select pasted objects so they are easy to move by the user.
		this.selectionIds = this.getSelectionIds(this.clones);
	}

	// Adjusts the positions of the cloned objects appropriately. If the data
	// object contains a mousePos property it will be the position on the canvas
	// where the paste was requested, using a context menu, and we will paste the
	// objects at that position. If no mousePos is specified then the user will
	// have pasted using the toolbar button or keyboard. In this case, we paste
	// the objects in their original coordinate positions or, if that position is
	// not visible in the viewport, we paste them in the center of the viewport.
	adjustObjectsPositions() {
		const objects = this.data.objects;
		const pastedObjDimensions = CanvasUtils.getCanvasDimensions(objects.nodes, objects.comments, objects.links, 0, 0);
		if (pastedObjDimensions) {
			if (this.data.mousePos && this.data.mousePos.x && this.data.mousePos.y) {
				const xDelta = this.data.mousePos.x - pastedObjDimensions.left;
				const yDelta = this.data.mousePos.y - pastedObjDimensions.top;
				this.moveObjectsPositions(objects, xDelta, yDelta);

			} else {
				const transRect = this.viewportDimensions;
				if (transRect.x < pastedObjDimensions.left &&
						transRect.y < pastedObjDimensions.top &&
						transRect.x + transRect.width > pastedObjDimensions.left &&
						transRect.y + transRect.height > pastedObjDimensions.top) {
					this.ensureNoOverlap(objects);

				} else {
					const xDelta = transRect.x + (transRect.width / 2) - (pastedObjDimensions.width / 2) - pastedObjDimensions.left;
					const yDelta = transRect.y + (transRect.height / 2) - (pastedObjDimensions.height / 2) - pastedObjDimensions.top;
					this.moveObjectsPositions(objects, xDelta, yDelta);
					this.ensureNoOverlap(objects);
				}
			}
		}
	}

	// Offsets the positions of the canvas objects (nodes, comments and links)
	// if they exactly overlap any existing nodes, comments and links.
	// Exact overlap can happen when pasting over the top of the canvas from
	// which the canvas objects were copied.
	ensureNoOverlap(objects) {
		let xInc = 10;
		let yInc = 10;
		if (this.isSnapToGridInUse) {
			const canvasLayout = this.objectModel.getCanvasLayout();
			xInc = canvasLayout.snapToGridXPx;
			yInc = canvasLayout.snapToGridYPx;
		}
		while (this.apiPipeline.exactlyOverlaps(objects.nodes, objects.comments, objects.links)) {
			this.moveObjectsPositions(objects, xInc, yInc);
		}
	}

	// Moves the coordinate positions of the canvas objects specified by the
	// x and y amounts specified.
	moveObjectsPositions(objects, xDelta, yDelta) {
		if (objects.nodes) {
			objects.nodes.forEach((node) => {
				node.x_pos += xDelta;
				node.y_pos += yDelta;
			});
		}
		if (objects.comments) {
			objects.comments.forEach((comment) => {
				comment.x_pos += xDelta;
				comment.y_pos += yDelta;
				comment.selectedObjectIds = [];
			});
		}
		// Only semi-detached or fully-detached links (which will have srcPos or
		// trgPos properties) need to be moved. Other links will be moved due to
		// their relationship with their source and target node/comment.
		if (objects.links) {
			objects.links.forEach((link) => {
				if (link.srcPos) {
					link.srcPos.x_pos += xDelta;
					link.srcPos.y_pos += yDelta;
				}
				if (link.trgPos) {
					link.trgPos.x_pos += xDelta;
					link.trgPos.y_pos += yDelta;
				}
			});
		}
	}

	// Return the IDs of the cloned objects to be selected after the
	// paste is complete.
	getSelectionIds(clones) {
		const selectionIds = [];

		clones.clonedNodes.forEach((cn) => {
			selectionIds.push(cn.id);
		});

		clones.clonedComments.forEach((cc) => {
			selectionIds.push(cc.id);
		});

		if (this.areDetachableLinksInUse) {
			clones.clonedLinks.forEach((cl) => selectionIds.push(cl.id));
		}
		return selectionIds;
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.clonedNodes = this.clones.clonedNodes;
		this.data.clonedComments = this.clones.clonedComments;
		this.data.clonedLinks = this.clones.clonedLinks;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.addPastedObjects({
			nodesToAdd: this.clones.clonedNodes,
			commentsToAdd: this.clones.clonedComments,
			linksToAdd: this.clones.clonedLinks,
			pipelinesToAdd: this.pipelines,
			selections: this.selectionIds
		});
		this.focusObject = this.getDoFocusObject();
	}

	getDoFocusObject() {
		if (this.clones?.clonedNodes?.length > 0) {
			return this.clones.clonedNodes[0];
		}
		if (this.clones?.clonedComments?.length > 0) {
			return this.clones.clonedComments[0];
		}
		if (this.clones?.clonedLinks?.length > 0) {
			return this.clones.clonedLinks[0];
		}
		return null;
	}

	undo() {
		// External pipelines may have been loaded in the do() function so we
		// retrieve a full set of pipelines to delete from the object model.
		const supernodes = CanvasUtils.filterSupernodes(this.clones.clonedNodes);
		const pipelines = this.objectModel.getDescPipelinesToDelete(supernodes, this.data.pipelineId);

		// We can also retrieve any external pipeline flows that might have been
		// loaded while executing the do() method.
		const oldExtPipelineFlows =
			this.objectModel.getExternalPipelineFlowsForPipelines(pipelines);

		this.apiPipeline.deletePastedObjects({
			nodesToDelete: this.clones.clonedNodes,
			commentsToDelete: this.clones.clonedComments,
			linksToDelete: this.clones.clonedLinks,
			pipelinesToDelete: pipelines,
			extPipelineFlowsToDelete: oldExtPipelineFlows
		});
		this.focusObject = this.oldFocusObject || CANVAS_FOCUS;
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.pasteObjects");
	}

	getFocusObject() {
		return this.focusObject;
	}
}
