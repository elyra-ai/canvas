/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { GroupMetadata } from "./GroupInfo";
import { ActionMetadata } from "./ActionInfo";
import { ParameterMetadata } from "./ParameterInfo";
import { StructureMetadata } from "./StructureInfo";
import { DEFAULT_LABEL_EDITABLE } from "../constants/constants";
import { Size } from "../constants/form-constants";
import { ResourceDef } from "../util/L10nProvider";
import propertyOf from "lodash/propertyOf";

export class PropertyDef {
	constructor(cname, icon, editorSize, pixelWidth, label, labelEditable, help, description, structureMetadata, parameterMetadata, groupMetadata, actionMetadata) {
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

		const label = titleDefinition && titleDefinition.title ? titleDefinition.title : "";
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
			actionMetadata
		);
	}
}
