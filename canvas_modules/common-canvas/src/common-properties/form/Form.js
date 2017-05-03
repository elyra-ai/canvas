import {Button} from "./UIInfo";
import {OperaterDef} from "./OperatorDef";
import _ from "underscore";
import {makePrimaryTab} from "./EditorForm"
import {UIItem} from "./UIItem"


export default class Form{
	constructor(componentId, label, editorSize, uiItems, buttons){
		this.componentId = componentId;
		this.label = label;
		this.editorSize = editorSize;
		this.uiItems = uiItems;
		this.buttons= buttons;
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
	static makeForm(operator, resources){
		if (operator){
			let op = OperaterDef.makeOperaterDef(operator);
			let tabs = [];
			for (let group of op.groupMetadata.groups){
				let tab = makePrimaryTab(op, group);
				tabs.push(tab);
			}
			let componentId = op.name
			let label = op.name + " TODO translate"
			return new Form(componentId, label, op.editorSizeHint(), [UIItem.makePrimaryTabs(tabs)], _defaultButtons());
		}
	}
}
function _defaultButtons(){
	let okBtn = new Button("ok", "OK", true,"");
	let cancelBtn = new Button("cancel", "Cancel", false,"");
	return [okBtn, cancelBtn];
}
