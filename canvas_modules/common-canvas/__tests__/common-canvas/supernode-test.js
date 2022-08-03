/*
 * Copyright 2017-2022 Elyra Authors
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
/* eslint no-console: "off" */

import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller";
import deepFreeze from "deep-freeze";
import { createIntlCommonCanvas } from "../_utils_/common-canvas-utils.js";
import { expect } from "chai";
import sinon from "sinon";

import supernodeCanvas from "../../../harness/test_resources/diagrams/supernodeCanvas.json";
import associationLinkCanvas from "../test_resources/json/associationLinkCanvas.json";
import supernodeNestedCanvas from "../../../harness/test_resources/diagrams/supernodeNestedCanvas.json";

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
import test7ExpectedFlow from "../test_resources/json/supernode-test7-expected-flow.json";
import test7ExpectedUndoFlow from "../test_resources/json/supernode-test7-expected-undo-flow.json";
import test8ExpectedFlow from "../test_resources/json/supernode-test8-expected-flow.json";
import test8ExpectedUndoFlow from "../test_resources/json/supernode-test8-expected-undo-flow.json";
import test9ExpectedFlow from "../test_resources/json/supernode-test9-expected-flow.json";
import test9ExpectedUndoFlow from "../test_resources/json/supernode-test9-expected-undo-flow.json";
import test10ExpectedFlow from "../test_resources/json/supernode-test10-expected-flow.json";
import test10ExpectedUndoFlow from "../test_resources/json/supernode-test10-expected-undo-flow.json";

const primaryPipelineId = "153651d6-9b88-423c-b01b-861f12d01489";
const superNodeId = "7015d906-2eae-45c1-999e-fb888ed957e5";
// Supernode.
const expandCollapseDeconstructSourceObject = {
	"type": "node",
	"targetObject": {
		"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
		"type": "super_node",
		"outputs": [{
			"id": "7d1ac5ee-a599-451a-9036-dd2bafb53dd2_outPort",
			"label": "Output Port",
			"subflow_node_ref": "813ddbfd-cabb-4037-833d-bc839e13e264",
			"cardinality": {
				"min": 0,
				"max": -1
			},
			"app_data": {},
			"cx": 70,
			"cy": 29
		}],
		"inputs": [{
			"id": "691e065f-8359-4b46-aad2-531702ef2a8e_inPort",
			"label": "Input Port",
			"subflow_node_ref": "d585f3c8-29d7-4daf-b808-f80a64634343",
			"cardinality": {
				"min": 0,
				"max": 1
			},
			"app_data": {
				"my_data": {
					"my_field": "Execution node -> Inputs -> My data -> My field -> My value"
				}
			},
			"cx": 0,
			"cy": 27.5
		}, {
			"id": "ba83fcf4-d7d7-4862-b7c9-f2e611f912df_inPort",
			"label": "Input Port",
			"subflow_node_ref": "b82bb50c-edd4-44b5-9e14-f5db5eedddb8",
			"cardinality": {
				"min": 0,
				"max": 1
			},
			"app_data": {},
			"cx": 0,
			"cy": 47.5
		}],
		"label": "Supernode",
		"x_pos": 297,
		"y_pos": 235,
		"decorations": [],
		"parameters": [],
		"messages": [],
		"ui_parameters": [],
		"app_data": {},
		"subflow_ref": {
			"pipeline_id_ref": "babad275-1719-4224-8d65-b04d0804d95c"
		},
		"is_expanded": false,
		"expanded_width": 200,
		"expanded_height": 200,
		"description": "supernode",
		"image": "useDefaultIcon",
		"layout": {},
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
// Sample node.
const createSupernodeSourceObject3 = {
	"type": "node",
	"targetObject": {
		"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
		"type": "execution_node",
		"operator_id_ref": "merge",
		"output_ports": [
			{
				"id": "outPort",
				"label": "Output Port",
				"cardinality": {
					"min": 0,
					"max": -1
				},
				"app_data": {},
				"cy": 29
			}
		],
		"input_ports": [
			{
				"id": "inPort",
				"label": "Input Port",
				"cardinality": {
					"min": 0,
					"max": -1
				},
				"app_data": {},
				"cy": 29
			}
		],
		"label": "Merge",
		"description": "Combines data from multiple data sources",
		"image": "",
		"x_pos": 380,
		"y_pos": 518.5,
		"class_name": "",
		"decorations": [],
		"parameters": [],
		"messages": [],
		"app_data": {},
		"subflow_ref": {},
		"model_ref": "",
		"is_expanded": false,
		"expanded_width": 200,
		"expanded_height": 200,
		"inputPortsHeight": 20,
		"outputPortsHeight": 20,
		"height": 75,
		"width": 70
	},
	"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
	"pipelineId": "153651d6-9b88-423c-b01b-861f12d01489",
	"cmPos": {
		"x": 414,
		"y": 543
	},
	"mousePos": {
		"x": 414,
		"y": 543
	},
	"selectedObjectIds": [],
	"zoom": 1
};
// Drug node.
const createSupernodeSourceObject4 = {
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
				"app_data": {},
				"cy": 29
			}
		],
		"label": "Drug",
		"description": "",
		"image": "",
		"x_pos": 623,
		"y_pos": 304.99999237060547,
		"class_name": "canvas-node",
		"decorations": [],
		"parameters": [],
		"messages": [],
		"uiParameters": [],
		"app_data": {},
		"subflow_ref": {},
		"model_ref": "",
		"is_expanded": false,
		"expanded_width": 200,
		"expanded_height": 200,
		"inputPortsHeight": 20,
		"outputPortsHeight": 0,
		"height": 75,
		"width": 70
	},
	"id": "id5KIRGGJ3FYT",
	"pipelineId": "153651d6-9b88-423c-b01b-861f12d01489",
	"cmPos": {
		"x": 572,
		"y": 350
	},
	"mousePos": {
		"x": 655,
		"y": 349
	},
	"selectedObjectIds": [],
	"zoom": 1
};

