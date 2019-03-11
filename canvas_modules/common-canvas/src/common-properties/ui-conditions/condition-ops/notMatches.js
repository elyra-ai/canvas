/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "./../../../../utils/logger";

function op() {
	return "notMatches";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const dataType = typeof paramInfo.value;
	var regExp = "";
	if (typeof param2Info !== "undefined" && param2Info !== null) {
		regExp = param2Info.value;
	} else if (typeof value !== "undefined" && value !== null) {
		regExp = value;
	} else {
		logger.warn("Ignoring condition operation 'notMatches' for parameter_ref " + paramInfo.param + " no regular expression specified in condition.");
		return true;
	}
	if (dataType === "string") {
		// the added regexp before and after the value strips out whitespace or positions at the start and end of the string.
		const regex = new RegExp(regExp);
		return !regex.test(paramInfo.value);
	}
	logger.warn("Ignoring condition operation 'notMatches' for parameter_ref " + paramInfo.param + " with input data type " + dataType);
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
