/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { ParameterDef, ParameterMetadata } from "./ParameterInfo";
import propertyOf from "lodash/propertyOf";
import { ResourceDef } from "./L10nProvider";

export class StructureDef {
	constructor(cname, keyDefinition, parameterMetadata, moveableRows, label, rowSelection) {
		this.name = cname;
		this.keyDefinition = keyDefinition;
		this.parameterMetadata = parameterMetadata;
		this.moveableRows = moveableRows;
		this.label = ResourceDef.make(label);
		this.rowSelection = rowSelection;
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
	hasSubPanel() {
		if (this.parameterMetadata) {
			for (const param of this.parameterMetadata.paramDefs) {
				if (param.isSubPanelEdit()) {
					return true;
				}
			}
		}
		return false;
	}
	keyAttributeIndex() {
		if (this.keyDefinition) {
			// Assume the key is always in the first column
			return 0;
		}
		return -1;
	}

	defaultStructure() {
		const defaults = [];
		this.parameterMetadata.paramDefs.forEach(function(param) {
			defaults.push(param.defaultValue);
		});
		if (this.keyDefinition) {
			// Assume the key is always in the first column
			defaults.unshift(this.keyDefinition.defaultValue);
		}
		return defaults;
	}

	static makeStructure(structure, uihints) {
		if (structure) {
			return new StructureDef(
				propertyOf(structure)("id"),
				ParameterDef.makeParameterDef(propertyOf(structure)("key_definition"), propertyOf(uihints)("key_definition"), true),
				ParameterMetadata.makeParameterMetadata(propertyOf(structure)("parameters"), propertyOf(uihints)("parameters")),
				propertyOf(uihints)("moveable_rows"),
				propertyOf(uihints)("label"),
				propertyOf(uihints)("row_selection")
			);
		}
		return null;
	}
}

// searches uihints to match up with parameter
function getStructureUIHint(structureName, uihints) {
	if (uihints) {
		for (const uihint of uihints) {
			if (structureName === uihint.complex_type_ref) {
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
				const struct = StructureDef.makeStructure(structure, getStructureUIHint(structure.id, uihintsStructures));
				if (struct !== null) {
					structureDefs.push(struct);
				}
			}
			return new StructureMetadata(structureDefs);
		}
		return null;
	}

}
