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

	this.Then("I click zoom in", function() {
		browser.$("#zoomIn-action").click();
	});

	this.Then("I click zoom out", function() {
		browser.$("#zoomOut-action").click();
	});

	this.Then("I click zoom to fit", function() {
		browser.$("#zoomToFit-action").click();
	});

	this.Then("I click extra canvas zoom in", function() {
		browser.$$("#zoomIn-action")[1].click();
	});

	this.Then("I click extra canvas zoom out", function() {
		browser.$$("#zoomOut-action")[1].click();
	});

	this.Then("I click extra canvas zoom to fit", function() {
		browser.$$("#zoomToFit-action")[1].click();
	});


	this.Then(/^I verify zoom transform value is "([^"]*)"$/, function(givenZoomTransform) {
		var actualZoomTransform = browser.$(".svg-area").$$("g")[0].getAttribute("transform");
		expect(String(actualZoomTransform)).toEqual(givenZoomTransform);
	});

	this.Then(/^I verify extra canvas zoom transform value is "([^"]*)"$/, function(givenZoomTransform) {
		var actualZoomTransform = browser.$$(".svg-area")[1].$$("g")[0].getAttribute("transform");
		expect(String(actualZoomTransform)).toEqual(givenZoomTransform);
	});
};
