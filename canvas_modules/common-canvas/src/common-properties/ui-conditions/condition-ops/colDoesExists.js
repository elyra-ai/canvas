/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "./../../../../utils/logger";
import PropertyUtils from "./../../util/property-utils.js";

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
	case "selectcolumns":
	case "selectcolumn": {
		return typeof valueInDataset(dataModelFields, paramInfo.value) !== "undefined";
	}
	default:
		logger.warn("Ignoring unsupported condition operation 'colDoesExists' for control type " + controlType);
		return true;
	}
}

// Return the field if found in dataset, else undefined
function valueInDataset(dataset, field) {
	return dataset.find(function(dataModelField) {
		return PropertyUtils.fieldValueMatchesProto(field, dataModelField);
	});
}


// Public Methods ------------------------------------------------------------->

module.exports.op = op;
module.exports.evaluate = evaluate;
