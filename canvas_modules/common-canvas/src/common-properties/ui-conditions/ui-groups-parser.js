/*
 * Copyright 2017-2023 Elyra Authors
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

import { has } from "lodash";

import logger from "../../../utils/logger";
import { ItemType } from "../constants/form-constants";

// Parse the set of panelTree from the form data
function parseUiContent(panelTree, formData, panelTreeRoot) {
	if (formData.uiItems) {
		for (const uiItem of formData.uiItems) {
			parseUiItem(panelTree, uiItem, panelTreeRoot);
		}
	}
	return panelTree;
}

function parseUiItem(panelTree, uiItem, currentPanel) {
	switch (uiItem.itemType) {
	case ItemType.PRIMARY_TABS:
	case ItemType.SUB_TABS: {
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(panelTree, tab.content, currentPanel);
			}
		}
		break;
	}
	case ItemType.TEXT_PANEL:
	case ItemType.PANEL:
	case ItemType.CUSTOM_PANEL:
	case ItemType.ADDITIONAL_LINK:
	case ItemType.TEARSHEET:
	case ItemType.CHECKBOX_SELECTOR: {
		if (uiItem.panel && uiItem.panel.id) {
			panelTree[currentPanel].panels.push(uiItem.panel.id);
			_newPanelTreeObject(panelTree, uiItem.panel.id);
			if (uiItem.panel.uiItems) {
				for (const panelUiItem of uiItem.panel.uiItems) {
					parseUiItem(panelTree, panelUiItem, uiItem.panel.id);
				}
			}
		}
		break;
	}
	case ItemType.CONTROL: {
		panelTree[currentPanel].controls.push(uiItem.control.name);
		// a control item may have an action ref associated with it.
		if (uiItem.control.action) {
			panelTree[currentPanel].actions.push(uiItem.control.action.name);
		}
		// This is a special case for the radio button set which has panels
		// inserted after each radio button. Those panels are provided in the
		// additionalItems array which is an array of EditorTab objects.
		if (uiItem.control.additionalItems) {
			for (const editorTab of uiItem.control.additionalItems) {
				parseUiItem(panelTree, editorTab.content, currentPanel);
			}
		}
		break;
	}
	case ItemType.PANEL_SELECTOR: {
		panelTree[currentPanel].panels.push(uiItem.id);
		_newPanelTreeObject(panelTree, uiItem.id);
		if (uiItem.dependsOn) {
			panelTree[uiItem.id].controls.push(uiItem.dependsOn);
		}
		if (uiItem.tabs) {
			for (const tab of uiItem.tabs) {
				parseUiItem(panelTree, tab.content, uiItem.id);
			}
		}

		break;
	}

	case ItemType.ACTION:
	{
		panelTree[currentPanel].actions.push(uiItem.action.name);
		break;
	}
	case ItemType.STATIC_TEXT:
	case ItemType.HORIZONTAL_SEPARATOR: {
		break;
	}
	default:
		logger.warn("Unknown UiItem type when parsing ui conditions: " + uiItem.itemType);
		break;
	}
}

function _newPanelTreeObject(panelTree, panelId) {
	if (has(panelTree, panelId)) {
		logger.warn("Duplicate panel ids, each panel id must be unique.  Panel id = " + panelId);
	}
	panelTree[panelId] = { controls: [], panels: [], actions: [] };
}

export { parseUiContent };
