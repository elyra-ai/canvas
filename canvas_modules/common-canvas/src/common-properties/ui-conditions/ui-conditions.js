/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
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
import union from "lodash/union";
import isEqual from "lodash/isEqual";

const ERROR = "error";
const WARNING = "warning";
function evaluateInput(validationDefinition, userInput, control, dataModel, requiredParameters, propertyId, controller) {
	let output;
	try {
		if ((control.valueDef && control.valueDef.isMap) || (typeof propertyId.col !== "undefined")) {
			output = _validateTable(validationDefinition, userInput, control, dataModel, requiredParameters, propertyId, controller);
		} else {
			output = validateInput(validationDefinition, userInput, control.controlType, dataModel,
				{}, requiredParameters);
		}
	} catch (error) {
		logger.warn("Error thrown in validation: " + error);
	}
	return output;
}

function _validateTable(validationDefinition, userInput, control, dataModel, requiredParameters, propertyId, controller) {
	let output;
	const coordinates = {};
	// get the control for the table,
	// need to use controller.getControl({ name: propertyId.name })so it does not return the control for the cell.
	const tableControl = (propertyId.col) ? controller.getControl({ name: propertyId.name }) : null;
	const tableControlName = propertyId.name;
	const rowIndex = propertyId.row;
	const colIndex = propertyId.col;
	const tableControlType = (propertyId.col) ? tableControl.controlType : control.controlType;
	const fieldIndex = PropertyUtils.getTableFieldIndex(tableControl ? tableControl : control);

	// only evaluate table cells if the validation definition has  condition for a cell
	const columnNumbers = getColumnsFromValidation(validationDefinition);
	if (columnNumbers.length > 0) {
		// For tables we need to evaluate all cells
		const cellValues = userInput[tableControlName];
		for (let row = 0; row < cellValues.length; row++) {
			for (let col = 0; col < cellValues[row].length; col++) {
				coordinates.rowIndex = row;
				coordinates.colIndex = col;
				if (fieldIndex >= 0) {
					coordinates.skipVal = cellValues[row][fieldIndex];
				}
				// only run validation on columns defined in validation
				var tmp = null;
				if (columnNumbers.indexOf(col) > -1) {
					tmp = validateInput(validationDefinition, userInput, tableControlType, dataModel,
						coordinates, requiredParameters, controller);
				}

				// only set the error for the current cell
				const isError = PropertyUtils.toType(tmp) === "object";
				if (PropertyUtils.toType(rowIndex) === "number" && PropertyUtils.toType(colIndex) === "number") {
					if (row === rowIndex && col === colIndex && isError) {
						output = tmp;
						output.isActiveCell = true;
					}
				}
			}
		}
	} else {
		// no table cells in defintion then evaluate the table
		output = validateInput(validationDefinition, userInput, control.controlType, dataModel,
			coordinates, requiredParameters);
	}
	return output;
}

function getColumnsFromValidation(validationDefinition) {
	let columnNumbers = [];
	if (validationDefinition.validation && validationDefinition.validation.evaluate) {
		const evaluateDef = validationDefinition.validation.evaluate;
		if (evaluateDef.condition) {
			columnNumbers = union(columnNumbers, getColumnsFromCondition(columnNumbers, evaluateDef.condition));
		} else if (evaluateDef.and) {
			for (const andCondition of evaluateDef.and) {
				columnNumbers = union(columnNumbers, getColumnsFromCondition(columnNumbers, andCondition.condition));
			}
		} else if (evaluateDef.or) {
			for (const orCondition of evaluateDef.or) {
				columnNumbers = union(columnNumbers, getColumnsFromCondition(columnNumbers, orCondition.condition));
			}
		}
	}
	return columnNumbers;
}

function getColumnsFromCondition(columnNumbers, cellCondition) {
	if (cellCondition.parameter_ref && cellCondition.parameter_ref.indexOf("[") > -1) {
		columnNumbers.push(_getColumnNumber(cellCondition.parameter_ref));
	}
	if (cellCondition.parameter_2_ref && cellCondition.parameter_2_ref.indexOf("[") > -1) {
		columnNumbers.push(_getColumnNumber(cellCondition.parameter_2_ref));
	}
	return columnNumbers;
}

