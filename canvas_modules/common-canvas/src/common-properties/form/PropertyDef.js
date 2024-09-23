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

import { TitleMetadata } from "./TitleInfo";
import { GroupMetadata } from "./GroupInfo";
import { ActionMetadata } from "./ActionInfo";
import { ParameterMetadata } from "./ParameterInfo";
import { StructureMetadata } from "./StructureInfo";
import { DEFAULT_LABEL_EDITABLE } from "../constants/constants";
import { Size } from "../constants/form-constants";
import { ResourceDef } from "../util/L10nProvider";
import { propertyOf } from "lodash";

export class PropertyDef {
	constructor(cname, icon, editorSize, pixelWidth, label, labelEditable, help,
		description, structureMetadata, parameterMetadata, groupMetadata,
		actionMetadata, heading, titleMetadata) {
		this.name = cname;
		this.icon = icon;
		this.editorSize = editorSize;
		this.pixelWidth = pixelWidth;
		this.label = label;
		this.labelEditable = labelEditable;
		this.help = help;
		this.description = ResourceDef.make(description);
		this.structureMetadata = structureMetadata;
		this.parameterMetadata = parameterMetadata;
		this.groupMetadata = groupMetadata;
		this.actionMetadata = actionMetadata;
		this.heading = heading;
		this.titleMetadata = titleMetadata;
	}

	/**
	 * Returns the "editorSize" attribute which can be used to define how large
	 * a node editor should be in the UI. Default to small editor unless defaultValue is set.
	 */
	editorSizeHint(defaultValue) {
		if (this.editorSize) {
			return this.editorSize;
		}
		if (defaultValue) {
			return defaultValue;
		}
		return Size.SMALL;
	}


	static makePropertyDef(titleDefinition, parameters, structures, uihints) {
		const structureMetadata = StructureMetadata.makeStructureMetadata(structures, propertyOf(uihints)("complex_type_info"));
		const parameterMetadata = ParameterMetadata.makeParameterMetadata(parameters,
			propertyOf(uihints)("parameter_info"), propertyOf(uihints)("ui_parameters"));
		const actionMetadata = ActionMetadata.makeActionMetadata(propertyOf(uihints)("action_info"));
		const groupMetadata = GroupMetadata.makeGroupMetadata(propertyOf(uihints)("group_info"), parameterMetadata.getParameters());
		const titleMetadata = TitleMetadata.makeTitleMetadata(propertyOf(uihints)("title_info"));

		const label = titleDefinition && titleDefinition.title ? titleDefinition.title : null;
		const labelEditable = titleDefinition && typeof titleDefinition.editable !== "undefined" ? titleDefinition.editable : DEFAULT_LABEL_EDITABLE;

		return new PropertyDef(
			propertyOf(uihints)("id"),
			propertyOf(uihints)("icon"),
			propertyOf(uihints)("editor_size"),
			propertyOf(uihints)("pixel_width"),
			label,
			labelEditable,
			propertyOf(uihints)("help"),
			propertyOf(uihints)("description"),
			structureMetadata,
			parameterMetadata,
			groupMetadata,
			actionMetadata,
			propertyOf(uihints)("label"),
			titleMetadata
		);
	}
}
