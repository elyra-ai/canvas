/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import shaperSupernodeTestPipeline from "../test_resources/json/supernode_subtype_shaper_flow.json";
import canvasSupernodeTestPipeline from "../test_resources/json/supernode_subtype_canvas_flow.json";
import noSubtypeSupernodeTestPipeline from "../test_resources/json/supernode_subtype_nosubtype_flow.json";

const canvasController = new CanvasController();
const test1ExpectedFlow = shaperSupernodeTestPipeline;
const test2ExpectedFlow = canvasSupernodeTestPipeline;
const test3ExpectedFlow = noSubtypeSupernodeTestPipeline;

describe("Subtypes enumerated for supernodes OK", () => {
	it("should contain shaper subtype", () => {
		deepFreeze(shaperSupernodeTestPipeline);
		canvasController.setPipelineFlow(shaperSupernodeTestPipeline);
		expect(isEqual(JSON.stringify(test1ExpectedFlow), JSON.stringify(canvasController.getPipelineFlow())));
	});
	it("should contain canvas subtype", () => {
		deepFreeze(canvasSupernodeTestPipeline);
		canvasController.setPipelineFlow(canvasSupernodeTestPipeline);
		expect(isEqual(JSON.stringify(test2ExpectedFlow), JSON.stringify(canvasController.getPipelineFlow())));
	});
	it("should contain no subtype if no subtype is specified", () => {
		deepFreeze(noSubtypeSupernodeTestPipeline);
		canvasController.setPipelineFlow(noSubtypeSupernodeTestPipeline);
		expect(isEqual(JSON.stringify(test3ExpectedFlow), JSON.stringify(canvasController.getPipelineFlow())));
	});
});
