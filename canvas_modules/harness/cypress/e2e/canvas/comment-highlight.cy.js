/*
 * Copyright 2025 Elyra Authors
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


describe("Test clipboard with no link selection enabled", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test text is highlighted in a regular comment", function() {
		cy.clickToolbarAddComment();
		cy.editTextInComment("", "Now is the winter of our discontent made glorious summer by this son of York.");

		cy.setCommentHighlightText(
			"Now is the winter of our discontent made glorious summer by this son of York.",
			"made glorious summer");

		cy.verifyCommentContainsHTML(
			"Now is the winter of our discontent made glorious summer by this son of York.",
			"Now is the winter of our discontent <mark>made glorious summer</mark> by this son of York.");
	});


	it("Test text is highlighted in a markdown comment", function() {
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });

		cy.clickToolbarAddComment();
		cy.editTextInComment("",
			"Now is the **winter of our _discontent made_ glorious summer by** this son of York.");

		cy.setCommentHighlightText(
			"Now is the **winter of our _discontent made_ glorious summer by** this son of York.",
			"made glorious summer");

		cy.verifyCommentContainsHTML(
			"Now is the **winter of our _discontent made_ glorious summer by** this son of York.",
			"<p>Now is the <strong>winter of our <em>discontent <mark>made</mark></em><mark> glorious " +
			"summer</mark> by</strong> this son of York.</p>\n");
	});

	it("Test highlighting in markdown comment where highlighting ends at end of ** markdown", function() {
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });

		cy.clickToolbarAddComment();
		cy.editTextInComment("",
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.");

		cy.setCommentHighlightText(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"made glorious summer");

		cy.verifyCommentContainsHTML(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"<p>Now is the <strong>winter of our <em>discontent <mark>made</mark></em><mark> glorious " +
			"summer</mark></strong> by this son of York.</p>\n");
	});

	it("Test highlighting in markdown where highlighting starts at beginning of ** markdown", function() {
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });

		cy.clickToolbarAddComment();
		cy.editTextInComment("",
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.");

		cy.setCommentHighlightText(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"winter of our discontent");

		cy.verifyCommentContainsHTML(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"<p>Now is the <strong><mark>winter of our </mark><em><mark>discontent</mark> made</em> glorious " +
			"summer</strong> by this son of York.</p>\n");
	});

	it("Test highlighting in markdown where highlighting is same as italics (_) markdown", function() {
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });

		cy.clickToolbarAddComment();
		cy.editTextInComment("",
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.");

		cy.setCommentHighlightText(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"discontent made");

		cy.verifyCommentContainsHTML(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"<p>Now is the <strong>winter of our <em><mark>discontent made</mark></em> glorious " +
			"summer</strong> by this son of York.</p>\n");
	});

	it("Test highlighting in markdown where highlighting is in middle of italics (_) markdown", function() {
		cy.setCanvasConfig({ "selectedMarkdownInComments": true });

		cy.clickToolbarAddComment();
		cy.editTextInComment("",
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.");

		cy.setCommentHighlightText(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"content");

		cy.verifyCommentContainsHTML(
			"Now is the **winter of our _discontent made_ glorious summer** by this son of York.",
			"<p>Now is the <strong>winter of our <em>dis<mark>content</mark> made</em> glorious " +
			"summer</strong> by this son of York.</p>\n");
	});
});
