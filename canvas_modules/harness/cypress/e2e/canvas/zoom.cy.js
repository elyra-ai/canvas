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
/* eslint no-undefined: "off" */

describe("Test of zoom operations", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test zoom-in,  zoom-out using toolbar and verify zoom transform", function() {
		cy.verifyZoomTransformDoesNotExist();
		cy.clickToolbarZoomIn();
		cy.verifyZoomTransform(-62, -28, 1.10);

		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(1, 0, 1.00);

		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(-63, -28, 1.10);

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(58, 26, 0.90);

		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.verifyZoomTransform(-485, -219, 1.77);

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(200, 90, 0.68);
	});
});

describe("Test zoomToReveal function returns the appropriate zoom object for a node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("bigCanvas.json");
		cy.openCanvasAPI("Zoom To Reveal Node");
	});

	it("Test ZoomTo function with x,y parameters", function() {
		cy.verifyCanvasTransform(undefined);
		cy.selectEntryFromDropdown("Histogram");
		cy.setXPercentOffset(25);
		cy.setYPercentOffset(25);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(-1529.2531391552911,-684.6045237056301) scale(1)");
	});

	it("Test ZoomTo function with x,y parameters after panning the canvas", function() {
		cy.setCanvasConfig({ "selectedInteractionType": "Carbon" });

		cy.verifyCanvasTransform(undefined);
		// Panning the canvas.
		cy.panCanvasToPosition(350, 200);
		cy.verifyCanvasTransform("translate(350,200) scale(1)");
		// Test get Zoom to reveal & ZoomTo
		cy.selectEntryFromDropdown("Histogram");
		cy.setXPercentOffset(55);
		cy.setYPercentOffset(55);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(-1226.853139155291,-471.90452370563) scale(1)");
	});

	it("Test ZoomTo function with x,y parameters after zooming out", function() {
		cy.verifyCanvasTransform(undefined);
		// Zooming the canvas.
		cy.clickToolbarZoomOut();
		cy.verifyCanvasTransform("translate(45.81818181818181,32.22727272727275) scale(0.9090909090909091)");
		// Test get Zoom to reveal & ZoomTo
		cy.selectEntryFromDropdown("Histogram");
		cy.setXPercentOffset(70);
		cy.setYPercentOffset(60);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(-913.7210355957193,-358.1041124596638) scale(0.9090909090909091)");
	});
});

describe("Test zoomToReveal function returns the appropriate zoom object for a link", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
		cy.openCanvasAPI("Zoom To Reveal Link");
	});

	it("Test ZoomTo function with x,y parameters", function() {
		cy.verifyCanvasTransform(undefined);
		cy.selectEntryFromDropdown("Execution node-Super node");
		cy.setXPercentOffset(25);
		cy.setYPercentOffset(25);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(-181.5,-15.25) scale(1)");
	});

	it("Test ZoomTo function with x,y parameters after panning the canvas", function() {
		cy.setCanvasConfig({ "selectedInteractionType": "Carbon" });

		cy.verifyCanvasTransform(undefined);
		// Panning the canvas.
		cy.panCanvasToPosition(350, 200);
		cy.verifyCanvasTransform("translate(350,200) scale(1)");
		// Test get Zoom to reveal & ZoomTo
		cy.selectEntryFromDropdown("Super node-Binding (exit) node");
		cy.setXPercentOffset(55);
		cy.setYPercentOffset(55);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(-51.59999999999991,87.95000381469731) scale(1)");
	});

	it("Test ZoomTo function with x,y parameters after zooming out", function() {
		cy.verifyCanvasTransform(undefined);
		// Zooming the canvas.
		cy.clickToolbarZoomOut();
		cy.verifyCanvasTransform("translate(45.92045454545456,32.22727272727275) scale(0.9090909090909091)");
		// Test get Zoom to reveal & ZoomTo
		cy.selectEntryFromDropdown("Binding (entry) node-Execution node");
		cy.setXPercentOffset(70);
		cy.setYPercentOffset(60);
		cy.submitAPI();
		cy.verifyCanvasTransform("translate(498.3272727272727,290.85454545454536) scale(0.9090909090909091)");
	});
});

describe("Test to see if zoom is NOT preserved with 'Save Zoom' set to 'None'", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedSaveZoom": "None" });
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test to see if zoom is NOT preserved with 'Save Zoom' set to 'None'", function() {
		// The zoom will be the default which is null
		cy.verifyZoomTransformDoesNotExist();

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(156, 71, 0.75);

		// Now I load the blank canvas so I can return to the original canvas to make
		// sure the zoom amount has returned to the default
		cy.openCanvasDefinition("blankCanvas.json");

		// Now I reload the original canvas and the zoom should return to the default
		// zoom because we are using None for the 'Save Zoom' parameter.
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.verifyZoomTransformDoesNotExist();
	});
});

describe("Test to see if zoom IS preserved with 'Save Zoom' set to 'LocalStorage'", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedSaveZoom": "LocalStorage" });
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test to see if zoom IS preserved with 'Save Zoom' set to 'LocalStorage'", function() {
		// The zoom will be the default which is null
		cy.verifyZoomTransformDoesNotExist();

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(156, 71, 0.75);

		// Now I load the blank canvas so I can return to the original canvas to make
		// sure the zoom amount has returned to the default
		cy.openCanvasDefinition("blankCanvas.json");

		// Wait for the canvas to load otherwise zoom is not reset as desired.
		/* eslint cypress/no-unnecessary-waiting: "off" */
		cy.wait(1000);

		// Make sure the zoom was reset for the new canvas.
		cy.verifyZoomTransform(0, 0, 1);

		// Now reload the original canvas and the zoom should return to the default
		// zoom because we are using 'LocalStorage' for the 'Save Zoom' parameter.
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.verifyZoomTransform(156, 71, 0.75);
	});
});

describe("Test to see if zoom IS saved in the pipeline flow with 'Save Zoom' set to 'Pipelineflow'", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedSaveZoom": "Pipelineflow" });
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test to see if zoom IS saved in the pipeline flow with 'Save Zoom' set to 'Pipelineflow'", function() {
		// The zoom will be the default which is null
		cy.verifyZoomTransformDoesNotExist();

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform(156, 71, 0.75);

		// Check to see if the zoom amount in the canvas info for this pipeline is correct.
		cy.verifyPrimaryPipelineZoomInCanvasInfo(156, 71, 0.75);
	});
});

describe("Test to see if the canvas is panned into view when selectedPanIntoViewOnOpen is enabled", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedPanIntoViewOnOpen": true });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test to see if the canvas is panned into view when selectedPanIntoViewOnOpen is enabled", function() {
		// The allTypesCanvas should have been panned up and to the left.
		cy.verifyZoomTransform(-6, -6, 1);
	});
});

describe("Test the canvas is panned on open with initialPanX and initialPanY are set in canvasLayout", function() {
	beforeEach(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.setCanvasConfig({ "selectedCanvasLayout": { initialPanX: 100, initialPanY: 200 } });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test to see if the canvas is panned when first opened", function() {
		// The allTypesCanvas should have been panned to down and to the right.
		cy.verifyZoomTransform(100, 200, 1);
	});
});
