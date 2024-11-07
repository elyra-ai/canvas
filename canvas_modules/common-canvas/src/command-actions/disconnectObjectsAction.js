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

/***************************************************************************/
/* WARNING:                                                                */
/* This class is exported from Common Canvas. This means host apps can     */
/* extend the class and add to, or alter, this class's member variables.   */
/* So, if the names of any internal this.xxxx variables are changed that   */
/* needs to be communicated clearly through the release notes, Slack, etc. */
/***************************************************************************/

import Action from "../command-stack/action.js";

export default class DisconnectObjectsAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.links = [];
	}

	// Standard methods
	do() {
		this.links = this.apiPipeline.disconnectObjects(this.data.selectedObjectIds);
	}

	undo() {
		this.apiPipeline.addLinks(this.links);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.disconnectObjects");
	}

	getFocusObject() {
		return this.data.selectedObjects[0];
	}
}
