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

describe("Test the supernode expanded structure", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it("Test expanding supernode using context menu, verify exapanded supernode image and label location, " +
	"Add a very long label to the supernode", function() {
		// Expand supernode using context menu
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Verify expanded supernode's image and label location
		cy.verifyNodeElementLocation("Supernode", "image", 5, 4);
		cy.verifyNodeElementLocation("Supernode", "label", 30, 18);
		cy.verifyNodeElementWidth("Supernode", "label", "65.265625px");

		// Add a very long label to the supernode
		cy.openCanvasAPI("Set Node Label");
		cy.selectNodeLabelFromDropDown("Supernode");
		cy.setNewNodeLabel("New Very Long Supernode Label To Test The Label Abbreviation");
		cy.submitAPI();

		// Verify new label location and width
		cy.verifyNodeElementLocation("New Very Long Supernode Label To Test The Label Abbreviation", "label", 30, 18);
		cy.verifyNodeElementWidth(
			"New Very Long Supernode Label To Test The Label Abbreviation", "label", "127.03125px"
		);
	});
});

describe("Test supernode expanded to correct size", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it.skip("Test expanding supernode, rename supernode, create a nested supernode, " +
	"expand and delete nested supernode, undo delete, verify number of nodes and links in all pipelines", function() {
		// Expand supernode using context menu
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		//  Verify node dimensions based on nodeId
		cy.verifyNodeDimensions("7015d906-2eae-45c1-999e-fb888ed957e5", 200, 200);

		// Rename supernode
		cy.openCanvasAPI("Set Node Label");
		cy.selectNodeLabelFromDropDown("Supernode");
		cy.setNewNodeLabel("First Supernode");
		cy.submitAPI();
		cy.get("#harness-action-bar-sidepanel-api > a").click();

		// Select multiple nodes in supernode
		// TODO: cy.ctrlOrCmdClickNodeInSupernode() works on localhost but fails on travis - Skipping this test
		cy.getNodeWithLabelInSupernode("Partition", "First Supernode").click();
		cy.ctrlOrCmdClickNodeInSupernode("Distribution", "First Supernode");
		cy.verifyNumberOfSelectedObjects(2);

		// Create a nested supernode
		cy.rightClickNodeInSupernode("Partition", "First Supernode");
		cy.clickOptionFromContextMenu("Create supernode");
		cy.verifyNumberOfPipelines(3);

		// Rename nested supernode
		cy.getNodeWithLabelInSupernode("Supernode", "First Supernode").dblclick();
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Second Supernode");
		cy.saveFlyout();

		// Delete nested supernode within supernode from primary pipeline
		cy.deleteNodeInSupernodeUsingKeyboard("Second Supernode", "First Supernode");
		cy.verifyNumberOfNodesInSupernode("First Supernode", 6);
		cy.verifyNumberOfLinksInSupernode("First Supernode", 3);

		// Undo delete nested supernode operation
		cy.shortcutKeysUndo();
		cy.verifyNumberOfNodesInSupernode("First Supernode", 7);
		cy.verifyNumberOfLinksInSupernode("First Supernode", 6);

		// Expand nested supernode
		cy.rightClickNodeInSupernode("Second Supernode", "First Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Verify number of nodes and links in all pipelines
		cy.verifyNumberOfNodesInPipeline(15);
		cy.verifyNumberOfLinksInPipeline(24);

		cy.verifyNumberOfNodesInSupernode("First Supernode", 7);
		cy.verifyNumberOfLinksInSupernode("First Supernode", 6);

		cy.verifyNumberOfNodesInSupernodeNested("Second Supernode", "First Supernode", 5);
		cy.verifyNumberOfLinksInSupernodeNested("Second Supernode", "First Supernode", 4);
	});
});