/**
* @param {Object} definition Condition definition
* @param {Any} userInput Contains the control value entered by the user
* @param {Object} dataModel Optional data model
* @param {Object} cellCoordinates Cell coordinates for tables
*/
function validateInput(definition, userInput, controlType, dataModel, cellCoordinates, requiredParameters) {
	const data = definition;
	const info = {
		controlType: controlType,
		dataModel: dataModel,
		cellCoordinates: cellCoordinates,
		requiredParameters: requiredParameters
	};
	if (data.validation) {
		return validation(data.validation, userInput, info);
	} else if (data.enabled) {
		return enabled(data.enabled, userInput, info);
	} else if (data.visible) {
		return visible(data.visible, userInput, info);
	} else if (data.filtered_enum) {
		return filteredEnum(data.filtered_enum, userInput, info);
	}
	throw new Error("Invalid user input validation definition schema");
}

/**
 * A single validation. The fail_message is displayed upon validation failure.
 * @param {Object} validationData contains an object that adheres to the validation_definition
 *	 "validation_definition": {
 *		 "properties": {
 *			 "validation": {
 *				 "description": "A single validation. The fail_message is displayed upon validation failure.",
 *				 "type": "object",
 *				 "properties": {
 *					 "fail_message": {
 *						 "description": "Error/warning",
 *						 "type": "object",
 *						 "$ref": "#/definitions/failMessage_definition"
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				 "required": ["fail_message", "evaluate"]
 *			 }
 *		 },
 *		 "required": ["validation"]
 *	 }
 * @param {Any} userInput Contains the control value entered by the user
 * @param {Object} info optional dataset metadata and cell coordinates info
 * @return {boolean} true if valid, failMessage {Object} if false.
 */
function validation(validationData, userInput, info) {
	const data = validationData;
	info.conditionType = "validation";
	if (data.fail_message && data.evaluate) {
		return evaluate(data.evaluate, userInput, info) || failedMessage(data.fail_message);
	}
	throw new Error("Invalid validation schema");
}

/**
 * Enablement test. Disables controls if evaluate is false.
 * @param {Object} enabledData contains an object that adheres to the enabled_definition
 *	 "enabled_definition": {
 *		 "properties": {
 *			 "enabled": {
 *				 "description": "Enablement test. Disables controls if evaluate is false.",
 *				 "type": "object",
 *				 "properties": {
 *					 "parameter_refs": {
 *						 "description": "Array of parameter names affected by this operation",
 *						 "type": "array",
 *						 "minItems": 1,
 *						 "items": {
 *							 "type": "string"
 *						 },
 *						 "uniqueItems": true
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				"required": ["parameter_refs, evaluate"]
 *			 }
 *		 },
 *		"required": ["enabled"]
 *	 }
 * @return {boolean} true if valid.
 */
function enabled(enabledData, userInput, info) {
	const data = enabledData;
	info.conditionType = "enabled";
	if (data.parameter_refs && data.evaluate) {
		return evaluate(data.evaluate, userInput, info);
	}
	throw new Error("Invalid enabled schema");
}

/**
 * Visibility test. Hides controls if evaluate is false.
 * @param {Object} data contains an object that adheres to the visible_definition
 *	 "visible_definition": {
 *		 "properties": {
 *			 "visible": {
 *				 "description": "Visibility test. Hides controls if evaluate is false.",
 *				 "type": "object",
 *				 "properties": {
 *					 "parameter_refs": {
 *						 "description": "Array of parameter names affected by this operation",
 *						 "type": "array",
 *						 "minItems": 1,
 *						 "items": {
 *							 "type": "string"
 *						 },
 *						 "uniqueItems": true
 *					 },
 *					 "evaluate": {
 *						 "description": "Evaluates to a boolean result",
 *						 "type": "object",
 *						 "$ref": "#/definitions/evaluate_definition"
 *					 }
 *				 },
 *				"required": ["parameter_refs, evaluate"]
 *			 }
 *		 },
 *		"required": ["visible"]
 *	 }
 * @return {boolean} true if valid.
 */
function visible(visibleData, userInput, info) {
	const data = visibleData;
	info.conditionType = "visible";
	if (data.parameter_refs && data.evaluate) {
		return evaluate(data.evaluate, userInput, info);
	}
	throw new Error("Invalid visible schema");
}

function filter(filterDef, controller, datasetMetadata) {
	if (filterDef && filterDef.filter && filterDef.filter.evaluate) {
		return evaluateFilter(filterDef.filter.evaluate, controller, datasetMetadata);
	}
	return datasetMetadata;
}

