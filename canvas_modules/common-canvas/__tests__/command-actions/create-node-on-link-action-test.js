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
	type: "nodeLink",
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

		const getData = createNodeLink.getData();
		const newLinkIds = difference(canvasController.getLinks(), startingLinks).map((newLink) => newLink.id);

		// Get the node that was added to teh canvas
		const addedNode = nodeDifference(startingNodes)[0];

		// Check two new links were added with corrct IDs
		expect(difference([getData.newFirstLink.id, getData.newSecondLink.id], newLinkIds)).to.have.length(0);
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);
		// Check old link was removed
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.be.undefined;
		// Check new links were added
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, addedNode.id, addedNode.inputs[0].id)).to.exist;
		expect(canvasController.getNodeDataLinkFromInfo(addedNode.id, addedNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.exist;


		createNodeLink.undo();
		expect(canvasController.getLinks()).to.have.length(9);
		const addedNode2 = nodeDifference(startingNodes)[0];
		expect(addedNode2).to.be.undefined;
		// Check the old link was restored
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.exist;


		createNodeLink.redo();
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);
		const addedNode3 = nodeDifference(startingNodes)[0];
		expect(addedNode3).to.be.not.undefined;
		// Check the new links were restored
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, trgNode.id, trgNode.inputs[0].id)).to.be.undefined;
		expect(canvasController.getNodeDataLinkFromInfo(srcNode.id, srcNode.outputs[0].id, addedNode.id, addedNode.inputs[0].id)).to.exist;
	});

	function nodeDifference(diffNodes) {
		return canvasController.getNodes().filter((n) => diffNodes.findIndex((sn) => sn.id === n.id) === -1);
	}

});
