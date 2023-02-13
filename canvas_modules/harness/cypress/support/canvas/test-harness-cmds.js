/*
 * Copyright 2017-2022 Elyra Authors
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

// Global scope - extraCanvas
document.extraCanvas = false;
document.instanceId = 0;

Cypress.Commands.add("inExtraCanvas", () => {
	document.extraCanvas = true;
	document.instanceId = 1;
});

Cypress.Commands.add("inRegularCanvas", () => {
	document.extraCanvas = false;
	document.instanceId = 0;
});

// `cy.log()` command's output can be seen on the screen along with test steps
Cypress.Commands.overwrite("log", (subject, message) => cy.task("log", message));

Cypress.Commands.add("toggleCommonCanvasSidePanel", () => {
	cy.get("#harness-action-bar-sidepanel-canvas").click();
});

Cypress.Commands.add("toggleCommonPropertiesSidePanel", () => {
	cy.get("#harness-action-bar-sidepanel-modal").click();
});

Cypress.Commands.add("openCanvasDefinition", (canvasFileName, checkForComment) => {
	cy.document().then((doc) => {
		doc.setCanvasDropdownFile(canvasFileName);
	});
	// Wait until we can get a node or comment from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	if (checkForComment) {
		cy.get(".d3-comment-group");
	} else {
		cy.get(".d3-node-group");
	}
});

Cypress.Commands.add("openCanvasDefinitionForExtraCanvas", (canvasFileName) => {
	cy.document().then((doc) => {
		doc.setCanvasDropdownFile2(canvasFileName);
	});
});

Cypress.Commands.add("openCanvasPalette", (paletteName) => {
	cy.toggleCommonCanvasSidePanel();
	cy.get("#harness-sidepanel-palette-dropdown").select(paletteName);
	// Wait until we can get a palette flyout category from the canvas before proceeding. This
	// allows the canvas to load and display before any more test case steps
	// are executed. Note: this won't work if the testcase selects a second
	// canvas while an existing canvas with nodes is displayed.
	cy.document().then((doc) => {
		if (doc.canvasController.getCanvasConfig().enablePaletteLayout === "Modal") {
			// Palette Layout - Modal
			cy.get(".palette-dialog-categories");
		} else {
			// Palette Layout - Flyout
			cy.get(".palette-flyout-category");
		}
		cy.toggleCommonCanvasSidePanel();
	});
});

Cypress.Commands.add("openCanvasPaletteForExtraCanvas", (paletteName) => {
	cy.document().then((doc) => {
		doc.setPaletteDropdownSelect2(paletteName);
	});
});

Cypress.Commands.add("openCanvasAPI", (api) => {
	cy.get("#harness-action-bar-sidepanel-api > a").click();
	cy.dropdownSelect("#harness-sidepanel-api-list", api);
});

Cypress.Commands.add("dropdownSelect", (dropdownElement, selectedItemName) => {
	// Get the list of drop down options
	cy.get(dropdownElement)
		.find(".bx--dropdown")
		.click();

	// Select option from drop down list
	cy.get(".bx--list-box__menu")
		.find(".bx--list-box__menu-item")
		.then((options) => options.filter((idx) => options[idx].outerText === selectedItemName))
		.click();
});

Cypress.Commands.add("setCanvasConfig", (config) => {
	cy.document().then((doc) => {
		doc.setCanvasConfig(config);
	});
});

Cypress.Commands.add("selectEntryFromDropdown", (nodeName) => {
	cy.dropdownSelect("#harness-sidepanel-api-selection", nodeName);
});

Cypress.Commands.add("selectLinkForDecoration", (linkName) => {
	cy.dropdownSelect("#harness-sidepanel-api-linkSelection", linkName);
});

Cypress.Commands.add("updateDecorationsJSON", (decoratorsJSON) => {
	cy.get("#harness-sidepanel-api-decorations")
		.find("textarea")
		.clear()
		.type(decoratorsJSON);
});

Cypress.Commands.add("selectNodeLabelFromDropDown", (nodeName) => {
	cy.dropdownSelect("#harness-sidepanel-api-nodePortSelection", nodeName);
});

Cypress.Commands.add("selectPortFromDropDown", (portName) => {
	cy.dropdownSelect("#harness-sidepanel-api-portSelection", portName);
});

Cypress.Commands.add("setNewLabel", (newNodeName) => {
	cy.get("#harness-newLabel")
		.clear()
		.type(newNodeName);
});

Cypress.Commands.add("setCategoryId", (categoryId) => {
	cy.get("#harness-categoryId")
		.clear()
		.type(categoryId);
});

Cypress.Commands.add("setXPercentOffset", (xOffSet) => {
	cy.get("#harness-zoom-canvas-x-position")
		.clear()
		.type(xOffSet);
});

Cypress.Commands.add("setYPercentOffset", (yOffSet) => {
	cy.get("#harness-zoom-canvas-y-position")
		.clear()
		.type(yOffSet);
});

Cypress.Commands.add("setCategoryName", (categoryName) => {
	cy.get("#harness-categoryName")
		.clear()
		.type(categoryName);
});

// update the pipelineflow to add input and output ports to node
Cypress.Commands.add("updatePipelineflowToAddInputOutputPortsToNode", (nodeName) => {
	cy.get("#harness-sidepanel-api-pipelineFlow")
		.find("textarea")
		.invoke("text")
		.then((flowText) => {
			const pipelineFlow = JSON.parse(flowText);
			const nodeList = pipelineFlow.pipelines[0].nodes;
			const node = nodeList.find((nd) => nd.app_data.ui_data.label === nodeName);
			const newInputPort = {
				"id": "inPort2",
				"app_data": {
					"ui_data": {
						"cardinality": {
							"min": 0,
							"max": 1
						},
						"label": "Input Port2"
					}
				},
				"links": []
			};

			const newOutputPort = {
				"id": "outPort2",
				"app_data": {
					"ui_data": {
						"cardinality": {
							"min": 0,
							"max": -1
						},
						"label": "Output Port2"
					}
				}
			};

			node.inputs.push(newInputPort);
			node.outputs.push(newOutputPort);

			const newPipelineFlow = JSON.stringify(pipelineFlow);
			cy.get("#harness-sidepanel-api-pipelineFlow")
				.find("textarea")
				.clear()
				.type(newPipelineFlow, { parseSpecialCharSequences: false });
		});
});

Cypress.Commands.add("clickOutsideNotificationPanel", () => {
	cy.get(".d3-svg-canvas-div").click();
});

Cypress.Commands.add("setNotificationCenterContent", (id, content) => {
	cy.get("#" + id)
		.clear()
		.type(content);
});

Cypress.Commands.add("clearNotificationCenterContent", (id) => {
	cy.get("#" + id)
		.clear();
});

Cypress.Commands.add("toggleNotificationCenterKeepOpen", () => {
	cy.get("label[for='keepOpen'] .bx--toggle__switch").click();
});

Cypress.Commands.add("selectNotificationMessageType", (type) => {
	cy.get("#harness-sidepanel-api-nm-types")
		.contains(type)
		.click();
});


Cypress.Commands.add("selectNotificationMessageType", (type) => {
	cy.get("#harness-sidepanel-api-nm-types")
		.contains(type)
		.click();
});

Cypress.Commands.add("setNotificationMessageTitle", (title) => {
	cy.get("#harness-messageTitle")
		.clear()
		.type(title);
});

Cypress.Commands.add("setNotificationMessageContent", (content) => {
	cy.get("#harness-sidepanel-api-nm-content")
		.find("textarea")
		.clear()
		.type(content);
});

Cypress.Commands.add("toggleNotificationMessageTimestamp", () => {
	cy.get("label[for='harness-sidepanel-api-notification-timestamp']").click();
});

Cypress.Commands.add("toggleNotificationMessageCallback", () => {
	cy.get("label[for='harness-sidepanel-api-notification-callback']").click();
});

Cypress.Commands.add("toggleNotificationMessageDismiss", () => {
	cy.get("label[for='harness-sidepanel-api-notification-dismiss']").click();
});

Cypress.Commands.add("generateNotificationMessage", (type, timestamp, callback, dismiss) => {
	cy.selectNotificationMessageType(type);
	cy.setNotificationMessageTitle(type + " title");
	cy.setNotificationMessageContent(type + " message");
	if (timestamp) {
		cy.toggleNotificationMessageTimestamp();
	}
	if (callback) {
		cy.toggleNotificationMessageCallback();
	}
	if (dismiss) {
		cy.toggleNotificationMessageDismiss();
	}
	cy.submitAPI();
});

Cypress.Commands.add("submitAPI", () => {
	cy.get("#harness-sidepanel-api-submit")
		.find("button")
		.click();
});

Cypress.Commands.add("clickBreadcrumb", (breadCrumb) => {
	cy.get(".harness-pipeline-breadcrumbs-label")
		.contains(breadCrumb)
		.click();
});

Cypress.Commands.add("toggleApplyOnBlur", () => {
	cy.get("label[for='harness-sidepanel-applyOnBlur-toggle']").click();
});
