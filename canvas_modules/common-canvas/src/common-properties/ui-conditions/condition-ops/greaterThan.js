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
	return "greaterThan";
}
function evaluate(paramInfo, param2Info, value, controller) {
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
			if (value === null) {
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

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
