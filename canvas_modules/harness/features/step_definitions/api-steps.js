/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import { dropdownSelect } from "./utilities/test-utils.js";
import { findCategoryElement } from "./utilities/validate-utils.js";

/* eslint no-console: "off" */
/* global browser */

var nconf = require("nconf");
module.exports = function() {

	this.When(/^I enter "([^"]*)" into the Category id field$/, function(textboxValue) {
		var textbox = browser.$("#harness-categoryId");
		textbox.setValue("", textboxValue);
	});

	this.When(/^I enter "([^"]*)" into the Category name field$/, function(textboxValue) {
		var textbox = browser.$("#harness-categoryName");
		textbox.setValue("", textboxValue);
	});

	this.When(/^I enter "([^"]*)" into the new label field$/, function(textboxValue) {
		var textbox = browser.$("#harness-newLabel");
		textbox.setValue("", textboxValue);
	});

	this.When("I call the API by clicking on the Submit button", function() {
		var submitButton = getAPISubmitButton();
		submitButton.click();
	});

	this.Then(/^I select node "([^"]*)" in the node label drop-down list$/, function(nodeName) {
		dropdownSelect(browser.$("#harness-sidepanel-api-nodePortSelection"), nodeName);
	});

	this.Then(/^I select node "([^"]*)" in the node drop-down list$/, function(nodeName) {
		dropdownSelect(browser.$("#harness-sidepanel-api-nodeSelection"), nodeName);
	});

	this.Then(/^I select link "([^"]*)" in the link drop-down list$/, function(linkName) {
		dropdownSelect(browser.$("#harness-sidepanel-api-linkSelection"), linkName);
	});

	this.Then(/^I select port "([^"]*)" in the port drop-down list$/, function(portName) {
		dropdownSelect(browser.$("#harness-sidepanel-api-portSelection"), portName);
	});

	this.Then(/^I verify that "([^"]*)" was added in palette category "([^"]*)"$/, function(nodeTypeName, categoryName) {
		if (nconf.get("paletteLayout") === "Modal") {
			// select import categories
			var categoryElemModal = findCategoryElementModal(categoryName);
			expect(categoryElemModal).not.toEqual(null);
			categoryElemModal.click();

			const nodeIndexModal = findNodeIndexModal(nodeTypeName);
			expect(nodeIndexModal).not.toEqual(-1);
		} else {
			var categoryElem = findCategoryElement(categoryName);
			expect(categoryElem).not.toEqual(null);
			categoryElem.click();
			// find node index
			const nodeIndex = findNodeIndex(nodeTypeName);
			expect(nodeIndex).not.toEqual(-1);
		}

	});

	// Double up the double quotes in this step to allow JSON containing double quotes
	// to be specified in the feature file.
	this.Then(/^I update the decorations text area with ""([^']*)""$/, function(decoratorsJSON) {
		const textField = browser.$("#harness-sidepanel-api-decorations").$("textarea");
		textField.setValue(decoratorsJSON);
	});

	this.When(/^I update the pipelineflow to add input and output ports to node "([^"]*)"$/, function(nodeName) {
		const textField = browser.$("#harness-sidepanel-api-pipelineFlow").$("textarea");
		const pipelineFlow = JSON.parse(textField.getText());
		const nodeList = pipelineFlow.pipelines[0].nodes;
		const node = nodeList.find((nd) => nd.app_data.ui_data.label === nodeName);
		const newInputPort = {
			"id": "inPort2",
			"app_data": {
				"ui_data": {
					"cardinality": {
						"min": 0,
						"max": 1
					},
					"label": "Input Port2"
				}
			},
			"links": []
		};

		const newOutputPort = {
			"id": "outPort2",
			"app_data": {
				"ui_data": {
					"cardinality": {
						"min": 0,
						"max": -1
					},
					"label": "Output Port2"
				}
			}
		};

		node.inputs.push(newInputPort);
		node.outputs.push(newOutputPort);
		textField.setValue(JSON.stringify(pipelineFlow));
	});

	this.Then(/^I click on the toggle with label "([^"]*)" in the api sidepanel$/, function(toggleLabel) {
		const apiSidePanel = browser.$("#harness-sidepanel-api-notificationMessages");
		const labels = apiSidePanel.$$("label");
		let toggleFound = false;
		for (const label of labels) {
			if (label.getAttribute("for") === toggleLabel) {
				label.click();
				toggleFound = true;
				break;
			}
		}
		expect(toggleFound).toEqual(true);
	});

	this.Then(/^I have selected the "([^"]*)" message type in the api sidepanel$/, function(messageType) {
		const apiSidePanel = browser.$("#harness-sidepanel-api-nm-types");
		const radioOptions = apiSidePanel.$$(".radioButtonWrapper");
		try {
			if (messageType === "informational") {
				const informational = radioOptions[0].$("label");
				informational.scroll();
				browser.pause(500);
				informational.click();
			} else if (messageType === "success") {
				const success = radioOptions[1].$("label");
				success.scroll();
				browser.pause(500);
				success.click();
			} else if (messageType === "warning") {
				const warning = radioOptions[2].$("label");
				warning.scroll();
				browser.pause(500);
				warning.click();
			} else if (messageType === "error") {
				const error = radioOptions[3].$("label");
				error.scroll();
				browser.pause(500);
				error.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

	this.When(/^I enter "([^"]*)" into the message details field$/, function(textboxValue) {
		const apiSidePanel = browser.$("#harness-sidepanel-api-notificationMessages");
		const textbox = apiSidePanel.$("#harness-sidepanel-api-nm-content textarea");
		textbox.setValue("", textboxValue);
	});

	function getAPISubmitButton() {
		return browser.$("#harness-sidepanel-api-submit").$("button");
	}

	function findNodeIndexModal(nodeType) {
		var listItems = browser.$$(".palette-grid-node-text");
		for (var idx = 0; idx < listItems.length; idx++) {
			var nodeText = listItems[idx].getText();
			if (nodeText === nodeType) {
				return idx;
			}
		}
		return -1;
	}

	function findNodeIndex(nodeType) {
		var listItems = browser.$$(".palette-list-item");
		for (var idx = 0; idx < listItems.length; idx++) {
			var nodeText = listItems[idx].$(".palette-list-item-text-div").$(".palette-list-item-text-span")
				.getText();
			if (nodeText === nodeType) {
				return idx;
			}
		}
		return -1;
	}

	function findCategoryElementModal(nodeCategory) {
		for (var cat of browser.$$(".palette-category")) {
			if (cat.getText() === nodeCategory) {
				return cat;
			}
		}
		return null;
	}

};
