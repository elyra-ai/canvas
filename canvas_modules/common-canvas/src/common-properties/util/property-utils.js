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

/* eslint max-depth: ["error", 5] */

import logger from "../../../utils/logger";
import { ParamRole } from "../constants/form-constants";
import { DATA_TYPE, CARBON_ICONS } from "../constants/constants";
import { cloneDeep, isUndefined, isString } from "lodash";
import { v4 as uuid4 } from "uuid";
import defaultMessages1 from "../../../locales/common-properties/locales/en.json";
import defaultMessages2 from "../../../locales/command-actions/locales/en.json";

/**
 * A better type identifier than a simple 'typeOf' call:
 *
 * 	toType({a: 4}); //"object"
 *	toType([1, 2, 3]); //"array"
 *	(function() {console.log(toType(arguments))})(); //arguments
 *	toType(new ReferenceError); //"error"
 *	toType(new Date); //"date"
 *	toType(/a-z/); //"regexp"
 *	toType(Math); //"math"
 *	toType(JSON); //"json"
 *	toType(new Number(4)); //"number"
 *	toType(new String("abc")); //"string"
 *	toType(new Boolean(true)); //"boolean"
 */
function toType(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function copy(obj) {
	if (typeof obj !== "undefined") {
		return cloneDeep(obj);
	}
	return obj;
}

function formatMessage(intl, key, substituteObj) {
	const defaultMessages = { ...defaultMessages1, ...defaultMessages2 };
	let formattedMessage;
	if (typeof intl !== "undefined" && intl !== null) {
		if (intl.messages[key] === "") {
			return ""; // Allow empty strings
		}
		formattedMessage = intl.formatMessage({ id: key, defaultMessage: defaultMessages[key] }, substituteObj);
	} else {
		formattedMessage = defaultMessages[key];
	}
	return formattedMessage;
}

function generateId() {
	return "properties-" + uuid4();
}

/*
* Parses text to see if there is any text replace elements ${}
*/
function evaluateText(text, controller) {
	try {
		if (!text) {
			return text;
		}
		const startIdx = text.indexOf("${");
		if (startIdx < 0) {
			return text;
		}
		const endIdx = text.substr(startIdx + 2).indexOf("}");
		if (endIdx < 0) {
			return text;
		}
		const expression = text.substr(startIdx + 2, endIdx);
		const newText = text.replace("${" + expression + "}", _evaluateExpression(expression, controller));
		return evaluateText(newText, controller); // test to see if there are more expressions
	} catch (e) {
		logger.warn("Invalid expression.  Make sure replacement expression in text is a valid expression.");
		return text;
	}
}

function _evaluateExpression(expression, controller) {
	const paramStartIdx = expression.indexOf("(");
	const funcName = expression.substr(0, paramStartIdx);
	const parameters = expression.slice(paramStartIdx + 1, -1).split(",");
	if (parameters.length === 0) {
		return "";
	}
	let value;
	let paramValue;
	switch (funcName) {
	case "percent":
		paramValue = _getExpParameterValue(parameters[0], controller);
		// 0, undefined, null, or not a number return 0
		if (!paramValue || isNaN(paramValue)) {
			return 0;
		}
		value = 100.0 / paramValue;
		if (parameters.length > 1) {
			value = value.toFixed(parseInt(parameters[1], 10));
		}
		return value;
	case "sum":
		value = 0;
		for (const param of parameters) {
			paramValue = _getExpParameterValue(param, controller);
			if (!isNaN(paramValue)) {
				value += paramValue;
			}
		}
		return value;
	default:
		break;
	}
	return "";
}

function _getExpParameterValue(expParam, controller) {
	// assume property if parameter is a string
	if (isNaN(expParam)) {
		return controller.getPropertyValue({ name: expParam.trim() });
	}
	return parseFloat(expParam);
}

function getTableFieldIndex(control) {
	if (control) {
		// table
		if (control.subControls) {
			for (let i = 0; i < control.subControls.length; i++) {
				if (control.subControls[i].role === ParamRole.COLUMN) {
					return i;
				}
			}
		} else if (control.role === ParamRole.COLUMN) { // array
			return 0;
		}
	}
	return -1;
}

/**
 * Returns true if any subControl within control has 'structureType === object'
 */
function isSubControlStructureObjectType(control) {
	if (control) {
		if (control.structureType && control.structureType === "object") {
			return true;
		} else if (control.subControls) {
			for (const subControl of control.subControls) {
				if (subControl.structureType && subControl.structureType === "object") {
					return true;
				} else if (subControl.subControls) {
					const objectType = isSubControlStructureObjectType(subControl);
					if (objectType) { // continue if false
						return true;
					}
				}
			}
			return false;
		}
	}
	return false;
}

/**
 * Converts the currentValues of a structure control of type 'object'
 *  from an array of objects to an array of values.
 *  @isList boolean, true if this structure is a list
 *  Example currentValues: [{a: 1, b: 2}, {a: 10, b; 20}]  || {z: 9, y: 88, x: ["abc", "def"]}
 *  Example convertedValues: [[1, 2], [10, 20]]            || [9, 88, ["abc", "def"]]
 */
function convertObjectStructureToArray(isList, subControls, currentValues) {
	const structureKeys = [];
	subControls.forEach((control) => {
		structureKeys.push(control.name);
	});

	if (isList) {
		const convertedValues = [];
		if (typeof currentValues === "object" && currentValues !== null && Object.keys(currentValues).length > 0) {
			currentValues.forEach((row) => {
				if (Array.isArray(row)) { // check if any values in the row is a nested object
					const convertedRow = [];
					row.forEach((field, index) => {
						let value = field;
						if (typeof field === "object" && field !== null && Object.keys(field).length > 0) {
							value = convertObjectStructureToArray(subControls[index].valueDef.isList, subControls[index].subControls, field);
						}
						convertedRow.push(value);
					});
					convertedValues.push(convertedRow);
				} else if (typeof row === "object") {
					const convertedRow = [];
					structureKeys.forEach((key, index) => {
						let value = typeof row[key] !== "undefined" ? row[key] : null;
						// subControls that are type 'object' will need to be converted
						if (subControls[index].structureType && subControls[index].structureType === "object") {
							value = convertObjectStructureToArray(subControls[index].valueDef.isList, subControls[index].subControls, row[key]);
						}
						convertedRow.push(value);
					});
					convertedValues.push(convertedRow);
				}
			});
		}
		return convertedValues;
	}

	const converted = [];
	structureKeys.forEach((key, index) => {
		const value = typeof currentValues[key] !== "undefined" ? currentValues[key] : null;
		converted.push(value);
	});
	return converted;
}

/**
 * Converts the currentValues of a structure control of type 'object'
 *  from an array of values to an array of objects.
 *  @isList boolean, true if this structure is a list
 *  @convert boolean, true if the current control values need to be converted.
 *    If false, need to determine if the subControls need to be converted
 *  Example currentValues: [[1, 2], [10, 20]]                || [9, 88, ["abc", "def"]]
 *  Example convertedValues: [{a: 1, b: 2}, {a: 10, b; 20}]  || {z: 9, y: 88, x: ["abc", "def"]}
 */
function convertArrayStructureToObject(isList, subControls, currentValues, convert) {
	const structureKeys = [];
	subControls.forEach((control) => {
		structureKeys.push(control.name);
	});

	if (isList && Array.isArray(currentValues)) {
		const convertedValues = [];
		currentValues.forEach((row, idx) => {
			if (convert) { // this control needs to be converted, convert all values in this row and determine if there are nested structures to be converted
				const newObject = {};
				structureKeys.forEach((key, keyIndex) => {
					// subControls that are type 'object' will need to be converted
					if (subControls[keyIndex].structureType && subControls[keyIndex].structureType === "object") { // nested object
						newObject[key] = convertArrayStructureToObject(subControls[keyIndex].valueDef.isList, subControls[keyIndex].subControls, row[keyIndex], true);
					} else if (typeof subControls.subControls !== "undefined") { // nested array
						newObject[key] = convertArrayStructureToObject(subControls[keyIndex].valueDef.isList, subControls[keyIndex].subControls, row[keyIndex], false);
					} else { // value
						newObject[key] = typeof row[keyIndex] !== "undefined" ? row[keyIndex] : null;
					}
				});
				convertedValues.push(newObject);
			} else { // determine if each value in the row is a nested structure that needs to be converted
				const convertedRow = [];
				row.forEach((field, index) => {
					let value = field;
					if (subControls[index].structureType && subControls[index].structureType === "object") {
						value = convertArrayStructureToObject(subControls[index].valueDef.isList, subControls[index].subControls, field, true);
					}
					convertedRow.push(value);
				});
				convertedValues.push(convertedRow);
			}
		});
		return convertedValues;
	}

	const converted = {};
	structureKeys.forEach((key, index) => {
		converted[key] = currentValues && typeof currentValues[index] !== "undefined" ? currentValues[index] : null;
	});
	return converted;
}

/**
 * Converts the input list of currentParameters into a simple array of field names
 * 	Will also remove invalid fields in currentParameters that are not in the data model.
 *
 * @param control the control to format the input list for
 * @param controlValues array of the currentControlValues
 * @param fields the filtered list of fields from the data model
 */
function getFieldsFromControlValues(control, controlValues, fields) {
	const dataColumnIndex = getTableFieldIndex(control);
	const outputList = [];
	if (controlValues && dataColumnIndex !== -1) {
		for (const controlValue of controlValues) {
			let fieldName = controlValue;
			if (Array.isArray(controlValue)) {
				fieldName = stringifyFieldValue(controlValue[dataColumnIndex], control);
			} else if (toType(controlValue) === "object") {
				fieldName = stringifyFieldValue(controlValue, control);
			}
			outputList.push(fieldName);
		}
	}
	return outputList;
}

/**
 * Returns the string field name for both string and object based field values.
 * If the control's propType is structure, return the combined schema and field names.
 *
 * @param value A field value. Can be string or object
 * @param control The control definition for the parameter
 * @param excludeSchema When true, exclude the schema prefix on compound entries
 * @return A string field name value or null
 */
function stringifyFieldValue(value, control, excludeSchema) {
	const theType = toType(value);
	if (theType === "object") {
		if (control && control.valueDef && value.link_ref) {
			let stringName;
			if (!excludeSchema) {
				stringName = value.link_ref + "." + value.field_name;
			} else {
				stringName = value.field_name;
			}
			return stringName;
		}
		return null;
	}
	return value;
}

/**
 * Returns true if the given field value matches the provided field prototype.
 *
 * @param fieldValue A persistent field value
 * @param fieldProto A field prototype structure
 * @return True if the field value matches the field prototype
 */
function fieldValueMatchesProto(fieldValue, fieldProto) {
	const theType = toType(fieldValue);
	if (theType === "object" && fieldValue.link_ref) {
		return fieldValue.link_ref === fieldProto.schema &&
						fieldValue.field_name === fieldProto.origName;
	}
	return fieldValue === fieldProto.name;
}

/**
 * Converts a display string for a field name into the value it is stored as.
 *
 * @param stringValue A field name, either plain or in schema.name format
 * @param The control The control
 * @param controller Properties controller
 * @return The field name in canonical format for storage (string or object)
 */
function fieldStringToValue(stringValue, control, controller) {
	if (control.role === "column" && control.valueDef.propType === "structure") {
		const dataModelFields = controller.getDatasetMetadataFields();
		for (const field of dataModelFields) {
			if (field.name === stringValue) {
				return { link_ref: field.schema, field_name: field.origName };
			}
		}
	}
	return stringValue;
}

function getDMDefault(subControlDef, fieldName, fields) {
	let defaultValue;
	const dmField = subControlDef.dmDefault;
	if (fieldName) {
		for (const field of fields) {
			if (field.name === fieldName) {
				switch (dmField) {
				case "type":
					defaultValue = field.type;
					break;
				case "description":
					defaultValue = field.metadata.description;
					break;
				case "measure":
					defaultValue = _findCorrespondingValue(field.metadata.measure, subControlDef.values);
					break;
				case "modeling_role":
					defaultValue = _findCorrespondingValue(field.metadata.modeling_role, subControlDef.values);
					break;
				default:
					break;
				}
				break;
			}
		}
	}
	return defaultValue;
}

function getDMFieldIcon(fields, value, iconType) {
	let icon;
	const correctField = fields.find(function(field) {
		return field.origName === value;
	});
	switch (iconType) {
	case "measure":
		if (!correctField) {
			return CARBON_ICONS.MEASUREMENTS.EMPTY;
		}
		switch (correctField.metadata.measure) {
		case "range":
			icon = CARBON_ICONS.MEASUREMENTS.SCALE;
			break;
		case "ordered_set":
			icon = CARBON_ICONS.MEASUREMENTS.ORDINAL;
			break;
		case "discrete":
			icon = CARBON_ICONS.MEASUREMENTS.DISCRETE;
			break;
		case "set":
			icon = CARBON_ICONS.MEASUREMENTS.NOMINAL;
			break;
		case "flag":
			icon = CARBON_ICONS.MEASUREMENTS.FLAG;
			break;
		case "collection":
			icon = CARBON_ICONS.MEASUREMENTS.NOMINAL;
			break;
		case "geospatial":
			icon = CARBON_ICONS.MEASUREMENTS.NOMINAL;
			break;
		default:
			icon = CARBON_ICONS.MEASUREMENTS.EMPTY;
			break;
		}
		break;
	case "type":
		if (!correctField) {
			return "typeEmpty";
		}
		switch (correctField.type) {
		case DATA_TYPE.DATE:
			icon = DATA_TYPE.DATE;
			break;
		case DATA_TYPE.TIME:
			icon = DATA_TYPE.TIME;
			break;
		case DATA_TYPE.TIMESTAMP:
			icon = DATA_TYPE.TIMESTAMP;
			break;
		case DATA_TYPE.STRING:
			icon = DATA_TYPE.STRING;
			break;
		case DATA_TYPE.INTEGER:
			icon = DATA_TYPE.INTEGER;
			break;
		case DATA_TYPE.DOUBLE:
			icon = DATA_TYPE.DOUBLE;
			break;
		default:
			icon = "typeEmpty";
			break;
		}
		break;
	default:
		break;
	}
	return icon;
}


// Attempts to synchronize the Modeler notions of measurement level
// and modeling role with those defined in datarecord-metadata.
function _findCorrespondingValue(input, values) {
	// First try for an exact match
	const idx = values.indexOf(input);
	if (idx > -1) {
		return values[idx];
	}
	// Next try for a case insensitive match
	const searchTerm = input.toLowerCase();
	for (const value of values) {
		if (searchTerm === value.toLowerCase()) {
			return value;
		}
	}
	// Finally try for a startsWith match
	for (const value of values) {
		if (searchTerm.startsWith(value.substring(0, 6).toLowerCase())) {
			return value;
		}
	}
	// Last resort: Return the original value
	return input;
}

// Convert the data types of currentParameters to the type defined in parameterDefs
function convertValueDataTypes(currentParameters, controls) {
	const convertedCurrentParameters = {};
	const currentParams = Object.keys(currentParameters);
	currentParams.forEach((paramName) => {
		const originalValue = currentParameters[paramName];
		if (!isUndefined(originalValue) && controls[paramName]) {
			const valueType = controls[paramName].valueDef.propType;
			const isList = controls[paramName].valueDef.isList;
			if (originalValue) {
				switch (valueType) {
				case "string": {
					if (isList) {
						convertedCurrentParameters[paramName] = originalValue.map((val) => val.toString());
					} else {
						convertedCurrentParameters[paramName] = originalValue.toString();
					}
					break;
				}
				case "integer": {
					if (isList) {
						convertedCurrentParameters[paramName] = originalValue.map((val) => parseInt(val, 10));
					} else {
						convertedCurrentParameters[paramName] = parseInt(originalValue, 10);
					}
					break;
				}
				case "double": {
					if (isList) {
						convertedCurrentParameters[paramName] = originalValue.map((val) => parseFloat(val));
					} else {
						convertedCurrentParameters[paramName] = parseFloat(originalValue);
					}
					break;
				}
				case "boolean": {
					if (isString(originalValue)) {
						convertedCurrentParameters[paramName] = originalValue === "true";
					} else { // Assume boolean
						convertedCurrentParameters[paramName] = Boolean(originalValue);
					}
					break;
				}
				default: { // arrays, objects, enum, password
					convertedCurrentParameters[paramName] = originalValue;
					break;
				}
				}
			} else { // null
				convertedCurrentParameters[paramName] = originalValue;
			}
		} else { // control is missing or current parameter is not set
			convertedCurrentParameters[paramName] = originalValue;
		}
	});
	return convertedCurrentParameters;
}

export {
	toType,
	formatMessage,
	evaluateText,
	getTableFieldIndex,
	isSubControlStructureObjectType,
	convertObjectStructureToArray,
	convertArrayStructureToObject,
	convertValueDataTypes,
	getFieldsFromControlValues,
	copy,
	stringifyFieldValue,
	fieldValueMatchesProto,
	fieldStringToValue,
	generateId,
	getDMDefault,
	getDMFieldIcon
};
