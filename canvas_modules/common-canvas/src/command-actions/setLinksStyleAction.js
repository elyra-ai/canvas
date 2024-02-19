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
import { forIn } from "lodash";

export default class SetLinksStyleAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.oldPipelineLinkStyles = [];
		forIn(this.data.pipelineLinkIds, (linkIds, pipelineId) => {
			const apiPipeline = this.objectModel.getAPIPipeline(pipelineId);
			this.oldPipelineLinkStyles = [];
			linkIds.forEach((linkId) => {
				this.oldPipelineLinkStyles.push({ pipelineId: pipelineId, objId: linkId, style: apiPipeline.getLinkStyle(linkId, this.data.temporary) });
			});
		});
	}

	// Standard methods
	do() {
		this.objectModel.setLinksStyle(this.data.pipelineLinkIds, this.data.style, this.data.temporary);
	}

	undo() {
		this.objectModel.setLinksMultiStyle(this.oldPipelineLinkStyles, this.data.temporary);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.setLinksStyle");
	}
}
