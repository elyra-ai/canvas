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

import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import DisplaySubPipeline from "../../src/command-actions/displaySubPipelineAction.js";
import { SUPER_NODE } from "../../src/common-canvas/constants/canvas-constants.js";

describe("DisplaySubPipeline action handles calls correctly", () => {
	it("should handle calls, undo, and redo when adding breadcrumbs", () => {
		// Newly created canvasController will have a single root breadcrumb in its object model
		const canvasController = createCanvasController();
		expect(canvasController.getBreadcrumbs()).to.have.length(1);

		const targetObj = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 1" } };
		const displaySubPipeline1 = new DisplaySubPipeline({ targetObject: targetObj, addBreadcrumbs: [{ pipelineId: "test 1" }] }, canvasController);
		displaySubPipeline1.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		// Setting addBreadcrumbs will add that array of breadcrumbs to the
		// current set of breadcrumbs.
		const targetObj2 = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 2" } };
		const displaySubPipeline2 = new DisplaySubPipeline({ targetObject: targetObj2, addBreadcrumbs: [{ pipelineId: "test 2" }] }, canvasController);
		displaySubPipeline2.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		displaySubPipeline2.undo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		displaySubPipeline2.redo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(canvasController.getBreadcrumbs()).to.have.length(3);
	});

	it("should handle calls, undo, and redo when adding displaying an indexed breadcrumb", () => {
		// Newly created canvasController will have a single root breadcrumb in its object model
		const canvasController = createCanvasController();
		expect(canvasController.getBreadcrumbs()).to.have.length(1);

		const targetObj = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 1" } };
		const displaySubPipeline1 = new DisplaySubPipeline({ targetObject: targetObj,
			addBreadcrumbs: [{ pipelineId: "test 1" }, { pipelineId: "test 2" }, { pipelineId: "test 3" }] }, canvasController);
		displaySubPipeline1.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 3");
		expect(canvasController.getBreadcrumbs()).to.have.length(4);

		// Setting breadcrumbIndex in the input object will truncate the
		// breadcrumbs array to the index position.
		const displaySubPipeline2 = new DisplaySubPipeline({ targetObject: targetObj, breadcrumbIndex: 2 }, canvasController);
		displaySubPipeline2.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(canvasController.getBreadcrumbs()).to.have.length(3);

		displaySubPipeline2.undo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 3");
		expect(canvasController.getBreadcrumbs()).to.have.length(4);

		displaySubPipeline2.redo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(canvasController.getBreadcrumbs()).to.have.length(3);
	});


	it("should handle calls, undo, and redo when resetting to the breadcrumbs", () => {
		// Newly created canvasController will have a single root breadcrumb in its object model
		const canvasController = createCanvasController();
		expect(canvasController.getBreadcrumbs()).to.have.length(1);

		const targetObj = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 1" } };
		const displaySubPipeline1 = new DisplaySubPipeline({ targetObject: targetObj,
			addBreadcrumbs: [{ pipelineId: "test 1" }, { pipelineId: "test 2" }, { pipelineId: "test 3" }] }, canvasController);
		displaySubPipeline1.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 3");
		expect(canvasController.getBreadcrumbs()).to.have.length(4);

		// If we don't provide breadcrumbIndex in the input
		// object the breadcrumbs will be set back to that index.
		const displaySubPipeline2 = new DisplaySubPipeline({ targetObject: targetObj, breadcrumbIndex: 1 }, canvasController);
		displaySubPipeline2.do();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(canvasController.getBreadcrumbs()).to.have.length(2);

		displaySubPipeline2.undo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 3");
		expect(canvasController.getBreadcrumbs()).to.have.length(4);

		displaySubPipeline2.redo();

		expect(canvasController.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(canvasController.getBreadcrumbs()).to.have.length(2);
	});


});

function createCanvasController() {
	const canvasController = new CanvasController();
	const objectModel = canvasController.getObjectModel();
	objectModel.setCanvasInfo({ primary_pipeline: "test 0", pipelines: [{ id: "test 0" }, { id: "test 1" }, { id: "test 2" }, { id: "test 3" }] });
	return canvasController;
}
