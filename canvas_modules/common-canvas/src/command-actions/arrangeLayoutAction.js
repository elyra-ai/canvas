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
import Action from "../command-stack/action.js";

export default class ArrangeLayoutAction extends Action {
	constructor(data, canvasController) {
		super();
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.layoutDirection = data.layoutDirection; // "horizontal" or "vertical"
		this.apiPipeline = this.objectModel.getAPIPipeline();

		// Copy the nodes to remember their original positions.
		this.existingNodes = this.apiPipeline.getNodes().map((n) => ({ ...n }));
		// Copy the links to remember their original positions.
		// This will also allow detached/semi-detached links to restore their positions.
		this.existingLinks = this.apiPipeline.getLinks().map((n) => ({ ...n }));
	}

	// Standard methods
	do() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}

	undo() {
		this.apiPipeline.replaceNodes(this.existingNodes);

		// Update links and detached/semi-detached links to restore its position.
		this.apiPipeline.updateLinks(this.existingLinks);
	}

	redo() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.arrangeLayout");
	}
}
