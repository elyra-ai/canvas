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

Cypress.Commands.add("getNodeForLabel", (nodeLabel) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-node-group").length) {
			cy.get(getNodeGrpSelector())
				.then((grpArray) => findGrpForLabel(grpArray, nodeLabel));
		}
		// No nodes found on canvas
		return null;
	});
});

Cypress.Commands.add("getNodeIdForLabel", (nodeLabel) =>
	cy.getNodeForLabel(nodeLabel)
		.then((node) => node[0].getAttribute("data-id").substring(11)));

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
	cy.useCtrlOrCmdKey().then((selectedKey) => {
		cy.get("body")
			.type(selectedKey, { release: false })
			.getNodeForLabel(nodeName)
			.click();
		// Cancel the command/ctrl key press -- the documentation doesn't say
		// this needs to be done but if it isn't the command key stays pressed down
		// causing problems with subsequent selections.
		cy.get("body")
			.type(selectedKey, { release: true });
	});
});

Cypress.Commands.add("rightClickNode", (nodeName) => {
	cy.getNodeForLabel(nodeName)
		.rightclick();
});


Cypress.Commands.add("getNumberOfSelectedNodes", () => {
	cy.getSelectedNodes()
		.then((selectedNodes) => selectedNodes.length);
});

Cypress.Commands.add("getSelectedNodes", () => {
	cy.document().then((doc) => {
		const selectedNodes = doc.canvasController.getSelectedNodes();
		return selectedNodes;
	});
});

Cypress.Commands.add("isNodeSelected", (nodeName) => {
	cy.getSelectedNodes()
		.then((selectedNodes) => {
			const idx = selectedNodes.findIndex((selNode) => selNode.label === nodeName);
			if (idx > -1) {
				return true;
			}
			return false;
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

Cypress.Commands.add("dragNodeToPosition", (nodeLabel, canvasX, canvasY) => {
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

// Solution found here - https://github.com/cypress-io/cypress/issues/3441#issuecomment-463239982
Cypress.Commands.add("moveNodeToPosition", (nodeLabel, canvasX, canvasY) => {
	cy.getNodeForLabel(nodeLabel)
		.then((node) => {
			const srcSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", "body") + "']";
			cy.window().then((win) => {
				cy.get(srcSelector)
					.trigger("mousedown", "topLeft", { which: 1, view: win });
				cy.get("#canvas-div-0")
					.trigger("mousemove", canvasX, canvasY, { view: win })
					.trigger("mouseup", { which: 1, view: win });
			});
		});
});

Cypress.Commands.add("deleteNode", (nodeLabel) => {
	// Delete node from context menu
	cy.getNodeForLabel(nodeLabel).rightclick();
	cy.clickOptionFromContextMenu("Delete");

	// Verify node is deleted
	cy.verifyNodeIsDeleted(nodeLabel);
});

Cypress.Commands.add("getNodeDimensions", (nodeLabel) => {
	cy.getNodeForLabel(nodeLabel).then((node) => {
		const nodeDimensions = {
			x_pos: node[0].__data__.x_pos,
			y_pos: node[0].__data__.y_pos,
			width: node[0].__data__.width,
			height: node[0].__data__.height
		};
		return nodeDimensions;
	});
});
