/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { ItemType } from "./form-constants";

export class UIItem {
	constructor(elements) {
		if (elements.itemType) {
			this.itemType = elements.itemType;
		}
		if (elements.tabs) {
			this.tabs = elements.tabs; // when PRIMARY_TABS, SUB_TABS or PANEL_SELECTOR
		}
		if (elements.panel) {
			this.panel = elements.panel; // when PANEL or ADDITIONAL_LINK
		}
		if (elements.control) {
			this.control = elements.control; // when CONTROL
		}
		if (elements.text) {
			this.text = elements.text; // when ADDITIONAL_LINK (link label), STATIC_TEXT or HORIZONTAL_SEPARATOR
		}
		if (elements.secondaryText) {
			this.secondaryText = elements.secondaryText; // when ADDITIONAL_LINK (subpanel label)
		}
		if (elements.dependsOn) {
			this.dependsOn = elements.dependsOn; // when PANEL_SELECTOR (control to obtain value from)
		}
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

	static makeHSeparator(label) {
		return new UIItem({
			itemType: ItemType.HORIZONTAL_SEPARATOR,
			label: label
		});
	}

	static makeStaticText(label) {
		return new UIItem({
			itemType: ItemType.STATIC_TEXT,
			label: label
		});
	}
}
