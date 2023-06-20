/*
 * Copyright 2017-2023 Elyra Authors
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
	constructor(data, objectModel, labelUtil, layoutDirection) {
		super(layoutDirection);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.layoutDirection = layoutDirection;
		this.apiPipeline = this.objectModel.getAPIPipeline();
		// Copy the nodes to remember their original positions.
		this.existingNodes = this.apiPipeline.getNodes().map((n) => Object.assign({}, n));
	}

	// Standard methods
	do() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}

	undo() {
		this.apiPipeline.replaceNodes(this.existingNodes);
	}

	redo() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.arrangeLayout");
	}
}