describe("Test create supernode within a supernode with a new node from palette", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it.skip("Add a node from palette to canvas, Cut node on canvas and paste it inside expanded supernode, " +
	"Add a port to port link between nodes in supernode, Create a nested supernode, " +
	"Delete supernode should remove nested subpipelines", function() {
		// Double click Derive node on canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.doubleClickNodeInCategory("Derive");

		// Verify number of nodes in all pipelines
		cy.verifyNumberOfNodesInPipeline(16);
		cy.verifyNumberOfNodesInSupernode("Supernode", 8);

		// Expand Supernode
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Cut node on canvas and paste it inside expanded supernode
		cy.getNodeWithLabel("Derive").click();
		cy.clickToolbarCut();
		cy.rightClickToDisplayContextMenu(440, 300);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		// Verify number of nodes in all pipelines
		cy.verifyNumberOfNodesInPipeline(15);
		cy.verifyNumberOfNodesInSupernode("Supernode", 9);

		// Add a port to port link between nodes in supernode
		cy.linkNodeOutputPortToNodeInputPortInSupernode("Supernode", "Distribution", "outPort", "Derive", "inPort");

		// Rename supernode
		cy.openCanvasAPI("Set Node Label");
		cy.selectNodeLabelFromDropDown("Supernode");
		cy.setNewNodeLabel("First Supernode");
		cy.submitAPI();
		cy.get("#harness-action-bar-sidepanel-api > a").click();

		// Select multiple nodes in supernode
		// TODO: cy.ctrlOrCmdClickNodeInSupernode() works on localhost but fails on travis - Skipping this test
		cy.getNodeWithLabelInSupernode("Distribution", "First Supernode").click();
		cy.ctrlOrCmdClickNodeInSupernode("Derive", "First Supernode");
		cy.verifyNumberOfSelectedObjects(2);

		// Create a nested supernode
		cy.rightClickNodeInSupernode("Distribution", "First Supernode");
		cy.clickOptionFromContextMenu("Create supernode");

		// Rename nested supernode
		cy.getNodeWithLabelInSupernode("Supernode", "First Supernode").dblclick();
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Second Supernode");
		cy.saveFlyout();

		// Expand nested supernode
		cy.rightClickNodeInSupernode("Second Supernode", "First Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Verify number of nodes and links in all pipelines
		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfNodesInPipeline(15);
		cy.verifyNumberOfLinksInPipeline(24);
		cy.verifyNumberOfNodesInSupernode("First Supernode", 8);
		cy.verifyNumberOfLinksInSupernode("First Supernode", 7);
		cy.verifyNumberOfNodesInSupernodeNested("Second Supernode", "First Supernode", 4);
		cy.verifyNumberOfLinksInSupernodeNested("Second Supernode", "First Supernode", 3);

		// Delete supernode should remove nested subpipelines
		cy.deleteNodeUsingKeyboard("First Supernode");

		// Verify number of nodes and links in all pipelines
		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfNodesInPipeline(14);
		cy.verifyNumberOfLinksInPipeline(21);

		// Undo delete supernode action
		cy.clickToolbarUndo();

		// Verify number of nodes and links in all pipelines
		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfNodesInPipeline(15);
		cy.verifyNumberOfLinksInPipeline(24);
		cy.verifyNumberOfNodesInSupernode("First Supernode", 8);
		cy.verifyNumberOfLinksInSupernode("First Supernode", 7);
		cy.verifyNumberOfNodesInSupernodeNested("Second Supernode", "First Supernode", 4);
		cy.verifyNumberOfLinksInSupernodeNested("Second Supernode", "First Supernode", 3);
	});
});

