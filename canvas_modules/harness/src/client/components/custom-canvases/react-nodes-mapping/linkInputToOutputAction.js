/*
 * Copyright 2023 Elyra Authors
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
// import Action from "../command-stack/action.js";
import { v4 as uuid4 } from "uuid";
import { get } from "lodash";

export default class LinkInputToOutputAction {
	constructor(srcNodeId, srcFields, trgNodeId, canvasController) {
		// super(data);
		this.srcNodeId = srcNodeId;
		this.srcFields = srcFields;
		this.trgNodeId = trgNodeId;
		this.canvasController = canvasController;
		this.oldTrgNode = canvasController.getNode(trgNodeId);

		this.oldTrgInputs = [...this.oldTrgNode.inputs];
		this.oldLinks = [...this.canvasController.getLinks()];
		this.oldTrgAppData = this.oldTrgNode.app_data;
		this.oldTrgFields = get(this, "oldTrgNode.app_data.table_data.fields", []);

		this.newTrgFields = [...this.oldTrgFields];
		this.newTrgInputs = [...this.oldTrgInputs];
		const startingLinks = this.oldLinks.filter((l) => l.srcNodeId === srcNodeId && l.trgNodeId === trgNodeId);
		this.newLinks = [...startingLinks];

		srcFields.forEach((sf) => {
			let trgField = this.getMatchingTrgField(sf);
			if (!trgField) {
				const trgId = uuid4();
				trgField = { id: trgId, label: sf.label, type: sf.type };
				this.newTrgFields.push(trgField);
				this.newTrgInputs.push({ id: trgId });
			}

			// Create what would be the link to the new, or existing, target field
			const link = {
				id: uuid4(),
				srcNodeId: srcNodeId,
				srcNodePortId: sf.id,
				trgNodeId: trgNodeId,
				trgNodePortId: trgField.id,
				type: "nodeLink"
			};

			// If the link doesn't exist, add it to those to be added to the camvas.
			if (!this.linkExists(link)) {
				this.newLinks.push(link);
			}
		});

		this.newTrgAppData = {
			table_data: {
				fields: this.newTrgFields
			}
		};
	}

	getMatchingTrgField(sourceField) {
		return this.oldTrgFields.find((tf) => tf.label === sourceField.label);
	}

	linkExists(link) {
		const result = this.oldLinks.find((l) =>
			l.srcNodeId === link.srcNodeId &&
			l.srcNodePortId === link.srcNodePortId &&
			l.trgNodeId === link.trgNodeId &&
			l.trgNodePortId === link.trgNodePortId);
		return result;
	}

	// Returns true if there is something to execute. No need to check the
	// inputs array because it should be in-sync with the fields array.
	isDoable() {
		return this.newTrgFields.length > this.oldTrgFields.length || this.newLinks.length > this.oldLinks.length;
	}

	// Standard methods
	do() {
		this.canvasController.setNodeProperties(this.trgNodeId, { inputs: this.newTrgInputs, app_data: this.newTrgAppData });
		this.canvasController.addLinks(this.newLinks);
	}

	undo() {
		this.canvasController.setNodeProperties(this.trgNodeId, { inputs: this.oldTrgInputs, app_data: this.oldTrgAppData });
		this.canvasController.setLinks(this.oldLinks);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return "Create " + this.newLinks.length + " mappings";
	}
}
