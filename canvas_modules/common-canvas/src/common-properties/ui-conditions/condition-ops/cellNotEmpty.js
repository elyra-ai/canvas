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
	return "cellNotEmpty";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["structuretable", "structureeditor", "structurelisteditor"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		return typeof paramInfo.value !== "undefined" && paramInfo.value !== null && String(paramInfo.value).length > 0;
	}
	logger.warn("Ignoring unsupported condition operation 'cellNotEmpty' for control type " + paramInfo.control.controlType);
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