describe("Test cut and copy supernode from first canvas to second canvas", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedExtraCanvasDisplayed": true });
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it("Cut supernode from regular canvas and paste in extra canvas, " +
	"Copy supernode from regular canvas and paste in extra canvas", function() {
		// Rename supernode
		cy.openCanvasAPI("Set Node Label");
		cy.selectNodeLabelFromDropDown("Supernode");
		cy.setNewNodeLabel("First Supernode");
		cy.submitAPI();
		cy.get("#harness-action-bar-sidepanel-api > a").click();

		// Cut supernode from regular canvas and paste in extra canvas
		cy.getNodeWithLabel("First Supernode").click();
		cy.clickToolbarCut();
		cy.clickToolbarPasteInExtraCanvas();

		// Verify number of nodes in all pipelines
		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfNodesInPipeline(14);
		cy.verifyNodeExistsInExtraCanvas("First Supernode");

		// Create a supernode on regular canvas
		cy.getNodeWithLabel("Multiplot").click();
		cy.ctrlOrCmdClickNode("Execution node");
		cy.rightClickNode("Multiplot");
		cy.clickOptionFromContextMenu("Create supernode");

		// Rename supernode
		cy.getNodeWithLabel("Supernode").dblclick();
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("Second Supernode");
		cy.saveFlyout();

		// Copy supernode from regular canvas and paste in extra canvas
		cy.getNodeWithLabel("Second Supernode").click();
		cy.clickToolbarCopy();
		cy.clickToolbarPasteInExtraCanvas();

		// Verify number of nodes in all pipelines in regular canvas
		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfNodesInPipeline(13);

		// Verify number of nodes in all pipelines in extra canvas
		cy.verifyNodeExistsInExtraCanvas("Second Supernode");
		cy.verifyNumberOfPipelinesInExtraCanvas(3);
		cy.verifyNumberOfNodesInPipelineInExtraCanvas(2);
	});
});

describe("Test create a supernode with link that does not have port info", function() {
	before(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedConnectionType": "Halo" });
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test creating a supernode with link that does not have port info", function() {
		// Add nodes from palette to canvas
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.dragNodeToPosition("Filler", 400, 200);
		cy.dragNodeToPosition("Type", 700, 200);
		cy.dragNodeToPosition("Filter", 700, 400);
		cy.clickToolbarPaletteClose();

		// Link nodes
		cy.linkNodes("Filler", "Type");
		cy.verifyLinkBetweenNodes("Filler", "Type", 1);
		cy.linkNodes("Filler", "Filter");
		cy.verifyLinkBetweenNodes("Filler", "Filter", 2);

		// Verify number of nodes and links in pipeline
		cy.verifyNumberOfNodesInPipeline(3);
		cy.verifyNumberOfLinksInPipeline(2);

		// Create supernode from a single node
		cy.rightClickNode("Filler");
		cy.clickOptionFromContextMenu("Create supernode");

		// Update canvas config and expand supernode
		cy.setCanvasConfig({ "selectedConnectionType": "Ports" });
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Verify number of nodes and links in supernode
		cy.verifyNumberOfNodesInSupernode("Supernode", 2); // Includes supernode binding node
		cy.verifyNumberOfLinksInSupernode("Supernode", 1);

		// Verify the "Supernode" node has 3 "output" ports
		cy.verifyNumberOfPortsOnNode("Supernode", "output", 3);
	});
});

describe("Test selecting the canvas background of expanded supernodes", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeNestedCanvas.json");
	});

	it("Test selecting the canvas background of expanded supernodes and verify number of selected objects", function() {
		// Select canvas backgrounds of multiple expanded supernodes
		cy.clickExpandedCanvasBackgroundOfSupernode("Supernode1");
		cy.ctrlOrCmdClickExpandedCanvasBackgroundOfSupernode("Supernode3");
		cy.verifyNumberOfSelectedObjects(2);

		// Click on canvas to clear selection
		cy.get("#canvas-div-0").click(100, 100);
		cy.verifyNumberOfSelectedObjects(0);

		// Select a node and ctrl/cmd click canvas background of expanded supernode
		cy.getNodeWithLabel("Database").click();
		cy.ctrlOrCmdClickExpandedCanvasBackgroundOfSupernode("Supernode1");
		cy.verifyNumberOfSelectedObjects(2);

		// Select canvas background of expanded supernode3
		cy.clickExpandedCanvasBackgroundOfSupernode("Supernode3");
		cy.verifyNumberOfSelectedObjects(1);
	});
});