function filteredEnum(filteredEnumData, userInput, info) {
	const data = filteredEnumData;
	info.conditionType = "filteredEnum";
	if (data.target && data.evaluate) {
		return evaluate(data.evaluate, userInput, info);
	}
	throw new Error("Invalid filteredEnum schema");
}

/**
 * Evaluate Definition
 */
function evaluate(data, userInput, info) {
	if (data.or) {
		return or(data.or, userInput, info);
	} else if (data.and) {
		return and(data.and, userInput, info);
	} else if (data.condition) { // condition
		return condition(data.condition, userInput, info);
	}
	throw new Error("Failed to parse definition");
}

/**
 * Evaluate Definition.
 */
function evaluateFilter(conditionItem, controller, datasetMetadata) {
	if (conditionItem.or) {
		return orFilter(conditionItem.or, controller, datasetMetadata);
	} else if (conditionItem.and) {
		return andFilter(conditionItem.and, controller, datasetMetadata);
	} else if (conditionItem.condition) { // condition
		return conditionFilter(conditionItem.condition, controller, datasetMetadata);
	}
	throw new Error("Failed to parse filter definition");
}

/**
 * The 'or' condition. Any sub-condition evaluates to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} info optional dataset metadata and cell coordinates info
 * @return {boolean}
 */
function or(data, userInput, info) {
	for (let i = 0; i < data.length; i++) {
		const evaluated = evaluate(data[i], userInput, info);
		if (evaluated === true) {
			return true;
		}
	}
	return false;
}

