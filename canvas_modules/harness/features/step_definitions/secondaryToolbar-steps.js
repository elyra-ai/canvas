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


	this.Then("I click the undo button on the toolbar", function() {
		browser.$("#undo-action").click();
	});

	this.Then("I click the redo button on the toolbar", function() {
		browser.$("#redo-action").click();
	});

	this.Then("I click the create comment button on the toolbar", function() {
		browser.$("#addComment-action").click();
	});

	this.Then("I click the delete button on the toolbar", function() {
		browser.$("#delete-action").click();
	});

	this.Then("I click the horizontal layout button on the toolbar", function() {
		browser.$("#arrangeHorizontally-action").click();
	});

	this.Then("I click the vertical layout button on the toolbar", function() {
		browser.$("#arrangeVertically-action").click();
	});

	this.Then("I click the cut button on the toolbar", function() {
		browser.$("#cut-action").click();
	});

	this.Then("I click the copy button on the toolbar", function() {
		browser.$("#copy-action").click();
	});

	this.Then("I click the paste button on the toolbar", function() {
		browser.$("#paste-action").click();
	});

	this.Then("I click the overflow button on the toolbar", function() {
		browser.$("#overflow-action").click();
	});

	this.Then("I click the zoom in button on the toolbar", function() {
		browser.$("#zoomIn-action").click();
	});

	this.Then("I click the zoom out button on the toolbar", function() {
		browser.$("#zoomOut-action").click();
	});

	this.Then("I click the zoom to fit button on the toolbar", function() {
		browser.$("#zoomToFit-action").click();
	});

	this.Then("I click the open notification button on the toolbar", function() {
		browser.$("#notification-open-action").click();
	});

	this.Then("I click the close notification button on the toolbar", function() {
		browser.$("#notification-close-action").click();
	});

	/* Extra canvas - toolbar actions */

	this.Then("I click the create comment button on the toolbar on the extra canvas", function() {
		browser.$$("#addComment-action")[1].click();
	});

	this.Then("I click the paste button on the toolbar on the extra canvas", function() {
		browser.$$("#paste-action")[1].click();
	});

	this.Then("I click the zoom in button on the toolbar on the extra canvas", function() {
		browser.$$("#zoomIn-action")[1].click();
	});

	this.Then("I click the zoom out button on the toolbar on the extra canvas", function() {
		browser.$$("#zoomOut-action")[1].click();
	});

	this.Then("I click the zoom to fit button on the toolbar on the extra canvas", function() {
		browser.$$("#zoomToFit-action")[1].click();
	});


	this.Then(/^I resize the window size to (\d+) width and (\d+) height$/, function(widthNumber, heightNumber) {

		browser.setViewportSize({
			width: Number(widthNumber),
			height: Number(heightNumber),
			type: false
		});

	});

	this.Then(/^I verify the number of items in the secondary toolbar are (\d+)$/, function(numberOfItems) {

		var totalItemsLength = browser.$("#toolbar-items").$$("li");
		var itemsHidden = browser.$("#actions-container").$$("#overflow-action")[0].$$(".toolbar-popover-list-hide")[0].$$("li");

		var itemsVisible = totalItemsLength.length - itemsHidden.length;

		expect(itemsVisible).toEqual(Number(numberOfItems));

	});

	this.Then(/^I verify the action "([^"]*)" in the toolbar is "([^"]*)"$/, function(actionId, iconState) {
		const actionItems = browser.$("#toolbar-items").$$("li");
		let actionFound = false;
		for (const action of actionItems) {
			if (action.getAttribute("id") === actionId) {
				actionFound = true;
				if (iconState === "disabled") {
					expect(action.$("a").getAttribute("class")).toEqual("list-item list-item-disabled");
					break;
				}
				expect(action.$("a").getAttribute("class")).toEqual("list-item");
				break;
			}
		}
		expect(actionFound).toEqual(true);
	});

	this.Then(/^I verify the action "([^"]*)" in the toolbar has svg of type "([^"]*)"$/, function(actionId, svgType) {
		const actionItems = browser.$("#toolbar-items").$$("li");
		let actionFound = false;
		for (const action of actionItems) {
			if (action.getAttribute("id") === actionId) {
				actionFound = true;
				expect(action.$("svg").getAttribute("type")).toEqual(svgType);
			}
		}
		expect(actionFound).toEqual(true);
	});

	this.Then(/^I verify the action "([^"]*)" in the toolbar has svg with className "([^"]*)"$/, function(actionId, svgClassName) {
		const actionItems = browser.$("#toolbar-items").$$("li");
		let actionFound = false;
		for (const action of actionItems) {
			if (action.getAttribute("id") === actionId) {
				actionFound = true;
				expect(action.$("svg").getAttribute("class")).toEqual(svgClassName);
			}
		}
		expect(actionFound).toEqual(true);
	});
};
