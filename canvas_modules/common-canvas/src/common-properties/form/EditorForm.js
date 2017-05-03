/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import {ValueDef, Label, ControlPanel} from "./UIInfo";
import {Control, SubControl} from "./ControlInfo";
import {UIItem} from "./UIItem";
import _ from "underscore";
import {GroupType, PanelType, Type, ControlType, ParamRole} from "./constants"

class EditorTab{
	constructor(label, name, uiItem){
		this.text = label;
		this.group = name;
		this.content = uiItem;
	}
}

function _makePrimaryTab(operatorDef, group){
	let label = operatorDef.name + " TODO translate";
	return new EditorTab(label, group.name, _makeUIItem(operatorDef.parameterMetadata, group, operatorDef.structureMetadata))
}

function _makeUIItem(parameterMetadata, group, structureMetadata){
	 let groupName = group.name;
	 switch(group.groupType()) {
		 case GroupType.CONTROLS :
		 	return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, group, structureMetadata)));
		 case GroupType.COLUMN_ALLOCATION:
			 return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_ALLOCATION, _makeControls(parameterMetadata, group, structureMetadata)));
		 case GroupType.ADDITIONAL:
			 let panel = new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, group, structureMetadata));
			 let groupLabel = group.name + " TODO translate";
			 return UIItem.makeAdditionalLink(groupLabel, groupLabel, panel);
		 case GroupType.SUB_TABS:
			 // Defines a sub-tab group where each child group represents a sub-tab.
			 let subTabItems = [];
			 group.subGroups.forEach(function(subGroup){
				 let subGroupName = subGroup.name
				 let groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata)
				 let groupLabel = subGroup.name + " TODO translate"
				 subTabItems.push(new EditorTab(groupLabel, subGroupName, groupItem))
			 })
			 return UIItem.makeSubTabs(subTabItems);
		 case GroupType.PANEL_SELECTOR:
			 // Defines a sub-tab group where each child group represents a sub-tab.
			 let panSelSubItems = [];
			 group.subGroups.forEach(function(subGroup){
				let subGroupName = subGroup.name
				let groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata);
				let groupLabel = subGroup.name + " TODO translate";
				panSelSubItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
			})
			 return UIItem.makePanelSelector(panSelSubItems, group.dependsOn());
		 case GroupType.PANELS:
			 let panSubItems = [];
			 group.subGroups.forEach(function(subGroup){
				 let groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata);
				 panSubItems.push(groupItem);
			 })
			 return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, panSubItems));
		 default:
			 return UIItem.makeStaticText("(Unknown group type '" + group.groupType() + "')");
	 }
 }

 /**
 * Called on a base property group.
 */
