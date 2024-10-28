describe("Test for verifying WYSIWYG comments functionality in the application", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedWYSIWYGComments": true });
		cy.rightClickToDisplayContextMenu(500, 50);
		cy.verifyOptionInContextMenu("New WYSIWYG comment");
		cy.clickOptionFromContextMenu("New WYSIWYG comment");
		cy.editTextInComment("", "First Comment", false);
	});

	it("Test to verify functionality of font option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-font", "IBM Plex Mono");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "fontFamily", styleValue: "IBM Plex Mono" });
	});

	it("Test to verify functionality of text size option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-text-size", "18");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "fontSize", styleValue: "18px" });
	});

	it("Test to verify functionality of bold option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("bold");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "fontWeight", styleValue: "600" });
	});

	it("Test to verify functionality of italics option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("italics");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "fontStyle", styleValue: "italic" });
	});

	it("Test to verify functionality of underline option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("underline");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "textDecoration", styleValue: "underline" });
	});

	it("Test to verify functionality of striketrough option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("strikethrough");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "textDecoration", styleValue: "line-through" });
	});

	it("Test to verify functionality of text color option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-text-color", "#A2191F");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "color", styleValue: "rgb(162, 25, 31)" });
	});

	it("Test to verify functionality of horizontal align option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-align-horiz", "Center");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "textAlign", styleValue: "center" });
	});

	it("Test to verify functionality of vertical align option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-align-vert", "Bottom");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "verticalAlign", styleValue: "bottom" });
	});

	it("Test to verify functionality of background color option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("submenu-background-color", "#0E6027");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "backgroundColor", styleValue: "rgb(14, 96, 39)" });
	});

	it("Test to verify functionality of outline option in WYSIWYG toolbar", function() {
		cy.clickTextToolbarOption("sub-menu-outline", "Solid outline");
		cy.clickCanvasAt(5, 5);
		cy.verifyWysiwygCommentStyles({ styleName: "outline", styleValue: "solid" });
	});
});
