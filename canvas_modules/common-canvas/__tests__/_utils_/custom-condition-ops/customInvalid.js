/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// This is an invalid formatted operation
function op() {
	return "invalidOp";
}

function invalid(paramInfo, param2Info, value, controller) {
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.invalid = invalid;
