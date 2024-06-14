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

import { Separator } from "../constants/form-constants";
import { Type, ParamRole, EditStyle, ControlType } from "../constants/form-constants";
import { ResourceDef } from "../util/L10nProvider";
import { propertyOf } from "lodash";
import { toType } from "../util/property-utils";

export class ParameterDef {
	constructor(settings) {
		if (settings.id) {
			this.name = settings.id;
		}
		if (settings.label) {
			this.label = ResourceDef.make(settings.label);
		}
		if (settings.description) {
			this.description = ResourceDef.make(settings.description);
		}
		if (settings.type) {
			this.type = settings.type;
		}
		if (settings.role) {
			this.role = settings.role;
		}
		if (settings.valueRestriction) {
			this.valueRestriction = settings.valueRestriction;
		}
		if (settings.defaultValue !== null && toType(settings.defaultValue) !== "undefined") {
			if (settings.defaultValue.parameter_ref) {
				this.defaultValue = {};
				this.defaultValue.parameterRef = settings.defaultValue.parameter_ref;
			} else {
				this.defaultValue = settings.defaultValue;
			}
		} else if (typeof settings.defaultValue === "undefined" && (this.isList() || this.isMapValue())) {
			this.defaultValue = []; // This is a nested structure
		}
		if (typeof settings.labelVisible === "boolean") {
			this.labelVisible = settings.labelVisible;
		}
		if (settings.control) {
			this.control = settings.control;
		}
		if (settings.orientation) {
			this.orientation = settings.orientation;
		}
		if (settings.width) {
			this.width = settings.width;
		}
		if (settings.charLimit) {
			this.charLimit = settings.charLimit;
		}
		if (settings.minValue) {
			this.minValue = settings.minValue;
		}
		if (settings.maxValue) {
			this.maxValue = settings.maxValue;
		}
		if (settings.placeHolderText) {
			this.placeHolderText = ResourceDef.make(settings.placeHolderText);
		}
		if (settings.separator) {
			this.separator = settings.separator;
		}
		if (settings.resource_key) {
			this.resource_key = settings.resource_key;
		}
		if (toType(settings.visible) === "boolean") {
			this.visible = settings.visible;
		} else {
			this.visible = true;
		}
		if (settings.valueIcons) {
			this.valueIcons = settings.valueIcons;
		}
		if (toType(settings.sortable) === "boolean") {
			this.sortable = settings.sortable;
		}
		if (toType(settings.filterable) === "boolean") {
			this.filterable = settings.filterable;
		}
		if (toType(settings.resizable) === "boolean") {
			this.resizable = settings.resizable;
		}
		if (settings.editStyle) {
			this.editStyle = settings.editStyle;
		}
		if (toType(settings.required) === "boolean") {
			this.required = settings.required;
		}
		if (settings.numberGenerator) {
			settings.numberGenerator.label = ResourceDef.make(settings.numberGenerator.label);
			this.numberGenerator = settings.numberGenerator;
		}
		if (settings.isKey) {
			this.isKey = settings.isKey;
		}
		if (settings.dmDefault) {
			this.dmDefault = settings.dmDefault;
		}
		if (settings.dmImage) {
			this.dmImage = settings.dmImage;
		}
		if (settings.language) {
			this.language = settings.language;
		}
		if (settings.enableMaximize) {
			this.enableMaximize = settings.enableMaximize;
		}

		if (toType(settings.summary) === "boolean") {
			this.summary = settings.summary;
		}
		if (settings.increment) {
			this.increment = settings.increment;
		}
		if (settings.textAfter) {
			this.textAfter = ResourceDef.make(settings.textAfter);
		}
		if (settings.textBefore) {
			this.textBefore = ResourceDef.make(settings.textBefore);
		}
		if (toType(settings.moveableRows) === "boolean") {
			this.moveableRows = settings.moveableRows;
		}
		if (settings.generatedValues) {
			this.generatedValues = settings.generatedValues;
		}
		if (settings.dateFormat) {
			this.dateFormat = settings.dateFormat;
		}
		if (settings.timeFormat) {
			this.timeFormat = settings.timeFormat;
		}
		if (settings.customControlId) {
			this.customControlId = settings.customControlId;
		}
		if (settings.data) {
			this.data = settings.data;
		}
		if (settings.rows) {
			this.rows = settings.rows;
		}
		if (settings.displayChars) {
			this.displayChars = settings.displayChars;
		}
		if (settings.uionly) {
			this.uionly = settings.uionly;
		}
		if (settings.actionRef) {
			this.actionRef = settings.actionRef;
		}
		if (toType(settings.customValueAllowed) === "boolean") {
			this.customValueAllowed = settings.customValueAllowed;
		}
		if (settings.className) {
			this.className = settings.className;
		}
		if (settings.helperText) {
			this.helperText = ResourceDef.make(settings.helperText);
		}
	}

