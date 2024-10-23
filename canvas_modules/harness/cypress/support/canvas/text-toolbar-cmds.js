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

Cypress.Commands.add("clickTextToolbarOption", (action, menuAction) => {
	cy.getTextToolbarAction(action).click();

	// The actions below cause a menu to appear so we handle that usng menuAction.
	switch (action) {
	case "headerStyle":
	case "submenu-font":
	case "submenu-text-size":
	case "submenu-align-horiz":
	case "submenu-align-vert":
	case "sub-menu-outline":
		cy.getOptionFromTextToolbarOverflow(menuAction).click({ force: true });
		break;
	case "submenu-text-color":
	case "submenu-background-color":
		cy.getOptionFromTextToolbarColorPalette(menuAction).click({ force: true });
		break;
	default:
		return;
	}
});

Cypress.Commands.add("getTextToolbarAction", (action) => {
	cy.getTextToolbar().find("." + action + "-action");
});

Cypress.Commands.add("getTextToolbar", () => {
	cy.get(".text-toolbar");
});

Cypress.Commands.add("getOptionFromTextToolbarOverflow", (optionName) => {
	cy.getTextToolbar()
		.find(".toolbar-popover-list")
		.find(".toolbar-sub-menu-item")
		.find("button")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				const optionText = options[idx].outerText;
				if (optionText === optionName) {
					return options[idx];
				}
			}
			return null;
		});
});

Cypress.Commands.add("getOptionFromTextToolbarColorPalette", (optionName) => {
	cy.getTextToolbar()
		.find(".toolbar-popover-list")
		.find(".color-picker")
		.find("div")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				const dataColor = options[idx].getAttribute("data-color");
				if (dataColor === optionName) {
					return options[idx];
				}
			}
			return null;
		});
});
