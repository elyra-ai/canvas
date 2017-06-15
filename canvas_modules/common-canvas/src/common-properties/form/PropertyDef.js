/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { GroupMetadata } from "./GroupInfo";
import { ParameterMetadata } from "./ParameterInfo";
import { Size } from "./form-constants";
import _ from "underscore";

export class PropertyDef {
	constructor(cname, icon, editorSize, label, description, structureMetadata, parameterMetadata, groupMetadata) {
		this.name = cname;
		this.icon = icon;
		this.editorSize = editorSize;
		this.label = label;
		this.description = description;
		this.structureMetadata = structureMetadata;
		this.parameterMetadata = parameterMetadata;
		this.groupMetadata = groupMetadata;
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

	static makePropertyDef(parameters, uihints) {
		if (parameters) {
			// structures aren't in current spec
			const structureMetadata = {};
			const parameterMetadata = ParameterMetadata.makeParameterMetadata(parameters, _.propertyOf(uihints)("parameter_info"));
			const groupMetadata = GroupMetadata.makeGroupMetadata(_.propertyOf(uihints)("group_info"));
			return new PropertyDef(
				_.propertyOf(uihints)("name"),
				_.propertyOf(uihints)("icon"),
				_.propertyOf(uihints)("editorSize"),
				_.propertyOf(uihints)("label"),
				_.propertyOf(uihints)("description"),
				structureMetadata,
				parameterMetadata,
				groupMetadata
			);
		}
		return null;
	}
}
