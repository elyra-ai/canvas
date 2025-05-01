/*
 * Copyright 2025 Elyra Authors
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

import { Action } from "common-canvas"; // eslint-disable-line import/no-unresolved

export default class AddNodeAndLinkAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.canvasController = canvasController;
	}

	// Standard methods
	do() {
		this.newNode = this.canvasController.createNode({
			nodeTemplate: this.data.nodeTemplate,
			offsetX: this.data.x_pos,
			offsetY: this.data.y_pos
		});
		this.canvasController.addNode(this.newNode);

		this.linksToAdd = this.canvasController.createNodeLinks({
			type: "nodeLink",
			nodes: [{ id: this.data.srcNodeId, portId: this.data.srcPortId }],
			targetNodes: [{ id: this.newNode.id }]
		});

		this.canvasController.addLinks(this.linksToAdd);
		this.focusObject = this.newNode;
	}

	undo() {
		this.canvasController.deleteNode(this.newNode.id);
		this.focusObject = "CanvasFocus";
	}

	redo() {
		this.canvasController.addNode(this.newNode);
		this.canvasController.addLinks(this.linksToAdd);
		this.focusObject = this.newNode;
	}

	getLabel() {
		return "Add '" + this.newNode.label + "' node and link";
	}

	getFocusObject() {
		return this.focusObject;
	}
}
