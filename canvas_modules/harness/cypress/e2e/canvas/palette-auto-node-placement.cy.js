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


describe("Test auto layout variations", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test double clicking nodes onto the canvas, verify number of nodes and port data links" +
  ", undo, redo functions", function() {
		cy.clickToolbarPaletteOpen();

		// Double click Var. File node on canvas
		cy.clickCategory("Import");
		cy.doubleClickNodeInCategory("Var. File", "Import");
		cy.verifyNodeTransform("Var. File", 50, 50);
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Double click Select node on canvas
		cy.clickCategory("Record Ops");
		cy.doubleClickNodeInCategory("Select", "Record Ops");
		cy.verifyNodeTransform("Select", 200, 50);
		cy.verifyNumberOfNodes(2);
		cy.verifyNumberOfPortDataLinks(1);

		// Double click Sample node on canvas
		cy.doubleClickNodeInCategory("Sample", "Record Ops");
		cy.verifyNodeTransform("Sample", 350, 50);
		cy.verifyNumberOfNodes(3);
		cy.verifyNumberOfPortDataLinks(2);

		// Double click Merge node on canvas
		cy.doubleClickNodeInCategory("Merge", "Record Ops");
		cy.verifyNodeTransform("Merge", 500, 50);
		cy.verifyNumberOfNodes(4);
		cy.verifyNumberOfPortDataLinks(3);

		// Select Var. File node
		cy.clickNode("Var. File");

		// Double click Sort node on canvas
		cy.doubleClickNodeInCategory("Sort", "Record Ops");
		cy.verifyNodeTransform("Sort", 200, 205);
		cy.verifyNumberOfNodes(5);
		cy.verifyNumberOfPortDataLinks(4);

		// Double click Aggregate node on canvas
		cy.doubleClickNodeInCategory("Aggregate", "Record Ops");
		cy.verifyNodeTransform("Aggregate", 350, 205);
		cy.verifyNumberOfNodes(6);
		cy.verifyNumberOfPortDataLinks(5);

		// Select Aggregate node
		cy.clickNode("Aggregate");

		// Double click Balance node on canvas
		cy.doubleClickNodeInCategory("Balance", "Record Ops");
		cy.verifyNodeTransform("Balance", 500, 205);
		cy.verifyNumberOfNodes(7);
		cy.verifyNumberOfPortDataLinks(6);

		// Double click Database node on canvas
		cy.doubleClickNodeInCategory("Database", "Import");
		cy.verifyNodeTransform("Database", 50, 360);
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(6);

		// Close the import category
		cy.clickCategory("Import");

		// Select Database node
		cy.clickNode("Database");

		// Double click Type node on canvas
		cy.clickCategory("Field Ops");
		cy.doubleClickNodeInCategory("Type", "Field Ops");
		cy.verifyNodeTransform("Type", 200, 360);
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Select Type node
		cy.clickNode("Type");
		cy.clickCategory("Field Ops");
		// Double click Object Store node on canvas
		cy.clickCategory("Export");
		cy.doubleClickNodeInCategory("Object Store", "Export");
		cy.verifyNodeTransform("Object Store", 350, 360);
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Select Object Store node
		cy.clickNode("Object Store");

		// Double click Object Store node on canvas
		cy.doubleClickNodeInCategory("Object Store", "Export");
		cy.verifyNumberOfNodes(11);
		cy.verifyNumberOfPortDataLinks(9);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(8);
		cy.verifyNumberOfPortDataLinks(6);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(9);
		cy.verifyNumberOfPortDataLinks(7);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(10);
		cy.verifyNumberOfPortDataLinks(8);

		// Click Redo
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(11);
		cy.verifyNumberOfPortDataLinks(9);
	});

	it("Test an execution node auto-added after a binding exit node goes on new line & undo, redo.", function() {
		cy.clickToolbarPaletteOpen();

		// Double click Object Store node on canvas
		cy.clickCategory("Export");
		cy.doubleClickNodeInCategory("Object Store", "Export");
		cy.verifyNodeTransform("Object Store", 50, 50);
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Double click Table node on canvas
		cy.clickCategory("Outputs");
		cy.doubleClickNodeInCategory("Table", "Outputs");
		cy.verifyNodeTransform("Table", 50, 205);
		cy.verifyNumberOfNodes(2);
		cy.verifyNumberOfPortDataLinks(0);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);

		// Click undo
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(0);
		cy.verifyNumberOfPortDataLinks(0);
	});
});

