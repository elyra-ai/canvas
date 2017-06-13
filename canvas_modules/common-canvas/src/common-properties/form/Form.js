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
		const propDef = PropertyDef.makePropertyDef(_.propertyOf(paramDef)("parameters"), _.propertyOf(paramDef)("uihints"));
		if (propDef) {
			const l10nProvider = new L10nProvider(_.propertyOf(paramDef)("resources"));
			const tabs = [];
			if (propDef.groupMetadata && propDef.groupMetadata.groups) {
				for (const group of propDef.groupMetadata.groups) {
					tabs.push(makePrimaryTab(propDef, group, l10nProvider));
				}
			}
			// tabs.push(makeStandardTab(componentDef, BuiltInProvider(messages), CommonComponents.ANNOTATIONS_TAB_GROUP,
			//  currentProperties));
			const data = {
				currentProperties: _.propertyOf(paramDef)("currentParameters"),
				inputDataModel: _.propertyOf(paramDef)("inputDataModel")
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
