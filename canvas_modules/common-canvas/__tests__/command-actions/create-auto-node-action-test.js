/*
 * Copyright 2017-2024 Elyra Authors
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
import { CreateAutoNodeAction } from "../../src/"; // Imports from the export list in index.js for common-canvas
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";

const canvasController = new CanvasController();
deepFreeze(startPipelineFlow);
canvasController.setPipelineFlow(startPipelineFlow);


describe("DisplaySubPipeline action handles calls correctly", () => {

	it("should handle calls, undo, and redo to multiple actions", () => {
		// Check the initial contents of the pipeline
		expect(canvasController.getLinks()).to.have.length(9);
		expect(canvasController.getNodes()).to.have.length(5);

		// Create the data object for the command action.
		const data = {
			pipelineId: "153651d6-9b88-423c-b01b-861f12d01489",
			nodeTemplate: {
				"id": "",
				"type": "execution_node",
				"inputs": [
					{
						"id": "inPort",
						"label": "Input Port",
						"cardinality": {
							"min": 0,
							"max": 1
						}
					}
				],
				"label": "Sort",
				"x_pos": 0,
				"y_pos": 0,
				"decorations": [],
				"parameters": {},
				"messages": [],
				"ui_parameters": [],
				"app_data": {},
				"model_ref": "",
				"description": "Sorts data",
				"image": "/images/actions/sort.svg"
			}
		};

		const createAutoNode = new CreateAutoNodeAction(data, canvasController);
		createAutoNode.do();

		// Check that a new node AND a new link have been added to the pipeline.
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);

		createAutoNode.undo();

		// Check that a new node AND a new link have been removed from the pipeline.
		expect(canvasController.getLinks()).to.have.length(9);
		expect(canvasController.getNodes()).to.have.length(5);

		createAutoNode.redo();

		// Check that a new node AND a new link have been added back to the pipeline.
		expect(canvasController.getLinks()).to.have.length(10);
		expect(canvasController.getNodes()).to.have.length(6);

	});

});
