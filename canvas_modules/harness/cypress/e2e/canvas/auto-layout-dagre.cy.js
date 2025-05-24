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
 * limitations   under the License.
 */


describe("Test for toolbar horizontal and vertical layout", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("supernodeLayoutCanvas.json");
		cy.setCanvasConfig({ "selectedToolbarType": "SingleLeftBarArray" });
	});

	it("Test the toolbar horizontal layout, vertical layout, undo, redo functions", function() {
		// Check the original transforms of the nodes are correct before auto layout
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 50, 712);
		cy.verifyNodeTransform("Select1", 1508, 50);
		cy.verifyNodeTransform("Select2", 1508, 712);
		cy.verifyNodeTransform("Select3", 1508, 1375);
		cy.verifyNodeTransform("Merge", 2966, 1375);
		cy.verifyNodeTransform("Sample", 4425, 712);
		cy.verifyNodeTransform("Supernode1", 2966, 50);
		cy.verifyNodeTransform("Supernode2", 4425, 50);
		cy.verifyNodeTransform("Supernode3", 2966, 712);
		cy.verifyNodeTransform("Supernode4", 4425, 1375);

		// Test the node transforms after horizontal layout
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 50, 583.5);
		cy.verifyNodeTransform("Select1", 200, 112.5);
		cy.verifyNodeTransform("Select2", 200, 583.5);
		cy.verifyNodeTransform("Select3", 200, 992);
		cy.verifyNodeTransform("Merge", 564.5, 992);
		cy.verifyNodeTransform("Sample", 1583, 583.5);
		cy.verifyNodeTransform("Supernode1", 366, 50);
		cy.verifyNodeTransform("Supernode2", 1468, 50);
		cy.verifyNodeTransform("Supernode3", 350, 330);
		cy.verifyNodeTransform("Supernode4", 929, 929.5);

		// Test the node transforms after vertical layout
		cy.clickToolbarArrangeVertically();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 811.5, 50);
		cy.verifyNodeTransform("Select1", 248.5, 205);
		cy.verifyNodeTransform("Select2", 811.5, 205);
		cy.verifyNodeTransform("Select3", 1615.5, 205);
		cy.verifyNodeTransform("Merge", 1615.5, 613.5);
		cy.verifyNodeTransform("Sample", 811.5, 1084.5);
		cy.verifyNodeTransform("Supernode1", 50, 551);
		cy.verifyNodeTransform("Supernode2", 133.5, 1022);
		cy.verifyNodeTransform("Supernode3", 597, 360);
		cy.verifyNodeTransform("Supernode4", 961.5, 1022);

		// Test the nodes return to their horizontal transforms on undo
		cy.clickToolbarUndo();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 50, 583.5);
		cy.verifyNodeTransform("Select1", 200, 112.5);
		cy.verifyNodeTransform("Select2", 200, 583.5);
		cy.verifyNodeTransform("Select3", 200, 992);
		cy.verifyNodeTransform("Merge", 564.5, 992);
		cy.verifyNodeTransform("Sample", 1583, 583.5);
		cy.verifyNodeTransform("Supernode1", 366, 50);
		cy.verifyNodeTransform("Supernode2", 1468, 50);
		cy.verifyNodeTransform("Supernode3", 350, 330);
		cy.verifyNodeTransform("Supernode4", 929, 929.5);

		// Test the nodes return to their original transforms on undo
		cy.clickToolbarUndo();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 50, 712);
		cy.verifyNodeTransform("Select1", 1508, 50);
		cy.verifyNodeTransform("Select2", 1508, 712);
		cy.verifyNodeTransform("Select3", 1508, 1375);
		cy.verifyNodeTransform("Merge", 2966, 1375);
		cy.verifyNodeTransform("Sample", 4425, 712);
		cy.verifyNodeTransform("Supernode1", 2966, 50);
		cy.verifyNodeTransform("Supernode2", 4425, 50);
		cy.verifyNodeTransform("Supernode3", 2966, 712);
		cy.verifyNodeTransform("Supernode4", 4425, 1375);

		// Test the nodes return to their horizontal layout transforms on redo
		cy.clickToolbarRedo();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 50, 583.5);
		cy.verifyNodeTransform("Select1", 200, 112.5);
		cy.verifyNodeTransform("Select2", 200, 583.5);
		cy.verifyNodeTransform("Select3", 200, 992);
		cy.verifyNodeTransform("Merge", 564.5, 992);
		cy.verifyNodeTransform("Sample", 1583, 583.5);
		cy.verifyNodeTransform("Supernode1", 366, 50);
		cy.verifyNodeTransform("Supernode2", 1468, 50);
		cy.verifyNodeTransform("Supernode3", 350, 330);
		cy.verifyNodeTransform("Supernode4", 929, 929.5);

		// Test the nodes return to their vertical layout transforms on redo
		cy.clickToolbarRedo();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("User Input", 811.5, 50);
		cy.verifyNodeTransform("Select1", 248.5, 205);
		cy.verifyNodeTransform("Select2", 811.5, 205);
		cy.verifyNodeTransform("Select3", 1615.5, 205);
		cy.verifyNodeTransform("Merge", 1615.5, 613.5);
		cy.verifyNodeTransform("Sample", 811.5, 1084.5);
		cy.verifyNodeTransform("Supernode1", 50, 551);
		cy.verifyNodeTransform("Supernode2", 133.5, 1022);
		cy.verifyNodeTransform("Supernode3", 597, 360);
		cy.verifyNodeTransform("Supernode4", 961.5, 1022);
	});
});