function orFilter(conditionItems, controller, datasetMetadata) {
	const filteredDataset = cloneDeep(datasetMetadata);
	for (let idx = 0; idx < datasetMetadata.length; idx++) {
		if (datasetMetadata[idx].fields) {
			filteredDataset[idx].fields = [];
			for (const item of conditionItems) {
				const newData = evaluateFilter(item, controller, datasetMetadata[idx]);
				filteredDataset[idx].fields = unionWith(filteredDataset[idx].fields, newData.fields, isEqual);
			}
		}
	}
	return filteredDataset;
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @param {string} userInput User-entered value to evaluate
 * @param {Object} info optional dataset metadata and cell coordinates info
 * @return {boolean}
 */
function and(data, userInput, info) {
	for (let i = 0; i < data.length; i++) {
		const evaluated = evaluate(data[i], userInput, info);
		if (evaluated === false) {
			return false;
		} else if (typeof evaluated === "object") {
			return evaluated;
		}
	}
	return true;
}

function andFilter(conditionItems, controller, datasetMetadata) {
	const filteredData = cloneDeep(datasetMetadata);
	for (const schema of filteredData) {
		if (schema.fields) {
			for (const item of conditionItems) {
				const newData = evaluateFilter(item, controller, schema);
				schema.fields = intersectionWith(schema.fields, newData.fields, isEqual);
			}
		}
	}
	return filteredData;
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} data.op A single operator for the properties of the condition.
 * @param {Object} data.parameter_ref required parameter the condition checks for
 * @param {Object} data.parameter_2_ref optional parameter the condition checks for
 * @param {Object} data.value optional value the condition checks for
 * @param {Object} info optional dataset metadata and cell coordinates info
 * @return {boolean} true if the parameter(s) satisfy the condition
 */
function condition(data, userInput, info) {
	const op = data.op;
	const param = data.parameter_ref;
	const param2 = data.parameter_2_ref;
	const value = data.value;

	// Separate any complex type sub-control reference
	let paramName = param;
	const offset = param.indexOf("[");
	const row = info.cellCoordinates ? info.cellCoordinates.rowIndex : 0;
	let column = info.cellCoordinates ? info.cellCoordinates.colIndex : 0;
	if (offset > -1) {
		paramName = param.substring(0, offset);
		column = _getColumnNumber(param);
	}

	// validate if userInput has param's input
	if (typeof userInput[paramName] === "undefined") {
		// console.log("userInput: \n" + JSON.stringify(userInput));
		throw new Error("param " + paramName + " not found in userInput");
	}

	const paramInput = _getUserInput(userInput, paramName, { rowIndex: row, colIndex: column });

	if (typeof param2 !== "undefined" && info.conditionType && info.conditionType === "validation" &&
		op !== "isEmpty" && op !== "isNotEmpty" && op !== "cellNotEmpty") {
		const valid = _validateParams(userInput, param, info.requiredParameters, ERROR);
		if (typeof valid === "object") {
			return valid;
		}
	}

	switch (op) {
	case "isEmpty":
		return _handleEmpty(param, paramInput);
	case "isNotEmpty":
		return _handleNotEmpty(param, paramInput);
	case "greaterThan":
		return _handleGreaterThan(param, paramInput, userInput, param2, value, info);
	case "lessThan":
		return _handleLessThan(param, paramInput, userInput, param2, value, info);
	case "equals":
		return _handleEquals(param, paramInput, userInput, param2, value, info);
	case "notEquals":
		return _handleNotEquals(param, paramInput, userInput, param2, value, info);
	case "contains":
		return _handleContains(param, paramInput, userInput, param2, value, info);
	case "notContains":
		return _handleNotContains(param, paramInput, userInput, param2, value, info);
	case "colNotExists":
		return _handleColNotExists(paramInput, info);
	case "cellNotEmpty":
		return _handleCellNotEmpty(paramInput, info);
	default:
		logger.warn("Ignoring unknown condition operation '" + op + "' for parameter_ref " + param);
		return true;
	}
}

/**
 * A parameter condition. Evaluates to true or false.
 * @param {Object} data.op A single operator for the properties of the condition.
 * @param {Object} data.value optional value the condition checks for
 * @param {Object} info optional dataset metadata and cell coordinates info
 */
function conditionFilter(conditionItem, controller, datasetMetadata) {
	const op = conditionItem.op;
	const value = conditionItem.value;
	switch (op) {
	case "dmMeasurement":
		return _handleDmMeasurement(datasetMetadata, value);
	case "dmType":
		return _handleDmType(datasetMetadata, value);
	default:
		logger.warn("Ignoring unknown condition operation '" + op + "'");
		return datasetMetadata;
	}
}

function _handleDmMeasurement(datasetMetadata, measurementValue) {
	const filterDM = cloneDeep(datasetMetadata);
	// TODO: reduce dup code. recursion here needs to handle both arrays and objects
	if (Array.isArray(filterDM)) {
		for (const schema of filterDM) {
			if (schema.fields) {
				const filteredFields = schema.fields.filter(function(field) {
					if (field.metadata.measure === measurementValue) {
						return true;
					}
					return false;
				});
				schema.fields = filteredFields;
			}
		}
	} else {
		const filteredFields = filterDM.fields.filter(function(field) {
			if (field.metadata.measure === measurementValue) {
				return true;
			}
			return false;
		});
		filterDM.fields = filteredFields;
	}
	return filterDM;
}

function _handleDmType(datasetMetadata, typeValue) {
	const filterDM = cloneDeep(datasetMetadata);
	if (Array.isArray(filterDM)) {
		for (const schema of filterDM) {
			if (schema.fields) {
				const filteredFields = schema.fields.filter(function(field) {
					if (field.type === typeValue) {
						return true;
					}
					return false;
				});
				schema.fields = filteredFields;
			}
		}
	} else {
		const filteredFields = filterDM.fields.filter(function(field) {
			if (field.type === typeValue) {
				return true;
			}
			return false;
		});
		filterDM.fields = filteredFields;
	}
	return filterDM;
}

function _getUserInput(userInput, param, cellCoordinates) {
	const paramInput = userInput[param];
	if (PropertyUtils.toType(paramInput) === "array" &&
			PropertyUtils.toType(cellCoordinates) === "object" &&
			PropertyUtils.toType(cellCoordinates.colIndex) === "number") {
		if (PropertyUtils.toType(cellCoordinates.rowIndex) === "number" &&
				paramInput.length > cellCoordinates.rowIndex &&
				paramInput[cellCoordinates.rowIndex].length > cellCoordinates.colIndex) {
			// Tables have rows and columns
			return paramInput[cellCoordinates.rowIndex][cellCoordinates.colIndex];
		} else if (paramInput.length > cellCoordinates.colIndex) {
			// Plain structures have only columns
			return paramInput[cellCoordinates.colIndex];
		}
	}
	return paramInput;
}

function _validateParams(userInput, param, requiredParameters, errorType) {
	let failMessage;
	if ((userInput[param] === null || userInput[param] === "") && requiredParameters.indexOf(param) !== -1) {
		const internalError = {
			focus_parameter_ref: param,
			message: {
				default: param + " is missing an input value for validation."
			},
			type: errorType
		};
		failMessage = failedMessage(internalError);
	}
	return failMessage;
}

function _handleEmpty(param, paramInput) {
	const dataType = typeof paramInput;
	switch (dataType) {
	case "boolean":
		return paramInput === false;
	case "string":
		return paramInput.trim().length === 0;
	case "number":
		return paramInput === null;
	case "object":
		return paramInput === null ? true : paramInput.length === 0;
	default:
		logger.warn("Ignoring condition operation 'isEmpty' for parameter_ref " + param + " with input data type " + dataType);
		return true;
	}
}

function _handleNotEmpty(param, paramInput) {
	const dataType = typeof paramInput;
	switch (dataType) {
	case "boolean":
		return paramInput === true;
	case "string":
		return paramInput.trim().length !== 0;
	case "number":
		return paramInput !== null;
	case "object":
		return paramInput === null ? false : paramInput.length !== 0;
	default:
		logger.warn("Ignoring condition operation 'isNotEmpty' for parameter_ref " + param + " with input data type " + dataType);
		return true;
	}
}

function _handleGreaterThan(param, paramInput, userInput, param2, value, info) {
	const dataType = typeof paramInput;
	switch (dataType) {
	case "number":
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}
			if (typeof userInput[param2] !== "number") {
				return false;
			}
			return paramInput > userInput[param2];
		} else if (typeof value !== "undefined") {
			if (value === "null") {
				return true;
			}
			return paramInput > value;
		}
		throw new Error("Insufficient parameter for condition operation 'greaterThan'");
	case "object":
		if (paramInput === null || userInput[param2] === null || value === null) {
			return true;
		}
		return false;
	default:
		logger.warn("Ignoring condition operation 'greaterThan' for parameter_ref " + param + " with input data type " + dataType);
		return true;
	}
}

