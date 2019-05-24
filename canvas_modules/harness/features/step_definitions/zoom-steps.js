/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { getCanvasData } from "./utilities/test-utils.js";
import { getZoomForPrimaryPipeline } from "./utilities/validate-utils.js";

module.exports = function() {

	/* global browser */

	this.Then(/^I verify zoom transform value is "([^"]*)"$/, function(givenZoomTransform) {
		var actualZoomTransform = browser.$(".svg-area").$$("g")[0].getAttribute("transform");
		expect(String(actualZoomTransform)).toEqual(givenZoomTransform);
	});

	this.Then(/^I verify extra canvas zoom transform value is "([^"]*)"$/, function(givenZoomTransform) {
		var actualZoomTransform = browser.$$(".svg-area")[1].$$("g")[0].getAttribute("transform");
		expect(String(actualZoomTransform)).toEqual(givenZoomTransform);
	});

	this.Then(/^I verify primary pipeline zoom in canvas info: x = ([-+]?[0-9]*\.?[0-9]+) y = ([-+]?[0-9]*\.?[0-9]+) k = ([-+]?[0-9]*\.?[0-9]+)$/, function(xx, yy, kk) {
		const objectModel = getCanvasData();
		const zoom = getZoomForPrimaryPipeline(objectModel);
		expect(Number(kk)).toEqual(zoom.k);
		expect(Number(xx)).toEqual(zoom.x);
		expect(Number(yy)).toEqual(zoom.y);
	});
};
