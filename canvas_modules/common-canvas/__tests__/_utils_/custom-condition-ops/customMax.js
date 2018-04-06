/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function op() {
	return "customMax";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["numberfield"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		return paramInfo.value < value;
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
