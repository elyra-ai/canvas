/*
 * Copyright 2017-2021 Elyra Authors
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

Cypress.Commands.add("getNodeWithLabel", (nodeLabel) => {
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
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			if (node) {
				return node[0].getAttribute("data-id").substring(11);
			}
			return null;
		})
);

Cypress.Commands.add("doubleClickLabelOnNode", (nodeLabel) => {
	cy.getNodeWithLabel(nodeLabel)
		.find("foreignObject > div > span")
		.dblclick();
});

Cypress.Commands.add("clickNodeLabelEditIcon", (nodeLabel) => {
	cy.getNodeWithLabel(nodeLabel)
		.find(".d3-node-label-edit-icon-group")
		.last() // With horizontal format nodes, two edit icons may be on the canvas while running tests
		.click();
});

Cypress.Commands.add("enterLabelForNode", (nodeLabel, newLabel) => {
	cy.getNodeWithLabel(nodeLabel)
		.find("foreignObject > textarea")
		.clear()
		.type(newLabel);
	// Click canvas to complete text entry
	cy.get("#canvas-div-0").click(1, 1);
});


Cypress.Commands.add("setNodeImage", (nodeLabel, nodeImage) =>
	cy.getNodeIdForLabel(nodeLabel)
		.then((nodeId) => {
			cy.document().then((doc) => {
				doc.canvasController.setNodeProperties(nodeId, { image: nodeImage });
			});
		})
);

Cypress.Commands.add("getNodeWithLabelInSubFlow", (nodeLabel) =>
	cy.get(getNodeGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel))
);

Cypress.Commands.add("getNodeWithLabelInSupernode", (nodeLabel, supernodeName) => {
	cy.getNodeWithLabel(supernodeName)
		.then((supernode) => {
			const supernodeId = supernode[0].getAttribute("data-id").substring(11);
			cy.get(getNodeGrpSelectorInSupernode(supernodeId))
				.then((grpArray) => findGrpForLabel(grpArray, nodeLabel));
		});
});

Cypress.Commands.add("getNodeIdForLabelInSupernode", (nodeLabel, supernodeName) =>
	cy.getNodeWithLabelInSupernode(nodeLabel, supernodeName)
		.then((node) => {
			if (node) {
				return node[0].getAttribute("data-id").substring(11);
			}
			return null;
		})
);

Cypress.Commands.add("getSupernodePipelineId", (supernodeName) => {
	cy.get(getNodeGrpSelector())
		.then((grpArray) => findGrpForLabel(grpArray, supernodeName).__data__.subflow_ref.pipeline_id_ref);
});

Cypress.Commands.add("getSupernodePipelineIdNested", (nodeName, supernodeName) => {
	// Get pipeline id of a node within supernode
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
		.then((node) => node[0].__data__.subflow_ref.pipeline_id_ref);
});

function getNodeGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function getNodeGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g > svg > g > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function getNodeGrpSelectorInSupernode(supernodeId) {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector =
	`div > svg > g > g > g[data-id='node_grp_${inst}_${supernodeId}'] > svg > g > g > g[data-id^='node_grp_${inst}']`;
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

Cypress.Commands.add("clickNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName).click();
});

Cypress.Commands.add("ctrlOrCmdClickNode", (nodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey().then((selectedKey) => {
		cy.get("body")
			.type(selectedKey, { release: false })
			.getNodeWithLabel(nodeName)
			.click();
		// Cancel the command/ctrl key press -- the documentation doesn't say
		// this needs to be done but if it isn't the command key stays pressed down
		// causing problems with subsequent selections.
		cy.get("body")
			.type(selectedKey, { release: true });
	});
});

Cypress.Commands.add("ctrlOrCmdClickNodeInSupernode", (nodeName, supernodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey().then((selectedKey) => {
		cy.get("body")
			.type(selectedKey, { release: false })
			.getNodeWithLabelInSupernode(nodeName, supernodeName)
			.click();

		// Cancel the command/ctrl key press
		cy.get("body")
			.type(selectedKey, { release: true });
	});
});

Cypress.Commands.add("rightClickNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
		.rightclick();
});

Cypress.Commands.add("rightClickNodeInSupernode", (nodeName, supernodeName) => {
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
		.rightclick();
});

Cypress.Commands.add("rightClickSourcePortOfNode", (nodeName, srcPortId) => {
	cy.getNodePortSelector(nodeName, "out_port", srcPortId)
		.then((portSelector) => cy.get(portSelector).rightclick("bottom"));
});

Cypress.Commands.add("rightClickTargetPortOfNode", (nodeName, trgPortId) => {
	// Added { force: true } to disable element visibility errorCheck from Cypress
	cy.getNodePortSelector(nodeName, "inp_port", trgPortId)
		.then((portSelector) => cy.get(portSelector).rightclick({ force: true }));
});

Cypress.Commands.add("hoverOverNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
		.trigger("mouseenter");
});

Cypress.Commands.add("hoverOverNodeLabel", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-label > span")
		.trigger("mouseenter");
});


Cypress.Commands.add("hoverOverNodeInSupernode", (nodeName, supernodeName) => {
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
		.trigger("mouseenter", { force: true });
});

Cypress.Commands.add("hoverOverInputPortOfNode", (nodeName, inputPortId) => {
	cy.getNodePortSelector(nodeName, "inp_port", inputPortId)
		.then((portSelector) => {
			cy.get(portSelector)
				.trigger("mouseenter", { force: true });
		});
});

Cypress.Commands.add("hoverOverOutputPortOfNode", (nodeName, outputPortId) => {
	cy.getNodePortSelector(nodeName, "out_port", outputPortId)
		.then((portSelector) => {
			cy.get(portSelector)
				.trigger("mouseenter", { force: true });
		});
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
	cy.getNodeWithLabel(nodeName)
		.find(`.d3-node-dec-group[data-id=node_dec_group_0_${decoratorId}]`)
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
				.trigger("dragover", canvasX, canvasY, { dataTransfer });
			cy.get("#harness-app-container")
				.trigger("drop", canvasX, canvasY, { dataTransfer });
		}
	});
});

// Solution found here - https://github.com/cypress-io/cypress/issues/3441#issuecomment-463239982
Cypress.Commands.add("moveNodeToPosition", (nodeLabel, canvasX, canvasY) => {
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			const srcSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", "body") + "']";
			cy.window().then((win) => {
				cy.getCanvasTranslateCoords()
					.then((transform) => {
						cy.get(srcSelector)
							.trigger("mousedown", "topLeft", { which: 1, view: win });
						cy.get("#canvas-div-0")
							.trigger("mousemove", canvasX + transform.x, canvasY + transform.y, { view: win })
							.trigger("mouseup", { which: 1, view: win });
					});
			});
		});
});

Cypress.Commands.add("deleteNodeUsingContextMenu", (nodeLabel) => {
	// Delete node from context menu
	cy.getNodeWithLabel(nodeLabel).rightclick();
	cy.clickOptionFromContextMenu("Delete");
});

Cypress.Commands.add("deleteNodeUsingKeyboard", (nodeName) => {
	// Delete node by pressing 'Delete' key on keyboard
	cy.useDeleteKey()
		.then((deleteKey) => {
			cy.getNodeWithLabel(nodeName)
				.click()
				.type(deleteKey);
		});
});

Cypress.Commands.add("deleteNodeUsingToolbar", (nodeName) => {
	// Select node and press delete icon on toolbar
	cy.getNodeWithLabel(nodeName).click();
	cy.clickToolbarDelete();
});

Cypress.Commands.add("deleteNodeInSupernodeUsingKeyboard", (nodeName, supernodeName) => {
	// Delete node in supernode by pressing 'Delete' key on keyboard
	cy.useDeleteKey()
		.then((deleteKey) => {
			cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
				.click()
				.type(deleteKey);
		});
});

Cypress.Commands.add("getNodeDimensions", (nodeLabel) => {
	cy.getNodeWithLabel(nodeLabel).then((node) => {
		const nodeDimensions = {
			x_pos: node[0].__data__.x_pos,
			y_pos: node[0].__data__.y_pos,
			width: node[0].__data__.width,
			height: node[0].__data__.height
		};
		return nodeDimensions;
	});
});

Cypress.Commands.add("selectAllNodesUsingCtrlOrCmdKey", () => {
	cy.get("#canvas-div-0").find(".d3-node-image")
		.then((nodes) => {
			cy.useCtrlOrCmdKey()
				.then((selectedKey) => {
					// Press and hold the ctrl/cmd key
					cy.get("body")
						.type(selectedKey, { release: false });

					// Click all the nodes
					nodes.each((idx, node) => {
						cy.wrap(node)
							.click();
					});

					// Cancel the ctrl/cmd key press
					cy.get("body")
						.type(selectedKey, { release: true });
				});
		});
});

Cypress.Commands.add("clickExpandedCanvasBackgroundOfSupernode", (supernodeName) => {
	cy.getNodeWithLabel(supernodeName)
		.find(".svg-area")
		.eq(0)
		.click();
});

Cypress.Commands.add("rightClickExpandedCanvasBackgroundOfSupernode", (supernodeName) => {
	cy.getNodeWithLabel(supernodeName)
		.find(".svg-area")
		.eq(0)
		.rightclick();
});

Cypress.Commands.add("ctrlOrCmdClickExpandedCanvasBackgroundOfSupernode", (supernodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey().then((selectedKey) => {
		cy.get("body")
			.type(selectedKey, { release: false })
			.getNodeWithLabel(supernodeName)
			.find(".svg-area")
			.eq(0)
			.click();
		// Cancel the command/ctrl key press
		cy.get("body")
			.type(selectedKey, { release: true });
	});
});

// Palette commands
Cypress.Commands.add("findCategory", (nodeCategory) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			cy.get(".palette-categories > div")
				.then((categories) => {
					let category = null;
					for (let idx = 0; idx < categories.length; idx++) {
						if (categories[idx].outerText === nodeCategory) {
							category = categories[idx];
							break;
						}
					}
					return category;
				});
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-flyout-category")
				.then((categories) => {
					let category = null;
					for (let idx = 0; idx < categories.length; idx++) {
						if (categories[idx].attributes.value.value === nodeCategory) {
							category = categories[idx];
							break;
						}
					}
					return category;
				});
		}
	});
});

Cypress.Commands.add("clickCategory", (nodeCategory) => {
	cy.findCategory(nodeCategory).click();
});

Cypress.Commands.add("hoverOverCategory", (nodeCategory) => {
	cy.findCategory(nodeCategory).trigger("mouseover");
});

Cypress.Commands.add("findNodeInCategory", (nodeLabel) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			cy.get(".palette-grid-node-inner > .palette-grid-node-text").contains(nodeLabel);
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-list-item-text-div > span").contains(nodeLabel);
		}
	});
});

Cypress.Commands.add("doubleClickNodeInCategory", (nodeLabel) => {
	cy.findNodeInCategory(nodeLabel).dblclick();
});

Cypress.Commands.add("hoverOverNodeInCategory", (nodeLabel) => {
	cy.findNodeIndexInPalette(nodeLabel)
		.then((nodeIndex) => {
			cy.get(".palette-list-item")
				.eq(nodeIndex)
				.trigger("mouseover");
		});
});

Cypress.Commands.add("findNodeInPalette", (filterText) => {
	cy.get(".palette-flyout-search").click();
	cy.get(".palette-flyout-search")
		.find("input")
		.type("{selectall}")
		.type(filterText);
});

Cypress.Commands.add("findNodeIndexInPalette", (nodeName) => {
	cy.document().then((doc) => {
		// Palette Layout - Modal
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			cy.get(".palette-grid-node-text")
				.then((listItems) => {
					let nodeIndex = -1;
					for (let idx = 0; idx < listItems.length; idx++) {
						if (listItems[idx].textContent === nodeName) {
							nodeIndex = idx;
						}
					}
					return nodeIndex;
				});
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-list-item-text-span")
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

Cypress.Commands.add("moveMouseToCoordinates", (x, y) => {
	cy.get(".d3-svg-canvas-div")
		.trigger("mouseover", x, y);
});
