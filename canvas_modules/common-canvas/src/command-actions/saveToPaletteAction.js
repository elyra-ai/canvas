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
import { SAVED_NODES_CATEGORY_ID, SAVED_NODES_FOLDER_ICON }
	from "../common-canvas/constants/canvas-constants.js";

export default class SaveToPaletteAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.data.addedNodeTypes = this.apiPipeline.createNodesForPalette(this.data.selectedObjectIds);
	}

	do() {
		// The new category will only be created if it does not already exist.
		// TODO - Make these hardcoded values for name and image configurable
		this.objectModel.addNodeTypesToPalette(
			this.data.addedNodeTypes,
			SAVED_NODES_CATEGORY_ID,
			this.labelUtil.getLabel("palette.saved.nodes.label"),
			this.labelUtil.getLabel("palette.saved.nodes.description"),
			SAVED_NODES_FOLDER_ICON);
	}

	undo() {
		const addedIds = this.data.addedNodeTypes.map((ant) => ant.id);
		this.objectModel.removeNodesFromPalette(addedIds, SAVED_NODES_CATEGORY_ID);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.saveToPalette");
	}
}
