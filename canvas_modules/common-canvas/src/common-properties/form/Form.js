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
import Conditions from "./Conditions";

export default class Form {
	constructor(componentId, label, editorSize, uiItems, buttons, data, conditions) {
		this.componentId = componentId;
		this.label = label;
		this.editorSize = editorSize;
		this.uiItems = uiItems;
		this.buttons = buttons;
		this.data = data;
		this.conditions = conditions;
	}

	/**
	* Returns a new Form
	*/
	static makeForm(paramDef) {
		const propDef = PropertyDef.makePropertyDef(_.propertyOf(paramDef)("parameters"), _.propertyOf(paramDef)("complex_types"),
			_.propertyOf(paramDef)("uihints"));
		const conditions = _.propertyOf(paramDef)("conditions");
		if (propDef) {
			const l10nProvider = new L10nProvider(_.propertyOf(paramDef)("resources"));
			const tabs = [];
			if (propDef.groupMetadata && propDef.groupMetadata.groups) {
				for (const group of propDef.groupMetadata.groups) {
					tabs.push(makePrimaryTab(propDef, group, l10nProvider, conditions));
				}
			}

			const data = {
				currentParameters: _.propertyOf(paramDef)("current_parameters"),
				datasetMetadata: _.propertyOf(paramDef)("dataset_metadata")
			};
			return new Form(propDef.name,
				l10nProvider.l10nLabel(propDef, propDef.name),
				propDef.editorSizeHint(),
				[UIItem.makePrimaryTabs(tabs)],
				_defaultButtons(),
				data,
				Conditions.translateMessages(conditions, l10nProvider));
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
