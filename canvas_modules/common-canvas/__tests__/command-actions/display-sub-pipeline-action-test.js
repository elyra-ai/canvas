/*
 * Copyright 2017-2020 Elyra Authors
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

const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
objectModel.setCanvasInfo({ pipelines: [{ id: "test 1" }, { id: "test 2" }] });

describe("DisplaySubPipeline action handles calls correctly", () => {
	it("should handle calls, undo, and redo to multiple actions", () => {
		const targetObj = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 1" } };
		const displaySubPipeline1 = new DisplaySubPipeline({ targetObject: targetObj, pipelineInfo: { pipelineId: "test 1" } }, objectModel);
		expect(objectModel.getBreadcrumbs()).to.have.length(1);

		displaySubPipeline1.do();
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);

		const targetObj2 = { type: SUPER_NODE, subflow_ref: { pipeline_id_ref: "test 2" } };
		const displaySubPipeline2 = new DisplaySubPipeline({ targetObject: targetObj2, pipelineInfo: { pipelineId: "test 2" } }, objectModel);
		displaySubPipeline2.do();
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(objectModel.getBreadcrumbs()).to.have.length(3);

		displaySubPipeline1.undo();
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);

		displaySubPipeline1.redo();
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(3);
	});

});
