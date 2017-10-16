/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import logger from "../../../utils/logger";

function parseInput(definition) {
	var data = definition;
	if (data.evaluate) {
		var paramsList = [];
		evaluate(data.evaluate, paramsList);
		// remove duplicates in paramsList array
		var uniqueList = Array.from(new Set(paramsList));
		if (uniqueList.length > 1) {
			return uniqueList;
		}
		// return single control; this will never be an empty list
		var controlName = uniqueList[0];
		return controlName;
	}
	throw new Error("Invalid validation schema");
}


/**
 * Evaluate Definition
 */
function evaluate(data, paramsList) {
	if (data.or) {
		or(data.or, paramsList);
	} else if (data.and) {
		and(data.and, paramsList);
	} else if (data.condition) { // condition
		condition(data.condition, paramsList);
	} else {
		throw new Error("Failed to parse definition");
	}
}

/**
 * The 'or' condition.
 */
function or(data, paramsList) {
	for (let i = 0; i < data.length; i++) {
		evaluate(data[i], paramsList);
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
	paramsList.push(data.parameter_ref);
	if (data.parameter_2_ref) {
		paramsList.push(data.parameter_2_ref);
	}
}

// Parse the set of Controls from the form data
function parseControls(controls, formData) {
	if (formData.uiItems) {
		for (const uiItem of formData.uiItems) {
			parseUiItem(controls, uiItem);
		}
	}
	return controls;
}

function parseUiItem(controls, uiItem) {
	switch (uiItem.itemType) {
	case "control": {
		controls.push(uiItem.control);
		if (uiItem.control.childItem) {
			parseUiItem(controls, uiItem.control.childItem);
		}
		break;
	}
	case "additionalLink":
	case "checkboxSelector":
	case "panel": {
		if (uiItem.panel && uiItem.panel.uiItems) {
			for (const panelUiItem of uiItem.panel.uiItems) {
				parseUiItem(controls, panelUiItem);
			}
		}
		break;
	}

	case "primaryTabs":
	case "panelSelector":
	case "subTabs": {
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(controls, tab.content);
			}
		}
		break;
	}
	default:
		logger.warn("Unknown UiItem type when parsing ui conditions: " + uiItem.itemType);
		break;

	}
	return controls;

}

// Parse Require Parameters from form Data

function parseRequiredParameters(requiredParameters, formData, controls) {
	var localControls = controls;
	if (!localControls) {
		localControls = [];
		localControls = parseControls(localControls, formData);
	}
	const localRequired = localControls.filter(function(control) {
		return (control.required);
	});

	return localRequired.map(function(required) {
		return (required.name);
	});
}

// parser the condition section of the form data
function parseConditions(container, uiCondition, conditionType) {
	try {
		var controls = parseInput(uiCondition[conditionType]);
		var groupDef = {
			"params": controls,
			"definition": uiCondition
		};
		if (Array.isArray(controls) === true) {
			for (let j = 0; j < controls.length; j++) {
				if (typeof container[controls[j]] === "undefined") {
					container[controls[j]] = [];
				}
				container[controls[j]].push(groupDef);
			}
		} else { // single control
			if (typeof container[controls] === "undefined") {
				container[controls] = [];
			}
			container[controls].push(groupDef);
		}
	} catch (error) { // invalid
		logger.info("Error parsing ui conditions: " + error);
	}
	return container;
}

module.exports = {
	parseInput: parseInput,
	parseRequiredParameters: parseRequiredParameters,
	parseControls: parseControls,
	parseConditions: parseConditions
};
