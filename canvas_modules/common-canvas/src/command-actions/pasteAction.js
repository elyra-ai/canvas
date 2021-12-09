/*
 * Copyright 2017-2021 Elyra Authors
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
import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";

export default class PasteAction extends Action {
	constructor(data, objectModel, labelUtil, viewportDimensions, areDetachableLinksInUse, isSnapToGridInUse) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.viewportDimensions = viewportDimensions;
		this.areDetachableLinksInUse = areDetachableLinksInUse;
		this.isSnapToGridInUse = isSnapToGridInUse;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		// Make sure objects to be pasted are in an appropriate position for them
		// to appear within the viewport.
		this.adjustObjectsPositions();

		// Clone the objects being pasted because we don't want any objects
		// with IDs the same as those already on the canvas.
		this.clones = this.objectModel.cloneObjectsToPaste(
			data.objects.nodes, data.objects.comments, data.objects.links);
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
	// which the canvas objects  were copied.
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
		const addedObjectIds = [];

		this.clones.clonedNodes.forEach((cn) => {
			this.apiPipeline.addNode(cn);
			addedObjectIds.push(cn.id);
		});

		this.clones.clonedComments.forEach((cc) => {
			this.apiPipeline.addComment(cc);
			addedObjectIds.push(cc.id);
		});


		this.apiPipeline.addLinks(this.clones.clonedLinks);
		if (this.areDetachableLinksInUse) {
			this.clones.clonedLinks.forEach((cl) => addedObjectIds.push(cl.id));
		}

		this.objectModel.setSelections(addedObjectIds, this.apiPipeline.pipelineId);
	}

	undo() {
		this.apiPipeline.deleteNodes(this.clones.clonedNodes);
		this.apiPipeline.deleteComments(this.clones.clonedComments);
		this.apiPipeline.deleteLinks(this.clones.clonedLinks);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.pasteObjects");
	}
}
