/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import SetLinksStyleAction from "../../src/command-actions/setLinksStyleAction.js";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";


const canvasController = new CanvasController();
const objectModel = canvasController.getObjectModel();
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
		const setLinksStyleAction1 = new SetLinksStyleAction(data, objectModel);

		setLinksStyleAction1.do();
		expect(canvasController.getLinkStyle(links[0].id, false, originalPipelineId)).to.equal(dummyStyle);

		setLinksStyleAction1.undo();
		expect(canvasController.getLinkStyle(links[0].id, false, originalPipelineId)).to.equal(null);

		setLinksStyleAction1.redo();
		expect(canvasController.getLinkStyle(links[0].id, false, originalPipelineId)).to.equal(dummyStyle);
	});
});