	isList() {
		if (this.type) {
			return this.type.startsWith("array[");
		}
		return false;
	}

	isMapValue() {
		if (this.type) {
			return this.type.startsWith("map[");
		}
		return false;
	}

	isSubPanelEdit() {
		if (this.editStyle === EditStyle.SUBPANEL) {
			return true;
		}
		return false;
	}

	// For multi select edit subpanel, fields having editStyle "inline" and undefined can be edited in the subpanel
	isInlineEdit() {
		if ((this.editStyle === EditStyle.INLINE || typeof this.editStyle === "undefined") && this.control !== ControlType.READONLY) {
			return true;
		}
		return false;
	}

	/**
	 * Determines if the given parameter object represents a compound field.
	 *
	 * @return True if the parameter represents a compound field
	 */
	isCompoundField() {
		if (this.role && this.type) {
			const isObject = this.type === Type.OBJECT || this.baseType() === Type.OBJECT;
			return isObject && this.role === ParamRole.COLUMN;
		}
		return false;
	}

	propType() {
		// If we don't recognize the base type as one of the built-in types, assume it's a structure
		let value;
		for (const key in Type) {
			if (this.baseType() === Type[key]) {
				value = Type[key];
			}
		}
		if (!value) {
			value = Type.STRUCTURE;
		}
		return value;
	}

	getRole() {
		if (this.role) {
			return this.role;
		} else if (this.getValidValues()) {
			// Assume valueRestriction implies ENUM
			return ParamRole.ENUM;
		}
		return ParamRole.UNSPECIFIED;
	}

	/**
	 * Returns the type of a parameter.
	 */
	baseType() {
		const typ = this.type;
		if (this.isList()) {
			// "array[<value-type>]" so remove the leading "array[" and trailing "]"
			return typ.substring(6, this.type.length - 1);
		} else if (this.isMapValue()) {
			// "map[<key-type>,<value-type>]" so remove everything up to and including "," and drop the trailing "]"
			return typ.substring(typ.indexOf(",") + 1, this.type.length - 1).trim();
		} else if (this.valueRestriction && !this.type) { // assume String for enums
			return Type.STRING;
		}
		return typ;
	}

	getValidValues() {
		var undef;
		if (this.valueRestriction) {
			return this.valueRestriction;
		} else if (this.type === Type.BOOLEAN) {
			return [true, false];
		}
		return undef;
	}

	getValidValueCount() {
		return (this.getValidValues() ? this.getValidValues().length : 0);
	}

	/**
	 * Returns the "additionalText" attribute which can be used to include additional
	 * text associated with the property control on the UI.
	 */
	getAdditionalText(l10nProvider) {
		return l10nProvider.l10nResource(this.placeHolderText);
	}

	/**
	 * Returns the "additionalHelperText" attribute which can be used to include additional
	 * helper text associated with the property control on the UI.
	*/
	getAdditionalHelperText(l10nProvider) {
		return l10nProvider.l10nResource(this.helperText);
	}

	getTextAfter(l10nProvider) {
		return l10nProvider.l10nResource(this.textAfter);
	}
	getTextAfterType() {
		return this.textAfter ? this.textAfter.type : null;
	}
	getTextBefore(l10nProvider) {
		return l10nProvider.l10nResource(this.textBefore);
	}
	getTextBeforeType() {
		return this.textBefore ? this.textBefore.type : null;
	}

	/**
	 * Returns the "control" attribute which can be used to define which control should be used
	 * for editing a property. The control should be valid for the associated property.
	 */
	getControl(defaultControl) {
		return (this.control ? this.control : defaultControl);
	}

	/**
	 * Returns the "columns" uihint or the default value if a "columns" hint has not been supplied.
	 */
	columns(defaultCol) {
		return (this.width ? this.width : defaultCol);
	}

	/**
	 * Returns the "separatorAfter" attribute which can be used to insert a horizontal
	 * separator before the control in the UI.
	 */
	separatorAfter() {
		if (this.separator === Separator.AFTER) {
			return true;
		}
		return false;
	}

