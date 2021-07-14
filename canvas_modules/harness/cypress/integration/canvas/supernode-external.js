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

describe("Test the external supernode/sub-flows support", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedExternalPipelineFlows": true });
	});

	it("Test creating a supernode referencing an external pipeline flow", function() {
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

		cy.verifyNumberOfNodesInSupernode("Supernode", 4); // Includes supernode binding nodes
		cy.verifyNumberOfLinksInSupernode("Supernode", 3);
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
		testForExternalInPlace();

		// -------------------------------------------------------------------------
		// Convert from external to local
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForLocalInPlace();

		// -------------------------------------------------------------------------
		// Convert back to external
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalInPlace();

		// -------------------------------------------------------------------------
		// Convert from external to local
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert external to local");
		testForLocalInPlace();

		// -------------------------------------------------------------------------
		// Convert back to external
		// -------------------------------------------------------------------------
		cy.hoverOverNode("Super node");
		cy.clickEllipsisIconOfSupernode("Super node");
		cy.clickOptionFromContextMenu("Convert local to external");
		testForExternalInPlace();

		// -------------------------------------------------------------------------
		// Undo to local -> external -> local -> external
		// -------------------------------------------------------------------------
		cy.clickToolbarUndo();
		testForLocalInPlace();

		cy.clickToolbarUndo();
		testForExternalInPlace();

		cy.clickToolbarUndo();
		testForLocalInPlace();

		cy.clickToolbarUndo();
		testForExternalInPlace();

		// -------------------------------------------------------------------------
		// Redo to external -> local -> external
		// -------------------------------------------------------------------------
		cy.clickToolbarRedo();
		testForLocalInPlace();

		cy.clickToolbarRedo();
		testForExternalInPlace();

		cy.clickToolbarRedo();
		testForLocalInPlace();

		cy.clickToolbarRedo();
		testForExternalInPlace();

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
		cy.rightClickNode("Super node", "topLeft");
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

	it("Test opening a flow with an expanded external supernode loads the external pipeline and displays it", function() {
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
	});

});

function testForExternalInPlace() {
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

function testForLocalInPlace() {
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
