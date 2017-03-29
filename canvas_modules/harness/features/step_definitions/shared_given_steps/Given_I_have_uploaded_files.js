module.exports = function() {

	/* global browser */
	const baseFileDir = process.env.TRAVIS_BUILD_DIR;

	this.Then(/^I have uploaded diagram "([^"]*)$/, function(diagramFile) {
		var canvasInput = browser.$("#canvasFileInput");
		browser.pause(500);
		// this will not work with relative paths
		canvasInput.setValue(baseFileDir + diagramFile);
		browser.$(".canvasField").click("a");
	});

	this.Then(/^I have uploaded palette "([^"]*)"$/, function(paletteFile) {
		var paletteInput = browser.$("#paletteJsonInput");
		browser.pause(500);
		// this will not work with relative paths
		paletteInput.setValue(baseFileDir + paletteFile);
		browser.$("#sidepanel-palette-input").click("a");
	});
};
