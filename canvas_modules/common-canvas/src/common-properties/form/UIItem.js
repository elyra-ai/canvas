/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 import {ItemType} from "./form-constants"

export class UIItem {
	constructor(itemType, tabs, panel, control, text, secondaryText, dependsOn){
		this.itemType = itemType;
		this.tabs = tabs;      // when PRIMARY_TABS, SUB_TABS or PANEL_SELECTOR
		this.panel = panel;       // when PANEL or ADDITIONAL_LINK
		this.control = control;          // when CONTROL
		this.text = text;              // when ADDITIONAL_LINK (link label), STATIC_TEXT or HORIZONTAL_SEPARATOR
		this.secondaryText = secondaryText;     // when ADDITIONAL_LINK (subpanel label)
		this.dependsOn = dependsOn;          // when PANEL_SELECTOR (control to obtain value from)
	}

	static makePrimaryTabs(tabs){
		return new UIItem(ItemType.PRIMARY_TABS, tabs);
	}

	static makeSubTabs(tabs){
		return new UIItem(ItemType.SUB_TABS, tabs);
	}

	static makePanelSelector(tabs, dependsOn){
	  return new UIItem(ItemType.PANEL_SELECTOR, tabs, undefined, undefined, undefined, undefined, dependsOn);
	}

	static makePanel(panel){
	  return new UIItem(ItemType.PANEL, undefined, panel);
	}

	static makeAdditionalLink(linkText, dialogText, panel){
	  return new UIItem(ItemType.ADDITIONAL_LINK, undefined, panel, undefined, linkText, dialogText);
	}

	static makeControl(control){
	  return new UIItem(ItemType.CONTROL, undefined, undefined, control);
	}

	static makeHSeparator(label){
	  return new UIItem(ItemType.HORIZONTAL_SEPARATOR, undefined, undefined, undefined, label);
	}

	static makeStaticText(label){
	  return new UIItem(ItemType.STATIC_TEXT, undefined, undefined, undefined, label);
	}
}
