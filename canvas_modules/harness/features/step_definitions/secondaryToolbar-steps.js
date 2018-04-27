/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


module.exports = function() {

	/* global browser */

	this.Then("I click on the secondary toolbar create comment button", function() {
		browser.$("#addComment-action").click();
	});

	this.Then("I click on the extra canvas secondary toolbar create comment button", function() {
		browser.$$("#addComment-action")[1].click();
	});

	this.Then("I click on the secondary toolbar delete button", function() {
		browser.$("#delete-action").click();
	});

	this.Then("I click on the secondary toolbar horizontal layout button", function() {
		browser.$("#arrangeHorizontally-action").click();
	});

	this.Then("I click on the secondary toolbar vertical layout button", function() {
		browser.$("#arrangeVertically-action").click();
	});

	this.Then("I click on the secondary toolbar cut button", function() {
		browser.$("#cut-action").click();
	});

	this.Then("I click on the secondary toolbar copy button", function() {
		browser.$("#copy-action").click();
	});

	this.Then("I click on the secondary toolbar paste button", function() {
		browser.$("#paste-action").click();
	});

	this.Then("I click on the secondary toolbar open notification button", function() {
		browser.$("#notification-open-action").click();
	});

	this.Then("I click on the secondary toolbar close notification button", function() {
		browser.$("#notification-close-action").click();
	});

	this.Then("I click on the secondary toolbar overflow button", function() {
		browser.$("#overflow-action").click();
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
					expect(action.$("a").getAttribute("class")).toEqual("list-item list-item-disabled ");
					break;
				}
				expect(action.$("a").getAttribute("class")).toEqual("list-item ");
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
};
