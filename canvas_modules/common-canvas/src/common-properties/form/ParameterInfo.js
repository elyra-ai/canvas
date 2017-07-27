/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { Separator } from "./form-constants";
import { Type, ParamRole } from "./form-constants";
import { ResourceDef } from "./L10nProvider";
import _ from "underscore";

export class ParameterDef {
	constructor(cname, label, description, type, role, valueRestriction, defaultValue,
		control, orientation, style, width, charLimit, placeHolderText, separator,
		resource_key, visible, valueIcons, sortable, filterable, editStyle, required, numberGenerator) {
		this.name = cname;
		this.label = ResourceDef.make(label);
		this.description = ResourceDef.make(description);
		this.type = type;
		this.role = role;
		this.valueRestriction = valueRestriction; // enum
		this.defaultValue = defaultValue;
		this.control = control;
		this.orientation = orientation;
		this.style = style;
		this.width = width;
		this.charLimit = charLimit;
		this.placeHolderText = ResourceDef.make(placeHolderText); // additionalText
		this.separator = separator;
		this.resource_key = resource_key;
		this.visible = (typeof visible === "boolean" ? visible : true);
		this.valueIcons = valueIcons;
		this.sortable = sortable;
		this.filterable = filterable;
		this.editStyle = editStyle;
		this.required = required;
		if (numberGenerator) {
			this.numberGenerator = numberGenerator;
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
		} else if (this.valueRestriction) {
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
			return typ.substring(typ.indexOf(",") + 1, this.type.length - 1);
		} else if (this.valueRestriction && !this.type) { // assume String for enums
			return Type.STRING;
		}
		return typ;
	}

	getValidValues() {
		var undef;
		if (this.getRole() === ParamRole.ENUM && this.valueRestriction) {
			return this.valueRestriction;
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

	static makeParameterDef(param, uihint) {
		if (param) {
			if (uihint && uihint.columns && !uihint.width) {
				uihint.width = uihint.columns;
			}
			// JSON.stringify(_.propertyOf(param)("default")),
			return new ParameterDef(
				_.propertyOf(param)("id"),
				_.propertyOf(uihint)("label"),
				_.propertyOf(uihint)("description"),
				_.propertyOf(param)("type"),
				_.propertyOf(param)("role"),
				_.propertyOf(param)("enum"),
				_.propertyOf(param)("default"),
				_.propertyOf(uihint)("control"),
				_.propertyOf(uihint)("orientation"),
				_.propertyOf(uihint)("style"),
				_.propertyOf(uihint)("width"),
				_.propertyOf(uihint)("char_limit"),
				_.propertyOf(uihint)("place_holder_text"),
				_.propertyOf(uihint)("separator"),
				_.propertyOf(uihint)("resource_key"),
				_.propertyOf(uihint)("visible"),
				_.propertyOf(uihint)("valueIcons"),
				_.propertyOf(uihint)("sortable"),
				_.propertyOf(uihint)("filterable"),
				_.propertyOf(uihint)("editStyle"),
				_.propertyOf(param)("required"),
				_.propertyOf(uihint)("number_generator")
			);
		}
		return null;
	}
}

// searches uihints to match up with parameter
function getParamUIHint(paramName, uihints) {
	if (uihints) {
		for (const uihint of uihints) {
			if (paramName === uihint.name) {
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

	// operation arguments
	static makeParameterMetadata(parameters, uihintsParams) {
		if (parameters) {
			const paramDefs = [];
			for (const param of parameters) {
				const paramDef = ParameterDef.makeParameterDef(param, getParamUIHint(param.name, uihintsParams));
				if (paramDef) {
					paramDefs.push(paramDef);
				}
			}
			return new ParameterMetadata(paramDefs);
		}
		return null;
	}
}