describe("Test auto layout with enableSingleClickAddFromPalette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test single click adds node to canvas when enableSingleClickAddFromPalette is true", function() {
		cy.setCanvasConfig({
			"selectedSingleClickAddFromPalette": true
		});

		cy.clickToolbarPaletteOpen();

		cy.clickCategory("Import");
		cy.clickNodeInCategory("Var. File", "Import");
		cy.verifyNodeTransform("Var. File", 50, 50);
		cy.verifyNumberOfNodes(1);
		cy.verifyNumberOfPortDataLinks(0);
	});

	it("Test single click doesn't add node to canvas when enableSingleClickAddFromPalette is false", function() {
		cy.setCanvasConfig({
			"selectedSingleClickAddFromPalette": false
		});

		cy.clickToolbarPaletteOpen();

		// Double click Var. File node on canvas
		cy.clickCategory("Import");
		cy.clickNodeInCategory("Var. File", "Import");
		cy.verifyNumberOfNodes(0);
		cy.verifyNumberOfPortDataLinks(0);
	});
});

describe("Test that auto-nodes are added to an in-place expanded supernode", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeCanvas.json");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test that two auto nodes are added to the sub-flow", function() {
		// Verify Supernode pipeline has 8 nodes
		cy.verifyNumberOfNodesInSupernode("Supernode", 8);

		// Verify Supernode pipeline has 7 links
		cy.verifyNumberOfLinksInSupernode("Supernode", 7);

		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");
		cy.getNodeWithLabelInSubFlow("Type").click();

		// Test that first auto node is added to the sub-flow
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Field Ops");
		cy.doubleClickNodeInCategory("Filter", "Field Ops");
		cy.verifyNumberOfNodesInSupernode("Supernode", 9);
		cy.verifyNumberOfLinksInSupernode("Supernode", 8);

		// Test that second auto node is added to the sub-flow
		cy.doubleClickNodeInCategory("Derive", "Field Ops");
		cy.verifyNumberOfNodesInSupernode("Supernode", 10);
		cy.verifyNumberOfLinksInSupernode("Supernode", 9);
	});
});

describe("Test that supernodes are auto-added from the palette", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true } });
		cy.openCanvasPalette("supernodePalette.json");
	});

	it("Test that local and external nodes are added correctly to the flow", function() {
		cy.verifyNumberOfPipelines(1);

		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Supernodes");

		cy.doubleClickNodeInCategory("External Supernode", "Supernodes");
		verify({ nodes: 1, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.doubleClickNodeInCategory("Local Supernode", "Supernodes");
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 0, extFlows: 0 });

		cy.getNodeWithLabel("External Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });

		cy.getNodeWithLabel("Local Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 1, links: 0, pipelines: 2, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 0, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.clickToolbarRedo();
		verify({ nodes: 1, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 0, extFlows: 0 });

		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 3, extPipelines: 1, extFlows: 1 });
	});

	it("Test that external nodes that share pipelines are added correctly to the flow", function() {
		cy.verifyNumberOfPipelines(1);

		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Supernodes");

		cy.doubleClickNodeInCategory("External Supernode", "Supernodes");
		cy.hoverOverNodeLabel("External Supernode");
		cy.clickNodeLabelEditIcon("External Supernode");
		cy.enterLabelForNode("External Supernode", "External 1");
		verify({ nodes: 1, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.doubleClickNodeInCategory("External Supernode", "Supernodes");
		cy.hoverOverNodeLabel("External Supernode");
		cy.clickNodeLabelEditIcon("External Supernode");
		cy.enterLabelForNode("External Supernode", "External 2");
		verify({ nodes: 2, links: 1, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.getNodeWithLabel("External 1").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });

		cy.getNodeWithLabel("External 2").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarUndo();
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });

		// Do two undos - first is to undo node name change.
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		verify({ nodes: 1, links: 0, pipelines: 2, extPipelines: 1, extFlows: 1 });

		// Do two undos - first is to undo node name change.
		cy.clickToolbarUndo();
		cy.clickToolbarUndo();
		verify({ nodes: 0, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		// Do two redos - first is to redo node name change.
		cy.clickToolbarRedo();
		cy.clickToolbarRedo();
		verify({ nodes: 1, links: 0, pipelines: 1, extPipelines: 0, extFlows: 0 });

		// Do two redos - first is to redo node name change.
		cy.clickToolbarRedo();
		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 1, extPipelines: 0, extFlows: 0 });

		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });

		cy.clickToolbarRedo();
		verify({ nodes: 2, links: 1, pipelines: 2, extPipelines: 1, extFlows: 1 });
	});

});

function verify(data) {
	cy.verifyNumberOfNodes(data.nodes);
	cy.verifyNumberOfPortDataLinks(data.links);
	cy.verifyNumberOfPipelines(data.pipelines);
	cy.verifyNumberOfExternalPipelines(data.extPipelines);
	cy.verifyNumberOfExternalPipelineFlows(data.extFlows);
}
