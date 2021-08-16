/*
 * Copyright 2017-2020 Elyra Authors
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

describe("Test to check if tips show up for the palette, nodes, ports and links", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test to check if tips show up for the palette, nodes, ports and links", function() {
		cy.clickToolbarPaletteOpen();

		cy.hoverOverCategory("Import");
		cy.verifyTipForCategory("Import");

		// TODO: cy.hoverOverNodeInCategory() is not showing the tooltip
		cy.clickCategory("Import");
		cy.hoverOverNodeInCategory("Var. File");
		// cy.verifyTipForNodeInCategory("Var. File");

		// TODO: cy.moveMouseToCoordinates() is not removing the tooltip
		// after fixing this, uncomment cy.verifyTipDoesNotShowForNode() and cy.verifyTipDoesNotShowForInputPortId()
		// and cy.verifyTipWithTextInSummaryPanel()
		cy.moveMouseToCoordinates(300, 100);
		cy.verifyTipDoesNotShowForNodeInCategory("Var. File");

		cy.hoverOverNode("Define Types");
		cy.verifyTipForNodeAtLocation("Define Types", "below");

		cy.moveMouseToCoordinates(300, 100);
		// cy.verifyTipDoesNotShowForNode("Define Types");

		cy.hoverOverInputPortOfNode("Define Types", "inPort2");
		cy.verifyTipForInputPortOfNode("Define Types", "inPort2", "Input Port 2");

		cy.moveMouseToCoordinates(300, 100);
		// cy.verifyTipDoesNotShowForInputPortId("inPort2");

		// TODO: cy.hoverOverLinkName() is not showing the tooltip
		cy.hoverOverLinkName("Discard Fields-Define Types");
		// cy.verifyTipForLink(260, "Discard Fields", "Output Port Two", "Define Types", "Input Port 2");

		cy.moveMouseToCoordinates(300, 100);
		cy.verifyTipDoesNotShowForLink();
	});
});

describe("Test to check if tips don't show up for the palette, nodes, ports and links " +
"after disabling tips", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedTipConfig": { "palette": false, "nodes": false, "ports": false, "links": false }
		});
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test to check if tips don't show up for the palette, nodes, ports and links " +
	"after disabling tips", function() {
		cy.clickToolbarPaletteOpen();

		cy.clickCategory("Import");
		cy.hoverOverNodeInCategory("Var. File");
		cy.verifyTipDoesNotShowForNodeInCategory("Var. File");

		cy.hoverOverNode("Define Types");
		cy.verifyTipDoesNotShowForNode("Define Types");

		cy.hoverOverInputPortOfNode("Define Types", "inPort2");
		cy.verifyTipDoesNotShowForInputPortId("inPort2");

		cy.hoverOverLinkName("Discard Fields-Define Types");
		cy.verifyTipDoesNotShowForLink();
	});
});

describe("Test to check if tips are hidden on scroll", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openPropertyDefinition("action_paramDef.json");
	});

	it("Test to check if palette tips are hidden on scroll", function() {
		cy.clickToolbarPaletteOpen();

		// Open multiple categories so that palette is scrollable
		cy.clickCategory("Import");
		cy.clickCategory("Record Ops");
		cy.clickCategory("Modeling");

		cy.hoverOverCategory("Import");
		cy.verifyTipForCategory("Import");

		cy.get(".palette-flyout-categories")
			.scrollTo("bottom", { ensureScrollable: false });
		cy.verifyTipDoesNotShowForCategory("Import");
	});

	it("Test to check if properties tips are hidden on scroll", function() {
		cy.get("div[data-id='properties-ctrl-number']")
			.find(".tooltip-container")
			.click();
		cy.verifyTipForLabelIsVisibleAtLocation("Integer", "bottom", "Try pressing Increment or Descrement buttons");
		cy.get(".properties-custom-container")
			.scrollTo("bottom", { ensureScrollable: false });
		cy.verifyTipForLabelIsHidden("Integer", "Try pressing Increment or Descrement buttons");
	});
});

describe("Test changing node name to update node tip", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test changing node name to update node tip", function() {
		cy.openCanvasAPI("Set Node Label");
		cy.selectNodeLabelFromDropDown("Na_to_K");
		cy.setNewLabel("New Node Label");
		cy.submitAPI();

		cy.hoverOverNode("New Node Label");
		cy.verifyTipForNodeAtLocation("New Node Label", "below");
	});
});

describe("Test changing input port name to update port tip", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test changing input port name to update port tip", function() {
		cy.openCanvasAPI("Set Input Port Label");
		cy.selectNodeLabelFromDropDown("Na_to_K");
		cy.selectPortFromDropDown("Input Port2");
		cy.setNewLabel("New Port Label");
		cy.submitAPI();

		cy.hoverOverInputPortOfNode("Na_to_K", "inPort2");
		cy.verifyTipForInputPortOfNode("Na_to_K", "inPort2", "New Port Label");
	});
});

describe("Test changing output port name to update port tip", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test changing output port name to update port tip", function() {
		cy.openCanvasAPI("Set Output Port Label");
		cy.selectNodeLabelFromDropDown("Discard Fields");
		cy.selectPortFromDropDown("Output Port Two");
		cy.setNewLabel("New Port Label");
		cy.submitAPI();

		cy.hoverOverOutputPortOfNode("Discard Fields", "outPort2");
		cy.verifyTipForOutputPortOfNode("Discard Fields", "outPort2", "New Port Label");
	});
});

describe("Test tip location adjusted based on boundaries of canvas", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allNodes.json");
	});

	it("Test tip location adjusted based on boundaries of canvas", function() {
		cy.hoverOverNode("Random Forest Classifier");
		cy.verifyTipForNodeAtLocation("Random Forest Classifier", "above");
	});
});

describe("Test tip location adjusted based on boundaries of browser", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openPropertyDefinition("CLEM_FilterRows_paramDef.json");
	});

	it("Test tip location adjusted based on boundaries of browser", function() {
		cy.clickAtCoordinatesInCommonProperties(65, 100);
		cy.verifyTipForLabelIsVisibleAtLocation("Mode", "bottom", "Include or discard rows");

		cy.clickAtCoordinatesInCommonProperties(245, 160);
		cy.verifyTipForLabelIsVisibleAtLocation(
			"Modeler CLEM Condition Expression", "bottom", "Enter a boolean expression to use for filtering rows"
		);
	});
});

describe("Test if tips show up for the summary table values", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Test if tips show up for the summary table values", function() {
		cy.hoverOverTextInSummaryPanel("people in generation X ", "Values");
		cy.verifyTipWithTextInSummaryPanel("people in generation X ", "Values", "visible");
		cy.moveMouseToCoordinates(300, 100);
		// cy.verifyTipWithTextInSummaryPanel("people in generation X ", "Values", "hidden");
	});
});

describe("Test if tips show up for summary validation icon when there is an error or warning", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.selectPropertiesContainerType("Flyout");
		cy.get("#harness-action-bar-sidepanel-modal").click();
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Test if tips show up for summary validation icon when there is an error or warning", function() {
		// Select an existing row in the table and delete it's value.
		cy.openSubPanel("Configure Derive Node");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInTable("Delete", "expressionCellTable");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.clickButtonInTable("Delete", "expressionCellTable");

		// Select all rows in a table and delete its value
		cy.selectAllRowsInTable("structurelisteditorTableInput");
		cy.clickButtonInTable("Delete", "structurelisteditorTableInput");
		cy.saveWideFlyout("Configure Derive Node");

		cy.hoverOverValidationIconInSummaryPanel("Derive-Node");
		cy.verifyTipForValidationIconInSummaryPanel(
			"Derive-Node", "There are 1 parameters with errors and 1 parameters with warnings."
		);
	});
});

describe("Test to check if tips show up for a supernode and nodes inside the supernode", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test to check if tips show up for a supernode and nodes inside the supernode", function() {
		// Create a supernode
		cy.getNodeWithLabel("Discard Fields").click();
		cy.ctrlOrCmdClickNode("Define Types");
		cy.rightClickNode("Define Types");
		cy.clickOptionFromContextMenu("Create supernode");

		// Check the collapsed supernode shows a tip
		cy.hoverOverNode("Supernode");
		cy.verifyTipForNodeAtLocation("Supernode", "below");

		// Expand the supernode
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Check the expanded supernode shows a tip
		cy.hoverOverNode("Supernode");
		cy.verifyTipForNodeAtLocation("Supernode", "below");

		// Check one of the nodes in the subflow shows a tip
		// TODO: cy.hoverOverNodeInSupernode() is not showing the tooltip
		// cy.hoverOverNodeInSupernode("Discard Fields", "Supernode");
		// cy.verifyTipForNodeInSupernodeAtLocation("Discard Fields", "Supernode", "below");

		// Check the other node in the subflow shows a tip
		// cy.hoverOverNodeInSupernode("Define Types", "Supernode");
		// cy.verifyTipForNodeInSupernodeAtLocation("Define Types", "Supernode", "below");
	});
});
