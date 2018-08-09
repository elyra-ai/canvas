/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function op() {
	return "customSyntaxCheck";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["expression"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const appData = controller.getAppData();
		if (appData) {
			// console.log("nodeId = " + appData.nodeId);
		}
		if (paramInfo.value.indexOf("?") === -1) {
			return { type: "success", text: "Expression is valid" };
		}
		return { type: "error", text: "There is an '?' in your expression." };
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
