/*
 * Copyright 2017-2020 IBM Corporation
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

import logger from "../../../utils/logger";
import { ParamRole } from "../constants/form-constants";
import { DATA_TYPE } from "../constants/constants";
import cloneDeep from "lodash/cloneDeep";
import uuid4 from "uuid/v4";

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

function formatMessage(intl, key, defaultMessage, substituteObj) {
	let formattedMessage;
	if (typeof intl !== "undefined" && intl !== null) {
		formattedMessage = intl.formatMessage({ id: key, defaultMessage: defaultMessage }, substituteObj);
	} else {
		formattedMessage = defaultMessage;
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

// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
/**
 * Converts old style Modeler inputDataModel into newer datasetMetadata
 */
function convertInputDataModel(dataModel) {
	const datasetMetadata = {};
	datasetMetadata.fields = [];
	if (dataModel && dataModel.columns) {
		for (const column of dataModel.columns) {
			const field = {};
			field.name = column.name;
			field.type = convertType(column.storage);
			field.metadata = {};
			field.metadata.description = "";
			if (column.measure) {
				field.metadata.measure = column.measure.toLowerCase();
			}
			if (column.modelingRole) {
				field.metadata.modeling_role = column.modelingRole.toLowerCase();
			}
			datasetMetadata.fields.push(field);
		}
	}
	return datasetMetadata;
}

/**
 * Converts from Modeler storage to WML type.
 */
function convertType(storage) {
	let retVal = storage.toLowerCase();
	if (storage === "Real") {
		retVal = "double";
	}
	return retVal;
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
			return "measurementEmpty";
		}
		switch (correctField.metadata.measure) {
		case "range":
			icon = "measurementScale";
			break;
		case "ordered_set":
			icon = "measurementOrdinal";
			break;
		case "discrete":
			icon = "measurementDiscrete";
			break;
		case "set":
			icon = "measurementNominal";
			break;
		case "flag":
			icon = "measurementFlag";
			break;
		case "collection":
			icon = "measurementNominal";
			break;
		case "geospatial":
			icon = "measurementNominal";
			break;
		default:
			icon = "measurementEmpty";
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

module.exports = {
	toType: toType,
	formatMessage: formatMessage,
	evaluateText: evaluateText,
	getTableFieldIndex: getTableFieldIndex,
	convertInputDataModel: convertInputDataModel,
	getFieldsFromControlValues: getFieldsFromControlValues,
	copy: copy,
	stringifyFieldValue: stringifyFieldValue,
	fieldValueMatchesProto: fieldValueMatchesProto,
	fieldStringToValue: fieldStringToValue,
	generateId: generateId,
	getDMDefault: getDMDefault,
	getDMFieldIcon: getDMFieldIcon
};
