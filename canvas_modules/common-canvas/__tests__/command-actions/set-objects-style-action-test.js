/*
 * Copyright 2017-2019 IBM Corporation
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
import SetObjectsStyleAction from "../../src/command-actions/setObjectsStyleAction.js";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";


const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
deepFreeze(startPipelineFlow);
canvasController.setPipelineFlow(startPipelineFlow);
const nodes = canvasController.getNodes();
const originalPipelineId = startPipelineFlow.primary_pipeline;
const dummyStyle = {
	default: "font-size: 24px"
};

describe("SetObjectsStyleAction handles calls correctly", () => {
	it("should handle calls, undo, and redo", () => {
		expect(canvasController.getNodeStyle(nodes[0].id, false, originalPipelineId)).to.be.undefined;

		const data = {
			style: dummyStyle,
			pipelineObjectIds: {},
			temporary: false
		};
		data.pipelineObjectIds[originalPipelineId] = [nodes[0].id];
		const setObjectsStyle = new SetObjectsStyleAction(data, objectModel);

		setObjectsStyle.do();
		expect(canvasController.getNodeStyle(nodes[0].id, false, originalPipelineId)).to.equal(dummyStyle);

		setObjectsStyle.undo();
		// undo should now set style to null, instead of an undefined property of the node
		expect(canvasController.getNodeStyle(nodes[0].id, false, originalPipelineId)).to.equal(null);

		setObjectsStyle.redo();
		expect(canvasController.getNodeStyle(nodes[0].id, false, originalPipelineId)).to.equal(dummyStyle);
	});
});
