/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "./../../../../utils/logger";

function op() {
	return "equals";
}

function evaluate(paramInfo, param2Info, value, controller) {
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

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
