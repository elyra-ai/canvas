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
	return "isEmpty";
}

function evaluate(paramInfo, param2Info, value, controller) {
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

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
