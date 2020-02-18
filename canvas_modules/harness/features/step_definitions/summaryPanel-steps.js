/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
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
		category.$(".properties-category-title").click();
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

	this.Then(/^I hover over the validation icon in the "([^"]*)" summary panel$/, function(summaryPanelId) {
		// open the category
		const summaryPanel = browser.$("div[data-id='properties-" + summaryPanelId + "']");
		expect(summaryPanel).not.toBe(null);
		// find the validation icon
		const icon = summaryPanel.$(".tooltip-container");
		icon.moveToObject();
		browser.pause(1000);
	});

	this.Then(/^I verify the tip for the validation icon in the "([^"]*)" summary panel is visible with text "([^"]*)"$/, function(summaryPanelId, text) {
		// open the category
		const summaryPanel = browser.$("div[data-id='properties-" + summaryPanelId + "']");
		expect(summaryPanel).not.toBe(null);
		// find the validation icon
		const icon = summaryPanel.$(".tooltip-container");
		// verify tooltip
		let visibleTip;
		const tips = browser.$(".common-canvas-tooltip");
		for (var idx = 0; idx < tips.length; idx++) {
			const tip = tips[idx];
			if (tip.getText() === text) {
				visibleTip = tip;
				break;
			}
		}
		if (visibleTip) {
			expect(visibleTip.getAttribute("aria-hidden") === "false").toEqual(true);
			const containerLeft = icon.getLocation().x;
			const tipLeft = visibleTip.getLocation().x;
			const containerTop = icon.getLocation().y;
			const tipTop = visibleTip.getLocation().y;
			expect(tipLeft).toBeGreaterThan(containerLeft);
			expect(tipTop).toBeGreaterThan(containerTop);
		}
	}
	);

	this.Then(/^I verify that the "([^"]*)" control is displayed$/, function(controlId) {
		const control = browser.$("div[data-id='properties-ci-" + controlId + "']");
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

	this.Then(/^I verify the "([^"]*)" summary in the "([^"]*)" category contains more than ten rows$/,
		function(linkName, categoryName) {
			const category = findCategory(categoryName);
			expect(category).not.toBe(null);

			const summaryContainer = findSummaryContainer(category, linkName);
			expect(summaryContainer).not.toBe(null);
			const summaryTablePlaceholder = summaryContainer.$(".control-summary-table").getText();

			expect(summaryTablePlaceholder).toBe("More than ten fields...");
		});

	this.Then(/^I verify that the "([^"]*)" panel wideflyout dialog has opened$/,
		function(panelName) {
			const panel = browser.$("div[data-id='properties-" + panelName + "']");
			expect(panel).not.toBe(null);
			const wideFlyOutClassElement = panel.$(".properties-wf-content.show");
			expect(wideFlyOutClassElement.value).not.toBe(null);
		});

	function findCategory(categoryName) {
		// find the catergory
		const categories = browser.$(".right-flyout-panel").$$(".properties-category-container");
		var category = null;
		for (let idx = 0; idx < categories.length; idx++) {
			const panel = categories[idx];
			if (panel.$(".properties-category-title").getText() === categoryName) {
				category = panel;
				break;
			}
		}
		return category;
	}

	function findSummaryLinkButton(category, linkName) {
		const summaryLinks = category.$$(".properties-summary-link-button");
		var linkButton = null;
		for (let idx = 0; idx < summaryLinks.length; idx++) {
			const button = summaryLinks[idx];
			if (button.$(".properties-icon-button-label").getText() === linkName) {
				linkButton = button;
				break;
			}
		}
		return linkButton;
	}


	function findSummaryContainer(category, linkName) {
		const summaryLinks = category.$$(".properties-summary-link-button");
		var summaryContainer = null;
		for (let idx = 0; idx < summaryLinks.length; idx++) {
			const summary = summaryLinks[idx];
			if (summary.$(".properties-icon-button-label").getText() === linkName) {
				summaryContainer = summary;
				break;
			}
		}
		return summaryContainer;
	}


};
