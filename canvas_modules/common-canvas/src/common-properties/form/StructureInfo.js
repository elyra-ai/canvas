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

import { ParameterDef, ParameterMetadata } from "./ParameterInfo";
import { ButtonMetadata } from "./ButtonInfo";
import { propertyOf } from "lodash";
import { ResourceDef } from "../util/L10nProvider";

export class StructureDef {
	constructor(cname, keyDefinition, parameterMetadata, moveableRows, label,
		rowSelection, addRemoveRows, header, includeAllFields, layout, buttons, type) {
		this.name = cname;
		this.keyDefinition = keyDefinition;
		this.parameterMetadata = parameterMetadata;
		this.moveableRows = moveableRows;
		this.label = ResourceDef.make(label);
		this.rowSelection = rowSelection;
		this.buttons = buttons;
		if (typeof addRemoveRows === "boolean") {
			this.addRemoveRows = addRemoveRows;
		} else {
			this.addRemoveRows = true; // set the default value
		}
		if (typeof header === "boolean") {
			this.header = header;
		} else {
			this.header = true; // set the default value
		}
		if (typeof includeAllFields === "boolean") {
			this.includeAllFields = includeAllFields;
		}
		if (Array.isArray(layout)) {
			this.layout = layout;
		}
		if (typeof type === "undefined") {
			this.type = "array"; // set the default value
		} else {
			this.type = type;
		}
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
	hasInlinePanel() {
		if (this.parameterMetadata) {
			for (const param of this.parameterMetadata.paramDefs) {
				if (param.isInlineEdit()) {
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
				propertyOf(uihints)("row_selection"),
				propertyOf(uihints)("add_remove_rows"),
				propertyOf(uihints)("header"),
				propertyOf(uihints)("include_all_fields"),
				propertyOf(uihints)("layout"),
				ButtonMetadata.makeButtonMetadata(propertyOf(uihints)("buttons")),
				propertyOf(structure)("type")
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