describe("Test for toolbar horizontal and vertical layout for a detached link", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedToolbarType": "SingleLeftBarArray",
			"selectedLinkSelection": "Detachable" });
		cy.openCanvasDefinition("detachedLinksCanvas.json");
	});

	it("Test horizontal and vertical autolayout of detached links", function() {
		// Create a function to verify the initial layout.
		const verifyInitialLayout = () => {
			cy.verifyNumberOfLinks(13);
			cy.verifyNumberOfNodes(6);

			// Verify the original positions of the three semi-detached links.
			cy.verifyDetachedLinkPathFromSource("Binding (entry) node", "outPort", 1, [
				"M 140 194 C 180 194 180 350 220 350"
			]);

			cy.verifyDetachedLinkPathToTarget("Execution node", "inPort", 1, [
				"M 260 360 C 296.25 360 296.25 194 332.5 194"
			]);

			cy.verifyDetachedLinkPathFromSource("Binding (exit) node", "outPort", 1, [
				"M 612.5 419 C 674.2556762695312 419 674.2556762695312 " +
				"381.00567626953125 736.0113525390625 381.00567626953125"
			]);
		};

		// Create a function to verify the horizontal layout.
		const verifyHorizontalAutoLayout = () => {
			cy.verifyNumberOfLinks(13);
			cy.verifyNumberOfNodes(6);

			// Verify the horizontal positions of the three semi-detached links.
			cy.verifyDetachedLinkPathFromSource("Binding (entry) node", "outPort", 1, [
				"M 120 234 C 180 234 180 242.5 240 242.5"
			]);

			cy.verifyDetachedLinkPathToTarget("Execution node", "inPort", 1, [
				"M 90 397.5 C 145 397.5 145 389 200 389"
			]);

			cy.verifyDetachedLinkPathFromSource("Binding (exit) node", "outPort", 1, [
				"M 570 466.5 C 630 466.5 630 562.5 690 562.5"
			]);
		};

		// Create a function to verify the vertical layout.
		const verifyVerticalAutoLayout = () => {
			cy.verifyNumberOfLinks(13);
			cy.verifyNumberOfNodes(6);

			// Verify the vertical positions of the three semi-detached links.
			cy.verifyDetachedLinkPathFromSource("Binding (entry) node", "outPort", 1, [
				"M 270 79 Q 300 79 300 119.875 Q 300 160.75 235 160.75 L 235 160.75 " +
				"Q 170 160.75 170 201.625 Q 170 242.5 200 242.5"
			]);

			cy.verifyDetachedLinkPathToTarget("Execution node", "inPort", 1, [
				"M 350 87.5 Q 380 87.5 380 124.125 Q 380 160.75 350 160.75 " +
				"L 350 160.75 Q 320 160.75 320 197.375 Q 320 234 350 234"
			]);

			cy.verifyDetachedLinkPathFromSource("Binding (exit) node", "outPort", 1, [
				"M 495 544 Q 525 544 525 584.875 Q 525 625.75 502.5 625.75 " +
				"L 502.5 625.75 Q 480 625.75 480 666.625 Q 480 707.5 510 707.5"
			]);
		};

		// Make sure the initial layout is correct.
		verifyInitialLayout();

		// Do vertical autolayout and verify layout
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		verifyHorizontalAutoLayout();

		// Undo and verify layout
		cy.clickToolbarUndo();
		verifyInitialLayout();

		// Redo and verify layout
		cy.clickToolbarRedo();
		verifyHorizontalAutoLayout();

		// Undo to get back to original layout
		cy.clickToolbarUndo();
		verifyInitialLayout();

		// Do vertical autolayout and verify layout
		cy.clickToolbarArrangeVertically();
		cy.clickToolbarZoomToFit();
		verifyVerticalAutoLayout();

		// Undo and verify layout
		cy.clickToolbarUndo();
		verifyInitialLayout();

		// Redo and verify layout
		cy.clickToolbarRedo();
		verifyVerticalAutoLayout();
	});
});

