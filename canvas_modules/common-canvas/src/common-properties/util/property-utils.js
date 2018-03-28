/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "../../../utils/logger";
import { ParamRole } from "../constants/form-constants";

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

function formatMessage(intl, key, defaultMessage) {
	let formattedMessage;
	if (typeof intl !== "undefined" && intl !== null) {
		formattedMessage = intl.formatMessage({ id: key, defaultMessage: defaultMessage });
	} else {
		formattedMessage = defaultMessage;
	}
	return formattedMessage;
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
 * 	Will also remove invalid fields in currentParameters that are not in the data model
 * @param control the control to format the input list for
 * @param controlValues array of the currentControlValues
 * @param fields the filtered list of fields from the data model
 */
function getFieldsFromControlValues(control, controlValues, fields) {
	const dataColumnIndex = getTableFieldIndex(control);
	const outputList = [];
	if (controlValues) {
		for (const controlValue of controlValues) {
			const fieldName = Array.isArray(controlValue) ? controlValue[dataColumnIndex] : controlValue;
			if (isValidField(fieldName, fields)) {
				outputList.push(fieldName);
			}
		}
	}
	return outputList;
}

/**
 * Return the field if the field name is found in the data model, else undefined
 *
 * @param field current control value name
 * @param fields the filtered list of fields from the data model
 * @return field
 */
function isValidField(field, fields) {
	const foundField = fields.find(function(value) {
		return value.name === field || field === value.schema + "." + value.origName;
	});
	return foundField;
}


module.exports = {
	toType: toType,
	formatMessage: formatMessage,
	evaluateText: evaluateText,
	getTableFieldIndex: getTableFieldIndex,
	convertInputDataModel: convertInputDataModel,
	getFieldsFromControlValues: getFieldsFromControlValues,
	isValidField: isValidField
};
