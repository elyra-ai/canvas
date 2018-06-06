/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/**
* Used to return a unique id for a control that requires an html id
*/
function getControlId(propertyId) {
	return getDataId(propertyId);
}

function getDataId(propertyId) {
	let id = propertyId.name;
	if (typeof propertyId.row !== "undefined") {
		id += "_" + propertyId.row;
		if (typeof propertyId.col !== "undefined") {
			id += "_" + propertyId.col;
		}
	}
	return "properties-" + id;
}

function	getCharLimit(control, defaultLimit) {
	let limit = defaultLimit;
	if (control.charLimit) {
		limit = control.charLimit;
	}
	return limit;
}

module.exports = {
	getCharLimit: getCharLimit,
	getControlId: getControlId,
	getDataId: getDataId
};
