/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("getNodeForLabel", (nodeLabel) =>
	cy.get(getNodeGrpSelector())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

Cypress.Commands.add("getNodeForLabelInSubFlow", (nodeLabel) =>
	cy.get(getNodeGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

Cypress.Commands.add("getSupernodePipelineId", (supernodeName) => {
	cy.get(getNodeGrpSelector())
		.then((grpArray) => findGrpForLabel(grpArray, supernodeName).__data__.subflow_ref.pipeline_id_ref);
});

function getNodeGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function getNodeGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function findGrpForLabel(grpArray, nodeLabel) {
	for (let idx = 0; idx < grpArray.length; idx++) {
		if (grpArray[idx].__data__.label === nodeLabel) {
			return grpArray[idx];
		}
	}
	return null;
}

Cypress.Commands.add("clickCategory", (nodeCategory) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			cy.get(".palette-categories > div").each((category) => {
				if (category[0].outerText === nodeCategory) {
					category.click();
				}
			});
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-flyout-category").each((category) => {
				if (category[0].attributes.value.value === nodeCategory) {
					category.click();
				}
			});
		}
	});
});

Cypress.Commands.add("doubleClickNodeInCategory", (nodeLabel) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			cy.get(".palette-grid-node-inner > .palette-grid-node-text").contains(nodeLabel)
				.dblclick();
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-list-item-text-div > span").contains(nodeLabel)
				.dblclick();
		}
	});
});

Cypress.Commands.add("clickOptionFromContextMenu", (optionName) => {
	cy.get(".context-menu-popover").find(".react-contextmenu-item:not(.contextmenu-divider)")
		.then((options) => {
			options.each((idx) => {
				if (options[idx].outerText === optionName) {
					options[idx].click();
				}
			});
		});
});
