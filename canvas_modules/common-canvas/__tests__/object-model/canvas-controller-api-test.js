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
/* eslint no-console: "off" */

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import { createCommonCanvas } from "../_utils_/common-canvas-utils.js";

// Imports from harness test resources
import startCanvas from "../test_resources/json/startCanvas.json";
import branchTestExpected from "../test_resources/canvas-controller/branch-test-exp.json";
import upstreamTestExpected from "../test_resources/canvas-controller/upstream-test-exp.json";
import downstreamTestExpected from "../test_resources/canvas-controller/downstream-test-exp.json";


// Imports from common-canvas test resources
import allTypesCanvas from "../../../harness/test_resources/diagrams/allTypesCanvas.json";
import supernodeCanvas from "../../../harness/test_resources/diagrams/supernodeCanvas.json";
import externalMainCanvasExpanded from "../../../harness/test_resources/diagrams/externalMainCanvasExpanded.json";
import commonPalette from "../../../harness/test_resources/palettes/commonPalette.json";
import supernodePalette from "../../../harness/test_resources/palettes/supernodePalette.json";
import bigCanvas from "../../../harness/test_resources/diagrams/bigCanvas.json";


import EXTERNAL_SUB_FLOW_CANVAS_1 from "../../../harness/test_resources/diagrams/externalSubFlowCanvas1.json";
import EXTERNAL_SUB_FLOW_CANVAS_2 from "../../../harness/test_resources/diagrams/externalSubFlowCanvas2.json";


import CanvasController from "../../src/common-canvas/canvas-controller.js";

