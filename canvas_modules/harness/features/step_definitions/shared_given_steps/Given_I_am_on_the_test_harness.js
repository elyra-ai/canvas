module.exports = function() {
	
	this.setDefaultTimeout(120 * 1000);

	/* global browser */

	const testUrl = process.env.UI_TEST_URL;

	this.Given("I am on the test harness", function() {
		browser.url(testUrl);
	});
};