	/**
	 * Returns the "separatorBefore" attribute which can be used to insert a horizontal
	 * separator before the control in the UI.
	 */
	separatorBefore() {
		if (this.separator === Separator.BEFORE) {
			return true;
		}
		return false;
	}

	static makeParameterDef(param, uihint, isKey) {
		if (param) {
			return new ParameterDef({
				"id": propertyOf(param)("id"),
				"enableMaximize": propertyOf(uihint)("enable_maximize"),
				"label": propertyOf(uihint)("label"),
				"description": propertyOf(uihint)("description"),
				"type": propertyOf(param)("type"),
				"role": propertyOf(param)("role"),
				"valueRestriction": propertyOf(param)("enum"),
				"defaultValue": propertyOf(param)("default"),
				"labelVisible": propertyOf(uihint)("label_visible"),
				"control": propertyOf(uihint)("control"),
				"orientation": propertyOf(uihint)("orientation"),
				"width": propertyOf(uihint)("width"),
				"charLimit": propertyOf(uihint)("char_limit"),
				"minValue": propertyOf(uihint)("min_value"),
				"maxValue": propertyOf(uihint)("max_value"),
				"placeHolderText": propertyOf(uihint)("place_holder_text"),
				"separator": propertyOf(uihint)("separator"),
				"resource_key": propertyOf(uihint)("resource_key"),
				"visible": propertyOf(uihint)("visible"),
				"valueIcons": propertyOf(uihint)("value_icons"),
				"sortable": propertyOf(uihint)("sortable"),
				"filterable": propertyOf(uihint)("filterable"),
				"resizable": propertyOf(uihint)("resizable"),
				"editStyle": propertyOf(uihint)("edit_style"),
				"required": propertyOf(param)("required"),
				"numberGenerator": propertyOf(uihint)("number_generator"),
				"isKey": isKey,
				"dmDefault": propertyOf(uihint)("dm_default"),
				"dmImage": propertyOf(uihint)("dm_image"),
				"language": propertyOf(uihint)("language"),
				"summary": propertyOf(uihint)("summary"),
				"increment": propertyOf(uihint)("increment"),
				"textAfter": propertyOf(uihint)("text_after"),
				"textBefore": propertyOf(uihint)("text_before"),
				"moveableRows": propertyOf(uihint)("moveable_rows"),
				"generatedValues": propertyOf(uihint)("generated_values"),
				"dateFormat": propertyOf(uihint)("date_format"),
				"timeFormat": propertyOf(uihint)("time_format"),
				"customControlId": propertyOf(uihint)("custom_control_id"),
				"data": propertyOf(uihint)("data"),
				"rows": propertyOf(uihint)("rows"),
				"displayChars": propertyOf(uihint)("display_chars"),
				"uionly": propertyOf(param)("uionly"),
				"actionRef": propertyOf(uihint)("action_ref"),
				"customValueAllowed": propertyOf(uihint)("custom_value_allowed"),
				"className": propertyOf(uihint)("class_name"),
				"helperText": propertyOf(uihint)("helper_text")
			});
		}
		return null;
	}
}

// searches uihints to match up with parameter
function getParamUIHint(paramName, uihints) {
	if (uihints) {
		for (const uihint of uihints) {
			if (paramName === uihint.parameter_ref) {
				return uihint;
			}
		}
	}
	return null;
}

// PropertyProvider
export class ParameterMetadata {
	constructor(paramDefs) {
		this.paramDefs = paramDefs;
	}

	// Return a single parameter
	getParameter(paramName) {
		let paramDef;
		this.paramDefs.forEach(function(param) {
			if (param.name === paramName) {
				paramDef = param;
			}
		});
		return paramDef;
	}

	// Return a single parameter
	getParameters() {
		return this.paramDefs.map((param) => param.name);
	}

	// operation arguments
	static makeParameterMetadata(parameters, uihintsParams, uihintsUiParams) {
		const paramDefs = [];
		if (Array.isArray(parameters)) {
			for (const param of parameters) {
				const paramDef = ParameterDef.makeParameterDef(param, getParamUIHint(param.id, uihintsParams));
				if (paramDef) {
					paramDefs.push(paramDef);
				}
			}
		}
		// Add any ui_parameters
		if (Array.isArray(uihintsUiParams)) {
			for (const param of uihintsUiParams) {
				const paramDef = ParameterDef.makeParameterDef(param, getParamUIHint(param.id, uihintsParams));
				if (paramDef) {
					paramDef.uionly = true;
					paramDefs.push(paramDef);
				}
			}
		}
		return new ParameterMetadata(paramDefs);
	}
}
