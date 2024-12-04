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
import { CANVAS_FOCUS } from "../common-canvas/constants/canvas-constants.js";

export default class DeleteLinkAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.link = this.apiPipeline.getLink(this.data.id);
	}

	// Standard methods
	do() {
		this.apiPipeline.deleteLink(this.link);
		this.focusObject = CANVAS_FOCUS;
	}

	undo() {
		this.apiPipeline.addLinks([this.link]);
		this.focusObject = this.link;
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.deleteLink");
	}

	getFocusObject() {
		return this.focusObject;
	}
}
