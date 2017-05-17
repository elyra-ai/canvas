/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function parseInput(definition) {
	var data = definition;
	if (data.evaluate) {
		var paramsList = [];
		evaluate(data.evaluate, paramsList);
		// remove duplicates in paramsList array
		var uniqueList = Array.from(new Set(paramsList));
		if (uniqueList.length > 1) {
			return uniqueList;
		} else { // return single control; this will never be an empty list
			var controlName = uniqueList[0];
			return controlName;
		}
	} else {
		throw "Invalid validation schema";
	}
}

/**
 * Evaluate Definition
 */
function evaluate(data, paramsList) {
	if(data.or) {
		or(data.or, paramsList);
	} else if (data.and) {
		and(data.and, paramsList);
	} else if (data.op && data.param) { // condition
		condition(data, paramsList);
	} else {
		throw "Failed to parse definition";
	}
}

/**
 * The 'or' condition.
 */
function or(data, paramsList) {
	for (let i = 0; i < data.length; i++) {
		evaluate(data[i], paramsList)
	}
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @return {boolean}
 */
function and(data, paramsList) {
	for (let i = 0; i < data.length; i++) {
		evaluate(data[i], paramsList);
	}
}

/**
 * A parameter condition.
 */
function condition(data, paramsList) {
	paramsList.push(data.param);
	if(data.param2) {
		paramsList.push(data.param2);
	}
}

module.exports = {
	parseInput: parseInput
};
