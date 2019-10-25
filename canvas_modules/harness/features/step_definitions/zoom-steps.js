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
