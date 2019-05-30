/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import CreateNodeOnLinkAction from "../../src/command-actions/createNodeOnLinkAction.js";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";
import difference from "lodash/difference";

const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
deepFreeze(startPipelineFlow);
canvasController.setPipelineFlow(startPipelineFlow);
const startingLinks = canvasController.getLinks();
const startingNodes = canvasController.getNodes();

const data = {
	link: startingLinks[0],
	nodeTemplate: {
		id: "dummy-node",
		inputs: [
			{ id: "inPort" }
		],
		outputs: [
			{ id: "outPort" }
		],
		label: "dummy node",
		op: "custom",
		type: "execution_node"
	}
};

const srcNode = canvasController.getNode(startingLinks[0].srcNodeId);
const trgNode = canvasController.getNode(startingLinks[0].trgNodeId);

describe("DisplaySubPipeline action handles calls correctly", () => {

	it("should handle calls, undo, and redo to multiple actions", () => {
		const createNodeLink = new CreateNodeOnLinkAction(data, objectModel);
		expect(canvasController.getLinks()).to.have.length(9);
		expect(canvasController.getNodes()).to.have.length(5);
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.exist;

		createNodeLink.do();

		// check getData() function
		const getData = createNodeLink.getData();
		const newLinkIds = difference(canvasController.getLinks(), startingLinks).map((newLink) => newLink.id);
		// ensure the newly created links are correctly set on the new node
		expect(difference([getData.newFirstLink.id, getData.newSecondLink.id], newLinkIds)).to.have.length(0);

		let dummyNode = difference(canvasController.getNodes(), startingNodes)[0];
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.be.undefined;
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, dummyNode.id, dummyNode.inputs[0].id)).to.exist;

		createNodeLink.undo();
		expect(canvasController.getLinks()).to.have.length(9);
		dummyNode = difference(canvasController.getNodes(), startingNodes)[0];
		expect(dummyNode).to.be.undefined;
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.exist;

		createNodeLink.redo();
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);
		dummyNode = difference(canvasController.getNodes(), startingNodes)[0];
		expect(dummyNode).to.be.not.undefined;
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.be.undefined;
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, dummyNode.id, dummyNode.inputs[0].id)).to.exist;
	});

});