describe("Test canvas controller methods", () => {
	it("should get the current pipeline using: getCurretPipeline", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);

		const pipelineId1 = canvasController.getCurrentPipelineId();
		expect(isEqual(pipelineId1, "`~!@#$%^&*()_+=-{}][|:;<,>.9?/")).to.be.true;

		canvasController.displaySubPipelineForSupernode("nodeIDSuperNodePE");
		const pipelineId2 = canvasController.getCurrentPipelineId();
		expect(isEqual(pipelineId2, "modeler-sub-pipeline")).to.be.true;

	});

	it("should position off screen node into specified positions within the canvas", () => {
		const config = {};
		const expectedZoom = {
			k: 1,
			x: -1845.4267361645375,
			y: -511.2203308688752,
		};

		const expectedZoom2 = {
			k: 1,
			x: -2120.4267361645375,
			y: -671.2203308688752,
		};
		const canvasController = new CanvasController();

		canvasController.setPipelineFlow(bigCanvas);
		createCommonCanvas(config, canvasController);

		const actualZoom = canvasController.getZoomToReveal(["3e09c42d-d01a-49ac-87fc-4d9acc9c4b6e"], 50, 50);
		expect(isEqual(expectedZoom, actualZoom)).to.be.true;

		const actualZoom2 = canvasController.getZoomToReveal(["3e09c42d-d01a-49ac-87fc-4d9acc9c4b6e"], 25, 25);
		expect(isEqual(expectedZoom2, actualZoom2)).to.be.true;
	});

	it("should update a link with new properties using: setLinkProperties", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setLinkProperties("a81684aa-9b09-4620-aa59-54035a5de913", { trgNodePortId: "input1SuperNodePE" });

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");
		const expectedLink = {
			"id": "a81684aa-9b09-4620-aa59-54035a5de913",
			"srcNodeId": "|:;<,>.9?/`~!@#$%^&*()_+=-{}][",
			"trgNodeId": "nodeIDSuperNodePE",
			"trgNodePortId": "input1SuperNodePE",
			"type": "nodeLink",
			"class_name": "d3-data-link",
			"app_data": {}
		};

		// console.info("Expected Link = " + JSON.stringify(expectedLink, null, 2));
		// console.info("Actual Link   = " + JSON.stringify(actualLink, null, 2));

		expect(isEqual(expectedLink, actualLink)).to.be.true;
	});

	it("should update a link with new properties using: setNodeDataLinkSrcInfo", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.deleteLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");
		canvasController.setNodeDataLinkSrcInfo("a81684aa-9b09-4620-aa59-54035a5de913", "id8I6RH2V91XW", "outPort");

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");
		const expectedLink = {
			"id": "a81684aa-9b09-4620-aa59-54035a5de913",
			"srcNodeId": "id8I6RH2V91XW",
			"srcNodePortId": "outPort",
			"trgNodeId": "nodeIDSuperNodePE",
			"trgNodePortId": "input2SuperNodePE",
			"type": "nodeLink",
			"class_name": "d3-data-link",
			"app_data": {}
		};

		// console.info("Expected Link = " + JSON.stringify(expectedLink, null, 2));
		// console.info("Actual Link   = " + JSON.stringify(actualLink, null, 2));

		expect(isEqual(expectedLink, actualLink)).to.be.true;
	});


	it("should update a link with new properties using: setNodeDataLinkTrgInfo", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodeDataLinkTrgInfo("a81684aa-9b09-4620-aa59-54035a5de913", "nodeIDSuperNodePE", "input1SuperNodePE");

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");
		const expectedLink = {
			"id": "a81684aa-9b09-4620-aa59-54035a5de913",
			"srcNodeId": "|:;<,>.9?/`~!@#$%^&*()_+=-{}][",
			"trgNodeId": "nodeIDSuperNodePE",
			"trgNodePortId": "input1SuperNodePE",
			"type": "nodeLink",
			"class_name": "d3-data-link",
			"app_data": {}
		};

		// console.info("Expected Link = " + JSON.stringify(expectedLink, null, 2));
		// console.info("Actual Link   = " + JSON.stringify(actualLink, null, 2));

		expect(isEqual(expectedLink, actualLink)).to.be.true;
	});


	it("should update a node with new properties using: setNodeProperties", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodeProperties("id8I6RH2V91XW", { label: "New Node Label" });

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);

		const actualNode = canvasController.getNode("id8I6RH2V91XW");
		const expectedNode = { label: "New Node Label" };

		// console.info("Expected Node = " + JSON.stringify(expectedNode, null, 2));
		// console.info("Actual Node   = " + JSON.stringify(actualNode, null, 2));

		expect(isEqual(expectedNode.label, actualNode.label)).to.be.true;
	});

	it("should update a comment with new properties using: setCommentProperties", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setCommentProperties("id42ESQA3VPXB", { x_pos: 30, y_pos: 50 });

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);

		const actualComment = canvasController.getComment("id42ESQA3VPXB");
		const expectedComment = { x_pos: 30, y_pos: 50 };

		// console.info("Expected Comment = " + JSON.stringify(expectedComment, null, 2));
		// console.info("Actual Comment   = " + JSON.stringify(actualComment, null, 2));

		expect(isEqual(expectedComment.x_pos, actualComment.x_pos)).to.be.true;
		expect(isEqual(expectedComment.y_pos, actualComment.y_pos)).to.be.true;
	});


	it("should not save a decoration for a node when temporary property is true", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();

		// First save a decoration with 'temporary' property not set
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodeDecorations("id8I6RH2V91XW", [{ id: 123, position: "topRight" }]);

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);
		const node = canvasController.getNode("id8I6RH2V91XW");

		// console.log(JSON.stringify(node.decorations));

		// There should be one decoration
		expect(node.decorations.length === 1).to.be.true;

		// Now save a decoration with 'temporary' property set to true
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(allTypesCanvas);
		canvasController2.setNodeDecorations("id8I6RH2V91XW", [{ id: 123, position: "topRight", temporary: true }]);

		const pf2 = canvasController2.getPipelineFlow();
		canvasController2.setPipelineFlow(pf2);
		const node2 = canvasController2.getNode("id8I6RH2V91XW");

		// console.log(JSON.stringify(node2.decorations));

		// There should be no decorations property
		expect(node2.decorations.length === 0).to.be.true;
	});

	it("should not save a decoration for a link when temporary property is true", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();

		// First save a decoration with 'temporary' property not set
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setLinkDecorations("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb", [{ id: 123, position: "middle" }]);

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);
		const link = canvasController.getLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");

		// There should be one decoration
		expect(link.decorations.length === 1).to.be.true;

		// Now save a decoration with 'temporary' property set to true
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setLinkDecorations("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb", [{ id: 123, position: "middle", temporary: true }]);

		const pf2 = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf2);
		const link2 = canvasController.getLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb");

		// There should be no decorations property
		expect(typeof link2.decorations === "undefined").to.be.true;
	});


	it("should retrieve and get input ports using: getNodeInputPorts and setNodeInputPorts", () => {
		deepFreeze(allTypesCanvas);
		const executionNodeId = "|:;<,>.9?/`~!@#$%^&*()_+=-{}][";
		const newInputPort = {
			id: "1234",
			label: "New Input Port",
			cardinality: { min: 0, max: 1 },
			app_data: {
				my_data: [
					"abc"
				]
			}
		};

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		const inputs = canvasController.getNodeInputPorts(executionNodeId);

		inputs.push(newInputPort);

		canvasController.setNodeInputPorts(executionNodeId, inputs);
		const newPF = canvasController.getPipelineFlow();

		// Create a new controller so there is no cross-contamination
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(newPF);

		const inputs2 = canvasController.getNodeInputPorts(executionNodeId);

		const actualPortStr = JSON.stringify(inputs2[1], null, 2);
		const expectedPortStr = JSON.stringify(newInputPort, null, 2);

		// console.log(actualPortStr)
		// console.log(expectedPortStr)

		expect(isEqual(expectedPortStr, actualPortStr)).to.be.true;
	});

	it("should retrieve and get output ports using: getNodeOutputPorts and setNodeOutputPorts", () => {
		deepFreeze(allTypesCanvas);
		const executionNodeId = "|:;<,>.9?/`~!@#$%^&*()_+=-{}][";
		const newOutputPort = {
			id: "4321",
			label: "New Output Port",
			cardinality: { min: 0, max: -1 },
			app_data: {
				my_data: [
					"cba"
				]
			}
		};

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		const outputs = canvasController.getNodeOutputPorts(executionNodeId);

		outputs.push(newOutputPort);

		canvasController.setNodeOutputPorts(executionNodeId, outputs);
		const newPF = canvasController.getPipelineFlow();

		// Create a new controller so there is no cross-contamination
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(newPF);

		const outputs2 = canvasController.getNodeOutputPorts(executionNodeId);

		const actualPortStr = JSON.stringify(outputs2[1], null, 2);
		const expectedPortStr = JSON.stringify(newOutputPort, null, 2);

		// console.log(actualPortStr);
		// console.log(expectedPortStr);

		expect(isEqual(expectedPortStr, actualPortStr)).to.be.true;
	});

	it("should update node class name using: setNodesClassName", () => {
		deepFreeze(allTypesCanvas);
		const canvasController = new CanvasController();
		const nodeId = "id8I6RH2V91XW";
		const testClassName = "my-node-class";

		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodesClassName([nodeId], testClassName);

		const newPF = canvasController.getPipelineFlow();

		// Create a new controller so there is no cross-contamination
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(newPF);

		const actualClassName = canvasController2.getNodeClassName(nodeId);

		// console.log(actualClassName);
		// console.log(testClassName);

		expect(isEqual(actualClassName, testClassName)).to.be.true;
	});

	it("should update comment class name using: setCommentsClassName", () => {
		deepFreeze(allTypesCanvas);
		const canvasController = new CanvasController();
		const commentId = "id42ESQA3VPXB";
		const testClassName = "my-comment-class";

		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setCommentsClassName([commentId], testClassName);

		const newPF = canvasController.getPipelineFlow();

		// Create a new controller so there is no cross-contamination
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(newPF);

		const actualClassName = canvasController2.getCommentClassName(commentId);

		// console.log(actualClassName);
		// console.log(testClassName);

		expect(isEqual(actualClassName, testClassName)).to.be.true;
	});

	it("should update link class name using: setLinksClassName", () => {
		deepFreeze(allTypesCanvas);
		const canvasController = new CanvasController();
		const linkIds = ["ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb", "a81684aa-9b09-4620-aa59-54035a5de913"];
		const testClassName = "my-link-class";

		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setLinksClassName(linkIds, testClassName);

		const newPF = canvasController.getPipelineFlow();

		// Create a new controller so there is no cross-contamination
		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(newPF);

		const actualClassName0 = canvasController2.getLinkClassName(linkIds[0]);
		const actualClassName1 = canvasController2.getLinkClassName(linkIds[1]);

		// console.log(actualClassName);
		// console.log(testClassName);

		expect(isEqual(actualClassName0, testClassName)).to.be.true;
		expect(isEqual(actualClassName1, testClassName)).to.be.true;
	});

	it("should test sub-pipeline display calls", () => {
		const canvasController = new CanvasController();
		canvasController.setHandlers({ beforeEditActionHandler: beforeEditActionHandler });

		canvasController.setPipelineFlow(externalMainCanvasExpanded);

		const breadcrumbs = [
			{
				"pipelineId": "external-sub-flow-pipeline-1",
				"supernodeId": "nodeIDSuperNodePE",
				"supernodeParentPipelineId": "`~!@#$%^&*()_+=-{}][|:;<,>.9?/",
				"externalUrl": "external-sub-flow-url-1",
				"label": "Super node"
			},
			{
				"pipelineId": "external-sub-flow-pipeline-2",
				"supernodeId": "8609fbcf-828a-49cc-8fee-c9d4593e3207",
				"supernodeParentPipelineId": "external-sub-flow-pipeline-1",
				"externalUrl": "external-sub-flow-url-2",
				"label": "Supernode 2"
			}
		];

		// Add some breadcrumbs to be added using: displaySubPipelineForBreadcrumbs
		canvasController.displaySubPipelineForBreadcrumbs(breadcrumbs);
		const bcs = canvasController.getBreadcrumbs();
		expect(bcs).to.have.length(3);

		// Specify the middle pipeline to be displayed using: displaySubPipeline
		canvasController.displaySubPipeline("external-sub-flow-pipeline-1");
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		// Specify the supernode to open the third breadcrumb using: displaySubPipelineForSupernode
		canvasController.displaySubPipelineForSupernode("8609fbcf-828a-49cc-8fee-c9d4593e3207", "external-sub-flow-pipeline-1");
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		// Try undoing the three actions performd so far.
		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(1);


		// Try rdoing the three actions performd so far.
		canvasController.getCommandStack().redo();
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		canvasController.getCommandStack().redo();
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		canvasController.getCommandStack().redo();
		expect(canvasController.getBreadcrumbs()).to.have.length(3);
	});

	it("should create a regular node on the canvas from a palette node", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlowPalette(commonPalette);

		const nodeTemplate = canvasController.getPaletteNode("com.ibm.commonicons.sources.varfile");
		const newNode = canvasController.createNode({
			nodeTemplate: nodeTemplate,
			offsetX: 200,
			offsetY: 400
		});
		canvasController.addNode(newNode);

		expect(canvasController.getNodes()).to.have.length(1);
		expect(canvasController.getPipelineFlow().pipelines).to.have.length(1);

	});

	it("should create a supernode on the canvas from a palette supernode", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlowPalette(supernodePalette);

		const snTemplate = canvasController.getPaletteNodeById("Supernode-local");
		const newNode = canvasController.createNode({
			nodeTemplate: snTemplate,
			offsetX: 200,
			offsetY: 400
		});
		canvasController.addNode(newNode);

		expect(canvasController.getNodes()).to.have.length(1);
		expect(canvasController.getPipelineFlow().pipelines).to.have.length(2);

	});


	it("should execute a Command to create a supernode on the canvas from a palette supernode", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlowPalette(supernodePalette);

		// Initially, there shouldn't be any commands to undo in the command stack.
		expect(canvasController.getCommandStack().canUndo()).to.be.false;

		const snTemplate = canvasController.getPaletteNodeById("Supernode-local");
		canvasController.createNodeCommand({ nodeTemplate: snTemplate, offsetX: 100, offsetY: 50 });

		expect(canvasController.getNodes()).to.have.length(1);
		expect(canvasController.getPipelineFlow().pipelines).to.have.length(2);

		// createNodeCommand should add a command to the command stack so there
		// should now be a command to undo.
		expect(canvasController.getCommandStack().canUndo()).to.be.true;
	});

	it("should return an array of nodes for the branch", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(supernodeCanvas);

		// Supernode
		const branchTestActual = canvasController.getBranchNodes(["7015d906-2eae-45c1-999e-fb888ed957e5"]);

		expect(JSON.stringify(branchTestExpected)).to.equal(JSON.stringify(branchTestActual));
	});

	it("should return an array of nodes for the upstream", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(supernodeCanvas);

		// Binding (exit) node
		const upstreamTestActual = canvasController.getUpstreamNodes(["id5KIRGGJ3FYT"]);

		expect(JSON.stringify(upstreamTestExpected)).to.equal(JSON.stringify(upstreamTestActual));
	});

	it("should return an array of nodes for the downstream", () => {
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(supernodeCanvas);

		// Database node
		const downstreamTestActual = canvasController.getDownstreamNodes(["f5373d9e-677d-4717-a9fd-3b57038ce0de"]);

		expect(JSON.stringify(downstreamTestExpected)).to.equal(JSON.stringify(downstreamTestActual));
	});
});

const externalPipelineFlows = [];
externalPipelineFlows["external-sub-flow-url-1"] = EXTERNAL_SUB_FLOW_CANVAS_1;
externalPipelineFlows["external-sub-flow-url-2"] = EXTERNAL_SUB_FLOW_CANVAS_2;


function beforeEditActionHandler(data) {
	switch (data.editType) {

	case "createSuperNodeExternal":
	case "convertSuperNodeLocalToExternal": {
		data.externalUrl = "external-flow-url-" + Date.now();
		data.externalPipelineFlowId = "external-pipeline-flow-id-" + Date.now();
		break;
	}
	case "loadPipelineFlow":
	case "expandSuperNodeInPlace":
	case "displaySubPipeline":
	case "convertSuperNodeExternalToLocal": {
		if (data.externalPipelineFlowLoad) {
			data.externalPipelineFlow = externalPipelineFlows[data.externalUrl];
		}
		break;
	}
	default:
	}
	return data;
}
