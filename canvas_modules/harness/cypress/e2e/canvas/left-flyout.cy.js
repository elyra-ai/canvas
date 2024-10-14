describe("Test for verifying the Left Flyout panel functionality and layout in the application", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "None" });
		cy.setCanvasConfig({ "selectedShowLeftFlyout": true });
	});

	it("Test ensuring Left Flyout panel is open", function() {
		cy.verifyLeftFlyoutPanelWidth(300);
	});
});
