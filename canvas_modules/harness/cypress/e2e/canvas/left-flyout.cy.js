describe("Test for verifying the Left Flyout panel functionality and layout in the application", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPaletteLayout": "None" });
		cy.setCanvasConfig({ "selectedShowLeftFlyout": true });
	});

	it("Test ensuring the Left Flyout panel has the correct default size", function() {
		cy.verifyLeftFlyoutPanelWidth(300);
        cy.verifyLeftFlyoutPanelHeight(750);
	});

    it("Test ensuring the Left Flyout panel has the correct size when positioned under the Canvas toolbar", function() {
        cy.setCanvasConfig({ "selectedLeftFlyoutUnderToolbar": true });
		cy.verifyLeftFlyoutPanelWidth(300);
        cy.verifyLeftFlyoutPanelHeight(709);
	});
});