function _handleLessThan(param, paramInput, userInput, param2, value, info) {
	const dataType = typeof paramInput;
	switch (dataType) {
	case "number":
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}
			if (typeof userInput[param2] !== "number") {
				return false;
			}
			return paramInput < userInput[param2];
		} else if (typeof value !== "undefined") {
			if (value === "null") {
				return true;
			}
			return paramInput < value;
		}
		throw new Error("Insufficient parameter for condition operation 'lessThan'");
	case "object":
		if (paramInput === null || userInput[param2] === null || value === null) {
			return true;
		}
		return false;
	default:
		logger.warn("Ignoring condition operation 'lessThan' for parameter_ref " + param + " with input data type " + dataType);
		return true;
	}
}

function _handleEquals(param, paramInput, userInput, param2, value, info) {
	if (info.controlType !== "passwordfield") {
		const dataType = typeof paramInput;
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}

			switch (dataType) {
			case "boolean":
			case "number":
				return paramInput === userInput[param2];
			case "string":
				return paramInput.trim() === userInput[param2].trim();
			case "object":
				if (paramInput === null) {
					return paramInput === userInput[param2];
				}
				return JSON.stringify(paramInput) === JSON.stringify(userInput[param2]);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "boolean":
			case "number":
				return paramInput === value;
			case "string":
				return paramInput.trim() === value.trim();
			case "object":
				if (paramInput === null) {
					return paramInput === value;
				}
				return JSON.stringify(paramInput) === JSON.stringify(value);
			default:
				logger.warn("Ignoring condition operation 'equals' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation equals");
	}
	logger.warn("Ignoring unsupported condition operation 'equals' for control type " + info.controlType);
	return true;
}

