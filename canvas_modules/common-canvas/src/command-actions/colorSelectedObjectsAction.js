/*
 * Copyright 2022 Elyra Authors
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
import CanvasUtils from "../common-canvas/common-canvas-utils.js";

export default class ColorSelectedObjectsAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldIds = this.data.selectedObjects.map((o) => o.id); // Copy the IDs
		this.oldColors = this.getOldColors();
		this.actionLabel = this.createActionLabel();
	}

	// Standard methods
	do() {
		this.apiPipeline.setObjectsColorClassName(this.oldIds, this.data.editParam.color);
	}

	undo() {
		this.apiPipeline.setObjectsColorClassName(this.oldIds, this.oldColors);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.actionLabel;
	}

	createActionLabel() {
		return this.labelUtil.getActionLabel(this, "action.colorComments", {
			comments_count: this.data.selectedObjectIds.length
		});
	}

	getOldColors() {
		const oldColors = [];
		this.data.selectedObjects.forEach((o) => {
			oldColors.push(this.getObjectColorClass(o));
		});
		return oldColors;
	}

	getObjectColorClass(o) {
		if (o.class_name) {
			const classes = o.class_name.split(" ");
			if (classes) {
				const colorClass = classes.find((c) => CanvasUtils.getBkgColorClass(c));
				return colorClass;
			}
		}
		return "";
	}
}
