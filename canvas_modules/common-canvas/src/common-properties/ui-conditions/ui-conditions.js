/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7] */

import logger from "./../../../utils/logger";
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
	} else if (data.allow_change) {
		return allowChange(data.allow_change, propertyId, controller);

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
		const result = evaluate(data.evaluate, propertyId, controller);
		if (typeof result === "object") {
			return result;
		}
		return result || failedMessage(data.fail_message);
	}
	throw new Error("Invalid validation schema");
}

/**
 * Enablement test. Disables controls if evaluate is false.
 * @param {Object} enabledData contains an object that adheres to the enabled_definition
 * @return {boolean} true if valid.
 */
function enabled(data, propertyId, controller) {
	if ((data.parameter_refs || data.group_refs || data.action_refs) && data.evaluate) {
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
	if ((data.parameter_refs || data.group_refs || data.action_refs) && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid visible schema");
}

/**
 * Filters fields based on conditions.
 *
 * @param propertyId Id of the control being filtered
 * @param filterDef A filter definition for this item
 * @param controller Properties controller
 * @param fields Fields to filter
 * @return Array of filtered fields
 */
function filter(propertyId, filterDef, controller, fields) {
	if (filterDef && filterDef.filter && filterDef.filter.evaluate) {
		return evaluateFilter(propertyId, filterDef.filter, filterDef.filter.evaluate, controller, fields);
	}
	return fields;
}

function filteredEnum(data, propertyId, controller) {
	if (data.target && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid filteredEnum schema");
}

function allowChange(data, propertyId, controller) {
	if ((data.parameter_refs || data.group_refs) && data.evaluate) {
		return evaluate(data.evaluate, propertyId, controller);
	}
	throw new Error("Invalid allow change schema");
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
function evaluateFilter(propertyId, filterItem, conditionItem, controller, fields) {
	if (conditionItem.or) {
		return orFilter(propertyId, filterItem, conditionItem.or, controller, fields);
	} else if (conditionItem.and) {
		return andFilter(propertyId, filterItem, conditionItem.and, controller, fields);
	} else if (conditionItem.condition) { // condition
		return conditionFilter(propertyId, filterItem, conditionItem.condition, controller, fields);
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

function orFilter(propertyId, filterItem, conditionItems, controller, inFields) {
	let fields = [];
	for (const item of conditionItems) {
		const newFields = evaluateFilter(propertyId, filterItem, item, controller, inFields);
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

function andFilter(propertyId, filterItem, conditionItems, controller, inFields) {
	let fields = cloneDeep(inFields);
	for (const item of conditionItems) {
		const newFields = evaluateFilter(propertyId, filterItem, item, controller, fields);
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
	const operation = controller.getConditionOp(op);
	if (operation) {
		return operation(paramInfo, param2Info, value, controller);
	}
	logger.warn("Ignoring unknown condition operation '" + op + "' for parameter_ref " + param);
	return true;
}

/**
 * A filter parameter condition. Evaluates to an array of field names.
 *
 * @param {Object} propertyId Id of the property being operated upon
 * @param {Object} filterItem Top level filter entry for the property
 * @param {Object} conditionItem A single condition to evaluate
 * @param {Object} controller The properties controller
 * @param {Object} fields Array of fields to filter
 * @return {Object} Array of filtered field names
 */
function conditionFilter(propertyId, filterItem, conditionItem, controller, fields) {
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
	case "dmSharedFields":
		return _handleSharedFields(propertyId, filterItem, controller, fields);
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

function _handleSharedFields(propertyId, filterItem, controller, fields) {
	let returnFields = fields;
	if (filterItem.parameter_refs) {
		returnFields = controller.filterFieldsFromSharedProps(fields, filterItem.parameter_refs, propertyId.name);
	}
	return returnFields;
}

/**
 *
 * @param {Object}  failed message object with "focus_parameter_ref" and "message"
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
