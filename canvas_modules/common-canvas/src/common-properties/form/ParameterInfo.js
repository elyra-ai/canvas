/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


import { Type, ParamRole, EditStyle } from "./form-constants";
import { ResourceDef } from "./L10nProvider";
import _ from "underscore";

export class ParameterDef {
	constructor(cname, label, description, type, role, valueRestriction, defaultValue, control, orientation, style, width, charLimit, placeHolderText) {
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
		this.placeHolderText = placeHolderText; // additionalText
	}

	isList() {
		return this.type.startsWith("array[");
	}

	isMapValue() {
		return this.type.startsWith("map[");
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
		// TODO should return translated value.  New schema needs to handle this.
		return this.placeHolderText;
	}

	/**
	 * Returns the "control" attribute which can be used to define which control should be used
	 * for editing a property. The control should be valid for the associated property.
	 */
	getControl(defaultControl) {
		return (this.control ? this.control : defaultControl);
	}

	/**
	 * Returns the "editStyle" attribute which can be used to define how structured values are edited.
	 */
	editStyle() {
		return EditStyle.SUBPANEL;
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
		if (this.separator === "after") {
			return true;
		}
		return false;
	}

	/**
	 * Returns the "separatorBefore" attribute which can be used to insert a horizontal
	 * separator before the control in the UI.
	 */
	separatorBefore() {
		if (this.separator === "before") {
			return true;
		}
		return false;
	}

	static makeParameterDef(paramOp, uihint) {
		if (paramOp) {
			return new ParameterDef(
				_.propertyOf(paramOp)("name"),
				_.propertyOf(uihint)("label"),
				_.propertyOf(uihint)("description"),
				_.propertyOf(paramOp)("type"),
				_.propertyOf(paramOp)("role"),
				_.propertyOf(paramOp)("enum"),
				JSON.stringify(_.propertyOf(paramOp)("default")),
				_.propertyOf(paramOp)("control"),
				_.propertyOf(paramOp)("orientation"),
				_.propertyOf(paramOp)("style"),
				_.propertyOf(paramOp)("width"),
				_.propertyOf(paramOp)("char_limit"),
				_.propertyOf(paramOp)("place_holder_text")
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
