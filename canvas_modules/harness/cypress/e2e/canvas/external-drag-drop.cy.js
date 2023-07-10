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

describe("Test drag and drop of external object to canvas", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
	});

	it("Test dragging a node from side panel to canvas", function() {
		// Open side panel and drag derive node on canvas
		cy.toggleCommonCanvasSidePanel();
		cy.dragDeriveNodeAtPosition(300, 300);
		cy.verifyNumberOfNodes(1);
		cy.clickToolbarUndo();
		cy.verifyNumberOfNodes(0);
		cy.clickToolbarRedo();
		cy.verifyNumberOfNodes(1);
	});
});
