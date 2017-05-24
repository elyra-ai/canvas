/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { Button } from "./UIInfo";
import { OperaterDef } from "./OperatorDef";
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
	static makeForm(operator, dataModel, currentParameters, resources) {
		const op = OperaterDef.makeOperaterDef(operator);
		if (op !== null) {
			const l10nProvider = new L10nProvider(resources);
			const tabs = [];
			if (op.groupMetadata && op.groupMetadata.groups) {
				for (const group of op.groupMetadata.groups) {
					tabs.push(makePrimaryTab(op, group, l10nProvider));
				}
			}
			// tabs.push(makeStandardTab(componentDef, BuiltInProvider(messages), CommonComponents.ANNOTATIONS_TAB_GROUP,
			//  currentProperties));
			const data = {
				currentProperties: currentParameters,
				inputDataModel: dataModel
			};
			const formName = _.propertyOf(op)("name");
			return new Form(formName,
				l10nProvider.l10nLabel(op, formName),
				op.editorSizeHint(),
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
