/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

/* global browser */

module.exports = function() {

	// Then I verify that there are 1 nodes with a "warning" indicator
	//
	this.Then(/^I verify that there are (\d+) nodes with a "([^"]*)" indicator$/,
		function(numberNodes, msgIndicator) {
			const messageClassName = ".d3-" + msgIndicator + "-circle";
			expect(Number(numberNodes)).toEqual(browser.$("#common-canvas-items-container-0").$$(messageClassName).length);
		});

};
