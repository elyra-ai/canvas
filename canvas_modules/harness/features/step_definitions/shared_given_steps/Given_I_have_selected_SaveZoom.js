/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

module.exports = function() {

	/* global browser */

	this.Then(/^I have selected the "([^"]*)" save zoom parameter$/, function(saveZoom) {

		try {
			if (saveZoom === "None") {
				var noneLabel = browser.$("#harness-sidepanel-save-zoom").$$(".radioButtonWrapper")[0].$("label");
				noneLabel.scroll();
				browser.pause(500);
				noneLabel.click();
			} else if (saveZoom === "LocalStorage") {
				var localStorageLabel = browser.$("#harness-sidepanel-save-zoom").$$(".radioButtonWrapper")[1].$("label");
				localStorageLabel.scroll();
				browser.pause(500);
				localStorageLabel.click();
			} else if (saveZoom === "Pipelineflow") {
				var pipelineflowLabel = browser.$("#harness-sidepanel-save-zoom").$$(".radioButtonWrapper")[2].$("label");
				pipelineflowLabel.scroll();
				browser.pause(500);
				pipelineflowLabel.click();
			}
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});
};
