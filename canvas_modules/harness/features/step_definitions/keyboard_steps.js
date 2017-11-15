/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { clickSVGAreaAt } from "./utilities/validateUtil.js";

/* global browser */

module.exports = function() {

	this.Then("I press Ctrl/Cmnd+Z to Undo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "z", "Control", "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Shift+Z to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "Shift", "z", "Control", "Shift", "z"]);
	});

	this.Then("I press Ctrl/Cmnd+Y to Redo", function() {
		clickSVGAreaAt(1, 1); // Put foucs on the SVG area, ready for key press
		browser.keys(["Control", "y", "Control", "y"]);
	});

};
