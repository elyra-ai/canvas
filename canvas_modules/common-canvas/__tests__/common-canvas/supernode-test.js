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

const superNodeId = "nodeIDSuperNodePE";
const expandCollapseSupenodeSourceObject = {
	"type": "node",
	"targetObject": {
		"id": superNodeId,
		"type": "super_node",
		"output_ports": [
			{
				"id": "output1SuperNodePE",
				"label": "output1SuperNodePE",
				"subflow_node_ref": "exitID1SE",
				"schema_ref": "schema2",
				"app_data": {
					"my_data": {
						"my_field": "Execution node -> Outputs -> My data -> My field -> My value"
					}
				}
			}
		],
		"input_ports": [
			{
				"id": "input1SuperNodePE",
				"label": "input1SuperNodePE",
				"subflow_node_ref": "entryID1SE",
				"schema_ref": "schema3",
				"app_data": {
					"my_data": {
						"my_field": "Super node -> Inputs -> My data -> My field -> My value"
					}
				}
			}, {
				"id": "input2SuperNodePE",
				"label": "input2SuperNodePE",
				"subflow_node_ref": "entryID2SE",
				"schema_ref": "schema2",
				"parameters": {
					"props": [
						{
							"field1": "super-node-port2-param-val1"
						}, {
							"field2": "super-node-port2-param-val2"
						}
					]
				},
				"app_data": {}
			}
		],
		"label": "Super node",
		"description": superNodeId,
		"image": "/images/nodes/derive.svg",
		"x_pos": 500,
		"y_pos": 170,
		"class_name": "canvas-node",
		"decorations": [],
		"parameters": {
			"props": [
				{
					"field1": "super-node-param-val1"
				}, {
					"field2": "super-node-param-val2"
				}
			]
		},
		"messages": [],
		"app_data": {
			"my_data": {
				"value": "Super node - data value"
			}
		},
		"subflow_ref": {
			"pipeline_id_ref": "modeler-sub-pipeline"
		},
		"model_ref": "",
		"inputPortsHeight": 40,
		"outputPortsHeight": 20,
		"height": 75,
		"width": 70
	},
	"id": superNodeId,
	"cmPos": {
		"x": 530,
		"y": 196
	},
	"mousePos": {
		"x": 530,
		"y": 196
	},
	"selectedObjectIds": [superNodeId],
	"zoom": 1
};
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
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = { enableAutoLayout: "none", canvasController: canvasController, enableInternalObjectModel: true };
		createCommonCanvas(config, canvasController);
	});

	it("Should set the super_node_expanded attribute correctly when expanded or collapsed", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).super_node_expanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).super_node_expanded).to.be.false;
	});

	it("Should set the super_node_expanded attribute correctly with undo and redo", () => {
		canvasController.contextMenuHandler(expandCollapseSupenodeSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).super_node_expanded).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(canvasController.getNode(superNodeId).super_node_expanded).to.be.false;

		canvasController.contextMenuActionHandler("redo");
		expect(canvasController.getNode(superNodeId).super_node_expanded).to.be.true;
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
			"6f704d84-85be-4520-9d76-57fe2295b310",
			"idGWRVT47XDV"
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[1].links[0].node_id_ref;
		delete pipelineFlow.pipelines[0].nodes[4].id;
		delete pipelineFlow.pipelines[0].nodes[4].subflow_ref.pipeline_id_ref;
		delete pipelineFlow.pipelines[1].id;

		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test1ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test12ExpectedFlow and test2ExpectedUndoFlow
	it("Create supernode with selected nodes and selected comments", () => {
		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310",
			"idGWRVT47XDV",
			"id42ESQA3VPXB",
			"c9b039c9-b098-412f-a08a-e9b722eadafc"
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[1].links[0].node_id_ref;
		delete pipelineFlow.pipelines[0].nodes[4].id;
		delete pipelineFlow.pipelines[0].nodes[4].subflow_ref.pipeline_id_ref;
		delete pipelineFlow.pipelines[1].id;

		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test2ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test3ExpectedFlow and test3ExpectedUndoFlow
	it("Create supernode with selected nodes and selected comments connected to unselected nodes", () => {
		const selections = [
			"idGWRVT47XDV",
			"nodeIDSuperNodePE",
			"id42ESQA31234"
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject1.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject1);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[1].inputs[0].links[0].node_id_ref;
		delete pipelineFlow.pipelines[0].nodes[2].inputs[0].links[0].node_id_ref;
		delete pipelineFlow.pipelines[0].nodes[4].id;
		delete pipelineFlow.pipelines[0].nodes[4].subflow_ref.pipeline_id_ref;
		delete pipelineFlow.pipelines[1].id;

		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test3ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test4ExpectedFlow and test4ExpectedUndoFlow
	it("Create supernode with selected nodes with multiple inputs and connected via associationLink", () => {
		const selections = [
			"id5KIRGGJ3FYT",
			"id125TTEEIK7V"
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject2.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject2);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[4].id;
		delete pipelineFlow.pipelines[0].nodes[4].subflow_ref.pipeline_id_ref;
		delete pipelineFlow.pipelines[1].id;

		expect(isEqual(JSON.stringify(test4ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test4ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test4ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test5ExpectedFlow and test5ExpectedUndoFlow
	it("Create supernode with input link to second port", () => {
		const selections = [
			"nodeIDSuperNodePE",
			"id5KIRGGJ3FYT",
			"id125TTEEIK7V"
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject2.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject2);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[3].id;
		delete pipelineFlow.pipelines[0].nodes[3].subflow_ref.pipeline_id_ref;
		delete pipelineFlow.pipelines[1].id;

		expect(isEqual(JSON.stringify(test5ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test5ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test5ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
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
