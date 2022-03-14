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

export default class ColorSelectedObjectsAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldColors = this.data.selectedObjects.map((o) => this.getObjectColorClass(o));
		this.actionLabel = this.createActionLabel();
	}

	// Standard methods
	do() {
		this.apiPipeline.setObjectsColorClassName(this.data.selectedObjectIds, this.data.editParam.color);
	}

	undo() {
		this.apiPipeline.setObjectsColorClassName(this.data.selectedObjectIds, this.oldColors);
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

	getObjectColorClass(o) {
		if (o.class_name) {
			const classes = o.class_name.split(" ");
			if (classes) {
				const colorClass = classes.find((c) => this.getColorClass(c));
				return colorClass;
			}
		}
		return null;
	}

	getColorClass(className) {
		if (className === "white0" ||
				className === "yellow20" ||
				className === "gray20" ||
				className === "green20" ||
				className === "teal20" ||
				className === "cyan20" ||
				className === "red50" ||
				className === "orange40" ||
				className === "gray50" ||
				className === "green50" ||
				className === "teal50" ||
				className === "cyan50") {
			return className;
		}
		return null;
	}
}
