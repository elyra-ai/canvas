/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("Test creating comments", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test adding a comment using the toolbar without snap to grid", function() {
		cy.clickToolbarAddComment();
		cy.verifyCreateAutoCommentCommand(30, 50);

		// Change the text and test its position
		cy.editTextInComment("", "First comment");
		cy.verifyCommentTransform("First comment", 30, 50);

		// Second comment should be offset from the first by 10px (with no snap to grid).
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Second comment");
		cy.verifyCommentTransform("Second comment", 40, 60);
	});

	it("Test adding a comment using the toolbar with snap to grid: During", function() {
		cy.setCanvasConfig({ "selectedSnapToGridType": "During" });
		cy.clickToolbarAddComment();
		cy.verifyCreateAutoCommentCommand(35, 45);

		// Change the text and test its position
		cy.editTextInComment("", "First comment");
		cy.verifyCommentTransform("First comment", 35, 45);

		// Second comment should be offset from the first by 18px (with snap to grid).
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Second comment");
		cy.verifyCommentTransform("Second comment", 53, 60);
	});

	it("Test adding a comment using the toolbar with snap to grid: After", function() {
		cy.setCanvasConfig({ "selectedSnapToGridType": "After" });
		cy.clickToolbarAddComment();
		cy.verifyCreateAutoCommentCommand(35, 45);

		// Change the text and test its position
		cy.editTextInComment("", "First comment");
		cy.verifyCommentTransform("First comment", 35, 45);

		// Second comment should be offset from the first by 18px (with snap to grid).
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Second comment");
		cy.verifyCommentTransform("Second comment", 53, 60);
	});

	it("Test that after editing a comment the comment is still selected", function() {
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "First comment");
		cy.verifyCommentIsSelected("First comment");
	});
});

describe("Test creating a comment in main flow with toolbar and context menu", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test creating a comment using context menu, link comment to node, resize the comment", function() {
		// Create a new comment and add text to it
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");
		cy.editTextInComment("", "Hello Canvas!");
		cy.verifyNumberOfComments(1);

		// Test manually linking the comment to a node
		cy.verifyNumberOfCommentLinks(0);
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Record Ops");
		cy.dragNodeToPosition("Sample", 800, 450);
		cy.linkCommentToNode("Hello Canvas!", "Sample");
		cy.verifyNumberOfCommentLinks(1);

		// Test sizing the comment, using the sizing area, to the right and downwards.
		cy.resizeComment("Hello Canvas!", "south-east", 120, 80);
		cy.verifyCommentDimensions("Hello Canvas!", 120, 80);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "south-west", 130, 90);
		cy.verifyCommentDimensions("Hello Canvas!", 130, 90);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-west", 140, 100);
		cy.verifyCommentDimensions("Hello Canvas!", 140, 100);

		// Test sizing the comment, using the sizing area, to the left and downwards.
		cy.resizeComment("Hello Canvas!", "north-east", 150, 110);
		cy.verifyCommentDimensions("Hello Canvas!", 150, 110);

		// Size the comment to the left
		cy.resizeCommentOneDirection("Hello Canvas!", "west", 170);
		cy.verifyCommentDimensions("Hello Canvas!", 170, 110);

		// Size the comment to the right
		cy.resizeCommentOneDirection("Hello Canvas!", "east", 200);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 110);

		//  Size the comment upwards
		cy.resizeCommentOneDirection("Hello Canvas!", "north", 100);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 100);

		// Size the comment downwards
		cy.resizeCommentOneDirection("Hello Canvas!", "south", 150);
		cy.verifyCommentDimensions("Hello Canvas!", 200, 150);
	});
});

describe("Test creating comment from toolbar and editing them within supernodes", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test creating a comment using toolbar, add comment to node, add comment to supernode," +
	" edit comments in nested supernode", function() {
		// Create a node so we can add a comment which is linked to it
		cy.clickToolbarPaletteOpen();
		cy.clickCategory("Import");
		cy.dragNodeToPosition("Var. File", 400, 300);

		// Add a comment using the toolbar (which should link the node to the comment)
		cy.clickNode("Var. File");
		cy.clickToolbarAddComment();
		cy.verifyNumberOfCommentLinks(1);
		cy.editTextInComment("", "Inner node");

		// Add the node and comment to a supernode
		cy.getNodeWithLabel("Var. File").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Add a comment to the supernode
		cy.clickNode("Supernode");
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Inner Supernode");

		// Create a supernode to contain the supernode and its comment
		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Create supernode");

		// Open the supernode
		cy.getNodeWithLabel("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Open the inner supernode
		cy.getNodeWithLabelInSubFlow("Supernode").rightclick();
		cy.clickOptionFromContextMenu("Expand supernode");

		// Test editing the inner comment and the nested comment
		cy.editTextInCommentInSubFlow("Inner Supernode", "New Inner Supernode text");
		cy.editTextInCommentInSubFlowNested("Inner node", "New Inner node text");
	});
});

