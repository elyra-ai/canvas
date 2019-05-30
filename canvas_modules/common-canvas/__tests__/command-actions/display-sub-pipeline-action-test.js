/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import DisplaySubPipeline from "../../src/command-actions/displaySubPipelineAction.js";

const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();

describe("DisplaySubPipeline action handles calls correctly", () => {
	it("should handle calls, undo, and redo to multiple actions", () => {
		const displaySubPipeline1 = new DisplaySubPipeline({ pipelineInfo: { pipelineId: "test 1" } }, objectModel);
		expect(objectModel.getBreadcrumbs()).to.have.length(1);

		displaySubPipeline1.do();
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);

		const displaySubPipeline2 = new DisplaySubPipeline({ pipelineInfo: { pipelineId: "test 2" } }, objectModel);
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
