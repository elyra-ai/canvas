/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-console: "off" */

import { expect } from "chai";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import deepFreeze from "deep-freeze";
import CanvasController from "../../src/common-canvas/canvas-controller";
import supernodeFlow from "../test_resources/json/supernodeCanvas.json";

// import log4js from "log4js";

describe("Selection notification tests", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("Should select node and comment", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			const selectedApiPipeline = objectModel.getAPIPipeline(data.selectedPipelineId);
			expect(isEmpty(difference(data.selection, ["comment1", "node3"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, objectModel.getSelectedNodes()))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, objectModel.getSelectedComments()))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, [selectedApiPipeline.getNode("node3")]))).to.be.true;
			expect(isEmpty(difference(data.addedComments, [selectedApiPipeline.getComment("comment1")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});
		canvasController.setSelections(["comment1", "node3"]);

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should select nodes in a fork subgraph", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node2", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["node1"], "123");

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, ["node1", "node4", "node2"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, canvasController.getSelectedNodes()))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, [canvasController.getNode("node2", "123"), canvasController.getNode("node4", "123")]))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});

		objectModel.selectSubGraph("node4", "123");

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = ["node1", "node4", "node2"];
		const actualSelections = canvasController.getSelectedObjectIds();

		// console.log("expectedSelections = " + JSON.stringify(expectedSelections));
		// console.log("actualSelections   = " + JSON.stringify(actualSelections));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
		objectModel.setSelectionChangeHandler(null);
	});

	it("should select toggle off node", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["comment1", "node3"], "123");

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, canvasController.getSelectedComments()))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [canvasController.getNode("node3", "123")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});

		objectModel.toggleSelection("node3", true, "123");

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		// console.info("Expected Selections = " + JSON.stringify(expectedSelections, null, 2));
		// console.info("Actual Selections   = " + JSON.stringify(actualSelections, null, 2));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
		objectModel.setSelectionChangeHandler(null);
	});

	it("should deselect node", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["comment1", "node3"], "123");

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, [canvasController.getComment("comment1", "123")]))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [canvasController.getNode("node3", "123")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});
		canvasController.setSelections(["comment1"]);

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should deselect node and comment", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["comment1", "node3"], "123");

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, []))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [canvasController.getNode("node3", "123")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, [canvasController.getComment("comment1", "123")]))).to.be.true;
		});
		canvasController.setSelections([]);

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = [];
		const actualSelections = canvasController.getSelectedObjectIds();

		// console.info("Expected Selections = " + JSON.stringify(expectedSelections, null, 2));
		// console.info("Actual Selections   = " + JSON.stringify(actualSelections, null, 2));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should clear selection for deleted node", () => {
		const objectModel = canvasController.getObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["comment1", "node3"], "123");

		const node3 = canvasController.getNode("node3", "123");
		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, [canvasController.getComment("comment1", "123")]))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [node3]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});

		canvasController.deleteObject("node3", "123");

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		// console.info("Expected Selections = " + JSON.stringify(expectedSelections, null, 2));
		// console.info("Actual Selections   = " + JSON.stringify(actualSelections, null, 2));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should clear selection for deleted objects", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		canvasController.setSelections(["comment1", "node3"], "123");

		const node3 = canvasController.getNode("node3", "123");
		const comment1 = canvasController.getComment("comment1", "123");

		let changeHandlerCalled = false;
		objectModel.setSelectionChangeHandler((data) => {
			changeHandlerCalled = true;
			expect(isEmpty(difference(data.selection, []))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [node3]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, [comment1]))).to.be.true;
		});
		canvasController.deleteSelectedObjects();

		expect(changeHandlerCalled).to.be.true;

		const expectedSelections = [];
		const actualSelections = canvasController.getSelectedObjectIds();

		// console.info("Expected Selections = " + JSON.stringify(expectedSelections, null, 2));
		// console.info("Actual Selections   = " + JSON.stringify(actualSelections, null, 2));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	function setupStartCanvasInfo(primaryPipeline, pipeline, objectModel) {
		const canvasInfo =
			{	id: "456",
				primary_pipeline: primaryPipeline,
				pipelines: [pipeline]
			};

		deepFreeze(canvasInfo);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: canvasInfo,
			layoutinfo: objectModel.getLayout()
		});
	}


});


describe("test areSelectedNodesContiguous() api", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
	});

	it("Select, Execution, and Supernode nodes should be contiguous", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310",
			"idGWRVT47XDV",
			"nodeIDSuperNodePE"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Binding exit and Model nodes should be contiguous", () => {
		const selections = [
			"id5KIRGGJ3FYT",
			"id125TTEEIK7V"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Database, Sample, Merge, Table and NeuralNet nodes should be contiguous", () => {
		const selections = [
			"f5373d9e-677d-4717-a9fd-3b57038ce0de",
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
			"fab835e0-29ad-45ae-b72a-2eb3fcce6871",
			"a723a31c-6c66-421e-b00a-e4d0b1faa265",
			"bea1bbb7-ae00-404a-8380-bb65de1047cf"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Sample, Aggregate, and Merge nodes should be contiguous", () => {
		const selections = [
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
			"2807a076-6468-4ad1-94d3-f253f99bc8e0",
			"fab835e0-29ad-45ae-b72a-2eb3fcce6871"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Database, Sample, and Aggregate nodes should be contiguous", () => {
		const selections = [
			"f5373d9e-677d-4717-a9fd-3b57038ce0de",
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
			"2807a076-6468-4ad1-94d3-f253f99bc8e0"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Table, C5 and NeuralNet nodes should be contiguous", () => {
		const selections = [
			"a723a31c-6c66-421e-b00a-e4d0b1faa265",
			"353c4878-1db2-46c0-9370-3a55523dc07c",
			"bea1bbb7-ae00-404a-8380-bb65de1047cf"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.true;
	});

	it("Binding entry, Select, and Multiplot nodes should not be contiguous", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310",
			"id8I6RH2V91XW",
			"nodeIDMultiPlotPE"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.false;
	});

	it("Select, Execution, Sample, and Merge nodes should not be contiguous", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310",
			"idGWRVT47XDV",
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
			"fab835e0-29ad-45ae-b72a-2eb3fcce6871"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.false;
	});

	it("C5 and NeuralNet nodes should not be contiguous", () => {
		const selections = [
			"353c4878-1db2-46c0-9370-3a55523dc07c",
			"bea1bbb7-ae00-404a-8380-bb65de1047cf"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.false;
	});

	it("Database, Sample, Aggregate, Merge, and C5 nodes should not be contiguous", () => {
		const selections = [
			"f5373d9e-677d-4717-a9fd-3b57038ce0de",
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
			"2807a076-6468-4ad1-94d3-f253f99bc8e0",
			"fab835e0-29ad-45ae-b72a-2eb3fcce6871",
			"353c4878-1db2-46c0-9370-3a55523dc07c"
		];
		canvasController.setSelections(selections, canvasController.getPrimaryPipelineId());
		expect(canvasController.areSelectedNodesContiguous()).to.be.false;
	});

	it("Two selected flows should not be contiguous", () => {
		const objectModel = canvasController.getObjectModel();
		objectModel.selectAll();
		expect(canvasController.areSelectedNodesContiguous()).to.be.false;
	});
});
