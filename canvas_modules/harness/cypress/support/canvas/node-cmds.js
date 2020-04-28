/*
 * Copyright 2017-2020 IBM Corporation
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

Cypress.Commands.add("getNodeForLabel", (nodeLabel) =>
	cy.get(getNodeGrpSelector())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

Cypress.Commands.add("getNodeForLabelInSubFlow", (nodeLabel) =>
	cy.get(getNodeGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

Cypress.Commands.add("getNodeForLabelInSupernode", (nodeLabel, supernodeName) => {
	cy.getNodeForLabel(supernodeName)
		.then((supernode) => {
			const supernodeId = supernode[0].getAttribute("data-id").substring(11);
			cy.get(getNodeGrpSelectorInSupernode(supernodeId))
				.then((grpArray) => findGrpForLabel(grpArray, nodeLabel));
		});
});

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

function getNodeGrpSelectorInSupernode(supernodeId) {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector =
	`div > svg > g > g[data-id='node_grp_${inst}_${supernodeId}'] > svg > g > g[data-id^='node_grp_${inst}']`;
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

Cypress.Commands.add("ctrlOrCmdClickNode", (nodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey().then((selectedKey) => cy.getNodeForLabel(nodeName).type(selectedKey, { release: false }));
});

Cypress.Commands.add("getNumberOfSelectedNodes", () => {
	cy.get(".d3-node-selection-highlight")
		.then((nodes) => {
			const selectedNodes = nodes.filter((idx) => nodes[idx].getAttribute("data-selected") === "yes");
			return selectedNodes.length;
		});
});

Cypress.Commands.add("clickDecoratorHotspotOnNode", (decoratorId, nodeName) => {
	cy.getNodeForLabel(nodeName)
		.find(`.d3-node-dec-outline[data-id=node_dec_outln_0_${decoratorId}]`)
		.click();
});

Cypress.Commands.add("dragDeriveNodeAtPosition", (canvasX, canvasY) => {
	const dataTransfer = new DataTransfer();
	cy.get("#harness-sidePanelNodeDraggable")
		.trigger("dragstart", { dataTransfer });
	cy.get("#harness-app-container")
		.trigger("drop", canvasX, canvasY, { dataTransfer });
});

Cypress.Commands.add("dragNodeAtPosition", (nodeLabel, canvasX, canvasY) => {
	cy.document().then((doc) => {
		const dataTransfer = new DataTransfer();
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			// drag the node to the canvas
			cy.get(".palette-grid-node-inner > .palette-grid-node-text").contains(nodeLabel)
				.trigger("dragstart", { dataTransfer });
			cy.get("#harness-app-container")
				.trigger("drop", canvasX, canvasY, { dataTransfer });
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-list-item-text-div > span").contains(nodeLabel)
				.trigger("dragstart", { dataTransfer });
			cy.get("#harness-app-container")
				.trigger("drop", canvasX, canvasY, { dataTransfer });
		}
	});
});

Cypress.Commands.add("deleteNode", (nodeLabel) => {
	// Delete node from context menu
	cy.getNodeForLabel(nodeLabel).rightclick();
	cy.clickOptionFromContextMenu("Delete");
});
