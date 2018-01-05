/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { ItemType } from "./form-constants";
import _ from "underscore";

export class UIItem {
	constructor(elements) {
		this.itemType = _.propertyOf(elements)("itemType");
		this.tabs = _.propertyOf(elements)("tabs"); // when PRIMARY_TABS, SUB_TABS or PANEL_SELECTOR
		this.panel = _.propertyOf(elements)("panel"); // when PANEL or ADDITIONAL_LINK
		this.control = _.propertyOf(elements)("control"); // when CONTROL
		this.text = _.propertyOf(elements)("text"); // when ADDITIONAL_LINK (link label) or STATIC_TEXT
		this.textType = _.propertyOf(elements)("textType"); // when STATIC_TEXT
		this.secondaryText = _.propertyOf(elements)("secondaryText"); // when ADDITIONAL_LINK (subpanel label)
		this.dependsOn = _.propertyOf(elements)("dependsOn"); // when PANEL_SELECTOR (control to obtain value from)
		this.action = _.propertyOf(elements)("action"); // when ACTION
	}

	static makePrimaryTabs(tabs) {
		return new UIItem({
			itemType: ItemType.PRIMARY_TABS,
			tabs: tabs
		});
	}

	static makeSubTabs(tabs) {
		return new UIItem({
			itemType: ItemType.SUB_TABS,
			tabs: tabs
		});
	}

	static makePanelSelector(tabs, dependsOn) {
		return new UIItem({
			itemType: ItemType.PANEL_SELECTOR,
			tabs: tabs,
			dependsOn: dependsOn
		});
	}

	static makePanel(panel) {
		return new UIItem({
			itemType: ItemType.PANEL,
			panel: panel
		});
	}

	static makeAdditionalLink(text, dialogText, panel) {
		return new UIItem({
			itemType: ItemType.ADDITIONAL_LINK,
			panel: panel,
			text: text,
			secondaryText: dialogText
		});
	}

	static makeControl(control) {
		return new UIItem({
			itemType: ItemType.CONTROL,
			control: control
		});
	}

	static makeAction(action) {
		return new UIItem({
			itemType: ItemType.ACTION,
			action: action
		});
	}

	static makeHSeparator() {
		return new UIItem({
			itemType: ItemType.HORIZONTAL_SEPARATOR
		});
	}

	static makeStaticText(text, textType) {
		return new UIItem({
			itemType: ItemType.STATIC_TEXT,
			text: text,
			textType: textType
		});
	}

	static makeTextPanel(label, description) {
		return new UIItem({
			itemType: ItemType.TEXT_PANEL,
			panel: {
				label: label,
				description: description
			}
		});
	}

	static makeCheckboxPanel(panel) {
		return new UIItem({
			itemType: ItemType.CHECKBOX_SELECTOR,
			panel: panel
		});
	}
	static makeCustomPanel(panel) {
		return new UIItem({
			itemType: ItemType.CUSTOM_PANEL,
			panel: panel
		});
	}
	static makeSummaryPanel(panel) {
		return new UIItem({
			itemType: ItemType.SUMMARY_PANEL,
			panel: panel
		});
	}
}