describe("Test context menu for supernode canvas background doesn't deselect nodes or comments", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it("Select a node in the supernode and check right click on supernode background doesnot deselect it, " +
	"Create a comment in the supernode and check right click on supernode background doesnot deselect it", function() {
		// Select a node in the supernode and check right click on supernode background doesnot deselect it
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.getNodeWithLabelInSupernode("Partition", "Supernode").click();
		cy.rightClickExpandedCanvasBackgroundOfSupernode("Supernode");
		cy.verifyNumberOfSelectedObjects(1);

		// Create a comment in the supernode and check right click on supernode background doesnot deselect it
		// TODO: cy.ctrlOrCmdClickCommentInSupernode() works on localhost but fails on travis
		// cy.clickOptionFromContextMenu("New comment");
		// cy.editTextInCommentInSupernode("", "Hello Canvas in a supernode!", "Supernode");
		// cy.getNodeWithLabelInSupernode("Partition", "Supernode").click();
		// cy.ctrlOrCmdClickCommentInSupernode("Hello Canvas in a supernode!", "Supernode");
		// cy.rightClickExpandedCanvasBackgroundOfSupernode("Supernode");
		// cy.verifyNumberOfSelectedObjects(2);
	});
});

describe("Test Select All in context menu for supernode canvas only selects non-binding nodes", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
	});

	it("Test Select All in context menu for supernode canvas only selects non-binding nodes", function() {
		// Expand supernode and select all objects in supernode
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.rightClickExpandedCanvasBackgroundOfSupernode("Supernode");
		cy.clickOptionFromContextMenu("Select All");
		cy.verifyNumberOfSelectedObjects(5);
	});
});

describe("Test all the nodes are correctly positioned", function() {
	before(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodePortPosCanvas.json");
	});

	it("Test all the nodes are correctly positioned", function() {
		// Check the first supernode (with 5 single-port binding nodes) is correctly positioned
		cy.rightClickNode("Supernode-5-binding");
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.verifyNodeTransform("Supernode-5-binding", "translate(76.90125274658203, 335.5875015258789)");

		// Check the two nodes in the first supernode's supernode are correctly positioned
		cy.verifyNodeTransformInSupernode("SN1-Filler", "Supernode-5-binding", "translate(235, 496.5)");
		cy.verifyNodeTransformInSupernode("SN1-Sample", "Supernode-5-binding", "translate(234, 594.5)");

		// Check the five single-port binding nodes in the first supernode are correctly positioned
		cy.verifyNodeTransformInSupernode(
			"SN1-BN-INPUT0", "Supernode-5-binding", "translate(5.5325910785737875, 541.2282679742564)"
		);
		cy.verifyNodeTransformInSupernode(
			"SN1-BN-INPUT1", "Supernode-5-binding", "translate(5.5325910785737875, 577.7189309049523)"
		);
		cy.verifyNodeTransformInSupernode(
			"SN1-BN-OUTPUT0", "Supernode-5-binding", "translate(463.4674089214262, 522.9829365089084)"
		);
		cy.verifyNodeTransformInSupernode(
			"SN1-BN-OUTPUT1", "Supernode-5-binding", "translate(463.4674089214262, 559.4735994396044)"
		);
		cy.verifyNodeTransformInSupernode(
			"SN1-BN-OUTPUT2", "Supernode-5-binding", "translate(463.4674089214262, 595.9642623703003)"
		);

		// Check the second supernode (with 2 multi-port binding nodes) is correctly positioned
		cy.rightClickNode("Supernode-2-binding");
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.verifyNodeTransform("Supernode-2-binding", "translate(582.5964628569782, 329.97940826416016)");

		// Check the three nodes in the second supernode's sub-flow are correctly positioned
		cy.verifyNodeTransformInSupernode("SN2-Filler", "Supernode-2-binding", "translate(752, -351.49998474121094)");
		cy.verifyNodeTransformInSupernode("SN2-Select", "Supernode-2-binding", "translate(889.5, -344.99998474121094)");
		cy.verifyNodeTransformInSupernode(
			"SN2-Sample", "Supernode-2-binding", "translate(1039.5, -351.99998474121094)"
		);

		// Check the two single-port binding nodes in the second supernode are correctly positioned
		cy.verifyNodeTransformInSupernode("SN2-BN-INPUT", "Supernode-2-binding", "translate(598, -351.31031669823415)");
		cy.verifyNodeTransformInSupernode(
			"SN2-BN-OUTPUT", "Supernode-2-binding", "translate(1193.5, -354.72815902589485)"
		);
	});
});