describe("Expand and Collapse Supernode Action", () => {
	let canvasController;
	let objectModel;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeCanvas);

		const config = { enableNodeFormatType: "Vertical" };
		createCommonCanvas(config, canvasController);

		objectModel = canvasController.getObjectModel();
	});

	it("Should set the is_expanded attribute correctly when expanded or collapsed", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.false;
	});

	it("Should set the is_expanded attribute correctly with undo and redo", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.false;

		canvasController.contextMenuActionHandler("redo");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;
	});

	it("Should save the expanded_width, expanded_height, and is_expanded attributes when the supernode is expanded in-place", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		let pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_width).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_height).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.is_expanded).to.be.true;

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");
		pipelineFlow = objectModel.getPipelineFlow();

		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_width).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.expanded_height).to.equal(200);
		expect(pipelineFlow.pipelines[0].nodes[13].app_data.ui_data.is_expanded).to.be.false;
	});

	it("Should move the surrounding nodes when supernode is expanded", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 630,
				"y_pos": 170
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 890,
				"y_pos": 230.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 772,
				"y_pos": 500.99999237060547
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 429.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 642.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 234,
				"y_pos": 594.5
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 235,
				"y_pos": 690.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 510,
				"y_pos": 643.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 660.7247240471117,
				"y_pos": 644.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 805.6818052349669,
				"y_pos": 596.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 806.7398404208096,
				"y_pos": 692.8509946880919
			},
			{
				"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
				"label": "Supernode",
				"x_pos": 297,
				"y_pos": 235
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 235,
				"y_pos": 496.5
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});

	it("Surrounding nodes should go back to original positions when supernode is expanded and collapsed", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });

		const originalNodePositions = objectModel.getAPIPipeline().getNodes();

		// Expand the supernode
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");

		// Collapse the supernode
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("collapseSuperNodeInPlace");

		expect(canvasController.getNode(superNodeId).is_expanded).to.be.false;

		compareNodePositions(originalNodePositions, objectModel);
	});


	it("Should move the surrounding nodes south when supernode is expanded and overlaps nodes", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		// Sample, Aggregate, Filler nodes moved.
		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 630,
				"y_pos": 170
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 890,
				"y_pos": 230.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 772,
				"y_pos": 500.99999237060547
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 429.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 642.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 234,
				"y_pos": 594.5
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 235,
				"y_pos": 690.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 510,
				"y_pos": 643.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 660.7247240471117,
				"y_pos": 644.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 805.6818052349669,
				"y_pos": 596.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 806.7398404208096,
				"y_pos": 692.8509946880919
			},
			{
				"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
				"label": "Supernode",
				"x_pos": 297,
				"y_pos": 235
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 235,
				"y_pos": 496.5
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});

	it("Should move the surrounding nodes east when supernode is expanded and overlaps nodes", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });
		const moveSupernodeData = { "editType": "moveObjects", "nodes": [superNodeId], "offsetX": -85, "offsetY": -90, "pipelineId": primaryPipelineId	};
		objectModel.getAPIPipeline().moveObjects(moveSupernodeData);

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		// Execution and Multiplot nodes moved.
		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 427,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 630,
				"y_pos": 295
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 890,
				"y_pos": 355.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 772,
				"y_pos": 500.99999237060547
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 429.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 642.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 364,
				"y_pos": 594.5
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 365,
				"y_pos": 690.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 510,
				"y_pos": 643.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 660.7247240471117,
				"y_pos": 644.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 805.6818052349669,
				"y_pos": 596.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 806.7398404208096,
				"y_pos": 692.8509946880919
			},
			{
				"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
				"label": "Supernode",
				"x_pos": 212,
				"y_pos": 145
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 365,
				"y_pos": 496.5
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});

	it("Should move the surrounding nodes southeast when supernode is expanded and overlaps nodes", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });
		const moveSupernodeData = { "editType": "moveObjects", "nodes": [superNodeId], "offsetX": 263, "offsetY": 145, "pipelineId": primaryPipelineId	};
		objectModel.getAPIPipeline().moveObjects(moveSupernodeData);

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		// Binding (exit), C5, Table, and Neural Net nodes moved.
		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 500,
				"y_pos": 170
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 890,
				"y_pos": 230.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 772,
				"y_pos": 375.99999237060547
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 304.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 642.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 234,
				"y_pos": 594.5
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 235,
				"y_pos": 690.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 380,
				"y_pos": 643.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 530.7247240471117,
				"y_pos": 644.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 805.6818052349669,
				"y_pos": 596.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 806.7398404208096,
				"y_pos": 692.8509946880919
			},
			{
				"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
				"label": "Supernode",
				"x_pos": 560,
				"y_pos": 380
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 235,
				"y_pos": 371.5
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});

	it("Should not move the surrounding nodes when enableMoveNodesOnSupernodeResize is false", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: false });
		const moveSupernodeData = { "editType": "moveObjects", "nodes": [superNodeId], "offsetX": 263, "offsetY": 145, "pipelineId": primaryPipelineId	};
		objectModel.getAPIPipeline().moveObjects(moveSupernodeData);

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");
		expect(canvasController.getNode(superNodeId).is_expanded).to.be.true;

		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 500,
				"y_pos": 170
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 760,
				"y_pos": 230.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 642,
				"y_pos": 375.99999237060547
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 304.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 517.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 234,
				"y_pos": 469.5
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 235,
				"y_pos": 565.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 380,
				"y_pos": 518.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 530.7247240471117,
				"y_pos": 519.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 675.6818052349669,
				"y_pos": 471.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 676.7398404208096,
				"y_pos": 567.8509946880919
			},
			{
				"id": "7015d906-2eae-45c1-999e-fb888ed957e5",
				"label": "Supernode",
				"x_pos": 560,
				"y_pos": 380
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 235,
				"y_pos": 371.5
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});

});

