/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { PropertyDef } from "./PropertyDef";
import propertyOf from "lodash/propertyOf";
import { makePrimaryTab } from "./EditorForm";
import { UIItem } from "./UIItem";
import { L10nProvider } from "../util/L10nProvider";
import Conditions from "./Conditions";
import { Size } from "../constants/form-constants";

export default class Form {
	constructor(componentId, label, labelEditable, help, editorSize, pixelWidth, uiItems, buttons, data, conditions, resources) {
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
				Conditions.translateMessages(conditions, l10nProvider),
				resources
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
