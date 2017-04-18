import { getURL } from "../utilities/test-config.js";

module.exports = function() {

	this.setDefaultTimeout(120 * 1000);

	/* global browser */

	this.Given("I am on the test harness", function() {
		browser.url(getURL());
	});
};
