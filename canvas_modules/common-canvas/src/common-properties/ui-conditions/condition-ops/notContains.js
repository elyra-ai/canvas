/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "./../../../../utils/logger";
import utils from "./../conditions-utils.js";

function op() {
	return "notContains";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const unsupportedControls = ["checkbox", "numberfield", "passwordfield"];
	if (unsupportedControls.indexOf(paramInfo.control.controlType) < 0) {
		const dataType = typeof paramInfo.value;
		if (typeof param2Info !== "undefined") {
			switch (dataType) {
			case "undefined":
				return true;
			case "string":
				return paramInfo.value.indexOf(param2Info.value) < 0;
			case "object":
				return paramInfo.value === null ? true : !utils.searchInArray(paramInfo.value, param2Info.value, false);
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
				return paramInfo.value === null ? true : !utils.searchInArray(paramInfo.value, value, false);
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

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
