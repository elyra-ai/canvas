/*
 * Copyright 2017-2025 Elyra Authors
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


import { ResourceDef } from "../util/L10nProvider";

export class Button {
	constructor(id, label, description, icon, carbonIcon, enabled, divider) {
		this.id = id;
		this.label = label;
		this.description = description;
		this.icon = icon;
		this.carbonIcon = carbonIcon;
		this.enabled = enabled;
		this.divider = divider;
	}
}

class ButtonDef {
	static makeButtonDef(button) {
		if (button) {
			const buttonDef = new ButtonDef();
			buttonDef.id = button.id;
			buttonDef.label = ResourceDef.make(button.label);
			buttonDef.description = ResourceDef.make(button.description);
			buttonDef.icon = button.icon;
			buttonDef.carbonIcon = button.carbon_icon;
			buttonDef.enabled = button.enabled;
			buttonDef.divider = button.divider;
			return buttonDef;
		}
		return null;
	}
}

export class ButtonMetadata {
	constructor(buttonDefs) {
		this.buttonDefs = buttonDefs;
	}

	getButton(buttonId) {
		let buttonDef;
		this.buttonDefs.forEach(function(button) {
			if (button.id === buttonId) {
				buttonDef = button;
			}
		});
		return buttonDef;
	}

	static makeButtonMetadata(uihintsButtons) {
		if (uihintsButtons) {
			const buttonDefs = [];
			for (const button of uihintsButtons) {
				const buttonDef = ButtonDef.makeButtonDef(button);
				if (buttonDef) {
					buttonDefs.push(buttonDef);
				}
			}
			return new ButtonMetadata(buttonDefs);
		}
		return null;
	}
}
