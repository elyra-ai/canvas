/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import {EditStyle, Size} from "./form-constants";
import _ from "underscore";

export class ValueDef{
	constructor(propType, isList, isMap){
		this.propType = propType;
		this.isList = isList;
		this.isMap = isMap;
	}
	static make(parameter){
		return new ValueDef(parameter.propType(), parameter.isList(), parameter.isMapValue());
	}
}

export class Label{
	constructor(text){
		this.text = text;
	}
}

export class Button{
	 constructor(id, text, isPrimary, url){
		this.id = id;
	  this.text = text;
		this.isPrimary = isPrimary;
		this.url = url;
	}
}

export class ControlPanel{
	constructor(id, panelType, controls){
		this.id = id;
		this.panelType = panelType;
		this.uiItems = controls;
	}
}

export class UIInfo{
	constructor(label, description, resourceKey, uiHints){
		this.label = label;
		this.description = description;
		this.resourceKey = resourceKey;
		this.uiHints = uiHints;
	}

	/**
	* Returns the value of an attribute from the property or the default value
	* if no such attribute exists.
	*/
	uiHintOrElse(attr, defaultValue) {
		if (this.uiHints) {
			let hint = _.propertyOf(this.uiHints)(attr);
			if (hint) {
				return hint
			}
			else {
				return defaultValue
			}
		}
		else {
			return defaultValue
		}
	}

	/**
	* Returns the "additionalText" attribute which can be used to include additional
	* text associated with the property control on the UI.
	*/
	getAdditionalText(l10nProvider) {
		//TODO should return translated value.  New schema needs to handle this.
		this.uiHintOrElse("additionalText")
	}

	/**
	* Returns the "control" attribute which can be used to define which control should be used
	* for editing a property. The control should be valid for the associated property.
	*/
	control(defaultControl) {
		return this.uiHintOrElse("control", defaultControl);
	}

	/**
	* Returns the "editStyle" attribute which can be used to define how structured values are edited.
	*/
	editStyle() {
		return this.uiHintOrElse("editStyle", EditStyle.SUBPANEL)
	}

	/**
	* Returns the "orientation" attribute which can be used to define how sub-items
	* are laid out in the UI.
	*/
	orientation() {
		return this.uiHintOrElse("orientation", undefined)
	}

	columns(defaultCol){
		return this.uiHintOrElse("columns", defaultCol)
	}

	/**
   * Returns the "separatorBefore" attribute which can be used to insert a horizontal
   * separator before the control in the UI.
   */
  separatorBefore(){
    return this.uiHintOrElse("separatorBefore", false);
  }

  /**
   * Returns the "separatorAfter" attribute which can be used to insert a horizontal
   * separator before the control in the UI.
   */
  separatorAfter(){
    return this.uiHintOrElse("separatorAfter", false);
  }

	/**
   * Returns the "dependsOn" attribute which is used for panel
   * selectors to identify which control they should use.
   */
  dependsOn() {
    return this.uiHintOrElse("dependsOn")
  }

	/**
	* Returns the "editorSize" attribute which can be used to define how large an item should be in the UI.
	*/
	editorSizeHint(){
		// See: https://github.com/react-bootstrap/react-bootstrap/issues/2259
		//Size.valueOf(uiHintStringOrElse("editorSize", ""))
		// React dialogs can be either large or small (medium not supported)
		return this.uiHintOrElse("editorSize", Size.LARGE)
	}
}
