/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global browser */

module.exports = function() {

	this.Then(/^I open the "([^"]*)" category$/, function(categoryName) {
		// open the catergory
		const category = findCategory(categoryName);
		expect(category).not.toBe(null);
		category.$(".category-title-right-flyout-panel").click();
	});

	this.Then(/^I open the "([^"]*)" summary link in the "([^"]*)" category$/, function(linkName, categoryName) {
		// open the catergory
		const category = findCategory(categoryName);
		expect(category).not.toBe(null);

		// open the summary links
		const linkButton = findSummaryLinkButton(category, linkName);
		expect(linkButton).not.toBe(null);
		linkButton.click();
		browser.pause(250);
	});

	this.Then(/^I verify that the "([^"]*)" control is displayed$/, function(controlId) {
		const control = browser.$(".modal-dialog").$("#" + controlId);
		expect(control).not.toBe(null);
	});

	this.Then(/^I verify that the summary list contains the value of "([^"]*)" for the "([^"]*)" summary link in the "([^"]*)" category$/,
		function(arg1, linkName, categoryName) {
			const category = findCategory(categoryName);
			expect(category).not.toBe(null);
		});

	this.Then(/^I verify that the summary list does not contains the value of "([^"]*)" for the "([^"]*)" summary link in the "([^"]*)" category$/,
		function(arg1, linkName, categoryName) {
			const category = findCategory(categoryName);
			expect(category).not.toBe(null);

		});

	this.Then(/^I verify that the summary list for the "([^"]*)" summary link in the "([^"]*)" category is empty$/,
		function(linkName, categoryName) {
			const category = findCategory(categoryName);
			expect(category).not.toBe(null);

			const summaryContainer = findSummaryContainer(category, linkName);
			expect(summaryContainer).not.toBe(null);
			const summaryTable = summaryContainer.$("control-summary-table");
			if (summaryTable.value !== null) { // no summary table is fine, this means that the control inside the summary panel is disable
				// if there is a summary table, then for empty there is one row and the text is empty
				const rowText = summaryTable.$("tr")
					.$("td")
					.getText();
				expect(rowText).toBe("");
			}
		});

	this.Then(/^I verify that a wideflyout dialog has opened$/, function() {
		const wideFlyOutClassElement = browser.$(".rightside-modal-container");
		expect(wideFlyOutClassElement.value).not.toBe(null);
	});

	function findCategory(categoryName) {
		// find the catergory
		const categories = browser.$("#category-parent-container-right-flyout-panel").$$(".category-title-container-right-flyout-panel");
		var category = null;
		for (let idx = 0; idx < categories.length; idx++) {
			const panel = categories[idx];
			if (panel.$(".category-title-right-flyout-panel").getText() === categoryName.toUpperCase()) {
				category = panel;
				break;
			}
		}
		return category;
	}

	function findSummaryLinkButton(category, linkName) {
		const summaryLinks = category.$$(".control-summary-link-buttons");
		var linkButton = null;
		for (let idx = 0; idx < summaryLinks.length; idx++) {
			const button = summaryLinks[idx].$("a");
			if (button.getText() === linkName) {
				linkButton = button;
				break;
			}
		}
		return linkButton;
	}

	function findSummaryContainer(category, linkName) {
		const summaryLinks = category.$$(".control-summary");
		var summaryContainer = null;
		for (let idx = 0; idx < summaryLinks.length; idx++) {
			const summary = summaryLinks[idx];
			if (summary.$("a").getText() === linkName) {
				summaryContainer = summary;
				break;
			}
		}
		return summaryContainer;
	}


};
