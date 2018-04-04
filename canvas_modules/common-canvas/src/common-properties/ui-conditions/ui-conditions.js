/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 34] */
/* eslint max-depth: ["error", 7] */

import logger from "../../../utils/logger";
import PropertyUtils from "../util/property-utils.js";
import cloneDeep from "lodash/cloneDeep";
import intersectionWith from "lodash/intersectionWith";
import unionWith from "lodash/unionWith";
// import union from "lodash/union";
import isEqual from "lodash/isEqual";

/**
* @param {Object} definition Condition definition
* @param {Any} userInput Contains the control value entered by the user
* @param {Object} fields Optional datasetMetadata fields
* @param {Object} cellCoordinates Cell coordinates for tables
*/

function validateInput(definition, propertyId, controller) {
	const data = definition;
	if (data.validation) {
		return validation(data.validation, propertyId, controller);
	} else if (data.enabled) {
		return enabled(data.enabled, propertyId, controller);
	} else if (data.visible) {
		return visible(data.visible, propertyId, controller);
	} else if (data.enum_filter) {
		return filteredEnum(data.enum_filter, propertyId, controller);
	}
	throw new Error("Invalid user input validation definition schema");
}

/**
 * A single validation. The fail_message is displayed upon validation failure.
 * @param {Object} validationData contains an object that adheres to the validation_definition
 * @param {Any} userInput Contains the control value entered by the user
 * @param {Object} info optional dataset fields and cell coordinates info
 * @return {boolean} true if valid, failMessage {Object} if false.
 */
function validation(data, propertyId, controller) {
	if (data.fail_message && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller) || failedMessage(data.fail_message);
	}
	throw new Error("Invalid validation schema");
}

/**
 * Enablement test. Disables controls if evaluate is false.
 * @param {Object} enabledData contains an object that adheres to the enabled_definition
 * @return {boolean} true if valid.
 */