describe("Deconstruct Supernode Action", () => {
	let canvasController;
	let objectModel;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeCanvas);

		const config = { enableNodeFormatType: "Vertical" };
		createCommonCanvas(config, canvasController);

		objectModel = canvasController.getObjectModel();
	});

	it("Should add nodes to main pipeline when supernode is deconstructed", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });
		// Before
		expect(isEqual(canvasController.getNodes().length, 15)).to.be.true;
		expect(isEqual(canvasController.getComments().length, 3)).to.be.true;
		expect(isEqual(canvasController.getLinks().length, 24)).to.be.true;


		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("deconstructSuperNode");

		// After
		expect(isEqual(canvasController.getNodes().length, 19)).to.be.true;
		expect(isEqual(canvasController.getComments().length, 3)).to.be.true;
		expect(isEqual(canvasController.getLinks().length, 28)).to.be.true;
	});

	it("Should move the surrounding nodes when supernode is deconstructed", () => {
		canvasController.setCanvasConfig({ enableMoveNodesOnSupernodeResize: true });

		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("deconstructSuperNode");

		const expectedNodePositions = [
			{
				"id": "id8I6RH2V91XW",
				"label": "Binding (entry) node",
				"x_pos": 89,
				"y_pos": 99.5
			},
			{
				"id": "idGWRVT47XDV",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 138.5
			},
			{
				"id": "nodeIDMultiPlotPE",
				"label": "Multiplot",
				"x_pos": 831,
				"y_pos": 170
			},
			{
				"id": "id125TTEEIK7V",
				"label": "Model Node",
				"x_pos": 1091,
				"y_pos": 230.99999237060547
			},
			{
				"id": "id5KIRGGJ3FYT",
				"label": "Binding (exit) node",
				"x_pos": 973,
				"y_pos": 526.9999923706055
			},
			{
				"id": "6f704d84-85be-4520-9d76-57fe2295b310",
				"label": "Select",
				"x_pos": 135,
				"y_pos": 455.5
			},
			{
				"id": "f5373d9e-677d-4717-a9fd-3b57038ce0de",
				"label": "Database",
				"x_pos": 97,
				"y_pos": 668.5
			},
			{
				"id": "5db667dc-b2a9-4c35-bff0-136c4e7b6d26",
				"label": "Sample",
				"x_pos": 234,
				"y_pos": 620.5,
			},
			{
				"id": "2807a076-6468-4ad1-94d3-f253f99bc8e0",
				"label": "Aggregate",
				"x_pos": 235,
				"y_pos": 716.5
			},
			{
				"id": "fab835e0-29ad-45ae-b72a-2eb3fcce6871",
				"label": "Merge",
				"x_pos": 711,
				"y_pos": 669.5
			},
			{
				"id": "a723a31c-6c66-421e-b00a-e4d0b1faa265",
				"label": "Table",
				"x_pos": 861.7247240471117,
				"y_pos": 670.1793095752446
			},
			{
				"id": "353c4878-1db2-46c0-9370-3a55523dc07c",
				"label": "C5.0",
				"x_pos": 1006.6818052349669,
				"y_pos": 622.5656356040878
			},
			{
				"id": "bea1bbb7-ae00-404a-8380-bb65de1047cf",
				"label": "Neural Net",
				"x_pos": 1007.7398404208096,
				"y_pos": 718.8509946880919
			},
			{
				"id": "ac584be2-8a3c-474f-a046-e10a3665b875",
				"label": "Filler",
				"x_pos": 235,
				"y_pos": 522.5
			},
			{
				"id": "691e065f-8359-4b46-aad2-531702ef2a8e",
				"label": "Execution node",
				"x_pos": 297,
				"y_pos": 235
			},
			{
				"id": "49b5e5e5-ab72-4d8e-babe-9bd5977bc8e2",
				"label": "Type",
				"x_pos": 509.294189453125,
				"y_pos": 377.18524169921875
			},
			{
				"id": "7fadc642-9c03-473e-b4c5-308b1e4cbbb8",
				"label": "Partition",
				"x_pos": 451.4412536621094,
				"y_pos": 263.12994384765625
			},
			{
				"id": "7d1ac5ee-a599-451a-9036-dd2bafb53dd2",
				"label": "Distribution",
				"x_pos": 628,
				"y_pos": 256
			},
			{
				"id": "ba83fcf4-d7d7-4862-b7c9-f2e611f912df",
				"label": "Balance",
				"x_pos": 349,
				"y_pos": 386
			}];

		compareNodePositions(expectedNodePositions, objectModel);
	});
});

