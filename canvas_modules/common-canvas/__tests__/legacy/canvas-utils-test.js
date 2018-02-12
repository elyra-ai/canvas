/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import CanvasUtils from "../../src/legacy/canvas-utils.js";
import { assert } from "chai";


describe("canvas-utils.js", () => {

	it("getArrowheadPoints test", () => {
		const dataParam = {
			"x1": 662,
			"y1": 141,
			"x2": 876,
			"y2": 385
		};
		const zoomParam = 1.3;
		const expectedArrowheadPoints = {
			"p1": {
				"x": 828,
				"y": 336
			},
			"p2": {
				"x": 837,
				"y": 341
			},
			"p3": {
				"x": 833,
				"y": 332
			}
		};
		const result = CanvasUtils.getArrowheadPoints(dataParam, zoomParam);
		assert.deepEqual(result, expectedArrowheadPoints);
	});

	it("getLinePointOnHalo test", () => {
		const dataParam = {
			"x1": 683,
			"y1": 172,
			"x2": 902,
			"y2": 341
		};
		const zoomParam = 1.3;
		const expectedPosHalo = {
			"x": 856,
			"y": 305
		};
		assert.deepEqual(CanvasUtils.getLinePointOnHalo(dataParam, zoomParam), expectedPosHalo);
	});
});
