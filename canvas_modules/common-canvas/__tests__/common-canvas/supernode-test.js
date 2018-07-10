/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller";
import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

import supernodeFlow from "../test_resources/json/supernodeCanvas.json";
import test1ExpectedFlow from "../test_resources/json/supernode-test1-expected-flow.json";
import test1ExpectedUndoFlow from "../test_resources/json/supernode-test1-expected-undo-flow.json";
import test2ExpectedFlow from "../test_resources/json/supernode-test2-expected-flow.json";
import test2ExpectedUndoFlow from "../test_resources/json/supernode-test2-expected-undo-flow.json";
import test3ExpectedFlow from "../test_resources/json/supernode-test3-expected-flow.json";
import test3ExpectedUndoFlow from "../test_resources/json/supernode-test3-expected-undo-flow.json";
import test4ExpectedFlow from "../test_resources/json/supernode-test4-expected-flow.json";
import test4ExpectedUndoFlow from "../test_resources/json/supernode-test4-expected-undo-flow.json";
import test5ExpectedFlow from "../test_resources/json/supernode-test5-expected-flow.json";
import test5ExpectedUndoFlow from "../test_resources/json/supernode-test5-expected-undo-flow.json";
import test6ExpectedFlow from "../test_resources/json/supernode-test6-expected-flow.json";
import test6ExpectedUndoFlow from "../test_resources/json/supernode-test6-expected-undo-flow.json";

const superNodeId = "7015d906-2eae-45c1-999e-fb888ed957e5";
// Supernode.
const expandCollapseSupenodeSourceObject = {
	"type": "node",
	"targetObject": {
		"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
		"type": "super_node",
		"output_ports": [
			{
				"id": "7d1ac5ee-a599-451a-9036-dd2bafb53dd2_outPort",
				"label": "Output Port",
				"cardinality": {
					"min": 0,
					"max": -1
				},
				"app_data": {}
			}
		],
		"input_ports": [
			{
				"id": "691e065f-8359-4b46-aad2-531702ef2a8e_inPort",
				"label": "Input Port",
				"cardinality": {
					"min": 0,
					"max": 1
				},
				"app_data": {
					"my_data": {
						"my_field": "Execution node -> Inputs -> My data -> My field -> My value"
					}
				}
			}, {
				"id": "ba83fcf4-d7d7-4862-b7c9-f2e611f912df_inPort",
				"label": "Input Port",
				"cardinality": {
					"min": 0,
					"max": 1
				},
				"app_data": {}
			}
		],
		"label": "Supernode",
		"description": "supernode",
		"image": "/graphics/7db53b94e6b92ab5505e010d14b6f2d6.svg",
		"x_pos": 297,
		"y_pos": 235,
		"class_name": "",
		"decorations": [],
		"parameters": [],
		"messages": [],
		"app_data": {},
		"subflow_ref": {
			"pipeline_id_ref": "babad275-1719-4224-8d65-b04d0804d95c"
		},
		"model_ref": "",
		"inputPortsHeight": 40,
		"outputPortsHeight": 20,
		"expanded_height": 75,
		"expanded_width": 70
	},
	"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
	"pipelineId": "153651d6-9b88-423c-b01b-861f12d01489",
	"cmPos": {
		"x": 361,
		"y": 251
	},
	"mousePos": {
		"x": 361,
		"y": 251
	},
	"selectedObjectIds": ["7015d906-2eae-45c1-999e-fb888ed957e5"],
	"zoom": 1
};
// Execution Node.
const createSupernodeSourceObject1 = {
	"type": "node",
	"targetObject": {
		"id": "idGWRVT47XDV",
		"type": "execution_node",
		"operator_id_ref": "dummy_operator",
		"output_ports": [
			{
				"id": "outPort_1",
				"label": "Output Port",
				"cardinality": {
					"min": 0,
					"max": -1
				},
				"parameters": {
					"props": [
						{
							"field1": "execution-node-port-param-val1"
						}, {
							"field2": "execution-node-port-param-val2"
						}
					]
				},
				"app_data": {
					"my_data": {
						"my_field": "Execution node -> Outputs -> My data -> My field -> My value"
					}
				}
			}
		],
		"input_ports": [
			{
				"id": "inPort",
				"label": "Input Port",
				"cardinality": {
					"min": 0,
					"max": 1
				},
				"app_data": {
					"my_data": {
						"my_field": "Execution node -> Inputs -> My data -> My field -> My value"
					}
				}
			}
		],
		"label": "Execution node",
		"description": "Sorts the data",
		"image": "",
		"x_pos": 297,
		"y_pos": 139.5,
		"class_name": "",
		"decorations": [],
		"parameters": {
			"props": [
				{
					"field1": "execution-node-param-val1"
				}, {
					"field2": "execution-node-param-val2"
				}
			]
		},
		"messages": [],
		"app_data": {
			"my_data": {
				"value": "Execution node - data value"
			}
		},
		"subflow_ref": {},
		"model_ref": "",
		"inputPortsHeight": 20,
		"outputPortsHeight": 20,
		"expanded_height": 75,
		"expanded_width": 70
	},
	"id": "idGWRVT47XDV",
	"cmPos": {
		"x": 324,
		"y": 185
	},
	"mousePos": {
		"x": 324,
		"y": 185
	},
	"selectedObjectIds": [],
	"zoom": 1
};
// Binding (exit) node.
const createSupernodeSourceObject2 = {
	"type": "node",
	"targetObject": {
		"id": "id5KIRGGJ3FYT",
		"type": "binding",
		"output_ports": [],
		"input_ports": [
			{
				"id": "inPort",
				"label": "Input Port",
				"cardinality": {
					"min": 0,
					"max": 1
				},
				"app_data": {}
			}
		],
		"label": "Binding (exit) node",
		"description": "",
		"image": "",
		"x_pos": 642,
		"y_pos": 375.99999237060547,
		"class_name": "canvas-node",
		"decorations": [],
		"parameters": [],
		"messages": [],
		"app_data": {},
		"subflow_ref": {},
		"model_ref": "",
		"inputPortsHeight": 20,
		"outputPortsHeight": 0,
		"expanded_height": 75,
		"expanded_width": 70
	},
	"id": "id5KIRGGJ3FYT",
	"cmPos": {
		"x": 622,
		"y": 391
	},
	"mousePos": {
		"x": 658,
		"y": 394
	},
	"selectedObjectIds": [],
	"zoom": 1
};

