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

describe("Test context toolbar positioning in expanded sub-flows", function() {
	beforeEach(() => {
		cy.viewport(1400, 800);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedContextToolbar": true });
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("supernodeNestedCanvas.json");
	});

	it("Test context toolbar appears in correct position for node in single-level expanded sub-flow", function() {
		// Hover over a node inside the expanded supernode and verify context toolbar position
		cy.hoverOverNodeInSupernode("Filter", "Supernode3");
		cy.verifyContextToolbarPosition("329px", "391px");
	});

	it("Test context toolbar appears in correct position for node in nested expanded sub-flows", function() {
		// Hover over Supernode3A inside Supernode3
		cy.hoverOverNodeInSupernode("Supernode3A", "Supernode3");

		// Click the overflow button in the context toolbar and select 'Expand supernode'
		cy.clickContextToolbarOverflowButton();
		cy.clickOptionFromContextToolbarOverflow("Expand supernode");
		cy.wait(500);

		// Hover over Merge node in Supernode3A inside Supernode3
		cy.hoverOverNodeInSupernodeInSupernode("Merge", "Supernode3A", "Supernode3");

		// Test the position of the context toolbar
		cy.verifyContextToolbarPosition("363px", "422px");
	});
});

// Made with Bob
