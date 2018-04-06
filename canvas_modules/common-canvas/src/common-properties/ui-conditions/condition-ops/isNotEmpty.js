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
	return "isNotEmpty";
}
function evaluate(paramInfo, param2Info, value, controller) {
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

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
