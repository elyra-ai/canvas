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

const canvasController = new CanvasController();

describe("ObjectModel API handle model OK", () => {
	it("should update a link with newData", () => {
		deepFreeze(startCanvas);

		canvasController.setPipelineFlow(allTypesCanvas);
		canvasController.setLinkData("a81684aa-9b09-4620-aa59-54035a5de913", { trgPortNodeId: "input1SuperNodePE" });

		const pf = canvasController.getPipelineFlow();
		canvasController.setPipelineFlow(pf);
		const actualLink = canvasController.getLink("a81684aa-9b09-4620-aa59-54035a5de913");
		const expectedLink = {
			"id": "a81684aa-9b09-4620-aa59-54035a5de913",
			"srcNodeId": "|:;<,>.9?/`~!@#$%^&*()_+=-{}][",
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

});
