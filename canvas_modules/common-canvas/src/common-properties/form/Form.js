/*
 * Copyright 2017-2020 Elyra Authors
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
import { makePrimaryTab } from "./EditorForm";
import { UIItem } from "./UIItem";
import { L10nProvider } from "../util/L10nProvider";
import { translateMessages } from "./Conditions";
import { Size } from "../constants/form-constants";

export default class Form {
	constructor(componentId, label, labelEditable, help, editorSize, pixelWidth, uiItems, buttons, data, conditions, resources, icon, heading) {
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
	}

	/**
	* Returns a new Form
	* @param paramDef Parameter definition
	* @param isModal True for modal dialogs
	*/
	static makeForm(paramDef, isModal) {
		const propDef = PropertyDef.makePropertyDef(propertyOf(paramDef)("titleDefinition"), propertyOf(paramDef)("parameters"), propertyOf(paramDef)("complex_types"),
			propertyOf(paramDef)("uihints"));
		const resources = propertyOf(paramDef)("resources");
		const conditions = propertyOf(paramDef)("conditions");
		if (propDef) {
			const l10nProvider = new L10nProvider(resources);
			const tabs = [];
			if (propDef.groupMetadata && propDef.groupMetadata.groups) {
				for (const group of propDef.groupMetadata.groups) {
					tabs.push(makePrimaryTab(propDef, group, l10nProvider, conditions));
				}
			}

			const data = {
				currentParameters: propertyOf(paramDef)("current_parameters"),
				uiCurrentParameters: propertyOf(paramDef)("current_ui_parameters"),
				datasetMetadata: propertyOf(paramDef)("dataset_metadata")
			};
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
				l10nProvider.l10nResource(propDef.heading)
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
