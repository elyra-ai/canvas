/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import OpsService from "../../services/OpsService";

function op() {
	return "customSyntaxCheckAsync";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["expression"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const appData = controller.getAppData();
		if (appData) {
			// console.log("nodeId = " + appData.nodeId);
		}
		// This does not really work without additional support from Conditions code for
		// asynchronous custom condition operators.
		const result = OpsService.syntaxCheck(paramInfo.value).then(function(res) {
			return res;
		});
		return result;
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
