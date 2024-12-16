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
import Action from "../command-stack/action.js";

export default class CreateCommentLinkAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.linkCommentList = this.apiPipeline.createCommentLinks(data);
	}

	getData() {
		this.data.linkIds = this.linkCommentList.map((link) => link.id);
		this.data.linkType = "comment"; // Added for historical purposes - for WML Canvas support
		return this.data;
	}

	do() {
		this.apiPipeline.addLinks(this.linkCommentList);
	}

	undo() {
		this.linkCommentList.forEach((link) => {
			this.apiPipeline.deleteLink(link);
		});
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.createCommentLink");
	}
}
