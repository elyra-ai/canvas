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
import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import SetLinksStyleAction from "../../src/command-actions/setLinksStyleAction.js";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";


const canvasController = new CanvasController();
deepFreeze(startPipelineFlow);
canvasController.setPipelineFlow(startPipelineFlow);
const links = canvasController.getLinks();
const originalPipelineId = startPipelineFlow.primary_pipeline;
const dummyStyle = {
	default: "font-size: 24px"
};

describe("SetLinksStyleAction handles calls correctly", () => {
	it("should handle calls, undo, and redo", () => {
		expect(canvasController.getLinkStyle(links[0].id, false, originalPipelineId)).to.equal(null);

		const data = {
			style: dummyStyle,
			pipelineLinkIds: {},
			temporary: false
		};
		data.pipelineLinkIds[originalPipelineId] = [links[0].id];
		const setLinksStyleAction1 = new SetLinksStyleAction(data, canvasController);

		setLinksStyleAction1.do();
		let actualStyle = canvasController.getLinkStyle(links[0].id, false, originalPipelineId);
		expect(isEqual(actualStyle, dummyStyle)).to.be.true;

		setLinksStyleAction1.undo();
		actualStyle = canvasController.getLinkStyle(links[0].id, false, originalPipelineId);
		expect(actualStyle).to.equal(null);

		setLinksStyleAction1.redo();
		actualStyle = canvasController.getLinkStyle(links[0].id, false, originalPipelineId);
		expect(isEqual(actualStyle, dummyStyle)).to.be.true;
	});
});