describe("Expand and Collapse Supernode Action", () => {
	let canvasController;
	let objectModel;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = { enableAutoLayout: "none", canvasController: canvasController, enableInternalObjectModel: true };
		createCommonCanvas(config, canvasController);

		objectModel = canvasController.getObjectModel();
	});

	it("Should set the is_expanded attribute correctly when expanded or collapsed", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.false;
	});

	it("Should set the is_expanded attribute correctly with undo and redo", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.false;

		canvasController.contextMenuActionHandler("redo");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;
	});

	it("Should save the expanded_width, expanded_height, and is_expanded attributes when the supernode is expanded in-place", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		let pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_width).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_height).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.is_expanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_width).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_height).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.is_expanded).to.be.false;
	});
});

describe("Create Supernode Action", () => {
	let canvasController;
	let objectModel;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = { enableAutoLayout: "none", canvasController: canvasController, enableInternalObjectModel: true };
		createCommonCanvas(config, canvasController);

		objectModel = canvasController.getObjectModel();
	});

	// Uses test1ExpectedFlow and test1ExpectedUndoFlow
	it("Create supernode with selected nodes and connected comments", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"idGWRVT47XDV" // Execution
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[1].links[1].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[11].inputs[0].links[0].node_id_ref; // Delete existing supernode link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[11].inputs[1].links[0].node_id_ref; // Delete existing supernode link node_id_ref.
		pipelineFlow.pipelines[0].nodes[11] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.

		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test1ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test12ExpectedFlow and test2ExpectedUndoFlow
	it("Create supernode with selected nodes and selected comments", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"idGWRVT47XDV", // Execution
			"id42ESQA3VPXB", // Comment
			"c9b039c9-b098-412f-a08a-e9b722eadafc" // Comment
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[1].links[1].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[11].inputs[0].links[0].node_id_ref; // Delete existing supernode link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[11].inputs[1].links[0].node_id_ref; // Delete existing supernode link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test2ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test3ExpectedFlow and test3ExpectedUndoFlow
	it("Create supernode with selected nodes and selected comments connected to unselected nodes", () => {
		const selections = [
			"idGWRVT47XDV", // Execution
			"nodeIDMultiPlotPE", // Multiplot
			"id42ESQA31234" // Comment
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[2].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[1].links[1].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test3ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test4ExpectedFlow and test4ExpectedUndoFlow
	it("Create supernode with selected nodes with multiple inputs and connected via associationLink", () => {
		const selections = [
			"id5KIRGGJ3FYT", // Binding (exit)
			"id125TTEEIK7V" // Model
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject2.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject2);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test4ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test4ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test4ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test5ExpectedFlow and test5ExpectedUndoFlow
	it("Create supernode with input link to second port", () => {
		const selections = [
			"nodeIDMultiPlotPE", // Multiplot
			"id5KIRGGJ3FYT", // Binding (exit)
			"id125TTEEIK7V" // Model
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject2.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject2);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[11].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[11].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[11] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[1].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test5ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test5ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test5ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test6ExpectedFlow and test6ExpectedUndoFlow
	it("Create supernode with supernode", () => {
		const selections = [
			"nodeIDMultiPlotPE", // Multiplot
			"idGWRVT47XDV", // Execution
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[2].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[11].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[11].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[11] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].inputs[1].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[6].id; // Delete new binding node id.

		// console.log(JSON.stringify(pipelineFlow));
		expect(isEqual(JSON.stringify(test6ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test6ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test6ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	it("Create supernode in top left corner of rect, not the node order in the DOM", () => {
		const apiPipeline = objectModel.getAPIPipeline();
		const selections = [
			"nodeIDMultiPlotPE", // Multiplot
			"7015d906-2eae-45c1-999e-fb888ed957e5", // Supernode
			"id125TTEEIK7V", // Model Node
			"id5KIRGGJ3FYT" // Binding (exit) node
		];
		canvasController.setSelections(selections);

		// This node is closest to the top left corner of the selected nodes bounding rect.
		const topLeftNode = apiPipeline.getNode("7015d906-2eae-45c1-999e-fb888ed957e5");

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		const supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(1);
		expect(supernodes[0].x_pos).to.equal(topLeftNode.x_pos);
		expect(supernodes[0].y_pos).to.equal(topLeftNode.y_pos);
	});
});

describe("Copy and Paste Supernode", () => {
	let canvasController;
	let objectModel;
	let apiPipeline;

	const primaryPipelineId = "153651d6-9b88-423c-b01b-861f12d01489";

	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = { enableAutoLayout: "none", canvasController: canvasController, enableInternalObjectModel: true };
		createCommonCanvas(config, canvasController);

		objectModel = canvasController.getObjectModel();
		apiPipeline = objectModel.getAPIPipeline();

		objectModel.setSchemaValidation(false);
	});

	it("Copy supernode and regular node into same canvas", () => {
		const canvasInfoBefore = Object.assign({}, objectModel.getPipelineFlow());

		const selections = [
			"7015d906-2eae-45c1-999e-fb888ed957e5", // Supernode
			"nodeIDMultiPlotPE" // Multiplot
		];
		canvasController.setSelections(selections, primaryPipelineId);
		canvasController.copyToClipboard();
		canvasController.pasteFromClipboard(primaryPipelineId);

		const canvasInfo = objectModel.getPipelineFlow();

		// const supernodesOriginal = apiPipeline.getSupernodes();
		const supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(2);
		const originalSupernode = JSON.parse(JSON.stringify(supernodes[0]));
		const clonedSupernode = JSON.parse(JSON.stringify(supernodes[1]));

		// Delete the unique ids before comparing.
		deleteSupernodeUniqueIds(originalSupernode);
		deleteSupernodeUniqueIds(clonedSupernode);
		expect(isEqual(JSON.stringify(originalSupernode), JSON.stringify(clonedSupernode))).to.be.true;

		expect(canvasInfo.pipelines).to.have.length(3);
		const originalPipeline = Object.assign({}, canvasInfo.pipelines[1]);
		const clonedPipeline = Object.assign({}, canvasInfo.pipelines[2]);

		// Delete the unique ids before comparing.
		delete originalPipeline.id;
		delete clonedPipeline.id;
		expect(isEqual(JSON.stringify(originalPipeline), JSON.stringify(clonedPipeline))).to.be.true;

		// Undo the clone action.
		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(canvasInfoBefore), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});

	it("Copy supernode with subflow into same canvas", () => {
		let selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];
		canvasController.setSelections(selections);

		// Create supernode from selections.
		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		let supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(1);

		const newSupernode = supernodes[0];
		const canvasInfoBefore = Object.assign({}, objectModel.getPipelineFlow());

		// Copy and paste the newly created supernode.
		selections = [newSupernode.id];
		canvasController.setSelections(selections, primaryPipelineId);
		canvasController.copyToClipboard();
		canvasController.pasteFromClipboard(primaryPipelineId);

		const canvasInfo = objectModel.getPipelineFlow();

		supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(2);

		const originalSupernode = JSON.parse(JSON.stringify(supernodes[0]));
		const clonedSupernode = JSON.parse(JSON.stringify(supernodes[1]));

		// Delete the unique ids before comparing.
		deleteSupernodeUniqueIds(originalSupernode);
		deleteSupernodeUniqueIds(clonedSupernode);
		expect(isEqual(JSON.stringify(originalSupernode), JSON.stringify(clonedSupernode))).to.be.true;

		expect(canvasInfo.pipelines).to.have.length(5);
		const originalPipeline = Object.assign({}, canvasInfo.pipelines[2]);
		const clonedPipeline = Object.assign({}, canvasInfo.pipelines[4]);

		// Delete the unique ids before comparing.
		deletePipelineUniqueIds(originalPipeline, 1);
		deletePipelineUniqueIds(clonedPipeline, 1);
		expect(isEqual(JSON.stringify(originalPipeline), JSON.stringify(clonedPipeline))).to.be.true;

		// Undo the clone action.
		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(canvasInfoBefore), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});

	it("Copy multiple supernodes with nested subflow into same canvas", () => {
		let selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];
		canvasController.setSelections(selections);

		// Create supernode from selections.
		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		let supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(1);

		const newSupernode = supernodes[0];
		const canvasInfoBefore1 = Object.assign({}, objectModel.getPipelineFlow());

		// Copy and paste the newly created supernode.
		selections = [newSupernode.id];
		canvasController.setSelections(selections, primaryPipelineId);
		canvasController.copyToClipboard();
		canvasController.pasteFromClipboard(primaryPipelineId);

		supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(2);

		const originalSupernode = JSON.parse(JSON.stringify(supernodes[0]));
		const clonedSupernode = JSON.parse(JSON.stringify(supernodes[1]));

		let canvasInfo = objectModel.getPipelineFlow();
		expect(canvasInfo.pipelines).to.have.length(5);

		// Create another supernode from the cloned supernode.
		selections = [clonedSupernode.id];
		canvasController.setSelections(selections);
		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(2);

		const newSupernode2 = JSON.parse(JSON.stringify(supernodes[1]));
		const canvasInfoBefore2 = Object.assign({}, objectModel.getPipelineFlow());

		// Copy and paste both supernodes in primary pipeline.
		selections = [
			originalSupernode.id,
			newSupernode2.id
		];
		canvasController.setSelections(selections, primaryPipelineId);
		canvasController.copyToClipboard();
		canvasController.pasteFromClipboard(primaryPipelineId);

		supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(4);

		const clonedOriginalSupernode = JSON.parse(JSON.stringify(supernodes[2]));
		const clonedNewSupernode2 = JSON.parse(JSON.stringify(supernodes[3]));

		canvasInfo = objectModel.getPipelineFlow();

		// Delete the unique ids before comparing.
		deleteSupernodeUniqueIds(originalSupernode);
		deleteSupernodeUniqueIds(newSupernode2);
		deleteSupernodeUniqueIds(clonedOriginalSupernode);
		deleteSupernodeUniqueIds(clonedNewSupernode2);
		expect(isEqual(JSON.stringify(originalSupernode), JSON.stringify(clonedOriginalSupernode))).to.be.true;
		expect(isEqual(JSON.stringify(newSupernode2), JSON.stringify(clonedNewSupernode2))).to.be.true;

		expect(canvasInfo.pipelines).to.have.length(11);
		const originalPipeline = Object.assign({}, canvasInfo.pipelines[2]);
		const originalPipelineSubflow = Object.assign({}, canvasInfo.pipelines[1]);
		const clonedOriginalPipeline = Object.assign({}, canvasInfo.pipelines[7]);
		const clonedOriginalPipelineSubflow = Object.assign({}, canvasInfo.pipelines[6]);
		const originalPipeline2 = Object.assign({}, canvasInfo.pipelines[5]);
		const originalPipeline2Subflow = Object.assign({}, canvasInfo.pipelines[4]);
		const originalPipeline2NestedSubflow = Object.assign({}, canvasInfo.pipelines[3]);
		const clonedOriginalPipeline2 = Object.assign({}, canvasInfo.pipelines[10]);
		const clonedOriginalPipeline2Subflow = Object.assign({}, canvasInfo.pipelines[9]);
		const clonedOriginalPipeline2NestedSubflow = Object.assign({}, canvasInfo.pipelines[8]);

		// Verify the subPipeline references are correct.
		expect(isEqual(originalPipeline.nodes[1].subflow_ref.pipeline_id_ref, originalPipelineSubflow.id)).to.be.true;
		expect(isEqual(clonedOriginalPipeline.nodes[1].subflow_ref.pipeline_id_ref, clonedOriginalPipelineSubflow.id)).to.be.true;
		expect(isEqual(originalPipeline2.nodes[0].subflow_ref.pipeline_id_ref, originalPipeline2Subflow.id)).to.be.true;
		expect(isEqual(originalPipeline2Subflow.nodes[1].subflow_ref.pipeline_id_ref, originalPipeline2NestedSubflow.id)).to.be.true;
		expect(isEqual(clonedOriginalPipeline2.nodes[0].subflow_ref.pipeline_id_ref, clonedOriginalPipeline2Subflow.id)).to.be.true;
		expect(isEqual(clonedOriginalPipeline2Subflow.nodes[1].subflow_ref.pipeline_id_ref, clonedOriginalPipeline2NestedSubflow.id)).to.be.true;

		// Delete the unique ids before comparing.
		deletePipelineUniqueIds(originalPipeline, 1);
		deletePipelineUniqueIds(clonedOriginalPipeline, 1);
		deletePipelineUniqueIds(originalPipeline2, 0);
		deletePipelineUniqueIds(clonedOriginalPipeline2, 0);
		deletePipelineUniqueIds(originalPipeline2Subflow, 1);
		deletePipelineUniqueIds(clonedOriginalPipeline2Subflow, 1);
		deletePipelineUniqueIds(originalPipeline2NestedSubflow);
		deletePipelineUniqueIds(clonedOriginalPipeline2NestedSubflow);

		expect(isEqual(JSON.stringify(originalPipeline), JSON.stringify(clonedOriginalPipeline))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2), JSON.stringify(clonedOriginalPipeline2))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2Subflow), JSON.stringify(clonedOriginalPipeline2Subflow))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2NestedSubflow), JSON.stringify(clonedOriginalPipeline2NestedSubflow))).to.be.true;

		// Undo the clone action.
		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(canvasInfoBefore2), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("undo"); // Undo the create supernode.
		canvasController.contextMenuActionHandler("undo"); // Undo the clone.
		expect(isEqual(JSON.stringify(canvasInfoBefore1), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(canvasInfoBefore2), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});
});

function createCommonCanvas(config, canvasController) {
	const contextMenuHandler = sinon.spy();
	const contextMenuActionHandler = sinon.spy();
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarMenuActionHandler = sinon.spy();
	const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
	const notificationConfig = { action: "notification", label: "Notifications", enable: true };

	const wrapper = mount(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			showRightFlyout={false}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			canvasController={canvasController}
		/>
	);
	return wrapper;
}

function deleteSupernodeSubflowNodeRef(node) {
	if (node.inputs) {
		node.inputs.forEach((input) => {
			if (input.subflow_node_ref) {
				delete input.subflow_node_ref;
			}
		});
	}
	if (node.outputs) {
		node.outputs.forEach((input) => {
			if (input.subflow_node_ref) {
				delete input.subflow_node_ref;
			}
		});
	}
	return node;
}

function deleteSupernodeUniqueIds(supernode) {
	delete supernode.id;
	delete supernode.subflow_ref.pipeline_id_ref;
	delete supernode.x_pos;
	delete supernode.y_pos;
}

function deletePipelineUniqueIds(pipeline, supernodePosition) {
	delete pipeline.id;
	if (typeof supernodePosition !== "undefined") {
		delete pipeline.nodes[supernodePosition].subflow_ref.pipeline_id_ref;
	}
}
