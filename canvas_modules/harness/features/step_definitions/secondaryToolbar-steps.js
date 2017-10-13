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

	this.Then("I click on the secondary toolbar create comment", function() {
		browser.$("#toolbar-icon-addComment").click();
	});

	this.Then("I click on the secondary toolbar delete button", function() {
		browser.$("#toolbar-icon-delete").click();
	});

	this.Then("I click on the secondary toolbar horizontal layout button", function() {
		browser.$("#toolbar-icon-arrangeHorizontally").click();
	});

	this.Then("I click on the secondary toolbar vertical layout button", function() {
		browser.$("#toolbar-icon-arrangeVertically").click();
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


};
