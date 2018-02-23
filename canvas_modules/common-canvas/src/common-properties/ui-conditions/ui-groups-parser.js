/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 30]*/

import logger from "../../../utils/logger";
import { ItemType } from "../constants/form-constants";

// Parse the set of panelTree from the form data
function parseUiContent(panelTree, parentPanel, formData) {
	if (formData.uiItems) {
		for (const uiItem of formData.uiItems) {
			parseUiItem(panelTree, parentPanel, uiItem);
		}
	}
	return panelTree;
}

// does not work for individual textPanels or summaryPanels, they are taken care of
function parseUiItem(panelTree, parentPanel, uiItem, parentFound) {
	switch (uiItem.itemType) {
	case ItemType.PRIMARY_TABS: {
		const currentPanelIsParent = parentFound || false;
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(panelTree, parentPanel, tab.content, currentPanelIsParent);
			}
		}
		break;
	}
	case ItemType.SUB_TABS: {
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(panelTree, parentPanel, tab.content);
			}
		}
		break;
	}
	case ItemType.PANEL:
	case ItemType.SUMMARY_PANEL:
	case ItemType.CUSTOM_PANEL:
	case ItemType.ADDITIONAL_LINK:
	case ItemType.CHECKBOX_SELECTOR: {
		if (uiItem.panel && uiItem.panel.uiItems) {
			let currentPanelIsParent = parentFound;
			if (uiItem.panel.id && uiItem.panel.id === parentPanel) {
				currentPanelIsParent = true;
			}
			if (parentFound && uiItem.panel.id !== parentPanel) {
				panelTree[parentPanel].panels.push(uiItem.panel.id);
			}
			for (const panelUiItem of uiItem.panel.uiItems) {
				parseUiItem(panelTree, parentPanel, panelUiItem, currentPanelIsParent);
			}
		}
		break;
	}
	case ItemType.CONTROL: {
		if (parentFound && uiItem.control.name) {
			panelTree[parentPanel].controls.push(uiItem.control.name);
		}
		break;
	}
	case ItemType.PANEL_SELECTOR: {
		let currentPanelIsParent = parentFound;
		if (uiItem.id && uiItem.id === parentPanel) {
			currentPanelIsParent = true;
		}
		if ((parentFound || currentPanelIsParent) && uiItem.dependsOn) {
			panelTree[parentPanel].controls.push(uiItem.dependsOn);
		}
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(panelTree, parentPanel, tab.content, currentPanelIsParent);
			}
		}
		break;
	}
	case ItemType.TEXT_PANEL: {
		if (parentFound && uiItem.panel.id) {
			panelTree[parentPanel].panels.push(uiItem.panel.id);
		}
		break;
	}
	case ItemType.ACTION:
	case ItemType.STATIC_TEXT:
	case ItemType.HORIZONTAL_SEPARATOR: {
		break;
	}
	default:
		logger.warn("Unknown UiItem type when parsing ui conditions: " + uiItem.itemType);
		break;
	}
}

module.exports = {
	parseUiContent: parseUiContent
};
