/*
 * Copyright 2024 Elyra Authors
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


Cypress.Commands.add("clickContextToolbarOverflowButton", () => {
	cy.getContextToolbarOverflowItem().click();
});

Cypress.Commands.add("getContextToolbarOverflowItem", () => {
	cy.findOverflowItem(cy.getContextToolbar());
});

Cypress.Commands.add("clickContextToolbarButton", (optionName) => {
	cy.getOptionFromContextToolbar(optionName).click();
});

Cypress.Commands.add("getOptionFromContextToolbar", (optionName) => {
	cy.getContextToolbar()
		.find(".toolbar-item." + optionName + "-action")
		.first();
});

Cypress.Commands.add("clickOptionFromContextToolbarOverflow", (optionName) => {
	cy.getOptionFromContextToolbarOverflow(optionName).click({ force: true });
});

Cypress.Commands.add("getOptionFromContextToolbarOverflow", (optionName) => {
	cy.getContextToolbar()
		.find(".toolbar-popover-list")
		.find(".toolbar-sub-menu-item")
		.find("button")
		.then((options) => {
			for (let idx = 0; idx < options.length; idx++) {
				if (options[idx].outerText === optionName) {
					return options[idx];
				}
			}
			return null;
		});
});

Cypress.Commands.add("moveOutOfContextToolbar", (xPos, yPos) => {
	// Note: react uses mouseout even though cc-context-toolbar is listening to mouseleave.
	cy.get(".context-toolbar")
		.trigger("mouseout", xPos, yPos, { force: true });
});

Cypress.Commands.add("getContextToolbar", () => {
	cy.get(".context-toolbar");
});

