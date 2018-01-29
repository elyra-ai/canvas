/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
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
import ObjectModel from "../src/object-model/object-model.js";
import log4js from "log4js";

const logger = log4js.getLogger("object-model-test");
const objectModel = new ObjectModel();

describe("ObjectModel handle model OK", () => {

	it("should create a canvas", () => {
		logger.info("should create a canvas");

		const expectedCanvas =
			{	nodes: [{ id: "node1", name: "Node 1" },
				{ id: "node2", name: "Node 2" }]
			};

		deepFreeze(expectedCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: expectedCanvas,
			layoutinfo: objectModel.getLayout()
		});

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});


	it("should clear a canvas", () => {
		logger.info("should clear a canvas");

		const startCanvas =
			{ diagram:
			{ nodes: [
				{ id: "node1", x_pos: 10, y_pos: 10 },
				{ id: "node2", x_pos: 20, y_pos: 20 },
				{ id: "node3", x_pos: 30, y_pos: 30 }
			],
			comments: [
				{ id: "comment1", x_pos: 50, y_pos: 50 },
				{ id: "comment2", x_pos: 60, y_pos: 60 }
			]
			}
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({ type: "CLEAR_PIPELINE_FLOW" });

		const expectedCanvas = null;
		const actualCanvas = objectModel.getCanvasInfo();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a node", () => {
		logger.info("should add a node");

		const startCanvas =
			{ nodes: [
				{ id: "node1", x_pos: 10, y_pos: 10 },
				{ id: "node2", x_pos: 20, y_pos: 20 },
				{ id: "node3", x_pos: 30, y_pos: 30 }
			],
			comments: [
				{ id: "comment1", x_pos: 50, y_pos: 50 },
				{ id: "comment2", x_pos: 60, y_pos: 60 }
			]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		var newNodeData = { id: "node4", label: "Type", image: "imageName", type: "execution_node",
			operator_id_ref: "type", class_name: "canvas-node",
			input_ports: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
			output_ports: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
			x_pos: 40, y_pos: 40
		};

		// imageName - Just for Testing
		objectModel.dispatch({
			type: "ADD_NODE",
			data: { newNode: newNodeData }
		});


		const expectedCanvas =
			{
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", label: "Type", image: "imageName", type: "execution_node",
						operator_id_ref: "type", class_name: "canvas-node",
						input_ports: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
						output_ports: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
						x_pos: 40, y_pos: 40 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node", () => {
		logger.info("should move a node");

		const startCanvas =
			{ nodes: [
				{ id: "node1", x_pos: 10, y_pos: 10 },
				{ id: "node2", x_pos: 20, y_pos: 20 },
				{ id: "node3", x_pos: 30, y_pos: 30 }
			],
			comments: [
				{ id: "comment1", x_pos: 50, y_pos: 50 },
				{ id: "comment2", x_pos: 60, y_pos: 60 }
			],
			links: []
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["node1", "node2", "node3"],
				offsetX: 5,
				offsetY: 7 }
		});

		const expectedCanvas =
			{ nodes: [
				{ id: "node1", x_pos: 15, y_pos: 17 },
				{ id: "node2", x_pos: 25, y_pos: 27 },
				{ id: "node3", x_pos: 35, y_pos: 37 }
			],
			comments: [
				{ id: "comment1", x_pos: 50, y_pos: 50 },
				{ id: "comment2", x_pos: 60, y_pos: 60 }
			],
			links: []
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a node", () => {
		logger.info("should delete a node");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		/* objectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["node1", "node3"] }
		}); */

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "node1"
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "node3"
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node2", x_pos: 20, y_pos: 20 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should disconnect a node", () => {
		logger.info("should disconnect a node");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "DISCONNECT_NODES",
			data: { selectedNodeIds: ["node1"] }
		});

		const expectedCanvas =
			{ zoom: 100,
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
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add node attr", () => {
		logger.info("should add node attr");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "ADD_NODE_ATTR",
			data: { objIds: ["node1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": ["bgcolor"] },
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

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should remove node attr", () => {
		logger.info("should remove node attr");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": ["bgcolor"] },
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "REMOVE_NODE_ATTR",
			data: { objIds: ["node1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": [] },
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

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a comment", () => {
		logger.info("should add a comment");


		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		/* objectModel.dispatch({
			type: "ADD_COMMENT",
			data: { id: "comment3", mousePos: { x: 200, y: 300 }, selectedObjectIds: [] }
			class_name: "canvas-comment",
			content: " ",
			height: 32,
			width: 128,
		});*/

		objectModel.dispatch({
			type: "ADD_COMMENT",
			data: { id: "comment3",	x_pos: 200,	y_pos: 300,	selectedObjectIds: []	}
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 },
					{ id: "comment3",	x_pos: 200,	y_pos: 300 }
				],
				links: []
			};


		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(JSON.stringify(expectedCanvas), JSON.stringify(actualCanvas))).to.be.true;
	});

	it("should edit a comment", () => {
		logger.info("should edit a comment");


		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "EDIT_COMMENT",
			data: { nodes: ["comment2"], offsetX: 425, offsetY: 125, height: 45, width: 250, label: "this is a new comment string" }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2",
						x_pos: 425,
						y_pos: 125,
						content: "this is a new comment string",
						height: 45,
						width: 250 }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(JSON.stringify(expectedCanvas), JSON.stringify(actualCanvas))).to.be.true;
	});

	it("should move a comment", () => {
		logger.info("should move a comment");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["comment1", "comment2"],
				offsetX: 5,
				offsetY: 7 }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 55, y_pos: 57 },
					{ id: "comment2", x_pos: 65, y_pos: 67 }
				],
				links: []
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a comment", () => {
		logger.info("should delete a comment");
		const startCanvas =
			{ "zoom": 100,
				"nodes": [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				"comments": [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 },
					{ id: "comment3", x_pos: 70, y_pos: 70 }
				],
				"links": []
			};
		deepFreeze(startCanvas);
		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		/* objectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["comment1", "comment2"] }
		});*/

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "comment1"
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "comment2"
		});

		const expectedCanvas =
			{ "zoom": 100,
				"nodes": [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				"comments": [
					{ id: "comment3", x_pos: 70, y_pos: 70 }
				],
				"links": []
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should add comment attr", () => {
		logger.info("should add comment attr");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "ADD_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": ["bgcolor"] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should remove comment attr", () => {
		logger.info("should remove comment attr");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": ["bgcolor"] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "REMOVE_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": [] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a link", () => {
		logger.info("should add a link");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link3", class_name: "canvas-node-link",
				type: "nodeLink", srcNodeId: "node2", trgNodeId: "node3",
				srcNodePortId: "sourceport1", trgNodePortId: "targetport1" }
		});

		objectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link4", class_name: "canvas-comment-link",
				type: "commentLink", srcNodeId: "comment1", trgNodeId: "node2" }
		});


		const expectedCanvas =
			{ zoom: 100,
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
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" },
					{ id: "link3", class_name: "canvas-node-link",
						srcNodeId: "node2", trgNodeId: "node3", type: "nodeLink",
						srcNodePortId: "sourceport1", trgNodePortId: "targetport1" },
					{ id: "link4", class_name: "canvas-comment-link",
						srcNodeId: "comment1", trgNodeId: "node2", type: "commentLink" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		// var exp = JSON.stringify(expectedCanvas);
		// var act = JSON.stringify(actualCanvas);
		//
		// for (var i = 0; i < act.length; i++) {
		// 	if (exp[i] !== act[i]) {
		// 		logger.info("Mismatch at index = " + i + " exp = " + exp[i] + " act = " + act[i]);
		// 	} else {
		// 		// logger.info("Match OK at index = " + i + " exp = " + exp[i] + " act = " + act[i]);
		// 	}
		// }


		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link", () => {
		logger.info("should delete a link");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "DELETE_LINK",
			data: { id: "link1" }
		});

		const expectedCanvas =
			{ zoom: 100,
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
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link when a node is deleted", () => {
		logger.info("should delete a link when a node is deleted.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "node1"
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link when a comment is deleted", () => {
		logger.info("should delete a link when a comment is deleted.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: "comment1"
		});

		const expectedCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" }
				]
			};

		const actualCanvas = objectModel.getCanvasInfo();

		// Remove transient data before comparing with expected
		for (var i = 0; i < actualCanvas.nodes.length; i++) {
			delete actualCanvas.nodes[i].width;
			delete actualCanvas.nodes[i].height;
			delete actualCanvas.nodes[i].outputPortsHeight;
			delete actualCanvas.nodes[i].inputPortsHeight;
		}

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 4));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should select an object", () => {
		logger.info("should select an object.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should clear current selections", () => {
		logger.info("should clear current selections.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		objectModel.dispatch({
			type: "CLEAR_SELECTIONS"
		});


		const expectedSelections = [];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off comment", () => {
		logger.info("should select toggle off comment.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		objectModel.toggleSelection("comment1", true);


		const expectedSelections = ["node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on comment", () => {
		logger.info("should select toggle on comment.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node3"]
		});


		objectModel.toggleSelection("comment1", true);


		const expectedSelections = ["node3", "comment1"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off node", () => {
		logger.info("should select toggle off node.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		objectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on node", () => {
		logger.info("should select toggle on node.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});


		objectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a simple subgraph", () => {
		logger.info("should select nodes in a simple subgraph.");

		const startCanvas =
			{ zoom: 100,
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
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a fork subgraph", () => {
		logger.info("should select nodes in a fork subgraph.");

		const startCanvas =
			{ zoom: 100,
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

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node1", "node4", "node2"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a merge subgraph", () => {
		logger.info("should select nodes in a merge subgraph.");

		const startCanvas =
			{ zoom: 100,
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
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node3" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node1", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a simple partial subgraph", () => {
		logger.info("should select nodes in a simple partial subgraph.");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node5" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex subgraph", () => {
		logger.info("should select nodes in a complex subgraph.");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node13");

		const expectedSelections = ["node1", "node13", "node2", "node3", "node4", "node11", "node12",
			"node5", "node6", "node7"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		// logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex patial subgraph", () => {
		logger.info("should select nodes in a complex partial subgraph.");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node12");

		const expectedSelections = ["node1", "node12", "node2", "node3", "node4",
			"node5", "node6", "node7"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex single input subgraph", () => {
		logger.info("should select nodes in a complex single input subgraph.");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node8"]
		});

		objectModel.selectSubGraph("node11");

		const expectedSelections = ["node8", "node11", "node4", "node12"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		// logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex subgraph starting with comment", () => {
		logger.info("should select nodes in a complex subgraph starting with comment.");

		const startCanvas =
			{ zoom: 100,
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		deepFreeze(startCanvas);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: startCanvas,
			layoutinfo: objectModel.getLayout()
		});

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});

		objectModel.selectSubGraph("node13");

		const expectedSelections = ["comment1", "node13", "node7", "node4", "node11", "node12"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

});
