/*
 * Copyright 2017-2025 Elyra Authors
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

describe("Test the external supernode/sub-flows support", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedExternalPipelineFlows": true });
	});

	it("Test creating an external supernode referencing an external pipeline flow", function() {
		cy.openCanvasDefinition("allTypesCanvas.json");

		cy.clickNode("Super node");
		cy.ctrlOrCmdClickNode("Execution node");
		cy.rightClickNode("Execution node");
		cy.clickOptionFromContextMenu("Create external supernode");

		// There should now be 4 nodes and 3 links in the main flow.
		cy.verifyNumberOfNodes(4);
		cy.verifyNumberOfPortDataLinks(3);

		// The original flow had 2 pipelines so now there should be 3
		// of which 2 are external.
		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfNodesInPipeline(4);
		cy.verifyNumberOfExternalPipelines(2);

		cy.verifyNumberOfNodesInSupernode("Supernode", 5); // 2 regular nodes + 3 supernode binding nodes
		cy.verifyNumberOfLinksInSupernode("Supernode", 4); // 1 link between nodes + 3 links to binding nodes
	});

	it("Test creating and converting an external supernode referencing multiple nested supernodes", function() {
		cy.openCanvasDefinition("externalNestedCanvas.json");

		// Check initial contents
		checkContentsOfExternalNestedCanvas();

		// Create a new supernode
		// Select at offset 20, 20 so we don't select in middle of the supernode's subflow
		// Note: We need to select these nodes in this order. If we select the
		// supernode second, instead of first, we get an error when subsequently
		// clicking the ellipsis (when running on the build machine).
		cy.clickNode("Supernode-1", 20, 20);
		cy.ctrlOrCmdClickNode("Aggregate");

		cy.hoverOverNode("Supernode-1");
		cy.clickEllipsisIconOfSupernode("Supernode-1");
		cy.clickOptionFromContextMenu("Create external supernode");

		// Expand the new supernode
		cy.rightClickNode("Supernode");
		cy.clickOptionFromContextMenu("Expand supernode");

		// Check external supernode was created OK
		checkCreatedSupernodeInExternalNestedCanvas();

		cy.clickToolbarUndo(); // Undo: 'Expand supernode'
		cy.clickToolbarUndo(); // Undo: 'Create external supernode'

		// Check initial contents were restored
		checkContentsOfExternalNestedCanvas();

		// Redo the chnanges
		cy.clickToolbarRedo(); // Redo: 'Create external supernode'
		cy.clickToolbarRedo(); // Redo: 'Expand supernode'

		// Check external supernode was re-created OK
		checkCreatedSupernodeInExternalNestedCanvas();

		// No convert the external supernode to local
		cy.hoverOverNode("Supernode");
		cy.clickEllipsisIconOfSupernode("Supernode");
		cy.clickOptionFromContextMenu("Convert external to local");

		// The flow has 7 pipelines but now after conversion to local only 2 of them
		// are external (which are the two that are in a different pipeline flow)
		// in the original externalNestedCanvas that was loaded.
		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(2);

		cy.clickToolbarUndo();

		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(6);

		cy.clickToolbarRedo();
		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(2);

		// Now convert the local supernode to an external
		cy.hoverOverNode("Supernode");
		cy.clickEllipsisIconOfSupernode("Supernode");
		cy.clickOptionFromContextMenu("Convert local to external");

		// The flow has 7 pipelines but now after converion to external 6 of them
		// are external (which are the two that are in a different pipeline flow plus)
		// 4 that were converted).
		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(6);

		cy.clickToolbarUndo();

		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(2);

		cy.clickToolbarRedo();

		cy.verifyNumberOfPipelines(7);
		cy.verifyNumberOfExternalPipelines(6);
	});


	it("Test opening and loading a sub-flow pipeline in an external pipeline flow using expand in place", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvas.json");

		cy.clickNode("Super node");
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");

		// There should now be 5 nodes and 4 links in the main flow
		// and 5 in the sub-flow (including the binding nodes) and
		// 3 in the sub-flow in the sub-flow (including the binding nodes).
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

		// The original flow had 1 pipelines so now there should be 2.
		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfNodesInPipeline(5);
		cy.verifyNumberOfExternalPipelines(2);

		cy.verifyNumberOfNodesInSupernode("Super node", 5); // Includes 3 supernode binding nodes
		cy.verifyNumberOfLinksInSupernode("Super node", 3);
	});

	it("Test converting an external supernode to local after opening/loading the flow 'in-place'", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvas.json");

		cy.clickNode("Super node");
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");
		testForExternalMainCanvasSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Convert from external to local
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Convert back to external
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalMainCanvasSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Convert from external to local
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Convert back to external
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalMainCanvasSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Undo to local -> external -> local -> external
		// -------------------------------------------------------------------------
		cy.clickToolbarUndo();
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		cy.clickToolbarUndo();
		testForExternalMainCanvasSupernodeExpandedInPlace();

		cy.clickToolbarUndo();
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		cy.clickToolbarUndo();
		testForExternalMainCanvasSupernodeExpandedInPlace();

		// -------------------------------------------------------------------------
		// Redo to external -> local -> external
		// -------------------------------------------------------------------------
		cy.clickToolbarRedo();
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		cy.clickToolbarRedo();
		testForExternalMainCanvasSupernodeExpandedInPlace();

		cy.clickToolbarRedo();
		testForExternalMainCanvasLocalSupernodeExpandedInPlace();

		cy.clickToolbarRedo();
		testForExternalMainCanvasSupernodeExpandedInPlace();

	});

	it("Test converting an external supernode to local before opening/loading the flow 'in-place'", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvas.json");
		testForExternalCollapse(1, 0);

		cy.clickNode("Super node");
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForLocalCollapse();

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalCollapse(2, 1);

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForLocalCollapse();

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalCollapse(2, 1);

		// -------------------------------------------------------------------------
		// Undo to external -> local -> external -> local -> external
		// -------------------------------------------------------------------------
		cy.clickToolbarUndo();
		testForLocalCollapse();

		cy.clickToolbarUndo();
		testForExternalCollapse(2, 1);

		cy.clickToolbarUndo();
		testForLocalCollapse();

		cy.clickToolbarUndo();
		testForExternalCollapse(2, 1);

		// -------------------------------------------------------------------------
		// Undo to external -> local -> external -> local
		// -------------------------------------------------------------------------
		cy.clickToolbarRedo();
		testForLocalCollapse();

		cy.clickToolbarRedo();
		testForExternalCollapse(2, 1);

		cy.clickToolbarRedo();
		testForLocalCollapse();

		cy.clickToolbarRedo();
		testForExternalCollapse(2, 1);
	});

	it("Test opening and returning to another flow doesn't leave external flows behind " +
		"causing an error", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvas.json");

		cy.clickNode("Super node");
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");

		// There should now be 5 nodes and 4 links in the main flow.
		// and 5 in the sub-flows (including the 3 binding nodes) and
		// 3 in the sub-flow in the sub-flow (including 2 binding nodes).
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

		// Open a different pipeline flow
		cy.openCanvasDefinition("externalSubFlowCanvas1.json");
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1000);
		cy.verifyNumberOfNodes(5);

		// Reopen the original pipeline flow/canvas
		cy.openCanvasDefinition("externalMainCanvas.json");
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1000);

		cy.clickNode("Super node");
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");

		// There should now be 5 nodes and 4 links in the main flow.
		// and 5 in the sub-flow (including the 3 binding nodes) and also
		// 3 in the subflow inside the sub-flow.
		// If an error occurred this sub-flow would not open.
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);
	});

	it("Test opening a flow with an expanded external supernode loads the external pipeline " +
		"and displays it", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvasExpanded.json");

		// When the canvas is displayed common-canvas should load the external
		// pipelines that are expanded which is both the sub-flow of the
		// 'Super node' node and the subflow of Supernode 2' supernode.
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

		// There should be 3 pipelines in memory with 2 of them as external
		// pipelines.
		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfExternalPipelines(2);
		cy.verifyNumberOfExternalPipelineFlows(2);
	});

	it("Test deleting (and undo/redo) of an external supernode", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvas.json");
		testForExternalMainCanvas();

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Delete");
		testForExternalMainCanvasSupernodeDeleted();

		// Undo the delete
		cy.clickToolbarUndo();
		testForExternalMainCanvas();

		// Redo the delete
		cy.clickToolbarRedo();
		testForExternalMainCanvasSupernodeDeleted();
	});

	it("Test deleting (and undo/redo) of an expanded external supernode", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalMainCanvasExpanded.json");
		testForExternalMainCanvasExpanded();

		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Delete");
		testForExternalMainCanvasExpandedSupernodeDeleted();

		// Undo the delete
		cy.clickToolbarUndo();
		testForExternalMainCanvasExpanded();

		// Redo the delete
		cy.clickToolbarRedo();
		testForExternalMainCanvasExpandedSupernodeDeleted();
	});

	it("Test deleting (and undo/redo) of a supernode with nested external supernode", function() {
		// Open a flow that referencs an external subflow
		cy.openCanvasDefinition("externalNestedCanvas.json");
		testForExternalNestedCanvas();

		cy.hoverOverNode("Supernode-1");
		cy.clickEllipsisIconOfSupernode("Supernode-1");
		cy.clickOptionFromContextMenu("Delete");
		testForExternalNestedCanvasSupernodeDeleted();

		// Undo the delete
		cy.clickToolbarUndo();
		testForExternalNestedCanvas();

		// Redo the delete
		cy.clickToolbarRedo();
		testForExternalNestedCanvasSupernodeDeleted();
	});
});

describe("Test navigate into and out of an external sub-flow inside a sub-flow", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("externalMainCanvasExpanded.json");
	});

	it("Test navigaton using the expansion icon for the inner sub-flow", function() {
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

		cy.clickExpansionIconOfSupernodeInsideSupernode("Supernode 2", "Super node");
		testBreadcrumbNavigationForExternalMainCanvasExpanded();
	});

	it("Test navigaton using the ellipsis icon for the inner sub-flow", function() {
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfNodesInSubFlow(5);
		cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

		cy.clickEllipsisIconOfSupernodeInSupernode("Supernode 2", "Super node");
		cy.clickOptionFromContextMenu("Display full page");
		testBreadcrumbNavigationForExternalMainCanvasExpanded();
	});
});

describe("Test copy and paste with external pipeline flows", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true } });
	});

	it("Test copy and paste of external supernode]", function() {
		cy.openCanvasDefinition("externalMainCanvas.json");
		testForExternalMainCanvas();

		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		cy.hoverOverNodeLabel("Super node");
		cy.clickNodeLabelEditIcon("Super node");
		cy.enterLabelForNode("Super node", "Supernode Original");

		testForExternalMainCanvas();

		// Paste a copy of the supernode
		cy.rightClickToDisplayContextMenu(200, 450);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		testForExternalMainCanvasCopiedSupernode();

		// Undo the paste
		cy.clickToolbarUndo();
		testForExternalMainCanvas();

		// Redo the paste
		cy.clickToolbarRedo();
		testForExternalMainCanvasCopiedSupernode();

		// Expand the copied Supernode
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");
		testForExternalMainCanvasCopiedSupernodExpanded();
	});

	it("Test copy and paste of expanded external supernode]", function() {
		cy.openCanvasDefinition("externalMainCanvasExpanded.json");
		testForExternalMainCanvasExpanded();

		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextSubmenu("Edit", "Copy");

		cy.hoverOverNodeLabel("Super node");
		cy.clickNodeLabelEditIcon("Super node");
		cy.enterLabelForNode("Super node", "Supernode Original");

		testForExternalMainCanvasExpanded();

		// Paste a copy of the supernode
		cy.rightClickToDisplayContextMenu(200, 450);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		testForExternalMainCanvasExpandedCopiedSupernode();

		// Undo the paste
		cy.clickToolbarUndo();
		testForExternalMainCanvasExpanded();

		// Redo the paste
		cy.clickToolbarRedo();
		testForExternalMainCanvasExpandedCopiedSupernode();
	});

	it("Test conversion to local of copied expanded external supernode]", function() {

		// Thse steps same as tst case above so if that passed then these should be
		// OK.
		cy.openCanvasDefinition("externalMainCanvasExpanded.json");
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextSubmenu("Edit", "Copy");
		cy.hoverOverNodeLabel("Super node");
		cy.clickNodeLabelEditIcon("Super node");
		cy.enterLabelForNode("Super node", "Original");
		cy.rightClickToDisplayContextMenu(60, 450);
		cy.clickOptionFromContextSubmenu("Edit", "Paste");

		// Chck everything is OK before converting to local
		testForExternalMainCanvasExpandedBeforeConvertToLocal();

		// Convert copied Supernode to Local
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");

		testForExternalMainCanvasExpandedAfterConvertToLocal();

		// Need to click here to get the Ellipsis icon to be clickable in the
		// next step. I'm not sure why this is needed when the ellipsis icon
		// work perfectly OK in previous steps!?
		cy.getNodeWithLabel("Original").click("top");

		// Convert Original supernode to Local
		cy.hoverOverNode("Original");
		cy.clickEllipsisIconOfSupernode("Original");
		cy.clickOptionFromContextMenu("Convert external to local");

		testForExternalMainCanvasExpandedAfterConvertToLocal2();

		// Undo the conversion of Original supernode
		cy.clickToolbarUndo();
		testForExternalMainCanvasExpandedAfterConvertToLocal();

		// Undo the convertion of copied Supernode
		cy.clickToolbarUndo();
		testForExternalMainCanvasExpandedBeforeConvertToLocal();

		// Redo the convertion of copied Supernode
		cy.clickToolbarRedo();
		testForExternalMainCanvasExpandedAfterConvertToLocal();

		// Redo the convertion of copied Supernode
		cy.clickToolbarRedo();
		testForExternalMainCanvasExpandedAfterConvertToLocal2();
	});

});

describe("Test the supernode deconstruct feature for external pipelines", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("externalMainCanvas.json");
	});

	it("Test deconstructing a supernode works OK.", function() {

		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfExternalPipelines(0);
		cy.verifyNumberOfExternalPipelineFlows(0);
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfLinks(5);

		// Expand supernode using context menu
		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Deconstruct supernode");

		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfExternalPipelines(1);
		cy.verifyNumberOfExternalPipelineFlows(1);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfLinks(6);

		cy.hoverOverNode("Supernode 2");
		cy.clickEllipsisIconOfSupernode("Supernode 2");
		cy.clickOptionFromContextMenu("Deconstruct supernode");

		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfExternalPipelines(0);
		cy.verifyNumberOfExternalPipelineFlows(0);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfLinks(6);

		// On this Undo, common-canvas recreates the second pipeline (as an external
		// pipeline flow).
		cy.clickToolbarUndo();

		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfExternalPipelines(1);
		cy.verifyNumberOfExternalPipelineFlows(1);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfLinks(6);

		// On this Undo, common-canvas recreates the first pipeline (as an external
		// pipeline flow).
		cy.clickToolbarUndo();

		cy.verifyNumberOfPipelines(3);
		cy.verifyNumberOfExternalPipelines(2);
		cy.verifyNumberOfExternalPipelineFlows(2);
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfLinks(5);

		cy.clickToolbarRedo();

		cy.verifyNumberOfPipelines(2);
		cy.verifyNumberOfExternalPipelines(1);
		cy.verifyNumberOfExternalPipelineFlows(1);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfLinks(6);

		cy.clickToolbarRedo();

		cy.verifyNumberOfPipelines(1);
		cy.verifyNumberOfExternalPipelines(0);
		cy.verifyNumberOfExternalPipelineFlows(0);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfLinks(6);

	});
});

function testForExternalMainCanvasExpandedBeforeConvertToLocal() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(3);
	cy.verifyNumberOfExternalPipelines(2);
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasExpandedAfterConvertToLocal() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(4);
	cy.verifyNumberOfExternalPipelines(2);
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasExpandedAfterConvertToLocal2() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(4);
	cy.verifyNumberOfExternalPipelines(1);
	cy.verifyNumberOfExternalPipelineFlows(1);
}

function testBreadcrumbNavigationForExternalMainCanvasExpanded() {
	cy.verifyNumberOfNodes(3);
	cy.verifyNumberOfBreadcrumbs(3);

	cy.clickBreadcrumb("Super node");
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(2);

	cy.clickBreadcrumb("Primary");
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(1);

	cy.clickToolbarUndo();
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(2);

	cy.clickToolbarUndo();
	cy.verifyNumberOfNodes(3);
	cy.verifyNumberOfBreadcrumbs(3);

	cy.clickToolbarUndo();
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(1);

	cy.clickToolbarRedo();
	cy.verifyNumberOfNodes(3);
	cy.verifyNumberOfBreadcrumbs(3);

	cy.clickToolbarRedo();
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(2);

	cy.clickToolbarRedo();
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);
	cy.verifyNumberOfBreadcrumbs(1);
}

function testForExternalMainCanvas() {
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(1);
	cy.verifyNumberOfExternalPipelines(0);
	cy.verifyNumberOfExternalPipelineFlows(0);
}

function testForExternalMainCanvasCopiedSupernode() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(1);
	cy.verifyNumberOfExternalPipelines(0);
	cy.verifyNumberOfExternalPipelineFlows(0);
}

function testForExternalMainCanvasCopiedSupernodExpanded() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(3);
	cy.verifyNumberOfExternalPipelines(2);
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasSupernodeDeleted() {
	cy.verifyNumberOfNodes(4);
	cy.verifyNumberOfPortDataLinks(1);
	cy.verifyNumberOfPipelines(1);
	cy.verifyNumberOfExternalPipelines(0);
	cy.verifyNumberOfExternalPipelineFlows(0);
}

function testForExternalMainCanvasSupernodeExpandedInPlace() {
	// There should now be 5 nodes and 4 links in the main flow.
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);

	// There should be 5 in the sub-flow (including 3 binding nodes) and
	// 3 in the sub-flow in the sub-flow (including 2 binding nodes).
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

	// The flow should still have 3 pipelines (the sub-flow pipeline remains
	// loaded even though it became external) and one of them should be external.
	cy.verifyNumberOfPipelines(3);
	cy.verifyNumberOfExternalPipelines(2);

	// Ext flows are back!
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasLocalSupernodeExpandedInPlace() {
	// There should now be 5 nodes and 4 links in the main flow.
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);

	// There should be 5 in th sub-flow (including 3 binding nodes) and
	// 3 in the sub-flow in the sub-flow (including 2 binding nodes).
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);

	// The original flow had 1 pipelines so now there should be 3.
	cy.verifyNumberOfPipelines(3);
	cy.verifyNumberOfExternalPipelines(1);

	// The external flow should be gone!
	cy.verifyNumberOfExternalPipelineFlows(1);
}

function testForExternalMainCanvasExpanded() {
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);
	cy.verifyNumberOfPipelines(3);
	cy.verifyNumberOfNodesInSubFlow(5);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(3);
	cy.verifyNumberOfExternalPipelines(2);
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasExpandedCopiedSupernode() {
	cy.verifyNumberOfNodes(6);
	cy.verifyNumberOfNodesInSubFlow(10);
	cy.verifyNumberOfNodesInSubFlowInSubFlow(6);
	cy.verifyNumberOfExternalPipelines(2);
	cy.verifyNumberOfExternalPipelineFlows(2);
}

function testForExternalMainCanvasExpandedSupernodeDeleted() {
	cy.verifyNumberOfNodes(4);
	cy.verifyNumberOfPortDataLinks(1);
	cy.verifyNumberOfPipelines(1);
	cy.verifyNumberOfExternalPipelines(0);
}

function testForExternalNestedCanvas() {
	cy.verifyNumberOfNodes(4);
	cy.verifyNumberOfPortDataLinks(3);
	cy.verifyNumberOfPipelines(6);
	cy.verifyNumberOfExternalPipelines(2);
}

function testForExternalNestedCanvasSupernodeDeleted() {
	cy.verifyNumberOfNodes(3);
	cy.verifyNumberOfPortDataLinks(1);
	cy.verifyNumberOfPipelines(1);
	cy.verifyNumberOfExternalPipelines(0);
}


function testForExternalCollapse(pipelines, extFlows) {
	// There should now be 5 nodes and 4 links in the main flow.
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);

	// The original flow had 1 pipeline so now there should be 2 because the
	// external pipeline should be loaded when he converting from external
	// to local.
	cy.verifyNumberOfPipelines(pipelines);
	cy.verifyNumberOfExternalPipelines(extFlows);
}

function testForLocalCollapse() {
	// There should now be 5 nodes and 4 links in the main flow.
	cy.verifyNumberOfNodes(5);
	cy.verifyNumberOfPortDataLinks(4);

	// The original flow had 1 pipeline so now there should be 2 because the
	// external pipeline should be loaded when converting from external
	// to local.
	cy.verifyNumberOfPipelines(2);
	cy.verifyNumberOfExternalPipelines(0);
}

function checkContentsOfExternalNestedCanvas() {
	cy.verifyNumberOfPipelines(6);
	cy.verifyNumberOfNodesInPipeline(4);
	cy.verifyNumberOfExternalPipelines(2);
}

function checkCreatedSupernodeInExternalNestedCanvas() {
	// There should now be 4 nodes and 3 links in the main flow.
	cy.verifyNumberOfNodes(3);
	cy.verifyNumberOfPortDataLinks(2);

	// The original flow had 6 pipelines so now there should be 7
	// of which 6 are external.
	cy.verifyNumberOfPipelines(7);
	cy.verifyNumberOfNodesInPipeline(3);
	cy.verifyNumberOfExternalPipelines(6);

	cy.verifyNumberOfNodesInSupernode("Supernode", 4); // Includes supernode binding nodes
	cy.verifyNumberOfLinksInSupernode("Supernode", 3);

	cy.verifyNumberOfNodesInSupernodeNested("Supernode-1", "Supernode", 6); // Includes supernode binding nodes
	cy.verifyNumberOfLinksInSupernodeNested("Supernode-1", "Supernode", 5);
}