describe("Test coloring comments", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Create a comment and color it", function() {
		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");
		cy.editTextInComment("", "Hello Canvas!");

		cy.getCommentWithText("Hello Canvas!")
			.rightclick();
		cy.clickColorFromContextSubmenu("Color background", "teal-50");
		cy.wait(10);
		cy.verifyCommentColor("Hello Canvas!", "teal-50");
	});

	it("Color multiple colored comments and undo", function() {
		cy.openCanvasDefinition("commentNewColorsCanvas.json", true);

		cy.getCommentWithText("Default").click();
		cy.ctrlOrCmdClickComment("White 0");
		cy.ctrlOrCmdClickComment("Yellow 20");
		cy.ctrlOrCmdClickComment("Red 50");
		cy.ctrlOrCmdClickComment("Orange 40");

		cy.getCommentWithText("Orange 40").rightclick();
		cy.clickColorFromContextSubmenu("Color background", "cyan-20");

		cy.wait(10);
		cy.verifyCommentColor("Default", "cyan-20");
		cy.verifyCommentColor("White 0", "cyan-20");
		cy.verifyCommentColor("Yellow 20", "cyan-20");
		cy.verifyCommentColor("Red 50", "cyan-20");
		cy.verifyCommentColor("Orange 40", "cyan-20");

		cy.clickToolbarUndo();

		cy.wait(10);
		cy.verifyCommentColor("Default", "");
		cy.verifyCommentColor("White 0", "white-0");
		cy.verifyCommentColor("Yellow 20", "yellow-20");
		cy.verifyCommentColor("Red 50", "red-50");
		cy.verifyCommentColor("Orange 40", "orange-40");

		cy.clickToolbarRedo();

		cy.wait(10);
		cy.verifyCommentColor("Default", "cyan-20");
		cy.verifyCommentColor("White 0", "cyan-20");
		cy.verifyCommentColor("Yellow 20", "cyan-20");
		cy.verifyCommentColor("Red 50", "cyan-20");
		cy.verifyCommentColor("Orange 40", "cyan-20");
	});
});

describe("Test edting a comment using the text toolbar to add markdown syntax", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });
	});

	it("Test adding title markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some title text!",
			textToHighlight: "title",
			action: "headerStyle",
			menuAction: "Title",
			markdownText: "# Some title text!",
			html: "<h1>Some title text!</h1>\n"
		});
	});

	it("Test adding header markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some header text!",
			textToHighlight: "header",
			action: "headerStyle",
			menuAction: "Header",
			markdownText: "## Some header text!",
			html: "<h2>Some header text!</h2>\n"
		});
	});

	it("Test adding subheader markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some subheader text!",
			textToHighlight: "subheader",
			action: "headerStyle",
			menuAction: "Subheader",
			markdownText: "### Some subheader text!",
			html: "<h3>Some subheader text!</h3>\n"
		});
	});

	it("Test adding body markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "## Some body text!", // Set initial text to be a header so it can change to body.
			textToHighlight: "body",
			action: "headerStyle",
			menuAction: "Body",
			markdownText: "Some body text!",
			html: "<p>Some body text!</p>\n"
		});
	});

	it("Test adding bold markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some bold text!",
			textToHighlight: "bold",
			action: "bold",
			markdownText: "Some **bold** text!",
			html: "<p>Some <strong>bold</strong> text!</p>\n"
		});
	});

	it("Test adding italics markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some italics text!",
			textToHighlight: "italics",
			action: "italics",
			markdownText: "Some _italics_ text!",
			html: "<p>Some <em>italics</em> text!</p>\n"
		});
	});

	it("Test adding strikethrough markdown using a keyboard shortcut.", function() {
		addMarkdownWithToolbar({
			initialText: "Some strikethrough text!",
			textToHighlight: "strikethrough",
			action: "strikethrough",
			markdownText: "Some ~~strikethrough~~ text!",
			html: "<p>Some <s>strikethrough</s> text!</p>\n"
		});
	});

	it("Test adding code markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some code text!",
			textToHighlight: "code",
			action: "code",
			markdownText: "Some `code` text!",
			html: "<p>Some <code>code</code> text!</p>\n"
		});
	});

	it("Test adding link markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some link text!",
			textToHighlight: "link",
			action: "link",
			markdownText: "Some [link](url) text!",
			html: "<p>Some <a href=\"url\">link</a> text!</p>\n"
		});
	});

	it("Test adding quote markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some quote text!",
			textToHighlight: "quote",
			action: "quote",
			markdownText: "> Some quote text!\n",
			html: "<blockquote>\n<p>Some quote text!</p>\n</blockquote>\n"
		});
	});

	it("Test adding numbered list markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some numbered list text!",
			textToHighlight: "numberedList",
			action: "numberedList",
			markdownText: "1. Some numbered list text!\n",
			html: "<ol>\n<li>Some numbered list text!</li>\n</ol>\n"
		});
	});

	it("Test adding bulleted list markdown.", function() {
		addMarkdownWithToolbar({
			initialText: "Some bulleted list text!",
			textToHighlight: "bulletedList",
			action: "bulletedList",
			markdownText: "* Some bulleted list text!\n",
			html: "<ul>\n<li>Some bulleted list text!</li>\n</ul>\n"
		});
	});
});

