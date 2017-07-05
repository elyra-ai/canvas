/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { ParameterDef, ParameterMetadata } from "./ParameterInfo";
import { EditStyle } from "./form-constants";
import _ from "underscore";

class StructureDef {
	constructor(cname, keyDefinition, parameterMetadata, type) {
		this.name = cname;
		this.keyDefinition = keyDefinition;
		this.parameterMetadata = parameterMetadata;
		this.type = type;
	}

	/**
	 * Returns the "editStyle" attribute which can be used to define how structured values are edited.
	 */
	editStyle() {
		return EditStyle.SUBPANEL;
	}

	isEditStyleSubpanel() {
		return (this.editStyle === EditStyle.SUBPANEL);
	}

	/**
	 * Returns a array of parameter names
	 */
	parameterNames() {
		const params = [];
		if (this.parameterMetadata) {
			for (const param of this.parameterMetadata.paramDefs) {
				params.push(param.name);
			}
		}
		return params;
	}

	isEditStyleInlinel() {
		return (this.editStyle === EditStyle.INLINE);
	}

	keyAttributeIndex() {
		if (this.keyDefinition) {
			// Assume the key is always in the first column
			return 0;
		}
		return -1;
	}

	defaultStructure(addKeyDefinition) {
		const defaults = [];
		this.parameterMetadata.paramDefs.forEach(function(param) {
			defaults.push(param.defaultValue);
		});
		if (addKeyDefinition && this.keyDefinition) {
			// Assume the key is always in the first column
			defaults.unshift(this.keyDefinition.defaultValue);
		}
		return defaults;
	}

	static makeStructure(structure, uihints) {
		if (structure) {
			return new StructureDef(
				_.propertyOf(structure)("name"),
				ParameterDef.makeParameterDef(_.propertyOf(structure)("key_definition"), _.propertyOf(uihints)("key_definition")),
				ParameterMetadata.makeParameterMetadata(_.propertyOf(structure)("parameters"), _.propertyOf(uihints)("parameters")),
				_.propertyOf(structure)("type")
			);
		}
		return null;
	}
}

// searches uihints to match up with parameter
function getStructureUIHint(structureName, uihints) {
	if (uihints) {
		for (const uihint of uihints) {
			if (structureName === uihint.name) {
				return uihint;
			}
		}
	}
	return null;
}

export class StructureMetadata {
	constructor(structures) {
		this.structures = structures;
	}

	getStructure(structName) {
		let structureDef;
		this.structures.forEach(function(structure) {
			if (structure.name === structName) {
				structureDef = structure;
			}
		});
		return structureDef;
	}


	static makeStructureMetadata(structures, uihintsStructures) {
		if (structures) {
			const structureDefs = [];
			for (const structure of structures) {
				const struct = StructureDef.makeStructure(structure, getStructureUIHint(structure.name, uihintsStructures));
				if (struct !== null) {
					structureDefs.push(struct);
				}
			}
			return new StructureMetadata(structureDefs);
		}
		return null;
	}

}