function _handleNotEquals(param, paramInput, userInput, param2, value, info) {
	if (info.controlType !== "passwordfield") {
		const dataType = typeof paramInput;
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}

			switch (dataType) {
			case "boolean":
			case "number":
				return paramInput !== userInput[param2];
			case "string":
				return paramInput.trim() !== userInput[param2].trim();
			case "object":
				if (paramInput === null) {
					return paramInput !== userInput[param2];
				}
				return JSON.stringify(paramInput) !== JSON.stringify(userInput[param2]);
			default:
				logger.warn("Ignoring condition operation 'notEquals' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "boolean":
			case "number":
				return paramInput !== value;
			case "string":
				return paramInput.trim() !== value.trim();
			case "object":
				if (paramInput === null) {
					return paramInput !== value;
				}
				return JSON.stringify(paramInput) !== JSON.stringify(value);
			default:
				logger.warn("Ignoring condition operation 'notEquals' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation notEquals");
	}
	logger.warn("Ignoring unsupported condition operation 'notEquals' for control type " + info.controlType);
	return true;
}

function _handleContains(param, paramInput, userInput, param2, value, info) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield"];
	if (unsupportedControls.indexOf(info.controlType) < 0) {
		const dataType = typeof paramInput;
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}

			switch (dataType) {
			case "string":
				return paramInput.indexOf(userInput[param2]) >= 0;
			case "object":
				return paramInput === null ? false : _searchInArray(paramInput, userInput[param2], false);
			default:
				logger.warn("Ignoring condition operation 'contains' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "string":
				return paramInput.indexOf(value) >= 0;
			case "object":
				return paramInput === null ? false : _searchInArray(paramInput, value, false);
			default:
				logger.warn("Ignoring condition operation 'contains' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation contains");
	}
	logger.warn("Ignoring unsupported condition operation 'contains' for control type " + info.controlType);
	return true;
}

function _handleNotContains(param, paramInput, userInput, param2, value, info) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield"];
	if (unsupportedControls.indexOf(info.controlType) < 0) {
		const dataType = typeof paramInput;
		if (typeof userInput[param2] !== "undefined") {
			const notValid = _validateParams(userInput, param2, info.requiredParameters, WARNING);
			if (typeof notValid === "object") {
				return notValid;
			}

			switch (dataType) {
			case "string":
				return paramInput.indexOf(userInput[param2]) < 0;
			case "object":
				return paramInput === null ? true : !_searchInArray(paramInput, userInput[param2], false);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		} else if (typeof value !== "undefined") {
			switch (dataType) {
			case "string":
				return paramInput.indexOf(value) < 0;
			case "object":
				return paramInput === null ? true : !_searchInArray(paramInput, value, false);
			default:
				logger.warn("Ignoring condition operation 'notContains' for parameter_ref " + param + " with input data type " + dataType);
				return true;
			}
		}
		throw new Error("Insufficient parameter for condition operation notContains");
	}
	logger.warn("Ignoring unsupported condition operation 'notContains' for control type " + info.controlType);
	return true;
}

function _handleColNotExists(paramInput, info) {
	const supportedControls = ["textfield", "structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(info.controlType) >= 0) {
		if (!info.dataModel) {
			return true;
		}
		let value = paramInput;
		if (PropertyUtils.toType(paramInput) === "array" && info.cellCoordinates &&
				PropertyUtils.toType(info.cellCoordinates.rowIndex) === "number" &&
				PropertyUtils.toType(info.cellCoordinates.colIndex) === "number" &&
				info.cellCoordinates.rowIndex > -1 && info.cellCoordinates.colIndex > -1 &&
				paramInput.length > info.cellCoordinates.rowIndex &&
				paramInput[info.cellCoordinates.rowIndex].length > info.cellCoordinates.colIndex) {
			value = paramInput[info.cellCoordinates.rowIndex][info.cellCoordinates.colIndex];
		}
		if (!info.cellCoordinates || info.cellCoordinates.skipVal !== value) {
			for (const schema of info.dataModel) {
				for (const field of schema.fields) {
					if (field.name === value) {
						return false;
					}
				}
			}
		}
		return true;
	}
	logger.warn("Ignoring unsupported condition operation 'colNotExists' for control type " + info.controlType);
	return true;
}

function _handleCellNotEmpty(paramInput, info) {
	const supportedControls = ["structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(info.controlType) >= 0) {
		let value = paramInput;
		if (PropertyUtils.toType(paramInput) === "array" && info.cellCoordinates) {
			if (PropertyUtils.toType(info.cellCoordinates.rowIndex) === "number" &&
					PropertyUtils.toType(info.cellCoordinates.colIndex) === "number" &&
					info.cellCoordinates.rowIndex > -1 && info.cellCoordinates.colIndex > -1 &&
					paramInput.length > info.cellCoordinates.rowIndex &&
					paramInput[info.cellCoordinates.rowIndex].length > info.cellCoordinates.colIndex) {
				value = (paramInput[info.cellCoordinates.rowIndex][info.cellCoordinates.colIndex]).trim();
			} else {
				// An empty array means there are no rows to test
				return true;
			}
		}
		const type = PropertyUtils.toType(value);
		return type !== "undefined" && type !== "null" && String(value).length > 0;
	}
	logger.warn("Ignoring unsupported condition operation 'cellNotEmpty' for control type " + info.controlType);
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
	evaluateInput: evaluateInput,
	validateInput: validateInput,
	filter: filter
};
