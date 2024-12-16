/*
 * Copyright 2017-2025 Elyra Authors
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

import { PropertyDef } from "./PropertyDef";
import { propertyOf } from "lodash";
import { makePrimaryTab, makeActions } from "./EditorForm";
import { UIItem } from "./UIItem";
import { L10nProvider } from "../util/L10nProvider";
import { translateMessages } from "./Conditions";
import { Size } from "../constants/form-constants";
import { CONTAINER_TYPE } from "../constants/constants";

export default class Form {
	constructor(componentId, label, labelEditable, help, editorSize, pixelWidth, uiItems, buttons, data, conditions, resources, icon, heading, title, titleUiItems) {
		this.componentId = componentId;
		this.label = label;
		this.labelEditable = labelEditable;
		this.help = help;
		this.editorSize = editorSize;
		this.pixelWidth = pixelWidth;
		this.uiItems = uiItems;
		this.buttons = buttons;
		this.data = data;
		this.conditions = conditions;
		this.resources = resources;
		this.icon = icon;
		this.heading = heading;
		if (title) {
			this.title = title;
		}
		if (titleUiItems?.length > 0) {
			this.titleUiItems = titleUiItems;
		}
	}

	/**
	* Returns a new Form
	* @param paramDef Parameter definition
	* @param containerType Type of container common properties will be displayed in, set in propertiesConfig
	*/
	static makeForm(paramDef, containerType) {
		const propDef = PropertyDef.makePropertyDef(propertyOf(paramDef)("titleDefinition"), propertyOf(paramDef)("parameters"), propertyOf(paramDef)("complex_types"),
			propertyOf(paramDef)("uihints"));
		const resources = propertyOf(paramDef)("resources");
		const conditions = propertyOf(paramDef)("conditions");
		if (propDef) {
			const l10nProvider = new L10nProvider(resources);
			const tabs = [];
			if (propDef.groupMetadata && propDef.groupMetadata.groups) {
				for (const group of propDef.groupMetadata.groups) {
					tabs.push(makePrimaryTab(propDef, group, l10nProvider, containerType));
				}
			}
			let titleUiItems = [];
			if (propDef.titleMetadata && propDef.actionMetadata) {
				titleUiItems = makeActions(null, propDef.actionMetadata, propDef.titleMetadata.Title, null, l10nProvider);
			}

			const currentParameters = propertyOf(paramDef)("current_parameters");
			const data = {
				currentParameters: currentParameters,
				uiCurrentParameters: propertyOf(paramDef)("current_ui_parameters"),
				datasetMetadata: propertyOf(paramDef)("dataset_metadata")
			};
			const isModal = containerType === CONTAINER_TYPE.TEARSHEET || containerType === CONTAINER_TYPE.MODAL;
			const editorSizeDefault = isModal ? Size.LARGE : Size.SMALL;
			return new Form(propDef.name,
				propDef.label,
				propDef.labelEditable,
				propDef.help,
				propDef.editorSizeHint(editorSizeDefault),
				propDef.pixelWidth,
				[UIItem.makePrimaryTabs(tabs)],
				_defaultButtons(),
				data,
				translateMessages(conditions, l10nProvider),
				resources,
				propDef.icon,
				l10nProvider.l10nResource(propDef.heading),
				propDef.titleMetadata,
				titleUiItems
			);
		}
		return null;
	}
}

function _defaultButtons() {
	const okBtn = new Button("ok", "OK", true, "");
	const cancelBtn = new Button("cancel", "Cancel", false, "");
	return [okBtn, cancelBtn];
}

class Button {
	constructor(id, text, isPrimary, url) {
		this.id = id;
		this.text = text;
		this.isPrimary = isPrimary;
		this.url = url;
	}
}
