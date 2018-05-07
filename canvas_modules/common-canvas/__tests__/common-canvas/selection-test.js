/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import deepFreeze from "deep-freeze";
import CanvasController from "../../src/common-canvas/canvas-controller";
// import log4js from "log4js";

// const logger = log4js.getLogger("selection-test");
const canvasController = new CanvasController();

describe("Selection notification tests", () => {
	it("Should select node and comment", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, ["comment1", "node3"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, objectModel.getSelectedNodes()))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, objectModel.getSelectedComments()))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, [objectModel.getNode("node3")]))).to.be.true;
			expect(isEmpty(difference(data.addedComments, [objectModel.getComment("comment1")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});
		canvasController.setSelections(["comment1", "node3"]);

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should select nodes in a fork subgraph", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, ["node1", "node4", "node2"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, objectModel.getSelectedNodes()))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, [objectModel.getNode("node2"), objectModel.getNode("node4")]))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node1", "node4", "node2"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
		objectModel.setSelectionChangeHandler(null);
	});

	it("should select toggle off node", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, objectModel.getSelectedComments()))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [objectModel.getNode("node3")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});

		objectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
		objectModel.setSelectionChangeHandler(null);
	});

	it("should deselect node", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, [objectModel.getComment("comment1")]))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [objectModel.getNode("node3")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});
		canvasController.setSelections(["comment1"]);

		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should deselect node and comment", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, []))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [objectModel.getNode("node3")]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, [objectModel.getComment("comment1")]))).to.be.true;
		});
		canvasController.setSelections([]);

		const expectedSelections = [];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should clear selection for deleted node", () => {
		const objectModel = canvasController.getObjectModel();

		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		const node3 = objectModel.getNode("node3");
		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, ["comment1"]))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, [objectModel.getComment("comment1")]))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [node3]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, []))).to.be.true;
		});
		canvasController.deleteObject("node3");

		const expectedSelections = ["comment1"];
		const actualSelections = canvasController.getSelectedObjectIds();

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;

		objectModel.setSelectionChangeHandler(null);
	});

	it("should clear selection for deleted objects", () => {
		const objectModel = canvasController.getObjectModel();
		const startPipeline =
			{ sub_id: "123",
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

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		const node3 = objectModel.getNode("node3");
		const comment1 = objectModel.getComment("comment1");

		objectModel.setSelectionChangeHandler((data) => {
			expect(isEmpty(difference(data.selection, []))).to.be.true;
			expect(isEmpty(difference(data.selectedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.selectedComments, []))).to.be.true;
			expect(isEmpty(difference(data.addedNodes, []))).to.be.true;
			expect(isEmpty(difference(data.addedComments, []))).to.be.true;
			expect(isEmpty(difference(data.deselectedNodes, [node3]))).to.be.true;
			expect(isEmpty(difference(data.deselectedComments, [comment1]))).to.be.true;
		});
		canvasController.deleteSelectedObjects();

		const expectedSelections = [];
		const actualSelections = canvasController.getSelectedObjectIds();

		// logger.info("Expected Selections = " + JSON.stringify(expectedSelections, null, 2));
		// logger.info("Actual Selections   = " + JSON.stringify(actualSelections, null, 2));

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
