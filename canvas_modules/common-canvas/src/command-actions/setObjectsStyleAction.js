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
import { forIn } from "lodash";

export default class SetObjectsStyleAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.oldPipelineObjStyles = [];
		forIn(this.data.pipelineObjectIds, (objectIds, pipelineId) => {
			const apiPipeline = this.objectModel.getAPIPipeline(pipelineId);
			this.oldPipelineObjStyles = [];
			objectIds.forEach((objId) => {
				this.oldPipelineObjStyles.push({ pipelineId: pipelineId, objId: objId, style: apiPipeline.getObjectStyle(objId, this.data.temporary) });
			});
		});
	}

	// Standard methods
	do() {
		this.objectModel.setObjectsStyle(this.data.pipelineObjectIds, this.data.style, this.data.temporary);
	}

	undo() {
		this.objectModel.setObjectsMultiStyle(this.oldPipelineObjStyles, this.data.temporary);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.setObjectsStyle");
	}
}
