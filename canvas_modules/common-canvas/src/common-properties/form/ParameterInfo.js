/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import {UIInfo} from "./UIInfo";
import {Type, ParamRole} from "./form-constants";
import _ from "underscore";

class ValueRestriction{
	constructor(oneOf, labels, labelsKey){
		this.oneOf = oneOf;
		this.labels = labels;
		this.labelsKey = labelsKey;
	}

	static make(restrictionOp){
		return new ValueRestriction(
			_.propertyOf(restrictionOp)("oneOf"),
			_.propertyOf(restrictionOp)("labels"),
			_.propertyOf(restrictionOp)("labelsKey")
		)
	}
}

export class ParameterDef extends UIInfo{
	constructor(name, label, description, type, required, resourceKey, role, visible, range, valueRestriction, defaultValue, uiHints){
		super(label, description, resourceKey, uiHints);
		this.name = name;
		this.type = type;
		this.required = required;
		this.role = role;
		this.visible = (visible ? visible : true) // Only used for properties within structures
		this.range = range;
		this.valueRestriction = valueRestriction;
		this.defaultValue = defaultValue;
	}

	isList() {
		return this.type.startsWith("array[")
	}

	isMapValue() {
		return this.type.startsWith("map[")
	}

	propType(){
		// If we don't recognize the base type as one of the built-in types, assume it's a structure
		let value;
		for(let key in Type){
			if (this.baseType() === Type[key]){
				value = Type[key];
			}
		}
		if (!value){
			value = Type.STRUCTURE;
		}
		return value;
	}

	getRole() {
		if (this.role) {
			return this.role
		}else if (this.valueRestriction.oneOf) {
			// Assume valueRestriction implies ENUM
			return ParamRole.ENUM
		}else {
			return ParamRole.UNSPECIFIED
		}
	}

	/**
	* Returns the type of a parameter.
	*/
	baseType() {
		let typ = this.type
		if (this.isList()) {
			// "array[<value-type>]" so remove the leading "array[" and trailing "]"
			return typ.substring(6, this.type.length-1)
		}else if (this.isMapValue()) {
			// "map[<key-type>,<value-type>]" so remove everything up to and including "," and drop the trailing "]"
			return typ.substring(typ.indexOf(",")+ 1, this.type.length-1)
		}else {
			return typ;
		}
	}

	getValidValues() {
		if (this.getRole() === ParamRole.ENUM && this.valueRestriction) {
			return this.valueRestriction.oneOf
		}
	}

	getValidValueCount(){
		return (this.getValidValues() ? this.getValidValues().length : 0);
	}

	static makeParameterDef(paramOp){
		if (paramOp){
			return new ParameterDef(
				_.propertyOf(paramOp)("name"),
				_.propertyOf(paramOp)("label"),
				_.propertyOf(paramOp)("description"),
				_.propertyOf(paramOp)("type"),
				_.propertyOf(paramOp)("required"),
				_.propertyOf(paramOp)("resourceKey"),
				_.propertyOf(paramOp)("role"),
				_.propertyOf(paramOp)("visible"),
				_.propertyOf(paramOp)("range"),
				ValueRestriction.make(_.propertyOf(paramOp)("valueRestriction")),
				JSON.stringify(_.propertyOf(paramOp)("default")),
				_.propertyOf(paramOp)("uiHints")
			)
		}
	}
}

 // PropertyProvider
export class ParameterMetadata{
	constructor( paramDefs){
		this.paramDefs = paramDefs;
	}

	// Return a single parameter
	getParameter(paramName){
		let paramDef;
		this.paramDefs.forEach(function(param){
			if (param.name === paramName){
				paramDef = param;
			}
		})
		return paramDef;
	}

	// operation arguments
	static makeParameterMetadata(opParameters){
		if (opParameters){
			let paramDefs = [];
			for (let param of opParameters){
				paramDefs.push(ParameterDef.makeParameterDef(param));
			}
			return new ParameterMetadata(paramDefs)
		}
	}
}
