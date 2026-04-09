/*
 * Copyright 2026 Elyra Authors
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

import key from "../../support/canvas/key.js";

describe("Test comment keyboard navigation", function() {
	beforeEach(() => {
		cy.viewport(1400, 650);
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedKeyboardNavigation": true
		});
	});

	it("Test editing a comment using keyboard", function() {
		cy.setCanvasConfig({
			"selectedMarkdownInComments": true
		});

		createAndEditCommentWithKeyboard("New comment", "Keyboard edited comment");

		// Edit the comment again
		cy.pressOnComment("Keyboard edited comment", key.contextMenu);
		cy.clickOptionFromContextMenu("Edit comment");
		cy.verifyFocusOnCommentEntry();

		// Highlight some text
		cy.selectTextInComment("edited", "Keyboard edited comment");

		// Move focus to the toolbar
		cy.focusFirstTextToolbarButton();

		// Press right arrow key in toolbar to get to the bold button
		cy.moveFocusRightInTextToolbar();

		// Activate the focused toolbar button
		cy.clickFocusedTextToolbarButton();

		// Complete the text entry
		cy.completeTextEntry();

		// Test that the focus is back on the comment
		cy.verifyFocusOnComment("Keyboard **edited** comment");

		// Verify that the subset of the text is bold
		cy.verifyCommentContainsHTML("Keyboard **edited** comment",
			"<p>Keyboard <strong>edited</strong> comment</p>\n");
	});

	it("Test editing a WYSIWYG comment using keyboard", function() {
		cy.setCanvasConfig({
			"selectedWYSIWYGComments": true
		});

		createAndEditCommentWithKeyboard("New WYSIWYG comment", "Keyboard edited WYSIWYG comment");
	});
});

function createAndEditCommentWithKeyboard(newCommentOption, newCommentText) {
	// Click canvas background to move focus there
	cy.clickCanvasAt(1, 1);

	// Verify focus is on canvas background
	cy.verifyFocusOnCanvas();

	// Press Cmd+, to open context menu
	cy.pressOnCanvas(key.contextMenu);

	// Click new comment option in menu
	cy.clickOptionFromContextMenu(newCommentOption);

	cy.wait(100);

	// Verify focus is on the comment
	cy.verifyFocusOnComment("");

	// Press Cmd+, to open comment context menu
	cy.pressOnComment("", key.contextMenu);

	// Press Edit comment option
	cy.clickOptionFromContextMenu("Edit comment");

	// Verify focus is on comment entry area
	cy.verifyFocusOnCommentEntry();

	// Enter some text in the comment
	cy.editTextInComment("", newCommentText, false);

	// Press Shift+Return
	cy.completeTextEntry();

	// Test that the focus is back on the comment
	cy.verifyFocusOnComment(newCommentText);
}

// Made with Bob