describe("Ensure no cross pipeline selection", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeCanvas);
		const config = { enableNodeFormatType: "Vertical" };
		createCommonCanvas(config, canvasController);
	});


	it("Should cancel parent flow selection when sub-flow selection is made", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");

		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];

		canvasController.setSelections(selections, primaryPipelineId);

		const subflowSelections = [
			"7fadc642-9c03-473e-b4c5-308b1e4cbbb8"
		];

		canvasController.setSelections(subflowSelections, primaryPipelineId);

		const selObjs = canvasController.getSelectedObjectIds();
		expect(isEqual(selObjs.length, 1)).to.be.true;
		expect(isEqual(selObjs, ["7fadc642-9c03-473e-b4c5-308b1e4cbbb8"])).to.be.true;
	});

	it("Should cancel sub-flow selection when parent flow selection is made", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");

		const subflowSelections = [
			"7fadc642-9c03-473e-b4c5-308b1e4cbbb8"
		];

		canvasController.setSelections(subflowSelections, primaryPipelineId);

		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];

		canvasController.setSelections(selections, primaryPipelineId);

		const selObjs = canvasController.getSelectedObjectIds();
		expect(isEqual(selObjs.length, 2)).to.be.true;
		expect(isEqual(selObjs, selections)).to.be.true;
	});
});

