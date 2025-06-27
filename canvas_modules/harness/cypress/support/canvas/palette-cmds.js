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
/* eslint arrow-body-style: "off" */

Cypress.Commands.add("findCategory", (categoryLabel) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Dialog") {
			cy.get(".palette-dialog-categories > div")
				.then((categories) => {
					let category = null;
					for (let idx = 0; idx < categories.length; idx++) {
						if (categories[idx].outerText === categoryLabel) {
							category = categories[idx];
							break;
						}
					}
					return category;
				});
		// Palette Layout - Flyout
		} else {
			cy.get(".palette-flyout-category")
				.then((categories) => {
					let category = null;
					for (let idx = 0; idx < categories.length; idx++) {
						if (categories[idx].attributes.value.value === categoryLabel) {
							category = categories[idx];
							break;
						}
					}
					return category;
				});
		}
	});
});

Cypress.Commands.add("clickCategory", (categoryLabel) => {
	cy.findCategory(categoryLabel).click();
});

Cypress.Commands.add("hoverOverCategory", (categoryLabel) => {
	cy.findCategory(categoryLabel).trigger("mouseover");
});

Cypress.Commands.add("findCategoryAccordionItem", (categoryLabel) => {
	cy.findCategory(categoryLabel)
		.then((cat) => {
			return cat
				.parent()
				.parent()
				.parent();
		});
});

Cypress.Commands.add("findCategoryAccordionItemButton", (categoryLabel) => {
	cy.findCategory(categoryLabel)
		.then((cat) => {
			return cat
				.parent()
				.parent();
		});
});

Cypress.Commands.add("findNodeInCategory", (nodeLabel, categoryLabel) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Dialog") {
			cy.get(".palette-dialog-grid-node-inner > .palette-dialog-grid-node-text")
				.contains(nodeLabel)
				.parent()
				.parent();
		// Palette Layout - Flyout
		} else if (categoryLabel) {
			cy.findCategoryAccordionItem(categoryLabel)
				.find(".palette-list-item")
				.contains(nodeLabel) // Returns the text <span> within in the node item
				.parent() // Returns the palette-list-item-text-div
				.parent() // Returns the palette-list-item-icon-and-text
				.parent(); // Returns the palette-list-item
		}
	});
});

Cypress.Commands.add("doubleClickNodeInCategory", (nodeLabel, categoryLabel) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel).dblclick();
});

Cypress.Commands.add("clickNodeInCategory", (nodeLabel, categoryLabel) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel).click();
});

Cypress.Commands.add("hoverOverNodeInCategory", (nodeLabel, categoryLabel) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel).trigger("mouseover", { buttons: 0 });
});

Cypress.Commands.add("searchForNodeUsing", (filterText) => {
	cy.get(".palette-flyout-search").click();
	cy.get(".palette-flyout-search")
		.find("input")
		.as("input");
	cy.get("@input")
		.type("{selectall}");
	cy.get("@input")
		.type(filterText);
});

Cypress.Commands.add("findNodeIndexInPalette", (nodeName) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Dialog") {
			cy.get(".palette-dialog-grid-node-text")
				.then((listItems) => {
					let nodeIndex = -1;
					for (let idx = 0; idx < listItems.length; idx++) {
						if (listItems[idx].textContent === nodeName) {
							nodeIndex = idx;
						}
					}
					return nodeIndex;
				});
		// Palette Layout - Flyout
		} else {
			cy.get(".palette-list-item-text-div")
				.then((listItems) => {
					let nodeIndex = -1;
					for (let idx = 0; idx < listItems.length; idx++) {
						if (listItems[idx].textContent === nodeName) {
							nodeIndex = idx;
							break;
						}
					}
					return nodeIndex;
				});
		}
	});
});

// This code simulates the user pressing tab to move the keyboard focus.
// TODO - Use the Cypress tab() method when "Native Events" are supported in Cypress
Cypress.Commands.add("tabToCategory", (categoryLabel) => {
	cy.findCategoryAccordionItemButton(categoryLabel)
		.focus();
});

Cypress.Commands.add("pressSpaceOnCategory", (categoryLabel) => {
	cy.findCategory(categoryLabel)
		.type(" ");
});

// This code simulates the user pressing tab to move the keyboard focus.
// TODO - Use the Cypress tab() method when "Native Events" are supported in Cypress
Cypress.Commands.add("tabToNodeInCategory", (nodeLabel, categoryLabel) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel)
		.focus();
});

Cypress.Commands.add("pressOnNodeInCategory", (nodeLabel, categoryLabel, keyObj) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel)
		.trigger("keydown", keyObj);
});
