module.exports = function() {

/* global browser */

	this.Given("I have toggled the app side panel", function() {
		browser.$("#action-bar-sidepanel").click("a");
	});

};