function _makeControls(parameterMetadata, group, structureMetadata) {
	let uiItems = [];
	group.parameterNames().forEach(function(paramName){
		// Assume property definition exists
		let prop = parameterMetadata.getParameter(paramName)
		let structureDef;
		if (prop.propType() === Type.STRUCTURE && structureMetadata) {
			structureDef = structureMetadata.getStructure(prop.structureType());
		}
		let control = UIItem.makeControl(_makeControl(parameterMetadata, paramName, group, structureDef))
		if (prop.separatorBefore() || prop.separatorAfter()) {
			var subItems = [];
			if (prop.separatorBefore()) {
				subItems.push(UIItem.makeHSeparator(undefined))
			}
			subItems.push(control)
			if (prop.separatorAfter()) {
				subItems.push(UIItem.makeHSeparator(undefined))
			}
			uiItems.push(subItems);
		}
		else {
			uiItems.push(control);
		}
	})
	if (group.subGroups) {
		group.subGroups.forEach(function(group){
			let subGroup = _makeUIItem(parameterMetadata, group, structureMetadata);
			uiItems.push(subGroup);
		});
	}
	return uiItems;
}
function _makeControl(parameterMetadata, paramName, group, structureDef){
	 // Assume the property is defined
	 let parameter = parameterMetadata.getParameter(paramName)

	 let additionalText = parameter.getAdditionalText();
	 let orientation = parameter.orientation();
	 let controlLabel = new Label(parameter.name + " TODO translate");////ControlLabel(l10nLabel(property, property.name, l10nProvider))

	 // The role is used to modify the behaviour of certain controls
	 let role;
	 let separateLabel = true

	 let subControls;
	 let keyIndex;
	 let defaultRow;
	 let childItem;

	 // The control type defines the basic UI element that should be used to edit the property
	 let controlType;
	 if (parameter.getRole() === ParamRole.CUSTOM) {
		 controlType = ControlType.CUSTOM
	 }
	 else {
		 switch(parameter.propType() ){
			 case Type.STRING:
				 if (parameter.isList()) {
					 switch(parameter.getRole()){
						 case ParamRole.TEXT:
						 	controlType = ControlType.TEXTAREA;
							break;
						 case ParamRole.ENUM:
							 if (parameter.getValidValueCount() < 5) {
								 controlType = ControlType.CHECKBOXSET
							 }
							 else {
								 controlType = ControlType.SOMEOFSELECT
							 }
						 	break;
						 case ParamRole.COLUMN:
							 if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
								 controlType = ControlType.ALLOCATEDCOLUMNS
							 }
							 else {
								 controlType = ControlType.SOMEOFCOLUMNS
							 }
							break;
						 default:
						  controlType = ControlType.TEXTAREA
					 }
				 }
				 else {
					 switch(parameter.getRole()) {
						 case ParamRole.TEXT:
							 controlType = ControlType.TEXTAREA;
							 break;
						 case ParamRole.ENUM:
							 if (parameter.getValidValueCount() < 5) {
								 controlType = ControlType.RADIOSET
							 }
							 else {
								 controlType = ControlType.ONEOFSELECT
							 }
						 	break;
						 case ParamRole.COLUMN:
							 if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
								 controlType = ControlType.ALLOCATEDCOLUMN
							 }
							 else {
								 controlType = ControlType.ONEOFCOLUMNS
							 }
						 	break;
						 case ParamRole.EXPRESSION:
						 	controlType = ControlType.EXPRESSION;
							break;
						 case ParamRole.EMAIL:
						  role = ParamRole.EMAIL;
							controlType = ControlType.TEXTFIELD;
							break;
						 case ParamRole.URL:
						  role = ParamRole.URL;
							controlType = ControlType.TEXTFIELD
							break;
						 case ParamRole.COLOR:
							 role = ParamRole.COLOR;
							 controlType =ControlType.TEXTFIELD
							 break;
						 default:
						 	controlType = ControlType.TEXTFIELD
					 }
				 }
				 break;
			 case Type.PASSWORD:
			  controlType = ControlType.PASSWORDFIELD
				break;
			 case Type.BOOLEAN:
			  separateLabel = false;
				controlType = ControlType.CHECKBOX;
				break;
			 case Type.INTEGER:
				 if (parameter.isList()) {
					 controlType = ControlType.TEXTAREA
				 }
				 else {
					 controlType = ControlType.NUMBERFIELD
				 }
				 break;
			 case Type.LONG:
				 if (parameter.isList()) {
					 controlType = ControlType.TEXTAREA
				 }
				 else {
					 controlType = ControlType.NUMBERFIELD
				 }
				 break;
			 case Type.DOUBLE:
				 if (parameter.isList()) {
					 controlType = ControlType.TEXTAREA
				 }
				 else {
					 controlType = ControlType.NUMBERFIELD
				 }
				 break;
			 case Type.DATE:
			 	 role = Type.DATE;
				 if (parameter.isList()) {
					 controlType = ControlType.TEXTAREA
				 }
				 else {
					 controlType = ControlType.TEXTFIELD
				 }
				 break;
			 case Type.STRUCTURE:
				 if (structureDef) {
					 if (structureDef.isEditStyleSubpanel()) {
						// If we're not editing in-line then create a sub-panel that can be used to edit the attributes
						let panel = new ControlPanel(structureDef.name, PanelType.GENERAL, _makeControls(structureDef.parameterMetadata, structureDef, undefined));
						let groupLabel = structureDef.name + " TODO translate";
						childItem = UIItem.makeAdditionalLink("...", groupLabel, panel);
					 }

					 keyIndex = structureDef.keyAttributeIndex();

					 // The defaultRow allows the UI to create a new row with sensible settings
					 // when needed
					 defaultRow = structureDef.defaultStructure(parameter.isList());

					 // For inline/row editing, create definitions for all the columns that can be edited
					 subControls = [];
					 structureDef.parameterMetadata.paramDefs.forEach(function(param){
						 subControls.push(_makeSubControl(param));
					 })
					 // If the property is a keyed property or a structure list then the key should not be included in the
					 // structure definition. However it will still need to be included in the table column definitions.
					 if ((parameter.isMapValue() || parameter.isList()) && structureDef.keyDefinition) {
						 subControls.push(_makeSubControl(structureDef.keyDefinition))
					 }
					 if (parameter.isList() || parameter.isMapValue()) {
						 if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
							 controlType =  ControlType.ALLOCATEDSTRUCTURES
						 }
						 else {
							 controlType =  ControlType.STRUCTURELISTEDITOR
						 }
					 }
					 else {
						 controlType =  ControlType.STRUCTUREEDITOR
					 }
				 }
				 else {
					 controlType = ControlType.TEXTFIELD  // TODO - how to handle an undefined structure
				 }
				 break;
			 default:
			 	role = "???" + parameter.propType() + "???";
				controlType = ControlType.TEXTAREA
		 }
	 }
	 let valueLabels = function(){
		 if (parameter.getRole() === ParamRole.ENUM) {
			 return _parameterValueLabels(parameter)
		 }
	}
	return new Control(parameter.name, controlLabel, separateLabel, parameter.control(controlType), ValueDef.make(parameter),role, additionalText, orientation,
		parameter.getValidValues(), valueLabels, subControls, keyIndex, defaultRow, childItem)
}

