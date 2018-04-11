/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import moment from "moment";


function op() {
	return "isDateTime";
}

function evaluate(paramInfo, param2Info, value, controller) {
	if (paramInfo.value) { // only check if there is a value.
		const format = (value === "time") ? "HH:mm:ssZ" : moment.ISO_8601;
		const mom = moment.utc(paramInfo.value, format, true);
		return (mom.isValid());
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
