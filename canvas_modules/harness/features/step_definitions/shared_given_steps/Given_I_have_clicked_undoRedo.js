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

	this.Then("I click undo", function() {
		var undoButton = browser.$$(".navbar-li")[6].$(".isvg").$("svg");
		undoButton.click();
	});

	this.Then("I click redo", function() {
		var redoButton = browser.$$(".navbar-li")[7].$(".isvg").$("svg");
		redoButton.click();
	});

};
