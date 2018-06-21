/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import uuid4 from "uuid/v4";

/**
* Used to return a unique id for a control that requires an html id
* @param propertyId (required)
* @param id (optional)
* @return returns a unique id used for control DOM ids
*/
function getControlId(propertyId, id) {
	const uuid = id ? id : uuid4();
	return `${getDataId(propertyId)}-${uuid}`;
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
