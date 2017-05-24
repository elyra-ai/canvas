/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { UIInfo } from "./UIInfo";
import {
	ParameterDef,
	ParameterMetadata
} from "./ParameterInfo";
import { EditStyle } from "./form-constants";
import _ from "underscore";

class StructureDef extends UIInfo {
	constructor(cname, keyDefinition, parameterMetadata, uiHints) {
		super({ uiHints: uiHints });
		this.name = cname;
		this.keyDefinition = keyDefinition;
		this.parameterMetadata = parameterMetadata;
	}

	isEditStyleSubpanel() {
		return (this.editStyle() === EditStyle.SUBPANEL);
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
		return (this.editStyle() === EditStyle.INLINE);
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
			defaults.push(_.propertyOf(param)("defaultValue"));
		});
		if (addKeyDefinition && this.keyDefinition) {
			// Assume the key is always in the first column
			defaults.unshift(_.propertyOf(this.keyDefinition)("defaultValue"));
		}
		return defaults;
	}

	static makeStructure(structureOp) {
		if (structureOp) {
			return new StructureDef(
				_.propertyOf(structureOp)("name"),
				ParameterDef.makeParameterDef(_.propertyOf(structureOp.metadata)("keyDefinition")),
				ParameterMetadata.makeParameterMetadata(_.propertyOf(structureOp.metadata)("arguments")),
				_.propertyOf(structureOp.metadata)("uiHints")
			);
		}
		return null;
	}
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

	static makeStructureMetadata(structuresOp) {
		if (structuresOp) {
			const structures = [];
			for (const structure of structuresOp) {
				const struct = StructureDef.makeStructure(structure);
				if (struct !== null) {
					structures.push(struct);
				}
			}
			return new StructureMetadata(structures);
		}
		return null;
	}
}