function enabled(data, propertyId, controller) {
	if ((data.parameter_refs || data.group_refs) && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid enabled schema");
}

/**
 * Visibility test. Hides controls if evaluate is false.
 * @param {Object} data contains an object that adheres to the visible_definition
 * @return {boolean} true if valid.
 */
function visible(data, propertyId, controller) {
	if ((data.parameter_refs || data.group_refs) && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid visible schema");
}

function filter(filterDef, controller, fields) {
	if (filterDef && filterDef.filter && filterDef.filter.evaluate) {
		return evaluateFilter(filterDef.filter.evaluate, controller, fields);
	}
	return fields;
}

function filteredEnum(data, propertyId, controller) {
	if (data.target && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid filteredEnum schema");
}

/**
 * Evaluate Definition
 */
function evaluate(data, propertyId, controller) {
	if (data.or) {
		return or(data.or, propertyId, controller);
	} else if (data.and) {
		return and(data.and, propertyId, controller);
	} else if (data.condition) { // condition
		return condition(data.condition, propertyId, controller);
	}
	throw new Error("Failed to parse definition");
}

/**
 * Evaluate Definition.
 */
function evaluateFilter(conditionItem, controller, fields) {
	if (conditionItem.or) {
		return orFilter(conditionItem.or, controller, fields);
	} else if (conditionItem.and) {
		return andFilter(conditionItem.and, controller, fields);
	} else if (conditionItem.condition) { // condition
		return conditionFilter(conditionItem.condition, controller, fields);
	}
	throw new Error("Failed to parse filter definition");
}

/**
 * The 'or' condition. Any sub-condition evaluates to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} info optional dataset fields and cell coordinates info
 * @return {boolean}
 */
function or(data, propertyId, controller) {
	for (let i = 0; i < data.length; i++) {
		const evaluated = evaluate(data[i], propertyId, controller);
		if (evaluated === true) {
			return true;
		}
	}
	return false;
}

function orFilter(conditionItems, controller, inFields) {
	let fields = [];
	for (const item of conditionItems) {
		const newFields = evaluateFilter(item, controller, inFields);
		fields = unionWith(fields, newFields, isEqual);
	}
	return fields;
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} info optional dataset fields and cell coordinates info
 * @return {boolean}
 */
function and(data, propertyId, controller) {
	for (let i = 0; i < data.length; i++) {
		const evaluated = evaluate(data[i], propertyId, controller);
		if (evaluated === false) {
			return false;
		} else if (typeof evaluated === "object") {
			return evaluated;
		}
	}
	return true;
}

function andFilter(conditionItems, controller, inFields) {
	let fields = cloneDeep(inFields);
	for (const item of conditionItems) {
		const newFields = evaluateFilter(item, controller, fields);
		fields = intersectionWith(fields, newFields, isEqual);
	}
	return fields;
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} data.op A single operator for the properties of the condition.
 * @param {Object} data.parameter_ref required parameter the condition checks for
 * @param {Object} data.parameter_2_ref optional parameter the condition checks for
 * @param {Object} data.value optional value the condition checks for
 * @param {Object} info optional dataset fields and cell coordinates info
 * @return {boolean} true if the parameter(s) satisfy the condition
 */
function condition(data, propertyId, controller) {
	const op = data.op;
	const param = data.parameter_ref;
	const param2 = data.parameter_2_ref;
	const value = data.value;

	const paramInfo = { param: param, id: _getPropertyIdFromParam(propertyId, param) };
	paramInfo.value = controller.getPropertyValue(paramInfo.id);
	paramInfo.control = controller.getControl(paramInfo.id);

	let param2Info;

	if (typeof param2 !== "undefined") {
		param2Info = {
			param: param2,
			id: _getPropertyIdFromParam(propertyId, param2),
		};
		param2Info.value = controller.getPropertyValue(param2Info.id);
		param2Info.control = controller.getControl(param2Info.id);
	}

	switch (op) {
	case "isEmpty":
		return _handleEmpty(paramInfo);
	case "isNotEmpty":
		return _handleNotEmpty(paramInfo);
	case "greaterThan":
		return _handleGreaterThan(paramInfo, param2Info, value, controller);
	case "lessThan":
		return _handleLessThan(paramInfo, param2Info, value, controller);
	case "equals":
		return _handleEquals(paramInfo, param2Info, value, controller);
	case "notEquals":
		return _handleNotEquals(paramInfo, param2Info, value, controller);
	case "contains":
		return _handleContains(paramInfo, param2Info, value, controller);
	case "notContains":
		return _handleNotContains(paramInfo, param2Info, value, controller);
	case "colNotExists":
		return _handleColNotExists(paramInfo, controller);
	case "cellNotEmpty":
		return _handleCellNotEmpty(paramInfo);
	default:
		logger.warn("Ignoring unknown condition operation '" + op + "' for parameter_ref " + param);
		return true;
	}
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} data.op A single operator for the properties of the condition.
 * @param {Object} data.value optional value the condition checks for
 * @param {Object} data.values optional value the condition checks for
 * @param {Object} info optional dataset fields and cell coordinates info
 */
function conditionFilter(conditionItem, controller, fields) {
	const op = conditionItem.op;
	const values = [];
	if (typeof conditionItem.value !== "undefined" && conditionItem.value !== null) {
		values.push(conditionItem.value);
	} else if (Array.isArray(conditionItem.values)) {
		values.push(...conditionItem.values); // add all values into array
	}
	switch (op) {
	case "dmMeasurement":
		return _handleDmMeasurement(fields, values);
	case "dmType":
		return _handleDmType(fields, values);
	case "dmModelingRole":
		return _handleDmModelingRole(fields, values);
	default:
		logger.warn("Ignoring unknown condition operation '" + op + "'");
		return fields;
	}
}

function _handleDmMeasurement(inFields, measurementValues) {
	let fields = cloneDeep(inFields);
	if (fields) {
		fields = fields.filter(function(field) {
			for (const measurementValue of measurementValues) {
				if (field.metadata && field.metadata.measure === measurementValue) {
					// return true of any value meets condition
					return true;
				}
			}
			return false;
		});
	}
	return fields;
}

function _handleDmType(inFields, typeValues) {
	let fields = cloneDeep(inFields);
	if (fields) {
		fields = fields.filter(function(field) {
			for (const typeValue of typeValues) {
				if (field.type === typeValue) {
					// return true of any value meets condition
					return true;
				}
			}
			return false;
		});
	}
	return fields;
}

function _handleDmModelingRole(inFields, roleValues) {
	let fields = cloneDeep(inFields);
	if (fields) {
		fields = fields.filter(function(field) {
			for (const roleValue of roleValues) {
				if (field.metadata && field.metadata.modeling_role === roleValue) {
					// return true of any value meets condition
					return true;
				}
			}
			return false;
		});
	}
	return fields;
}


function _handleEmpty(paramInfo) {
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
		return true;
	case "boolean":
		return paramInfo.value === false;
	case "string":
		return paramInfo.value.trim().length === 0;
	case "number":
		return paramInfo.value === null;
	case "object":
		return paramInfo.value === null ? true : paramInfo.value.length === 0;
	default:
		logger.warn("Ignoring condition operation 'isEmpty' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

function _handleNotEmpty(paramInfo) {
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
		return false;
	case "boolean":
		return paramInfo.value === true;
	case "string":
		return paramInfo.value.trim().length !== 0;
	case "number":
		return paramInfo.value !== null;
	case "object":
		return paramInfo.value === null ? false : paramInfo.value.length !== 0;
	default:
		logger.warn("Ignoring condition operation 'isNotEmpty' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

function _handleGreaterThan(paramInfo, param2Info, value, controller) {
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
	case "number":
		if (typeof param2Info !== "undefined") {
			if (typeof param2Info.value !== "number") {
				return false;
			}
			return paramInfo.value > param2Info.value;
		} else if (typeof value !== "undefined") {
			if (value === "null") {
				return true;
			}
			return paramInfo.value > value;
		}
		throw new Error("Insufficient parameter for condition operation 'greaterThan'");
	case "object":
		if (paramInfo.value === null || param2Info.value === null || value === null) {
			return true;
		}
		return false;
	default:
		logger.warn("Ignoring condition operation 'greaterThan' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

function _handleLessThan(paramInfo, param2Info, value, controller) {
	const dataType = typeof paramInfo.value;
	switch (dataType) {
	case "undefined":
	case "number":
		if (typeof param2Info !== "undefined") {
			if (typeof param2Info.value !== "number") {
				return false;
			}
			return paramInfo.value < param2Info.value;
		} else if (typeof value !== "undefined") {
			if (value === "null") {
				return true;
			}
			return paramInfo.value < value;
		}
		throw new Error("Insufficient parameter for condition operation 'lessThan'");
	case "object":
		if (paramInfo.value === null || param2Info.value === null || value === null) {
			return true;
		}
		return false;
	default:
		logger.warn("Ignoring condition operation 'lessThan' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
		return true;
	}
}

function _handleEquals(paramInfo, param2Info, value, controller) {
	if (paramInfo.control.controlType !== "passwordfield") {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value === param2Info.value;
			case "string":
				return paramInfo.value.trim() === param2Info.value.trim();
			case "object":
				if (paramInfo.value === null) {
					return paramInfo.value === param2Info.value;
				}
				return JSON.stringify(paramInfo.value) === JSON.stringify(param2Info.value);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value === value;
			case "string":
				return paramInfo.value.trim() === value.trim();
			case "object":
				if (paramInfo.value === null) {
					return paramInfo.value === value;
				}
				return JSON.stringify(paramInfo.value) === JSON.stringify(value);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation equals");
	}
	logger.warn("Ignoring unsupported condition operation 'equals' for control type " + paramInfo.control.controlType);
	return true;
}

function _handleNotEquals(paramInfo, param2Info, value, controller) {
	if (paramInfo.control.controlType !== "passwordfield") {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value !== param2Info.value;
			case "string":
				return paramInfo.value.trim() !== param2Info.value.trim();
			case "object":
				if (paramInfo.value === null) {
					return paramInfo.value !== param2Info.value;
				}
				return JSON.stringify(paramInfo.value) !== JSON.stringify(param2Info.value);
			default:
				logger.warn("Ignoring condition operation 'notEquals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "undefined":
			case "boolean":
			case "number":
				return paramInfo.value !== value;
			case "string":
				return paramInfo.value.trim() !== value.trim();
			case "object":
				if (paramInfo.value === null) {
					return paramInfo.value !== value;
				}
				return JSON.stringify(paramInfo.value) !== JSON.stringify(value);
			default:
				logger.warn("Ignoring condition operation 'notEquals' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation notEquals");
	}
	logger.warn("Ignoring unsupported condition operation 'notEquals' for control type " + paramInfo.control.controlType);
	return true;
}

function _handleContains(paramInfo, param2Info, value, controller) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield"];
	if (unsupportedControls.indexOf(paramInfo.control.controlType) < 0) {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
				return false;
			case "string":
				if (param2Info.value === "") {
					return false;
				}
				return paramInfo.value.indexOf(param2Info.value) >= 0;
			case "object":
				return paramInfo.value === null ? false : _searchInArray(paramInfo.value, param2Info.value, false);
			default:
				logger.warn("Ignoring condition operation 'contains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "undefined":
				return false;
			case "string":
				return paramInfo.value.indexOf(value) >= 0;
			case "object":
				return paramInfo.value === null ? false : _searchInArray(paramInfo.value, value, false);
			default:
				logger.warn("Ignoring condition operation 'contains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation contains");
	}
	logger.warn("Ignoring unsupported condition operation 'contains' for control type " + paramInfo.control.controlType);
	return true;
}

function _handleNotContains(paramInfo, param2Info, value, controller) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield"];
	if (unsupportedControls.indexOf(paramInfo.control.controlType) < 0) {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
				return true;
			case "string":
				if (param2Info.value === "") {
					return true;
				}
				return paramInfo.value.indexOf(param2Info.value) < 0;
			case "object":
				return paramInfo.value === null ? true : !_searchInArray(paramInfo.value, param2Info.value, false);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "undefined":
				return true;
			case "string":
				return paramInfo.value.indexOf(value) < 0;
			case "object":
				return paramInfo.value === null ? true : !_searchInArray(paramInfo.value, value, false);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation notContains");
	}
	logger.warn("Ignoring unsupported condition operation 'notContains' for control type " + paramInfo.control.controlType);
	return true;
}

function _handleColNotExists(paramInfo, controller) {
	const supportedControls = ["textfield", "structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const dataModelFields = controller.getDatasetMetadataFields();
		if (!dataModelFields) {
			return true;
		}
		for (const field of dataModelFields) {
			if (field.name === paramInfo.value) {
				return false;
			}

		}
		return true;
	}
	logger.warn("Ignoring unsupported condition operation 'colNotExists' for control type " + paramInfo.control.controlType);
	return true;
}

function _handleCellNotEmpty(paramInfo) {
	const supportedControls = ["structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const type = PropertyUtils.toType(paramInfo.value);
		return type !== "undefined" && type !== "null" && String(paramInfo.value).length > 0;
	}
	logger.warn("Ignoring unsupported condition operation 'cellNotEmpty' for control type " + paramInfo.control.controlType);
	return true;
}

/**
 *
 * @param {Object} failedMessage message object with "focus_parameter_ref" and "message"
 * @return {String} failed message
 */
function failedMessage(failedErrorMessage) {
	if (failedErrorMessage.focus_parameter_ref && failedErrorMessage.message) {
		return {
			"text": failedErrorMessage.message.default,
			"type": failedErrorMessage.type
		};
	}
	return "Failed to parse failedMessage";
}

function _searchInArray(array, element, state) {
	let found = state;
	for (let i = 0; i < array.length; i++) {
		if (Array.isArray(array[i])) {
			found = _searchInArray(array[i], element, found);
		} else if (typeof array[i] === "string" && array[i].indexOf(element) >= 0) {
			found = true;
		} else if (array[i] === element) { // compare whole cell
			found = true;
		}
		if (found) {
			return true;
		}
	}
	return found;
}

function _getPropertyIdFromParam(propertyId, param) {
	const paramPropertyID = cloneDeep(propertyId);
	paramPropertyID.name = param;
	const offset = param.indexOf("[");
	if (offset > -1) {
		paramPropertyID.name = param.substring(0, offset);
		paramPropertyID.col = _getColumnNumber(param);
	}
	return paramPropertyID;
}

// returns -1 if no column specified in parameter
function _getColumnNumber(param) {
	const startCol = param.indexOf("[");
	if (startCol > -1) {
		const endCol = param.indexOf("]");
		if (endCol > -1) {
			return parseInt(param.substring(startCol + 1, endCol), 10);
		}
		return -1;
	}
	return -1;
}

module.exports = {
	validateInput: validateInput,
	filter: filter
};