describe("Create Supernode Action", () => {
	let canvasController;
	let objectModel;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeCanvas);
		const config = { enableNodeFormatType: "Vertical" };

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

		delete pipelineFlow.pipelines[0].nodes[13].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[13].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.

		pipelineFlow.pipelines[0].nodes[13] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[13]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Exp = " + JSON.stringify(test1ExpectedFlow, null, 2));
		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));

		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
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

		delete pipelineFlow.pipelines[0].nodes[13].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[13].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[13] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[13]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Exp = " + JSON.stringify(test2ExpectedFlow, null, 2));
		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));

		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
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

		delete pipelineFlow.pipelines[0].nodes[13].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[13].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[13] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[13]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[1].links[1].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
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
		delete pipelineFlow.pipelines[0].nodes[13].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[13].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[13] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[13]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
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
		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[1].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[1].links[1].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
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

		delete pipelineFlow.pipelines[0].nodes[12].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[12].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[12] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[12]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[2].inputs[1].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[6].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[7].id; // Delete new binding node id.

		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test6ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test6ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test6ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test7ExpectedFlow and test7ExpectedUndoFlow
	it("Create supernode with input ports and links created in the correct order", () => {
		const selections = [
			"ac584be2-8a3c-474f-a046-e10a3665b875", // Filler
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26", // Sample
			"2807a076-6468-4ad1-94d3-f253f99bc8e0", // Model
			"fab835e0-29ad-45ae-b72a-2eb3fcce6871" // Merge
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject3.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject3);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[7].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[11].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[11].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[11] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[1].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[3].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[6].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[7].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test7ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(test7ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test7ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test8ExpectedFlow and test8ExpectedUndoFlow
	it("Create supernode with output ports and links created in the correct order", () => {
		const selections = [
			"f5373d9e-677d-4717-a9fd-3b57038ce0de", // Database
			"ac584be2-8a3c-474f-a046-e10a3665b875", // Filler
			"5db667dc-b2a9-4c35-bff0-136c4e7b6d26", // Sample
			"2807a076-6468-4ad1-94d3-f253f99bc8e0" // Model
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject3.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject3);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[6].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[6].inputs[0].links[1].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[6].inputs[0].links[2].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[6].inputs[0].links[3].node_id_ref; // Delete link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[11].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[11].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.
		pipelineFlow.pipelines[0].nodes[11] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[11]);

		delete pipelineFlow.pipelines[2].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[2].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[5].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[6].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[2].nodes[7].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, supernodeCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test8ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
		expect(isEqual(JSON.stringify(test8ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test8ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test9ExpectedFlow and test9ExpectedUndoFlow
	it("Create supernode should break association link", () => {
		canvasController.getObjectModel().setPipelineFlow(associationLinkCanvas);
		const selections = [
			"id5KIRGGJ3FYT", // Drug
			"idGWRVT47XDV" // Define Types
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject4.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject4);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[0].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[2].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[5].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[6].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[6].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.

		pipelineFlow.pipelines[0].nodes[6] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[6]);

		delete pipelineFlow.pipelines[1].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[1].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[1].nodes[2].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[1].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[1].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[1].nodes[5].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, associationLinkCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test9ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
		expect(isEqual(JSON.stringify(test9ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test9ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
	});

	// Uses test10ExpectedFlow and test10ExpectedUndoFlow
	it("Create supernode should bring in association link", () => {
		canvasController.getObjectModel().setPipelineFlow(associationLinkCanvas);
		const selections = [
			"id5KIRGGJ3FYT", // Drug
			"idGWRVT47XDV", // Define Types
			"id125TTEEIK7V" // Drug Model
		];
		canvasController.setSelections(selections);

		createSupernodeSourceObject4.selectedObjectIds = selections;
		canvasController.contextMenuHandler(createSupernodeSourceObject4);
		canvasController.contextMenuActionHandler("createSuperNode");

		// Delete the newly created supernode and links IDs before comparing
		const pipelineFlow = objectModel.getPipelineFlow();
		delete pipelineFlow.pipelines[0].nodes[0].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[1].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.
		delete pipelineFlow.pipelines[0].nodes[4].inputs[0].links[0].node_id_ref; // Delete link node_id_ref.

		delete pipelineFlow.pipelines[0].nodes[5].id; // Delete new supernode id.
		delete pipelineFlow.pipelines[0].nodes[5].subflow_ref.pipeline_id_ref; // Delete new supernode subflow_ref id.

		pipelineFlow.pipelines[0].nodes[5] = deleteSupernodeSubflowNodeRef(pipelineFlow.pipelines[0].nodes[5]);

		delete pipelineFlow.pipelines[1].id; // Delete new subPipeline id.
		delete pipelineFlow.pipelines[1].nodes[0].inputs[0].links[0].node_id_ref; // Delete new link node_id_ref.
		delete pipelineFlow.pipelines[1].nodes[3].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[1].nodes[4].id; // Delete new binding node id.
		delete pipelineFlow.pipelines[1].nodes[5].id; // Delete new binding node id.
		removeGeneratedLinkIds(pipelineFlow, associationLinkCanvas);

		// console.log("Act = " + JSON.stringify(pipelineFlow, null, 2));
		expect(isEqual(JSON.stringify(test10ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;

		canvasController.contextMenuActionHandler("undo");
		// console.log("Act = " + JSON.stringify(objectModel.getPipelineFlow(), null, 2));
		expect(isEqual(JSON.stringify(test10ExpectedUndoFlow), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(test10ExpectedFlow), JSON.stringify(pipelineFlow))).to.be.true;
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

	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeCanvas);
		const config = { enableNodeFormatType: "Vertical" };
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

		// console.log(JSON.stringify(canvasInfoBefore, null, 2));
		// console.log(JSON.stringify(objectModel.getPipelineFlow(), null, 2));

		expect(isEqual(JSON.stringify(canvasInfoBefore), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});

	it("Copy supernode with subflow into same canvas", () => {
		let selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select node
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
		const pipelineFlowBefore = Object.assign({}, objectModel.getPipelineFlow());

		// Copy and paste the newly created supernode.
		selections = [newSupernode.id];
		canvasController.setSelections(selections, primaryPipelineId);
		canvasController.copyToClipboard();
		canvasController.pasteFromClipboard(primaryPipelineId);

		const pipelineFlow = objectModel.getPipelineFlow();

		supernodes = apiPipeline.getSupernodes();
		expect(supernodes).to.have.length(2);

		const originalSupernode = JSON.parse(JSON.stringify(supernodes[0]));
		const clonedSupernode = JSON.parse(JSON.stringify(supernodes[1]));

		// Ensure copied supernode is selected after paste
		const objIds = canvasController.getSelectedObjectIds();
		expect(isEqual(objIds.length, 1)).to.be.true;
		expect(isEqual(objIds, [clonedSupernode.id])).to.be.true;

		// Delete the unique ids before comparing.
		deleteSupernodeUniqueIds(originalSupernode);
		deleteSupernodeUniqueIds(clonedSupernode);
		delete clonedSupernode.app_data;
		expect(isEqual(JSON.stringify(originalSupernode), JSON.stringify(clonedSupernode))).to.be.true;

		expect(pipelineFlow.pipelines).to.have.length(5);
		const originalPipeline = Object.assign({}, pipelineFlow.pipelines[2]);
		const clonedPipeline = Object.assign({}, pipelineFlow.pipelines[3]);

		// Delete the unique ids before comparing.
		deletePipelineUniqueIds(originalPipeline, 1);
		deletePipelineUniqueIds(clonedPipeline, 1);
		expect(isEqual(JSON.stringify(originalPipeline), JSON.stringify(clonedPipeline))).to.be.true;

		// Undo the clone action.
		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(pipelineFlowBefore), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});

	it("Copy multiple supernodes with nested subflow into same canvas", () => {
		let selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select node
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
		const pipelineFlowBefore1 = Object.assign({}, objectModel.getPipelineFlow());

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
		const pipelineFlowBefore2 = Object.assign({}, objectModel.getPipelineFlow());

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

		// Ensure copied supernodes are selected after paste
		const objIds = canvasController.getSelectedObjectIds();
		expect(isEqual(objIds.length, 2)).to.be.true;
		expect(isEqual(objIds, [clonedOriginalSupernode.id, clonedNewSupernode2.id])).to.be.true;

		// Delete the unique ids before comparing.
		deleteSupernodeUniqueIds(originalSupernode);
		deleteSupernodeUniqueIds(newSupernode2);
		deleteSupernodeUniqueIds(clonedOriginalSupernode);
		deleteSupernodeUniqueIds(clonedNewSupernode2);
		delete clonedOriginalSupernode.app_data;
		delete clonedNewSupernode2.app_data;
		expect(isEqual(JSON.stringify(originalSupernode), JSON.stringify(clonedOriginalSupernode))).to.be.true;
		expect(isEqual(JSON.stringify(newSupernode2), JSON.stringify(clonedNewSupernode2))).to.be.true;

		expect(canvasInfo.pipelines).to.have.length(11);
		const originalPipeline = Object.assign({}, canvasInfo.pipelines[2]);
		const originalPipelineSubflow = Object.assign({}, canvasInfo.pipelines[1]);

		const originalPipeline2 = Object.assign({}, canvasInfo.pipelines[5]);
		const originalPipeline2Subflow = Object.assign({}, canvasInfo.pipelines[3]);
		const originalPipeline2NestedSubflow = Object.assign({}, canvasInfo.pipelines[4]);

		const clonedOriginalPipeline = Object.assign({}, canvasInfo.pipelines[6]);
		const clonedOriginalPipelineSubflow = Object.assign({}, canvasInfo.pipelines[7]);

		const clonedOriginalPipeline2 = Object.assign({}, canvasInfo.pipelines[8]);
		const clonedOriginalPipeline2Subflow = Object.assign({}, canvasInfo.pipelines[9]);
		const clonedOriginalPipeline2NestedSubflow = Object.assign({}, canvasInfo.pipelines[10]);

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

		// When originalPipeline2 is created in this test its supernode is not
		// assigned any of the three expanded properties. Therefore we have to
		// remove them from clonedOriginalPipeline2 for the comparison to
		// succeed.
		delete clonedOriginalPipeline2.nodes[0].app_data.ui_data.is_expanded;
		delete clonedOriginalPipeline2.nodes[0].app_data.ui_data.expanded_width;
		delete clonedOriginalPipeline2.nodes[0].app_data.ui_data.expanded_height;

		// console.info("Original = " + JSON.stringify(originalPipeline, null, 2));
		// console.info("Cloned = " + JSON.stringify(clonedOriginalPipeline, null, 2));

		expect(isEqual(JSON.stringify(originalPipeline), JSON.stringify(clonedOriginalPipeline))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2), JSON.stringify(clonedOriginalPipeline2))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2Subflow), JSON.stringify(clonedOriginalPipeline2Subflow))).to.be.true;
		expect(isEqual(JSON.stringify(originalPipeline2NestedSubflow), JSON.stringify(clonedOriginalPipeline2NestedSubflow))).to.be.true;

		// Undo the clone action.
		canvasController.contextMenuActionHandler("undo");
		expect(isEqual(JSON.stringify(pipelineFlowBefore2), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("undo"); // Undo the create supernode.
		canvasController.contextMenuActionHandler("undo"); // Undo the clone.
		expect(isEqual(JSON.stringify(pipelineFlowBefore1), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;

		canvasController.contextMenuActionHandler("redo");
		canvasController.contextMenuActionHandler("redo");
		expect(isEqual(JSON.stringify(pipelineFlowBefore2), JSON.stringify(objectModel.getPipelineFlow()))).to.be.true;
	});

	it("Select in sub-flow should cancel selection in parent flow", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");

		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];

		canvasController.setSelections(selections, primaryPipelineId);

		const subflowSelections = [
			"7fadc642-9c03-473e-b4c5-308b1e4cbbb8"
		];

		canvasController.setSelections(subflowSelections, primaryPipelineId);

		const selObjs = canvasController.getSelectedObjectIds();
		expect(isEqual(selObjs.length, 1)).to.be.true;
		expect(isEqual(selObjs, ["7fadc642-9c03-473e-b4c5-308b1e4cbbb8"])).to.be.true;
	});

	it("Select in parent flow should cancel selection in sub-flow", () => {
		canvasController.contextMenuHandler(expandCollapseDeconstructSourceObject);
		canvasController.contextMenuActionHandler("expandSuperNodeInPlace");

		const subflowSelections = [
			"7fadc642-9c03-473e-b4c5-308b1e4cbbb8"
		];

		canvasController.setSelections(subflowSelections, primaryPipelineId);

		const selections = [
			"6f704d84-85be-4520-9d76-57fe2295b310", // Select
			"7015d906-2eae-45c1-999e-fb888ed957e5" // Supernode
		];

		canvasController.setSelections(selections, primaryPipelineId);

		const selObjs = canvasController.getSelectedObjectIds();
		expect(isEqual(selObjs.length, 2)).to.be.true;
		expect(isEqual(selObjs, selections)).to.be.true;
	});

});

describe("Subtypes enumerated for supernodes OK", () => {
	let canvasController;

	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeNestedCanvas);
	});

	it("should contain shaper, canvas, and non-enumerated subtype", () => {
		deepFreeze(supernodeNestedCanvas);
		canvasController.setPipelineFlow(supernodeNestedCanvas);
		expect(isEqual(JSON.stringify(supernodeNestedCanvas), JSON.stringify(canvasController.getPipelineFlow())));
	});
});


function createCommonCanvas(config, canvasController, canvasParams) {
	const contextMenuHandler = sinon.spy();
	const beforeEditActionHandler = null; // If sepcified, must return data
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
	const notificationConfig = { action: "notification", label: "Notifications", enable: true };
	const contextMenuConfig = null;
	const canvasParameters = canvasParams || {};
	const wrapper = createIntlCommonCanvas(
		config,
		contextMenuHandler,
		beforeEditActionHandler,
		editActionHandler,
		clickActionHandler,
		decorationActionHandler,
		selectionChangeHandler,
		tipHandler,
		canvasParameters.showBottomPanel,
		canvasParameters.showRightFlyout,
		toolbarConfig,
		notificationConfig,
		contextMenuConfig,
		canvasController
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

function compareNodePositions(expectedNodes, objectModel) {
	expect(isEqual(expectedNodes.length, objectModel.getAPIPipeline().getNodes().length)).to.be.true;

	expectedNodes.forEach((expectedNode) => {
		const omNode = objectModel.getAPIPipeline().getNode(expectedNode.id);

		// console.log("node " + expectedNode.label);
		// console.log("expectedNode.label = " + expectedNode.label);
		// console.log("expectedNode.x_pos = " + expectedNode.x_pos + " omNode.x_pos " + omNode.x_pos);
		// console.log("expectedNode.y_pos = " + expectedNode.y_pos + " omNode.y_pos " + omNode.y_pos);

		expect(isEqual(expectedNode.x_pos, omNode.x_pos)).to.be.true;
		expect(isEqual(expectedNode.y_pos, omNode.y_pos)).to.be.true;
	});
}

function removeGeneratedLinkIds(firstPipelineFlow, secondPipelineFlow) {
	firstPipelineFlow.pipelines.forEach((pipeline, pIdx) => {
		if (pipeline.nodes) {
			pipeline.nodes.forEach((node, mIdx) => {
				if (node.inputs) {
					node.inputs.forEach((input, iIdx) => {
						if (input.links) {
							input.links.forEach((link, lIds) => {
								if (!findDataLinkInSecondPipelineFlow(link.id, secondPipelineFlow)) {
									delete link.id;
								}
							});
						}
					});
				}
			});
		}

		if (pipeline.app_data && pipeline.app_data.ui_data && pipeline.app_data.ui_data.comments) {
			pipeline.app_data.ui_data.comments.forEach((comment) => {
				if (comment.associated_id_refs) {
					comment.associated_id_refs.forEach((link) => {
						if (findCommentLinkInSecondPipelineFlow(link.id, secondPipelineFlow)) {
							delete link.id;
						}
					});
				}
			});
		}
	});
	return firstPipelineFlow;
}

function findDataLinkInSecondPipelineFlow(linkId, secondPipelineFlow) {
	let found = false;
	secondPipelineFlow.pipelines.forEach((pipeline) => {
		if (pipeline.nodes) {
			pipeline.nodes.forEach((node) => {
				if (node.inputs) {
					node.inputs.forEach((input) => {
						if (input.links) {
							input.links.forEach((link) => {
								if (link.id === linkId) {
									found = true;
								}
							});
						}
					});
				}
			});
		}
	});
	return found;
}

function findCommentLinkInSecondPipelineFlow(linkId, secondPipelineFlow) {
	let found = false;
	secondPipelineFlow.pipelines.forEach((pipeline, pIdx) => {
		if (pipeline.app_data && pipeline.app_data.ui_data && pipeline.app_data.ui_data.comments) {
			pipeline.app_data.ui_data.comments.forEach((comment) => {
				if (comment.associated_id_refs) {
					comment.associated_id_refs.forEach((link) => {
						if (link.id === linkId) {
							found = true;
						}
					});
				}
			});
		}
	});
	return found;
}
