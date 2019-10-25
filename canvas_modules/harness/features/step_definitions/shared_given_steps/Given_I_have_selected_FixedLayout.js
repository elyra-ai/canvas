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
/* eslint no-console: "off" */

module.exports = function() {

	/* global browser */

	this.Then(/^I have selected the "([^"]*)" properties container type$/, function(containerType) {

		try {
			if (containerType === "Custom" || containerType === "Flyout") {
				var customContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".radioButtonWrapper")[0].$("label");
				customContainer.scroll();
				browser.pause(500);
				customContainer.click();
			} else if (containerType === "Modal") {
				var modalContainer = browser.$("#harness-sidepanel-properties-container-type").$$(".radioButtonWrapper")[1].$("label");
				modalContainer.scroll();
				browser.pause(500);
				modalContainer.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
