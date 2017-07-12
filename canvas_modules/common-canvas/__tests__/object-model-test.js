/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import _ from "underscore";
import deepFreeze from "deep-freeze";
import ObjectModel from "../src/object-model/object-model.js";
import log4js from "log4js";

const logger = log4js.getLogger("object-model-test");

describe("ObjectModel handle model OK", () => {

	it("should create a canvas", () => {
		logger.info("should create a canvas");

		const expectedCanvas =
			{ zoom: 100,
				diagram:
				{ name: "my diagram",
					nodes: [{ id: "node1", name: "Node 1" },
                       { id: "node2", name: "Node 2" }]
				}
			};

		deepFreeze(expectedCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: expectedCanvas
		});

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});


	it("should clear a canvas", () => {
		logger.info("should clear a canvas");

		const startCanvas =
			{ diagram:
			{ nodes: [
               { id: "node1", xPos: 10, yPos: 10 },
               { id: "node2", xPos: 20, yPos: 20 },
               { id: "node3", xPos: 30, yPos: 30 }
			],
				comments: [
               { id: "comment1", xPos: 50, yPos: 50 },
               { id: "comment2", xPos: 60, yPos: 60 }
				]
			}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({ type: "CLEAR_CANVAS" });

		const expectedCanvas = null;
		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a node", () => {
		logger.info("should add a node");

		const startCanvas =
			{ diagram:
			{ nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
			],
				comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
				]
			}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

			// imageName - Just for Testing
		ObjectModel.dispatch({
			type: "ADD_NODE",
			data: { id: "node4",
				image: "imageName",
				inputPorts: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
				outputPorts: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
				xPos: 40,
				yPos: 40,
				label: "Type" }
		});

		const expectedCanvas =
			{ diagram:
			{ nodes: [
				{ id: "node1", xPos: 10, yPos: 10 },
				{ id: "node2", xPos: 20, yPos: 20 },
				{ id: "node3", xPos: 30, yPos: 30 },
				{ id: "node4", className: "canvas-node", image: "imageName",
					outputPorts: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
					inputPorts: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
					xPos: 40, yPos: 40, objectData: { description: "", label: "Type" } }
			],
				comments: [
					{ id: "comment1", xPos: 50, yPos: 50 },
					{ id: "comment2", xPos: 60, yPos: 60 }
				]
			}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node", () => {
		logger.info("should move a node");

		const startCanvas =
			{ diagram:
			{ nodes: [
               { id: "node1", xPos: 10, yPos: 10 },
               { id: "node2", xPos: 20, yPos: 20 },
               { id: "node3", xPos: 30, yPos: 30 }
			],
				comments: [
               { id: "comment1", xPos: 50, yPos: 50 },
               { id: "comment2", xPos: 60, yPos: 60 }
				]
			}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["node1", "node2", "node3"],
				offsetX: 5,
				offsetY: 7 }
		});

		const expectedCanvas =
			{ diagram:
			{ nodes: [
               { id: "node1", xPos: 15, yPos: 17 },
               { id: "node2", xPos: 25, yPos: 27 },
               { id: "node3", xPos: 35, yPos: 37 }
			],
				comments: [
               { id: "comment1", xPos: 50, yPos: 50 },
               { id: "comment2", xPos: 60, yPos: 60 }
				],
				links: []
			}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a node", () => {
		logger.info("should delete a node");

		const startCanvas =
			{ zoom: 100,
				diagram:
				{ nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
				],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					]
				} };

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["node1", "node3"] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram:
				{ nodes: [
              { id: "node2", xPos: 20, yPos: 20 }
				],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: []
				} };

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should disconnect a node", () => {
		logger.info("should disconnect a node");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "DISCONNECT_NODES",
			data: { selectedNodeIds: ["node1"] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ id: "comment1", xPos: 50, yPos: 50 },
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add node attr", () => {
		logger.info("should add node attr");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "ADD_NODE_ATTR",
			data: { objIds: ["node1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ "id": "node1", "xPos": 10, "yPos": 10, "customAttrs": ["bgcolor"] },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should remove node attr", () => {
		logger.info("should remove node attr");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ "id": "node1", "xPos": 10, "yPos": 10, "customAttrs": ["bgcolor"] },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "REMOVE_NODE_ATTR",
			data: { objIds: ["node1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ "id": "node1", "xPos": 10, "yPos": 10, "customAttrs": [] },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a comment", () => {
		logger.info("should add a comment");


		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "ADD_COMMENT",
			data: { id: "comment3", mousePos: { x: 200, y: 300 }, selectedObjectIds: [] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
                { id: "node1", xPos: 10, yPos: 10 },
                { id: "node2", xPos: 20, yPos: 20 },
                { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
                { id: "comment1", xPos: 50, yPos: 50 },
                { id: "comment2", xPos: 60, yPos: 60 },
						{ id: "comment3",
							className: "canvas-comment",
							content: " ",
							height: 32,
							width: 128,
							xPos: 200,
							yPos: 300 }
					],
					links: []
				}
			};


		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should edit a comment", () => {
		logger.info("should edit a comment");


		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "EDIT_COMMENT",
			data: { nodes: ["comment2"], offsetX: 425, offsetY: 125, height: 45, width: 250, label: "this is a new comment string" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
                { id: "node1", xPos: 10, yPos: 10 },
                { id: "node2", xPos: 20, yPos: 20 },
                { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
                { id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2",
							xPos: 425,
							yPos: 125,
							content: "this is a new comment string",
							height: 45,
							width: 250 }
					]
				}
			};


		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a comment", () => {
		logger.info("should move a comment");

		const startCanvas =
			{ diagram:
			{ nodes: [
               { id: "node1", xPos: 10, yPos: 10 },
               { id: "node2", xPos: 20, yPos: 20 },
               { id: "node3", xPos: 30, yPos: 30 }
			],
				comments: [
               { id: "comment1", xPos: 50, yPos: 50 },
               { id: "comment2", xPos: 60, yPos: 60 }
				]
			}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["comment1", "comment2"],
				offsetX: 5,
				offsetY: 7 }
		});

		const expectedCanvas =
			{ diagram:
			{ nodes: [
               { id: "node1", xPos: 10, yPos: 10 },
               { id: "node2", xPos: 20, yPos: 20 },
               { id: "node3", xPos: 30, yPos: 30 }
			],
				comments: [
               { id: "comment1", xPos: 55, yPos: 57 },
               { id: "comment2", xPos: 65, yPos: 67 }
				],
				links: []
			}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a comment", () => {
		logger.info("should delete a comment");
		const startCanvas =
			{ zoom: 100,
				diagram: {
					"nodes": [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 }
					],
					"comments": [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 },
						{ id: "comment3", xPos: 70, yPos: 70 }
					],
					"links": []
				}
			};
		deepFreeze(startCanvas);
		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});
		ObjectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["comment1", "comment2"] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					"nodes": [
									{ id: "node1", xPos: 10, yPos: 10 },
									{ id: "node2", xPos: 20, yPos: 20 },
									{ id: "node3", xPos: 30, yPos: 30 }
					],
					"comments": [
									{ id: "comment3", xPos: 70, yPos: 70 }
					],
					"links": []
				}
			};

		const actualCanvas = ObjectModel.getCanvas();
		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));
		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should add comment attr", () => {
		logger.info("should add comment attr");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ id: "comment1", xPos: 50, yPos: 50 },
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link1", source: "node1", target: "node2" },
								{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "ADD_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ "id": "comment1", "xPos": 50, "yPos": 50, "customAttrs": ["bgcolor"] },
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link1", source: "node1", target: "node2" },
								{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should remove comment attr", () => {
		logger.info("should remove comment attr");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ "id": "comment1", "xPos": 50, "yPos": 50, "customAttrs": ["bgcolor"] },
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link1", source: "node1", target: "node2" },
								{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "REMOVE_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ "id": "comment1", "xPos": 50, "yPos": 50, "customAttrs": [] },
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link1", source: "node1", target: "node2" },
								{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should add a link", () => {
		logger.info("should add a link");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link3", linkType: "data", srcNodeId: "node2", trgNodeId: "node3" }
		});

		ObjectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link4", linkType: "comment", srcNodeId: "comment1", trgNodeId: "node2" }
		});


		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
                { id: "node1", xPos: 10, yPos: 10 },
                { id: "node2", xPos: 20, yPos: 20 },
                { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
                { id: "comment1", xPos: 50, yPos: 50 },
                { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
                { id: "link1", source: "node1", target: "node2" },
                { id: "link2", source: "comment1", target: "node2" },
                { id: "link3", className: "canvas-data-link", source: "node2", target: "node3" },
                { id: "link4", className: "canvas-comment-link", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link", () => {
		logger.info("should delete a link");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "DELETE_LINK",
			data: { id: "link1" }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
                { id: "node1", xPos: 10, yPos: 10 },
                { id: "node2", xPos: 20, yPos: 20 },
                { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
                { id: "comment1", xPos: 50, yPos: 50 },
                { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
                { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link when a node is deleted", () => {
		logger.info("should delete a link when a node is deleted.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["node1"] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
                { id: "node2", xPos: 20, yPos: 20 },
                { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
                { id: "comment1", xPos: 50, yPos: 50 },
                { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
                { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should delete a link when a comment is deleted", () => {
		logger.info("should delete a link when a comment is deleted.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "DELETE_OBJECTS",
			data: { selectedObjectIds: ["comment1"] }
		});

		const expectedCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
								{ id: "node1", xPos: 10, yPos: 10 },
								{ id: "node2", xPos: 20, yPos: 20 },
								{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
								{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
								{ id: "link1", source: "node1", target: "node2" }
					]
				}
			};

		const actualCanvas = ObjectModel.getCanvas();

		logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas));
		logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas));

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should select an object", () => {
		logger.info("should select an object.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should clear current selections", () => {
		logger.info("should clear current selections.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		ObjectModel.dispatch({
			type: "CLEAR_SELECTIONS"
		});


		const expectedSelections = [];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off comment", () => {
		logger.info("should select toggle off comment.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		ObjectModel.toggleSelection("comment1", true);


		const expectedSelections = ["node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on comment", () => {
		logger.info("should select toggle on comment.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
              { id: "node1", xPos: 10, yPos: 10 },
              { id: "node2", xPos: 20, yPos: 20 },
              { id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
              { id: "comment1", xPos: 50, yPos: 50 },
              { id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
              { id: "link1", source: "node1", target: "node2" },
              { id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node3"]
		});


		ObjectModel.toggleSelection("comment1", true);


		const expectedSelections = ["node3", "comment1"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off node", () => {
		logger.info("should select toggle off node.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		ObjectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on node", () => {
		logger.info("should select toggle on node.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});


		ObjectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1", "node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a simple subgraph", () => {
		logger.info("should select nodes in a simple subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
							{ id: "node1", xPos: 10, yPos: 10 },
							{ id: "node2", xPos: 20, yPos: 20 },
							{ id: "node3", xPos: 30, yPos: 30 },
							{ id: "node4", xPos: 40, yPos: 30 }
					],
					comments: [
							{ id: "comment1", xPos: 50, yPos: 50 },
							{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
							{ id: "link1", source: "node1", target: "node2" },
							{ id: "link2", source: "node2", target: "node3" },
							{ id: "link3", source: "node3", target: "node4" },
							{ id: "link4", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});


		ObjectModel.selectSubGraph("node4");


		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a fork subgraph", () => {
		logger.info("should select nodes in a fork subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node2", target: "node4" },
						{ id: "link4", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node4");


		const expectedSelections = ["node1", "node4", "node2"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a merge subgraph", () => {
		logger.info("should select nodes in a merge subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node3" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link4", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node4");


		const expectedSelections = ["node1", "node4", "node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a simple partial subgraph", () => {
		logger.info("should select nodes in a simple partial subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 },
						{ id: "node5", xPos: 50, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link5", source: "node4", target: "node5" },
						{ id: "link4", source: "comment1", target: "node2" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});


		ObjectModel.selectSubGraph("node4");


		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a complex subgraph", () => {
		logger.info("should select nodes in a complex subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 },
						{ id: "node5", xPos: 50, yPos: 30 },
						{ id: "node6", xPos: 60, yPos: 30 },
						{ id: "node7", xPos: 70, yPos: 30 },
						{ id: "node8", xPos: 80, yPos: 30 },
						{ id: "node9", xPos: 90, yPos: 30 },
						{ id: "node10", xPos: 100, yPos: 30 },
						{ id: "node11", xPos: 110, yPos: 30 },
						{ id: "node12", xPos: 120, yPos: 30 },
						{ id: "node13", xPos: 130, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link5", source: "node4", target: "node9" },
						{ id: "link4", source: "comment1", target: "node7" },
						{ id: "link6", source: "node4", target: "node10" },
						{ id: "link7", source: "node4", target: "node11" },
						{ id: "link8", source: "node4", target: "node12" },
						{ id: "link9", source: "node9", target: "node10" },
						{ id: "link10", source: "node12", target: "node11" },
						{ id: "link11", source: "node11", target: "node13" },
						{ id: "link12", source: "node8", target: "node4" },
						{ id: "link13", source: "node1", target: "node5" },
						{ id: "link14", source: "node5", target: "node6" },
						{ id: "link15", source: "node1", target: "node7" },
						{ id: "link16", source: "node7", target: "node4" },
						{ id: "link17", source: "node6", target: "node4" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node13");


		const expectedSelections = ["node1", "node13", "node2", "node3", "node4", "node11", "node12",
			"node5", "node6", "node7"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a complex patial subgraph", () => {
		logger.info("should select nodes in a complex partial subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 },
						{ id: "node5", xPos: 50, yPos: 30 },
						{ id: "node6", xPos: 60, yPos: 30 },
						{ id: "node7", xPos: 70, yPos: 30 },
						{ id: "node8", xPos: 80, yPos: 30 },
						{ id: "node9", xPos: 90, yPos: 30 },
						{ id: "node10", xPos: 100, yPos: 30 },
						{ id: "node11", xPos: 110, yPos: 30 },
						{ id: "node12", xPos: 120, yPos: 30 },
						{ id: "node13", xPos: 130, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link5", source: "node4", target: "node9" },
						{ id: "link4", source: "comment1", target: "node7" },
						{ id: "link6", source: "node4", target: "node10" },
						{ id: "link7", source: "node4", target: "node11" },
						{ id: "link8", source: "node4", target: "node12" },
						{ id: "link9", source: "node9", target: "node10" },
						{ id: "link10", source: "node12", target: "node11" },
						{ id: "link11", source: "node11", target: "node13" },
						{ id: "link12", source: "node8", target: "node4" },
						{ id: "link13", source: "node1", target: "node5" },
						{ id: "link14", source: "node5", target: "node6" },
						{ id: "link15", source: "node1", target: "node7" },
						{ id: "link16", source: "node7", target: "node4" },
						{ id: "link17", source: "node6", target: "node4" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node12");


		const expectedSelections = ["node1", "node12", "node2", "node3", "node4",
			"node5", "node6", "node7"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a complex single input subgraph", () => {
		logger.info("should select nodes in a complex single input subgraph.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 },
						{ id: "node5", xPos: 50, yPos: 30 },
						{ id: "node6", xPos: 60, yPos: 30 },
						{ id: "node7", xPos: 70, yPos: 30 },
						{ id: "node8", xPos: 80, yPos: 30 },
						{ id: "node9", xPos: 90, yPos: 30 },
						{ id: "node10", xPos: 100, yPos: 30 },
						{ id: "node11", xPos: 110, yPos: 30 },
						{ id: "node12", xPos: 120, yPos: 30 },
						{ id: "node13", xPos: 130, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link5", source: "node4", target: "node9" },
						{ id: "link4", source: "comment1", target: "node7" },
						{ id: "link6", source: "node4", target: "node10" },
						{ id: "link7", source: "node4", target: "node11" },
						{ id: "link8", source: "node4", target: "node12" },
						{ id: "link9", source: "node9", target: "node10" },
						{ id: "link10", source: "node12", target: "node11" },
						{ id: "link11", source: "node11", target: "node13" },
						{ id: "link12", source: "node8", target: "node4" },
						{ id: "link13", source: "node1", target: "node5" },
						{ id: "link14", source: "node5", target: "node6" },
						{ id: "link15", source: "node1", target: "node7" },
						{ id: "link16", source: "node7", target: "node4" },
						{ id: "link17", source: "node6", target: "node4" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node8"]
		});


		ObjectModel.selectSubGraph("node11");


		const expectedSelections = ["node8", "node11", "node4", "node12"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a complex subgraph starting with comment", () => {
		logger.info("should select nodes in a complex subgraph starting with comment.");

		const startCanvas =
			{ zoom: 100,
				diagram: {
					nodes: [
						{ id: "node1", xPos: 10, yPos: 10 },
						{ id: "node2", xPos: 20, yPos: 20 },
						{ id: "node3", xPos: 30, yPos: 30 },
						{ id: "node4", xPos: 40, yPos: 30 },
						{ id: "node5", xPos: 50, yPos: 30 },
						{ id: "node6", xPos: 60, yPos: 30 },
						{ id: "node7", xPos: 70, yPos: 30 },
						{ id: "node8", xPos: 80, yPos: 30 },
						{ id: "node9", xPos: 90, yPos: 30 },
						{ id: "node10", xPos: 100, yPos: 30 },
						{ id: "node11", xPos: 110, yPos: 30 },
						{ id: "node12", xPos: 120, yPos: 30 },
						{ id: "node13", xPos: 130, yPos: 30 }
					],
					comments: [
						{ id: "comment1", xPos: 50, yPos: 50 },
						{ id: "comment2", xPos: 60, yPos: 60 }
					],
					links: [
						{ id: "link1", source: "node1", target: "node2" },
						{ id: "link2", source: "node2", target: "node3" },
						{ id: "link3", source: "node3", target: "node4" },
						{ id: "link5", source: "node4", target: "node9" },
						{ id: "link4", source: "comment1", target: "node7" },
						{ id: "link6", source: "node4", target: "node10" },
						{ id: "link7", source: "node4", target: "node11" },
						{ id: "link8", source: "node4", target: "node12" },
						{ id: "link9", source: "node9", target: "node10" },
						{ id: "link10", source: "node12", target: "node11" },
						{ id: "link11", source: "node11", target: "node13" },
						{ id: "link12", source: "node8", target: "node4" },
						{ id: "link13", source: "node1", target: "node5" },
						{ id: "link14", source: "node5", target: "node6" },
						{ id: "link15", source: "node1", target: "node7" },
						{ id: "link16", source: "node7", target: "node4" },
						{ id: "link17", source: "node6", target: "node4" }
					]
				}
			};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});


		ObjectModel.selectSubGraph("node13");


		const expectedSelections = ["comment1", "node13", "node7", "node4", "node11", "node12"];
		const actualSelections = ObjectModel.getSelectedObjectIds();

		logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

});
