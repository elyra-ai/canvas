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

Cypress.Commands.add("rightClickToDisplayContextMenu", (distFromLeft, distFromTop) => {
	cy.get("#canvas-div-0").rightclick(distFromLeft, distFromTop);
});

Cypress.Commands.add("getOptionFromContextMenu", (optionName) => {
	cy.get(".context-menu-popover").find(".context-menu-item:not(.contextmenu-divider)")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				if (options[idx].outerText === optionName) {
					return options[idx];
				}
			}
			return null;
		});
});

Cypress.Commands.add("clickOptionFromContextMenu", (optionName) => {
	cy.getOptionFromContextMenu(optionName).click();
});

Cypress.Commands.add("clickOptionFromContextSubmenu", (submenuName, optionName) => {
	cy.get(".context-menu-popover").find(".context-menu-item:not(.contextmenu-divider)")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				if (options[idx].outerText === optionName) {
					options[idx].click();
				}
			}
		});
});

Cypress.Commands.add("clickColorFromContextSubmenu", (submenuName, optionName) => {
	cy.get(".context-menu-popover").find(".color-picker-item")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				if (options[idx].className === "color-picker-item " + optionName) {
					options[idx].click();
				}
			}
		});
});

Cypress.Commands.add("simulateClickInBrowsersEditMenu", (type) => {
	cy.get("#canvas-div-0").trigger(type);
});
