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
import { Size } from "./form-constants";
import { ResourceDef } from "./L10nProvider";
import propertyOf from "lodash/propertyOf";

export class PropertyDef {
	constructor(cname, icon, editorSize, label, description, structureMetadata, parameterMetadata, groupMetadata, actionMetadata) {
		this.name = cname;
		this.icon = icon;
		this.editorSize = editorSize;
		this.label = ResourceDef.make(label);
		this.description = ResourceDef.make(description);
		this.structureMetadata = structureMetadata;
		this.parameterMetadata = parameterMetadata;
		this.groupMetadata = groupMetadata;
		this.actionMetadata = actionMetadata;
	}

	/**
	 * Returns the "editorSize" attribute which can be used to define how large an item should be in the UI.
	 * default to Large editor
	 */
	editorSizeHint() {
		if (this.editorSize) {
			return this.editorSize;
		}
		return Size.LARGE;
	}


	static makePropertyDef(parameters, structures, uihints) {
		if (parameters) {
			// structures aren't in current spec
			const structureMetadata = StructureMetadata.makeStructureMetadata(structures, propertyOf(uihints)("complex_type_info"));
			const parameterMetadata = ParameterMetadata.makeParameterMetadata(parameters, propertyOf(uihints)("parameter_info"));
			const actionMetadata = ActionMetadata.makeActionMetadata(propertyOf(uihints)("action_info"));
			const groupMetadata = GroupMetadata.makeGroupMetadata(propertyOf(uihints)("group_info"));
			return new PropertyDef(
				propertyOf(uihints)("id"),
				propertyOf(uihints)("icon"),
				propertyOf(uihints)("editor_size"),
				propertyOf(uihints)("label"),
				propertyOf(uihints)("description"),
				structureMetadata,
				parameterMetadata,
				groupMetadata,
				actionMetadata
			);
		}
		return null;
	}
}
