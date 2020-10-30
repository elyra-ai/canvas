/*
 * Copyright 2017-2020 IBM Corporation
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
import startCanvas from "../test_resources/json/startCanvas.json";
import allTypesCanvas from "../../../harness/test_resources/diagrams/allTypesCanvas.json";

import CanvasController from "../../src/common-canvas/canvas-controller.js";

describe("ObjectModel API handle model OK", () => {
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


});
