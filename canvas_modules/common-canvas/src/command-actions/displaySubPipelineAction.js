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

export default class DisplaySubPipeline extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.oldBreadcrumbs = this.objectModel.getBreadcrumbs();
	}

	// Standard methods
	do() {
		if (this.data.addBreadcrumbs) {
			// Make sure pipeline is loaded in case it is part of an external pipeline flow.
			this.objectModel.ensurePipelineIsLoaded(this.data);
			this.objectModel.addBreadcrumbs(this.data);

		} else if (this.data.breadcrumbIndex === 0) {
			// Index 0 is the primary pipeline so no need to check pipeline is loaded.
			this.objectModel.setIndexedBreadcrumb(this.data);

		} else if (this.data.breadcrumbIndex) {
			// Make sure pipeline is loaded in case it is part of an external pipeline flow.
			this.objectModel.ensurePipelineIsLoaded(this.data);
			this.objectModel.setIndexedBreadcrumb(this.data);
		}
	}

	undo() {
		this.objectModel.setBreadcrumbs(this.oldBreadcrumbs);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.displaySubPipeline");
	}
}
