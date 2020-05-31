/*
 * Copyright 2017-2020 IBM Corporation
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

describe("Test of zoom operations", function() {
	before(() => {
		cy.viewport(1330, 660);
		cy.visit("/");
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("commentColorCanvas.json");
	});

	it("Test zoom-in,  zoom-out using toolbar and verify zoom transform", function() {
		cy.log("Log 1");
		cy.clickToolbarZoomIn();
		cy.verifyZoomTransform("translate(125.93749999999999,7.349999999999994) scale(1.1)");
		cy.log("Log 2");

		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform("translate(184,32.5) scale(1)");
		cy.log("Log 3");

		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform("translate(139.5,7.349999999999994) scale(1.1)");
		cy.log("Log 4");

		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomOut();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomOut();
		cy.verifyZoomTransform("translate(224.4545454545455,55.363636363636374) scale(0.9090909090909091)");
		cy.log("Log 5");

		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.clickToolbarZoomIn();
		cy.verifyZoomTransform("translate(-159.34464500000047,-161.54759150000027) scale(1.771561000000001)");
		cy.log("Log 6");

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
		cy.verifyZoomTransform("translate(325.0590123625436,112.22211597568476) scale(0.6830134553650705)");
		cy.log("Log 7");
	});
});

describe("Test to see if zoom is NOT preserved with 'Save Zoom' set to 'None'", function() {
	before(() => {
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
		cy.verifyZoomTransform("translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)");

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
	before(() => {
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
		cy.verifyZoomTransform("translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)");

		// Now I load the blank canvas so I can return to the original canvas to make
		// sure the zoom amount has returned to the default
		cy.openCanvasDefinition("blankCanvas.json");

		// Now I reload the original canvas and the zoom should return to the default
		// zoom because we are using 'LocalStorage' for the 'Save Zoom' parameter.
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.verifyZoomTransform("translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)");
	});
});

describe("Test to see if zoom IS saved in the pipeline flow with 'Save Zoom' set to 'Pipelineflow'", function() {
	before(() => {
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
		cy.verifyZoomTransform("translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)");

		// Check to see if the zoom amount in the canvas info for this pipeline is correct.
		cy.verifyPrimaryPipelineZoomInCanvasInfo(294.6649135987979, 95.04432757325321, 0.7513148009015777);
	});
});
