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
describe("Test canvas background display", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test the background has a dots grid when activated", function() {
		cy.setCanvasConfig({ selectedCanvasLayout: { displayGridType: "Dots" } });
		cy.verifyCanvasBackgroundFill("url(#d3_grid_dots_pattern_0)");
	});

	it("Test the background has a dots and lines grid when activated", function() {
		cy.setCanvasConfig({ selectedCanvasLayout: { displayGridType: "DotsAndLines" } });
		cy.verifyCanvasBackgroundFill("url(#d3_grid_dots_lines_pattern_0)");
	});

	it("Test the background has a boxes grid when activated", function() {
		cy.setCanvasConfig({ selectedCanvasLayout: { displayGridType: "Boxes" } });
		cy.verifyCanvasBackgroundFill("url(#d3_grid_boxes_pattern_0)");
	});

	it("Test the background has a boxes and lines grid when activated", function() {
		cy.setCanvasConfig({ selectedCanvasLayout: { displayGridType: "BoxesAndLines" } });
		cy.verifyCanvasBackgroundFill("url(#d3_grid_boxes_lines_pattern_0)");
	});

	it("Test the background grid zoom successfully", function() {
		cy.setCanvasConfig({ selectedCanvasLayout: { displayGridType: "BoxesAndLines" } });
		cy.openCanvasDefinition("allTypesCanvas.json");
		cy.verifyBackgroundZoomTransform(0, 0, 1);

		// Zoom to fit
		cy.clickToolbarZoomToFit();
		cy.verifyBackgroundZoomTransform(238, 118, 1);

		// Zoom out
		cy.clickToolbarZoomOut();
		cy.verifyBackgroundZoomTransform(277, 139, 0.91);
	});
});
