/*
 * Copyright 2017-2026 Elyra Authors
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
import cardinalityCanvas from "../../../harness/test_resources/diagrams/cardinalityCanvas.json";
import multiPortsCanvas2 from "../../../harness/test_resources/diagrams/multiPortsCanvas2.json";


import EXTERNAL_SUB_FLOW_CANVAS_1 from "../../../harness/test_resources/diagrams/externalSubFlowCanvas1.json";
import EXTERNAL_SUB_FLOW_CANVAS_2 from "../../../harness/test_resources/diagrams/externalSubFlowCanvas2.json";
import multiPortsCanvas3 from "../../../harness/test_resources/diagrams/multiPortsCanvas3.json";


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
		canvasController.deleteLink(canvasController.getLink("ba2a3402-c34d-4d7e-a8fa-fea0ac34b5fb"));
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

	it("should set link parameters using: setLinkParameters", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);

		// Set parameters for a link
		const parameters = {
			param1: "value1",
			param2: "value2",
			param3: 123,
			nestedParam: {
				subParam1: "nestedValue1",
				subParam2: "nestedValue2"
			}
		};

		canvasController.setLinkParameters("a81684aa-9b09-4620-aa59-54035a5de913", parameters);

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Verify the parameters were set correctly
		expect(actualLink.parameters).to.deep.equal(parameters);

		// Verify other link properties remain unchanged
		expect(actualLink.id).to.equal("a81684aa-9b09-4620-aa59-54035a5de913");
		expect(actualLink.srcNodeId).to.equal("|:;<,>.9?/`~!@#$%^&*()_+=-{}][");
		expect(actualLink.trgNodeId).to.equal("nodeIDSuperNodePE");
		expect(actualLink.type).to.equal("nodeLink");
	});

	it("should update existing link parameters using: setLinkParameters", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);

		// Set initial parameters
		const initialParameters = {
			oldParam1: "oldValue1",
			oldParam2: "oldValue2"
		};
		canvasController.setLinkParameters("a81684aa-9b09-4620-aa59-54035a5de913", initialParameters);

		// Update with new parameters
		const newParameters = {
			newParam1: "newValue1",
			newParam2: "newValue2"
		};
		canvasController.setLinkParameters("a81684aa-9b09-4620-aa59-54035a5de913", newParameters);

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Verify old parameters are replaced with new ones
		expect(actualLink.parameters).to.deep.equal(newParameters);
		expect(actualLink.parameters.oldParam1).to.be.undefined;
		expect(actualLink.parameters.oldParam2).to.be.undefined;
	});

	it("should set empty parameters using: setLinkParameters", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);

		// Set initial parameters
		canvasController.setLinkParameters("a81684aa-9b09-4620-aa59-54035a5de913", { param1: "value1" });

		// Set empty parameters
		canvasController.setLinkParameters("a81684aa-9b09-4620-aa59-54035a5de913", {});

		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");

		// Verify parameters are set to empty object
		expect(actualLink.parameters).to.deep.equal({});
	});

	it("should set link parameters for a specific pipeline using: setLinkParameters", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(supernodeCanvas);

		const primaryPipelineId = canvasController.getPrimaryPipelineId();
		const parameters = {
			pipelineParam1: "pipelineValue1",
			pipelineParam2: 456
		};

		// Get a link from the primary pipeline
		const links = canvasController.getLinks(primaryPipelineId);
		if (links && links.length > 0) {
			const linkId = links[0].id;

			// Set parameters for the link in the specific pipeline
			canvasController.setLinkParameters(linkId, parameters, primaryPipelineId);

			const actualLink = canvasController.getLink(linkId, primaryPipelineId);

			// Verify parameters are set correctly
			expect(actualLink.parameters).to.deep.equal(parameters);
		}
	});


	it("should update a node with new properties using: setNodeProperties", () => {
		deepFreeze(startCanvas);

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodeProperties("id8I6RH2V91XW", { label: "New Node Label" });

		const actualNode = canvasController.getNode("id8I6RH2V91XW");
		const expectedNode = { label: "New Node Label" };

		expect(isEqual(expectedNode.label, actualNode.label)).to.be.true;
	});

	it("should update a nodes with new properties using: setNodesProperties", () => {
		deepFreeze(startCanvas);

		const expectedNode1 = { id: "id8I6RH2V91XW", label: "New Node Label1" };
		const expectedNode2 = { id: "id125TTEEIK7V", label: "New Node Label2" };

		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setNodesProperties([expectedNode1, expectedNode2]);

		const actualNode1 = canvasController.getNode("id8I6RH2V91XW");
		const actualNode2 = canvasController.getNode("id125TTEEIK7V");

		expect(isEqual(expectedNode1.label, actualNode1.label)).to.be.true;
		expect(isEqual(expectedNode2.label, actualNode2.label)).to.be.true;
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

		// Try undoing the three actions performed so far.
		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		canvasController.getCommandStack().undo();
		expect(canvasController.getBreadcrumbs()).to.have.length(1);


		// Try doing the three actions performed so far.
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

	it("should dynamically add input and output ports by updating pipeline flow through API " +
		"and add port to port links", () => {
		deepFreeze(multiPortsCanvas3);

		const canvasController2 = new CanvasController();
		canvasController2.setPipelineFlow(multiPortsCanvas3);

		// Get the Select1 node using getNodes() without parameters
		const nodes = canvasController2.getNodes();
		const select1Node = nodes.find((n) => n.label === "Select1");
		expect(select1Node).to.not.be.undefined;

		// Add input and output ports to node "Select1"
		// We need to modify the node in the pipeline flow, not the node object from getNodes()
		const pipelineFlow = canvasController2.getPipelineFlow();
		const pipeline = pipelineFlow.pipelines[0];
		const node = pipeline.nodes.find((n) => n.id === select1Node.id);

		// Add additional input ports
		node.inputs.push({
			id: "inPort2",
			app_data: {
				ui_data: {
					cardinality: { min: 0, max: 1 },
					label: "Input Port 2"
				}
			}
		});

		// Add additional output ports
		node.outputs.push({
			id: "outPort2",
			app_data: {
				ui_data: {
					cardinality: { min: 0, max: -1 },
					label: "Output Port 2"
				}
			}
		});

		// Update the pipeline flow with the modified node
		canvasController2.setPipelineFlow(pipelineFlow);

		// Get node IDs for creating links - use getNodes() which returns nodes with labels at top level
		const updatedNodes = canvasController2.getNodes();
		const varFileNode = updatedNodes.find((n) => n.label === "Var. File");
		const select2Node = updatedNodes.find((n) => n.label === "Select2");
		const select3Node = updatedNodes.find((n) => n.label === "Select3");
		const updatedSelect1Node = updatedNodes.find((n) => n.label === "Select1");

		// Add port to port links
		const linkData1 = {
			type: "nodeLink",
			nodes: [{ id: varFileNode.id, portId: "outPort" }],
			targetNodes: [{ id: updatedSelect1Node.id, portId: "inPort" }]
		};
		const link1Data = canvasController2.createNodeLinks(linkData1);
		canvasController2.addLinks(link1Data);

		const linkData2 = {
			type: "nodeLink",
			nodes: [{ id: select3Node.id, portId: "outPort1" }],
			targetNodes: [{ id: updatedSelect1Node.id, portId: "inPort2" }]
		};
		const link2Data = canvasController2.createNodeLinks(linkData2);
		canvasController2.addLinks(link2Data);

		const linkData3 = {
			type: "nodeLink",
			nodes: [{ id: updatedSelect1Node.id, portId: "outPort" }],
			targetNodes: [{ id: select3Node.id, portId: "inPort" }]
		};
		const link3Data = canvasController2.createNodeLinks(linkData3);
		canvasController2.addLinks(link3Data);

		const linkData4 = {
			type: "nodeLink",
			nodes: [{ id: updatedSelect1Node.id, portId: "outPort2" }],
			targetNodes: [{ id: select2Node.id, portId: "inPort" }]
		};
		const link4Data = canvasController2.createNodeLinks(linkData4);
		canvasController2.addLinks(link4Data);

		// Verification steps
		const links = canvasController2.getLinks();
		expect(links).to.have.length(4);

		// Verify link between Var. File outPort and Select1 inPort
		const link1 = links.find((l) =>
			l.srcNodeId === varFileNode.id &&
			l.srcNodePortId === "outPort" &&
			l.trgNodeId === updatedSelect1Node.id &&
			l.trgNodePortId === "inPort"
		);
		expect(link1).to.not.be.undefined;

		// Verify link between Select3 outPort1 and Select1 inPort2
		const link2 = links.find((l) =>
			l.srcNodeId === select3Node.id &&
			l.srcNodePortId === "outPort1" &&
			l.trgNodeId === updatedSelect1Node.id &&
			l.trgNodePortId === "inPort2"
		);
		expect(link2).to.not.be.undefined;

		// Verify link between Select1 outPort and Select3 inPort
		const link3 = links.find((l) =>
			l.srcNodeId === updatedSelect1Node.id &&
			l.srcNodePortId === "outPort" &&
			l.trgNodeId === select3Node.id &&
			l.trgNodePortId === "inPort"
		);
		expect(link3).to.not.be.undefined;

		// Verify link between Select1 outPort2 and Select2 inPort
		const link4 = links.find((l) =>
			l.srcNodeId === updatedSelect1Node.id &&
			l.srcNodePortId === "outPort2" &&
			l.trgNodeId === select2Node.id &&
			l.trgNodePortId === "inPort"
		);
		expect(link4).to.not.be.undefined;
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

// Helper function to create links and verify counts
function createLinkAndVerify(canvasController, srcNodeLabel, srcPortId, trgNodeLabel, trgPortId, expectedLinkCount) {
	const nodes = canvasController.getNodes();
	const srcNode = nodes.find((n) => n.label === srcNodeLabel);
	const trgNode = nodes.find((n) => n.label === trgNodeLabel);

	if (!srcNode || !trgNode) {
		return false;
	}

	const linkData = {
		type: "nodeLink",
		nodes: [{ id: srcNode.id, portId: srcPortId }],
		targetNodes: [{ id: trgNode.id, portId: trgPortId }]
	};

	const links = canvasController.createNodeLinks(linkData);
	canvasController.addLinks(links);

	const allLinks = canvasController.getLinks();
	expect(allLinks).to.have.length(expectedLinkCount);

	return true;
}

// Helper function to verify link exists between nodes
function verifyLinkBetweenPorts(canvasController, srcNodeLabel, srcPortId, trgNodeLabel, trgPortId, expectedCount) {
	const nodes = canvasController.getNodes();
	const srcNode = nodes.find((n) => n.label === srcNodeLabel);
	const trgNode = nodes.find((n) => n.label === trgNodeLabel);

	if (!srcNode || !trgNode) {
		if (expectedCount === 0) {
			return;
		}
		throw new Error(`Node not found: ${srcNodeLabel} or ${trgNodeLabel}`);
	}

	const links = canvasController.getLinks();
	const matchingLinks = links.filter((l) =>
		l.srcNodeId === srcNode.id &&
		l.srcNodePortId === srcPortId &&
		l.trgNodeId === trgNode.id &&
		l.trgNodePortId === trgPortId
	);

	expect(matchingLinks).to.have.length(expectedCount);
}

describe("Test adding links to target nodes with maxed out cardinalities", () => {
	it("should reject new connection when target node is maxed out (cardinality 0:1)", () => {
		deepFreeze(cardinalityCanvas);
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(cardinalityCanvas);

		// Create first link - should succeed
		createLinkAndVerify(canvasController, "Out 0:1", "outPort", "In 0:1", "inPort", 1);
		verifyLinkBetweenPorts(canvasController, "Out 0:1", "outPort", "In 0:1", "inPort", 1);

		// Try to create second link to same port - should fail because In 0:1 already has a link
		createLinkAndVerify(canvasController, "Out 0:3", "outPort", "In 0:1", "inPort", 1);
		verifyLinkBetweenPorts(canvasController, "Out 0:3", "outPort", "In 0:1", "inPort", 0);
	});

	it("should handle target node with multiple ports and different cardinalities", () => {
		deepFreeze(cardinalityCanvas);
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(cardinalityCanvas);

		// Create first link to InputPort2 - should succeed
		createLinkAndVerify(canvasController, "Out 0:1", "outPort", "0:1 & 0:2", "InputPort2", 1);
		verifyLinkBetweenPorts(canvasController, "Out 0:1", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// Create second link to InputPort2 - should succeed because InputPort2 can accept 2 input links
		createLinkAndVerify(canvasController, "Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 2);
		verifyLinkBetweenPorts(canvasController, "Out 0:3", "outPort", "0:1 & 0:2", "InputPort2", 1);

		// Try to create third link to InputPort2 - should fail because InputPort2 already has 2 input links
		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort2", "0:1 & 0:2", "InputPort2", 2);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort2", "0:1 & 0:2", "InputPort2", 0);
	});

	it("should handle target node with all ports having cardinality limits", () => {
		deepFreeze(cardinalityCanvas);
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(cardinalityCanvas);

		// Create links to different ports - all should succeed
		createLinkAndVerify(canvasController, "Out 0:1", "outPort", "All 0:1", "inPort1", 1);
		verifyLinkBetweenPorts(canvasController, "Out 0:1", "outPort", "All 0:1", "inPort1", 1);

		createLinkAndVerify(canvasController, "Out 0:3", "outPort", "All 0:1", "inPort2", 2);
		verifyLinkBetweenPorts(canvasController, "Out 0:3", "outPort", "All 0:1", "inPort2", 1);

		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort1", "All 0:1", "inPort3", 3);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort1", "All 0:1", "inPort3", 1);

		// Try to create links to already maxed out ports - all should fail
		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort1", 3);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort1", 0);

		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort2", 3);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort2", 0);

		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort3", 3);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort3", 0);

		// Create link to inPort4 - should succeed
		createLinkAndVerify(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort4", 4);
		verifyLinkBetweenPorts(canvasController, "0:1 & 0:-1", "outPort2", "All 0:1", "inPort4", 1);
	});
});

describe("Test multiple ports operations with cardinality enforcement", () => {
	it("should create multiple port-to-port links and enforce cardinality limits", () => {
		deepFreeze(multiPortsCanvas2);
		const canvasController = new CanvasController();
		canvasController.setPipelineFlow(multiPortsCanvas2);

		// Verify initial state - canvas has 5 existing links
		let links = canvasController.getLinks();
		expect(links).to.have.length(5);

		// Add port to port links - all should succeed
		createLinkAndVerify(canvasController, "Select4", "outPort", "Merge1", "inPort3", 6);
		createLinkAndVerify(canvasController, "Var. File", "outPort", "Select1", "inPort", 7);
		createLinkAndVerify(canvasController, "Select2", "outPort1", "Table", "inPort", 8);
		createLinkAndVerify(canvasController, "Select2", "outPort2", "Table", "inPort", 9);
		createLinkAndVerify(canvasController, "Select2", "outPort3", "Table", "inPort", 10);
		createLinkAndVerify(canvasController, "Select2", "outPort4", "Table", "inPort", 11);
		createLinkAndVerify(canvasController, "Select3", "outPort1", "Neural Net", "inPort1", 12);
		createLinkAndVerify(canvasController, "Select3", "outPort2", "Neural Net", "inPort1", 13);
		createLinkAndVerify(canvasController, "Select3", "outPort3", "Neural Net", "inPort1", 14);
		createLinkAndVerify(canvasController, "Select3", "outPort4", "Neural Net", "inPort1", 15);
		createLinkAndVerify(canvasController, "Select3", "outPort5", "Neural Net", "inPort1", 16);
		createLinkAndVerify(canvasController, "Select4", "outPort", "Sort", "inPort", 17);
		createLinkAndVerify(canvasController, "Select4", "outPort", "Merge1", "inPort1", 18);

		// Negative Tests - these should fail due to cardinality limits

		// The cardinality of 'inPort2' port on 'Neural Net' node is a max of 2
		// It already has 2 links, so this should fail
		createLinkAndVerify(canvasController, "Select3", "outPort8", "Neural Net", "inPort2", 18);
		verifyLinkBetweenPorts(canvasController, "Select3", "outPort8", "Neural Net", "inPort2", 0);

		// Node "Select4" node "outPort" has a maximum cardinality of 4
		// It already has 4 links, so this should fail
		createLinkAndVerify(canvasController, "Select4", "outPort", "Merge2", "inPort", 18);
		verifyLinkBetweenPorts(canvasController, "Select4", "outPort", "Merge2", "inPort", 0);

		// Final verification - should still have 18 links
		links = canvasController.getLinks();
		expect(links).to.have.length(18);
	});
});