describe("Test the horizontal layout of a multiport node with many descendants", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("layoutMultiPortsCanvas.json");
		cy.setCanvasConfig({ "selectedToolbarType": "SingleLeftBarArray" });
	});

	it("Test the horizontal layout of multiport node transforms having Vertical node format", function() {
		cy.setCanvasConfig({ "selectedNodeFormatType": "Vertical" });
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("Root", 50, 902.5);
		cy.verifyNodeTransform("Child1", 200, 592.5);
		cy.verifyNodeTransform("Child2", 200, 1290);
		cy.verifyNodeTransform("Big", 350, 550);
		cy.verifyNodeTransform("Small", 350, 1290);
		cy.verifyNodeTransform("Select1", 500, 50);
		cy.verifyNodeTransform("Select2", 500, 205);
		cy.verifyNodeTransform("Select3", 500, 360);
		cy.verifyNodeTransform("Select4", 500, 515);
		cy.verifyNodeTransform("Select5", 500, 670);
		cy.verifyNodeTransform("Select6", 500, 825);
		cy.verifyNodeTransform("Select7", 500, 980);
		cy.verifyNodeTransform("Select8", 500, 1135);
		cy.verifyNodeTransform("Select9", 500, 1290);
		cy.verifyNodeTransform("Sample", 650, 205);
	});

	it("Test the horizontal layout of multiport node transforms having Horizontal node format", function() {
		cy.setCanvasConfig({ "selectedNodeFormatType": "Horizontal" });
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("Root", 50, 710);
		cy.verifyNodeTransform("Child1", 290, 470);
		cy.verifyNodeTransform("Child2", 290, 1010);
		cy.verifyNodeTransform("Big", 530, 428.5);
		cy.verifyNodeTransform("Small", 530, 1010);
		cy.verifyNodeTransform("Select1", 770, 50);
		cy.verifyNodeTransform("Select2", 770, 170);
		cy.verifyNodeTransform("Select3", 770, 290);
		cy.verifyNodeTransform("Select4", 770, 410);
		cy.verifyNodeTransform("Select5", 770, 530);
		cy.verifyNodeTransform("Select6", 770, 650);
		cy.verifyNodeTransform("Select7", 770, 770);
		cy.verifyNodeTransform("Select8", 770, 890);
		cy.verifyNodeTransform("Select9", 770, 1010);
		cy.verifyNodeTransform("Sample", 1010, 170);
	});
});

describe("Test the horizontal layout of a flow and a sub-flow using curve and elbow connections", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("layoutSubFlowCanvas.json");
		cy.setCanvasConfig({ "selectedToolbarType": "SingleLeftBarArray" });
	});

	it("Test the horizontal layout of flow and sub-flow node transforms " +
  "having Vertical node format and curve connections", function() {
		cy.setCanvasConfig({ "selectedNodeFormatType": "Vertical", "selectedLinkType": "Curve" });
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("Select1", 50, 210);
		cy.verifyNodeTransform("Select2", 50, 365);
		cy.verifyNodeTransform("Select3", 591.5, 50);
		cy.verifyNodeTransform("Table", 591.5, 210);
		cy.verifyNodeTransform("Neural Net", 591.5, 365);
		cy.verifyNodeTransform("Sort", 591.5, 520);
		cy.verifyNodeTransform("Supernode", 200, 221.5);
		cy.verifyNodeTransformInSubFlow("Merge1", -749.5091705322266, 22.57819366455078);
		cy.verifyNodeTransformInSubFlow("Merge2", -518.0227603912354, 238.09954977035522);
		cy.verifyNodeTransformInSubFlow("Merge3", -295.0563049316406, 118.3043441772461);
		cy.verifyNodeTransformInSubFlow("Select", -389.2391815185547, -105.74821090698242);
		cy.verifyNodeTransformInSubFlow("Select2", 101.01441240310669, -37.72170448303223);
	});

	it("Test the horizontal layout of flow and sub-flow node transforms " +
  "having Horizontal node format and elbow connections", function() {
		cy.setCanvasConfig({ "selectedNodeFormatType": "Horizontal", "selectedLinkType": "Elbow" });
		cy.clickToolbarArrangeHorizontally();
		cy.clickToolbarZoomToFit();
		cy.verifyNodeTransform("Select1", 50, 193);
		cy.verifyNodeTransform("Select2", 50, 313);
		cy.verifyNodeTransform("Select3", 701.5, 50);
		cy.verifyNodeTransform("Table", 701.5, 193);
		cy.verifyNodeTransform("Neural Net", 701.5, 313);
		cy.verifyNodeTransform("Sort", 701.5, 433);
		cy.verifyNodeTransform("Supernode", 290, 169.5);
		cy.verifyNodeTransformInSubFlow("Merge1", -749.5091705322266, 22.57819366455078);
		cy.verifyNodeTransformInSubFlow("Merge2", -518.0227603912354, 238.09954977035522);
		cy.verifyNodeTransformInSubFlow("Merge3", -295.0563049316406, 118.3043441772461);
		cy.verifyNodeTransformInSubFlow("Select", -389.2391815185547, -105.74821090698242);
		cy.verifyNodeTransformInSubFlow("Select2", 101.01441240310669, -37.72170448303223);
	});
});
