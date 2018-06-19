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
		"height": 75,
		"width": 70
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
		"height": 75,
		"width": 70
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
		"height": 75,
		"width": 70
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

	it("Should set the isExpanded attribute correctly when expanded or collapsed", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).isExpanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).isExpanded).to.be.false;
	});

	it("Should set the isExpanded attribute correctly with undo and redo", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).isExpanded).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(canvasController.getNode(superNodeId).isExpanded).to.be.false;

		canvasController.contextMenuActionHandler("redo");
		expect(canvasController.getNode(superNodeId).isExpanded).to.be.true;
	});

	it("Should save the width, height, and isExpanded attributes when the supernode is expanded in-place", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		let pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.width).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.height).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.isExpanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.width).to.be.undefined;
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.height).to.be.undefined;
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.isExpanded).to.be.undefined;
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
		pipelineFlow.pipelines[0].nodes[11] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.

		pipelineFlow.pipelines[0].nodes[12] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

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
		pipelineFlow.pipelines[0].nodes[12] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

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
		pipelineFlow.pipelines[0].nodes[12] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

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
		pipelineFlow.pipelines[0].nodes[12] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

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
		pipelineFlow.pipelines[0].nodes[11] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

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
		pipelineFlow.pipelines[0].nodes[11] = removeSuperNodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

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

function removeSuperNodeSubflowNodeRef(node) {
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
