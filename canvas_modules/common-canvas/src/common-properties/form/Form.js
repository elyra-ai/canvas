/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import {Button} from "./UIInfo";
import {OperaterDef} from "./OperatorDef";
import _ from "underscore";
import {makePrimaryTab} from "./EditorForm"
import {UIItem} from "./UIItem"
import {L10nProvider} from "./L10nProvider"

export default class Form{
	constructor(componentId, label, editorSize, uiItems, buttons, data){
		this.componentId = componentId;
		this.label = label;
		this.editorSize = editorSize;
		this.uiItems = uiItems;
		this.buttons= buttons;
		this.data = data;
	}

	addUiItem(uiItem){
		if (this.uiItems){
			this.uiItems.push(uiItem);
		}else{
			this.uiItems = [uiItem];
		}
	}

	addButton(button){
		if (this.buttons){
			this.buttons.push(button);
		}else{
			this.buttons = [button];
		}
	}

	static makeForm(operator, dataModel, currentParameters, resources){
		if (operator){
			let op = OperaterDef.makeOperaterDef(operator);
			let l10nProvider = new L10nProvider(resources);
			let tabs = [];
			for (let group of op.groupMetadata.groups){
				tabs.push(makePrimaryTab(op, group, l10nProvider));
			}
			// tabs.push(makeStandardTab(componentDef, BuiltInProvider(messages), CommonComponents.ANNOTATIONS_TAB_GROUP,
      //  currentProperties));
			let componentId = op.name
			let label = l10nProvider.l10nLabel(op, op.name);
			let data = {
				currentProperties: currentParameters,
				inputDataModel: dataModel
			}
			return new Form(componentId, label, op.editorSizeHint(), [UIItem.makePrimaryTabs(tabs)], _defaultButtons(), data);
		}
	}
}

function _defaultButtons(){
	let okBtn = new Button("ok", "OK", true,"");
	let cancelBtn = new Button("cancel", "Cancel", false,"");
	return [okBtn, cancelBtn];
}
