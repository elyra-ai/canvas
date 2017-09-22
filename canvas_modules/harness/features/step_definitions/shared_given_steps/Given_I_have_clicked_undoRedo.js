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
		browser.$("#undo-action").click();
	});

	this.Then("I click redo", function() {
		browser.$("#redo-action").click();
	});

};
