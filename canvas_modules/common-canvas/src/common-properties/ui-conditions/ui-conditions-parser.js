/*
 * Copyright 2017-2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from "../../../utils/logger";
import { ItemType, PanelType } from "../constants/form-constants";


function parseInput(definition) {
	var data = definition;
	if (data.evaluate) {
		var paramsList = [];
		if (data.parameter_refs) {
			evaluate(data.evaluate, paramsList, data.parameter_refs);
		} else {
			evaluate(data.evaluate, paramsList, data.parameter_ref);
		}
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
function evaluate(data, paramsList, defaultParameter) {
	if (data.or) {
		or(data.or, paramsList, defaultParameter);
	} else if (data.and) {
		and(data.and, paramsList, defaultParameter);
	} else if (data.condition) { // condition
		condition(data.condition, paramsList, defaultParameter);
	} else {
		throw new Error("Failed to parse definition");
	}
}

/**
 * The 'or' condition.
 */
function or(data, paramsList, defaultParameter) {
	for (let i = 0; i < data.length; i++) {
		evaluate(data[i], paramsList, defaultParameter);
	}
}

/**
 * The 'and' condition. All sub-conditions evaluate to true.
 * Can nest any number of additional conditional types.
 * @param {Object} data an array of items
 * @return {boolean}
 */
function and(data, paramsList, defaultParameter) {
	for (let i = 0; i < data.length; i++) {
		evaluate(data[i], paramsList, defaultParameter);
	}
}

/**
 * A parameter condition.
 */
function condition(data, paramsList, defaultParameter) {
	if (data.parameter_ref) {
		paramsList.push(data.parameter_ref);
		if (data.parameter_2_ref) {
			paramsList.push(data.parameter_2_ref);
		}
	} else {
		// needed for filtering of dm fields
		paramsList.push(defaultParameter);
	}
}

// Parse the set of Controls from the form data
function parseControls(controls, actions, formData) {
	if (formData.uiItems) {
		for (const uiItem of formData.uiItems) {
			parseUiItem(controls, actions, uiItem);
		}
	}
}

function parseControl(controls, control, parentCategoryId) {
	if (control.label) {
		control.summaryLabel = control.label.text;
	}
	if (parentCategoryId) {
		control.parentCategoryId = parentCategoryId;
	}
	controls.push(control);
	if (control.subControls) {
		for (let idx = 0; idx < control.subControls.length; idx++) {
			const subControl = control.subControls[idx];
			subControl.parameterName = control.name;
			subControl.columnIndex = idx;
			if (parentCategoryId) {
				subControl.parentCategoryId = parentCategoryId;
			}
			controls.push(subControl);
		}
	}
}

function parseUiItem(controls, actions, uiItem, panelId, parentCategoryId) {
	switch (uiItem.itemType) {
	case ItemType.CONTROL: {
		const control = uiItem.control;
		if (panelId) {
			control.summaryPanelId = panelId;
		}
		if (parentCategoryId) {
			control.parentCategoryId = parentCategoryId;
		}
		parseControl(controls, control, parentCategoryId);
		// If some panels from a Selector Panel have been inserted in a
		// radio set control the control will have additionalItems which need
		// to be parsed.
		if (uiItem.additionalItems) {
			for (const additionalItem of uiItem.additionalItems) {
				parseUiItem(controls, actions, additionalItem.content, panelId, parentCategoryId);
			}
		}
		break;
	}
	case ItemType.ADDITIONAL_LINK:
	case ItemType.CHECKBOX_SELECTOR:
	case ItemType.PANEL: {
		if (uiItem.panel && uiItem.panel.uiItems) {
			let locPanelId = panelId;
			if (uiItem.panel.panelType === PanelType.SUMMARY) {
				locPanelId = uiItem.panel.id;
			}
			for (const panelUiItem of uiItem.panel.uiItems) {
				parseUiItem(controls, actions, panelUiItem, locPanelId, parentCategoryId);
			}
		}
		break;
	}
	case ItemType.PRIMARY_TABS:
	case ItemType.PANEL_SELECTOR:
	case ItemType.SUB_TABS: {
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(controls, actions, tab.content, panelId,
					uiItem.itemType === ItemType.PANEL_SELECTOR || uiItem.itemType === ItemType.SUB_TABS
						? parentCategoryId
						: tab.group);
			}
		}
		break;
	}
	case ItemType.CUSTOM_PANEL:
		if (uiItem.panel && uiItem.panel.parameters) {
			for (const param of uiItem.panel.parameters) {
				const control = {
					name: param,
					controlType: "custom"
				};
				if (panelId) {
					control.summaryPanelId = panelId;
				}
				if (parentCategoryId) {
					control.parentCategoryId = parentCategoryId;
				}
				controls.push(control);
			}
		}
		break; // required parameters are handled by panel
	case ItemType.ACTION:
		if (uiItem.action && uiItem.action.name) {
			actions[uiItem.action.name] = uiItem.action;
		}
		break;
	case ItemType.STATIC_TEXT:
	case ItemType.TEXT_PANEL:
	case ItemType.TEARSHEET:
	case ItemType.HORIZONTAL_SEPARATOR: {
		break;
	}
	default:
		logger.warn("Unknown UiItem type when parsing ui conditions: " + uiItem.itemType);
		break;

	}
	return controls;

}

// Parse the condition section of the form data
function parseConditions(container, uiCondition, conditionType) {
	try {
		var controls = parseInput(uiCondition[conditionType]);
		var groupDef = {
			"params": controls,
			"definition": uiCondition
		};
		_setDefinitions(container.controls, controls, groupDef);
		let refs = uiCondition[conditionType].parameter_refs;
		if (uiCondition[conditionType].group_refs) {
			refs = uiCondition[conditionType].group_refs;
		} else if (uiCondition[conditionType].action_refs) {
			refs = uiCondition[conditionType].action_refs;
		} else if (uiCondition[conditionType].target && uiCondition[conditionType].target.parameter_ref) {
			refs = [uiCondition[conditionType].target.parameter_ref];
		}
		if (refs) {
			_setDefinitions(container.refs, refs, groupDef);
		}
	} catch (error) { // invalid
		logger.info("Error parsing ui conditions: " + error);
	}
	return container;
}

function _setDefinitions(container, controls, groupDef) {
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
}

export {
	parseInput,
	parseControls,
	parseConditions,
	parseControl
};
