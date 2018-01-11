/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { ItemType } from "../constants/form-constants";
import propertyOf from "lodash/propertyOf";

export class UIItem {
	constructor(elements) {
		this.itemType = propertyOf(elements)("itemType");
		this.tabs = propertyOf(elements)("tabs"); // when PRIMARY_TABS, SUB_TABS or PANEL_SELECTOR
		this.panel = propertyOf(elements)("panel"); // when PANEL or ADDITIONAL_LINK
		this.control = propertyOf(elements)("control"); // when CONTROL
		this.text = propertyOf(elements)("text"); // when ADDITIONAL_LINK (link label) or STATIC_TEXT
		this.textType = propertyOf(elements)("textType"); // when STATIC_TEXT
		this.secondaryText = propertyOf(elements)("secondaryText"); // when ADDITIONAL_LINK (subpanel label)
		this.dependsOn = propertyOf(elements)("dependsOn"); // when PANEL_SELECTOR (control to obtain value from)
		this.action = propertyOf(elements)("action"); // when ACTION
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
