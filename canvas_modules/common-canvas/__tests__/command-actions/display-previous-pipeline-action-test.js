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
import DisplayPreviousPipeline from "../../src/command-actions/displayPreviousPipelineAction.js";


const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
describe("DisplayPreviousPipeline action handles calls correctly", () => {
	it("should handle calls, undo, and redo", () => {
		expect(objectModel.getBreadcrumbs()).to.have.length(1);
		objectModel.addNewBreadcrumb({ pipelineId: "test 1" });
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);
		objectModel.addNewBreadcrumb({ pipelineId: "test 2" });
		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(objectModel.getBreadcrumbs()).to.have.length(3);
		const displayPreviousPipeline = new DisplayPreviousPipeline({}, objectModel);
		displayPreviousPipeline.do();

		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);
		displayPreviousPipeline.undo();

		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 2");
		expect(objectModel.getBreadcrumbs()).to.have.length(3);
		displayPreviousPipeline.redo();

		expect(objectModel.getCurrentBreadcrumb().pipelineId).to.equal("test 1");
		expect(objectModel.getBreadcrumbs()).to.have.length(2);
	});
});