function _makeSubControl(parameter){
	let additionalText = parameter.getAdditionalText();
	let orientation = parameter.orientation();
	let controlLabel = parameter.name + " TODO translate"//ControlLabel(l10nLabel(property, property.name, l10nProvider))

	let role;
	let controlType;
	switch(parameter.propType()) {
		case Type.STRING:
			switch(parameter.getRole()){
				case ParamRole.ENUM:
				 	controlType = ControlType.ONEOFSELECT;
					break;
				case ParamRole.COLUMN:
					controlType = ControlType.ONEOFCOLUMNS;
					break;
				default:
					controlType = ControlType.TEXTFIELD;
			}
			break;
		case Type.PASSWORD:
		 	controlType = ControlType.PASSWORDFIELD;
			break;
		case Type.BOOLEAN:
		 	controlType = ControlType.CHECKBOX;
			break;
		case Type.INTEGER:
		 	controlType = ControlType.NUMBERFIELD;
			break;
		case Type.LONG:
		 	controlType = ControlType.NUMBERFIELD;
			break;
		case Type.DOUBLE:
		 	controlType = ControlType.NUMBERFIELD;
			break;
		case Type.DATE:
			role = "date";
			controlType = ControlType.TEXTFIELD;
			break;
		default:
			role = "???" + parameter.propType() + "???";
			controlType = ControlType.TEXTFIELD
	}

	let valueLabels;
	if (parameter.getRole() === ParamRole.ENUM) {
		valueLabels = _parameterValueLabels(parameter);
	}

	return new SubControl(parameter.name, controlLabel, parameter.visible,
			parameter.columns(8), parameter.control(controlType), ValueDef.make(parameter),
			role, additionalText, orientation, parameter.getValidValues(), valueLabels)
}
function _parameterValueLabels(parameter){
  if (_.has(parameter.valueRestriction, "labels")) {
      return parameter.valueRestriction.labels
    }
		//TODO fix
    //else {
    //  let key = property.valueRestriction.get.labelsKey.getOrElse(property.resourceKey.getOrElse(property.name))
  	//  property.valueRestriction.get.oneOf.get.map { propValue =>
  	//    l10nProvider.l10nValueLabel(key, propValue)
    //	}
    //}
}
module.exports.makePrimaryTab = _makePrimaryTab;
