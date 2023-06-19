/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ItemType } from "../constants/form-constants";
import { propertyOf } from "lodash";

export class UIItem {
	constructor(elements) {
		this.id = propertyOf(elements)("id");
		this.itemType = propertyOf(elements)("itemType");
		this.tabs = propertyOf(elements)("tabs"); // when PRIMARY_TABS, SUB_TABS or PANEL_SELECTOR
		this.panel = propertyOf(elements)("panel"); // when PANEL or ADDITIONAL_LINK
		this.control = propertyOf(elements)("control"); // when CONTROL
		this.text = propertyOf(elements)("text"); // when ADDITIONAL_LINK (link label) or STATIC_TEXT
		this.textType = propertyOf(elements)("textType"); // when STATIC_TEXT
		this.secondaryText = propertyOf(elements)("secondaryText"); // when ADDITIONAL_LINK (subpanel label)
		this.dependsOn = propertyOf(elements)("dependsOn"); // when PANEL_SELECTOR (control to obtain value from)
		this.action = propertyOf(elements)("action"); // when ACTION
		this.className = propertyOf(elements)("className");
		this.nestedPanel = propertyOf(elements)("nestedPanel"); // when SUB_TABS
	}

	static makePrimaryTabs(tabs) {
		return new UIItem({
			itemType: ItemType.PRIMARY_TABS,
			tabs: tabs
		});
	}

	static makeSubTabs(tabs, className, nestedPanel) {
		return new UIItem({
			itemType: ItemType.SUB_TABS,
			tabs: tabs,
			className: className,
			nestedPanel: nestedPanel
		});
	}

	static makePanelSelector(groupName, tabs, dependsOn, className) {
		return new UIItem({
			id: groupName,
			itemType: ItemType.PANEL_SELECTOR,
			tabs: tabs,
			dependsOn: dependsOn,
			className: className
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

	static makeTextPanel(groupName, label, description, className, nestedPanel) {
		return new UIItem({
			itemType: ItemType.TEXT_PANEL,
			panel: {
				id: groupName,
				label: label,
				description: description,
				className: className,
				nestedPanel: nestedPanel
			}
		});
	}

	static makeCustomPanel(panel, className) {
		return new UIItem({
			itemType: ItemType.CUSTOM_PANEL,
			panel: panel,
			className: className
		});
	}

	static makeTearsheetPanel(control, description) {
		return new UIItem({
			itemType: ItemType.TEARSHEET,
			panel: {
				...control,
				description
			}
		});
	}
}
