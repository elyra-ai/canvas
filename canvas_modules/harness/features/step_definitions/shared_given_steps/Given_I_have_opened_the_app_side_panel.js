/*
 * Copyright 2017-2020 IBM Corporation
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

module.exports = function() {

/* global browser */

	this.Given("I have toggled the app side panel", function() {
		browser.$("#harness-action-bar-sidepanel-canvas").click("a");
		browser.pause(600);
	});

	this.Given("I have toggled the app side common-properties panel", function() {
		browser.$("#harness-action-bar-sidepanel-modal").click("a");
		browser.pause(550);
	});

	this.Given("I have toggled the app side api panel", function() {
		browser.$("#harness-action-bar-sidepanel-api").click("a");
		browser.pause(550);
	});

	this.Then("I click the download button", function() {
		browser.$("[data-tip=download]").click();
	});

};
