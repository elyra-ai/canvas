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
import supernodeSubtypeTestPipeline from "../test_resources/json/supernode_subtypes_flow.json";

const canvasController = new CanvasController();
const expectedFlow = supernodeSubtypeTestPipeline;

describe("Subtypes enumerated for supernodes OK", () => {
	it("should contain shaper, canvas, and non-enumerated subtype", () => {
		deepFreeze(supernodeSubtypeTestPipeline);
		canvasController.setPipelineFlow(supernodeSubtypeTestPipeline);
		expect(isEqual(JSON.stringify(expectedFlow), JSON.stringify(canvasController.getPipelineFlow())));
	});
});