describe("Test edting a comment using keyboard shortcuts to add markdown syntax", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });
	});

	it("Test adding title markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some title text!",
			textToHighlight: "title",
			action: "increaseHashes",
			markdownText: "# Some title text!",
			html: "<h1>Some title text!</h1>\n"
		});
	});

	it("Test adding title markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "## Some title text!",
			textToHighlight: "title",
			action: "decreaseHashes",
			markdownText: "# Some title text!",
			html: "<h1>Some title text!</h1>\n"
		});
	});

	it("Test adding bold markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some bold text!",
			textToHighlight: "bold",
			action: "bold",
			markdownText: "Some **bold** text!",
			html: "<p>Some <strong>bold</strong> text!</p>\n"
		});
	});

	it("Test adding italics markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some italics text!",
			textToHighlight: "italics",
			action: "italics",
			markdownText: "Some _italics_ text!",
			html: "<p>Some <em>italics</em> text!</p>\n"
		});
	});

	it("Test adding strikethrough markdown using a keyboard shortcut.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some strikethrough text!",
			textToHighlight: "strikethrough",
			action: "strikethrough",
			markdownText: "Some ~~strikethrough~~ text!",
			html: "<p>Some <s>strikethrough</s> text!</p>\n"
		});
	});

	it("Test adding code markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some code text!",
			textToHighlight: "code",
			action: "code",
			markdownText: "Some `code` text!",
			html: "<p>Some <code>code</code> text!</p>\n"
		});
	});

	it("Test adding link markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some link text!",
			textToHighlight: "link",
			action: "link",
			markdownText: "Some [link](url) text!",
			html: "<p>Some <a href=\"url\">link</a> text!</p>\n"
		});
	});

	it("Test adding quote markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some quote text!",
			textToHighlight: "quote",
			action: "quote",
			markdownText: "> Some quote text!\n",
			html: "<blockquote>\n<p>Some quote text!</p>\n</blockquote>\n"
		});
	});

	it("Test adding numbered list markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some numbered list text!",
			textToHighlight: "numberedList",
			action: "numberedList",
			markdownText: "1. Some numbered list text!\n",
			html: "<ol>\n<li>Some numbered list text!</li>\n</ol>\n"
		});
	});

	it("Test adding bulleted list markdown.", function() {
		addMarkdownWithKeyboard({
			initialText: "Some bulleted list text!",
			textToHighlight: "bulletedList",
			action: "bulletedList",
			markdownText: "* Some bulleted list text!\n",
			html: "<ul>\n<li>Some bulleted list text!</li>\n</ul>\n"
		});
	});
});
describe("Add HTML to Markdown Comments", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });
	});
	it("Test adding html in header markdown.", function() {
		// html: true
		addHTML({
			htmlText: "<h1>Header 1</h1>"
		});

		// if html: false, <h1>Header 1</h1> would become <p>&lt;h1&gt;Header 1&lt;/h1&gt;</p>
	});
});

function addMarkdownWithToolbar(d) {
	cy.clickToolbarAddComment();
	cy.verifyNumberOfComments(1);
	cy.editTextInComment("", d.initialText, false);

	cy.selectTextInComment(d.textToHighlight, d.initialText);
	cy.clickTextToolbarOption(d.action, d.menuAction);

	cy.clickCanvasAt(5, 5);
	cy.verifyCommentContainsHTML(d.markdownText, d.html);
}

function addMarkdownWithKeyboard(d) {
	cy.clickToolbarAddComment();
	cy.verifyNumberOfComments(1);
	cy.editTextInComment("", d.initialText, false);

	cy.selectTextInComment(d.textToHighlight, d.initialText);
	cy.shortcutKeysMarkdown(d.action);

	cy.clickCanvasAt(5, 5);
	cy.verifyCommentContainsHTML(d.markdownText, d.html);
}

function addHTML(d) {
	cy.clickToolbarAddComment();
	cy.verifyNumberOfComments(1);
	cy.editTextInComment("", d.htmlText, false);

	cy.clickCanvasAt(5, 5);
	cy.verifyCommentContainsHTML(d.htmlText, d.htmlText);
}
