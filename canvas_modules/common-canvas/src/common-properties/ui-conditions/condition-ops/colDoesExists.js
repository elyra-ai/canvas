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
	return "colDoesExists";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const dataModelFields = controller.getDatasetMetadataFields();
	if (!dataModelFields) {
		return false;
	}

	const controlType = paramInfo.control.controlType;
	switch (controlType) {
	case "selectcolumn": {
		const foundField = dataModelFields.find(function(dataModelField) {
			return paramInfo.value === dataModelField.name;
		});
		return typeof foundField !== "undefined";
	}
	case "selectcolumns": {
		for (const paramValue of paramInfo.value) {
			const foundField = dataModelFields.find(function(dataModelField) {
				return paramValue === dataModelField.name;
			});

			if (typeof foundField === "undefined") {
				return false;
			}
		}
		return true;
	}
	default:
		logger.warn("Ignoring unsupported condition operation 'colDoesExists' for control type " + controlType);
		return true;
	}
}


// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
