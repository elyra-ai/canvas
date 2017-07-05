/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { PropertyDef } from "./PropertyDef";
import _ from "underscore";
import { makePrimaryTab } from "./EditorForm";
import { UIItem } from "./UIItem";
import { L10nProvider } from "./L10nProvider";

export default class Form {
	constructor(componentId, label, editorSize, uiItems, buttons, data) {
		this.componentId = componentId;
		this.label = label;
		this.editorSize = editorSize;
		this.uiItems = uiItems;
		this.buttons = buttons;
		this.data = data;
	}

	/**
	* Returns a new Form
	*/
	static makeForm(paramDef) {
		const propDef = PropertyDef.makePropertyDef(
			_.propertyOf(paramDef)("structures"),
			_.propertyOf(paramDef)("parameters"),
			_.propertyOf(paramDef)("uihints"));
		if (propDef) {
			const l10nProvider = new L10nProvider(_.propertyOf(paramDef)("resources"));
			const tabs = [];
			if (propDef.groupMetadata && propDef.groupMetadata.groups) {
				for (const group of propDef.groupMetadata.groups) {
					tabs.push(makePrimaryTab(propDef, group, l10nProvider));
				}
			}

			const uiConditions = loadConditionResources(_.propertyOf(paramDef.uihints)("conditions"), l10nProvider);
			const data = {
				currentParameters: _.propertyOf(paramDef)("currentParameters"),
				datasetMetadata: _.propertyOf(paramDef)("datasetMetadata"),
				conditions: uiConditions
			};
			const formName = _.propertyOf(propDef)("name");
			return new Form(formName,
				l10nProvider.l10nLabel(propDef, formName),
				propDef.editorSizeHint(),
				[UIItem.makePrimaryTabs(tabs)],
				_defaultButtons(),
				data);
		}
		return null;
	}
}

function loadConditionResources(conditions, l10nProvider) {
	if (!conditions) {
		return conditions;
	}
	for (const condition of conditions) {
		if (condition.validation && condition.validation.fail_message &&
				condition.validation.fail_message.message) {
			const message = condition.validation.fail_message.message;
			if (message.resourceKey && !message.default) {
				message.default = l10nProvider.l10n(message.resourceKey);
			}
		}
	}
	return conditions;
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
