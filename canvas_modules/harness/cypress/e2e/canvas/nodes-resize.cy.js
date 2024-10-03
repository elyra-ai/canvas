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

describe("Test adding resizing nodes", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({
			"selectedResizableNodes": true,
			"selectedLinkSelection": "Detachable",
			"selectedLinkType": "Straight"
		});
		cy.openCanvasPalette("modelerPalette.json");
		cy.openCanvasDefinition("resizedNodesCanvas.json");
	});

	it("Test all attached and detached links appear OK", function() {
		cy.verifyNumberOfPortDataLinks(8);
		verifyOnOpen();
	});

	it("Test all attached and detached links appear OK after moving nodes around", function() {
		cy.verifyNumberOfPortDataLinks(8);

		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Node 2").click();
		cy.moveNodeToPosition("Node 2", 700, 420);
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Node 3").click();
		cy.moveNodeToPosition("Node 3", 200, 100);
		// TODO -- Fix when autoselect is available.
		// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/3760
		cy.getNodeWithLabel("Node 4").click();
		cy.moveNodeToPosition("Node 4", 200, 400);

		// Test the two links from Node 2 to Node 1
		cy.verifyLinkPath("Node 2", "outPort1", "Node 1", "inPort",
			"M 692.3055572509766 435.94787206585977 L 538.2596130371094 385.5264058399579");
		cy.verifyLinkPath("Node 2", "outPort2", "Node 1", "inPort",
			"M 692.3055572509766 501.81172999935524 L 538.2596130371094 475.22806523339443");

		// Test the one link from Node 1 to Node 3
		cy.verifyLinkPath("Node 1", "outPort", "Node 3", "inPort",
			"M 435.2596130371094 263.4379955149248 L 276.09522247314453 240.07111426330442");

		// Test the one link from Node 1 to Node 4
		cy.verifyLinkPath("Node 1", "outPort", "Node 4", "inPort",
			"M 435.2596130371094 382.5865689106035 L 276.8162978100015 425.40274645747843");

		// Test the two detached links pointing away from Node 1
		cy.verifyDetachedLinkPathFromSource("Node 1", "outPort", 2, [
			"M 538.2596130371094 241.75221362533267 L 728 134",
			"M 435.2596130371094 599.6658747881331 L 338 667"
		]);

		// Test the two detached links pointing at Node 1
		cy.verifyDetachedLinkPathToTarget("Node 1", "inPort", 2, [
			"M 764 644 L 538.2596130371094 578.870308092851",
			"M 158 644 L 435.2596130371094 494.17094582980417"
		]);
	});

	it("Test all attached and detached links appear OK after resizing central node", function() {
		cy.verifyNumberOfPortDataLinks(8);

		// Resize the central node - short and fat
		cy.resizeNode("Node 1", "north-east", 100, 200);

		// Verify the node is sized OK
		cy.verifyNodeDimensions("Node 1", 100, 200);

		// Test the two links from Node 2 to Node 1
		cy.verifyLinkPath("Node 2", "outPort1", "Node 1", "inPort",
			"M 239 188 L 457 454");
		cy.verifyLinkPath("Node 2", "outPort2", "Node 1", "inPort",
			"M 183 188 L 435 465");

		// Test the one link from Node 1 to Node 3
		cy.verifyLinkPath("Node 1", "outPort", "Node 3", "inPort",
			"M 435 536 L 153 414");

		// Test the one link from Node 1 to Node 4
		cy.verifyLinkPath("Node 1", "outPort", "Node 4", "inPort",
			"M 549 501 L 713 327");

		// Test the two detached links pointing away from Node 1
		cy.verifyDetachedLinkPathFromSource("Node 1", "outPort", 2, [
			"M 527 454 L 728 134",
			"M 435 642 L 338 667"
		]);

		// Test the two detached links pointing at Node 1
		cy.verifyDetachedLinkPathToTarget("Node 1", "inPort", 2, [
			"M 764 644 L 549 618",
			"M 158 644 L 435 603"
		]);

	});

	it("Test undoing resize returns everything to original state", function() {
		cy.verifyNumberOfPortDataLinks(8);

		// Verify everything is OK initially
		verifyOnOpen();

		// Resize the central node
		cy.resizeNode("Node 1", "north-east", 80, 600);
		// Verify the node sized OK
		cy.verifyNodeDimensions("Node 1", 80, 600);
		// Undo using toolbar
		cy.clickToolbarUndo();

		// Verify everything is back as it was.
		verifyOnOpen();

		// Undo using toolbar
		cy.clickToolbarRedo();
		// Verify the node sized OK
		cy.verifyNodeDimensions("Node 1", 80, 600);

	});
});

// Tests the node sizes and link paths when the canvas is first opened.
function verifyOnOpen() {
	// Test node dimensions
	cy.verifyNodeDimensions("Node 1", 89, 488.35507065057755);
	cy.verifyNodeDimensions("Node 2", 190.32456970214844, 150.16434144973755);
	cy.verifyNodeDimensions("Node 3", 70, 268.2066955566406);

	// Test the two links from Node 2 to Node 1
	cy.verifyLinkPath("Node 2", "outPort1", "Node 1", "inPort",
		"M 242 139 L 435 230");
	cy.verifyLinkPath("Node 2", "outPort2", "Node 1", "inPort",
		"M 242 188 L 435 305");

	// Test the one link from Node 1 to Node 3
	cy.verifyLinkPath("Node 1", "outPort", "Node 3", "inPort",
		"M 435 414 L 153 398");

	// Test the one link from Node 1 to Node 4
	cy.verifyLinkPath("Node 1", "outPort", "Node 4", "inPort",
		"M 538 391 L 713 303");

	// Test the two detached links pointing away from Node 1
	cy.verifyDetachedLinkPathFromSource("Node 1", "outPort", 2, [
		"M 538 260 L 728 134",
		"M 435 610 L 338 667"
	]);

	// Test the two detached links pointing at Node 1
	cy.verifyDetachedLinkPathToTarget("Node 1", "inPort", 2, [
		"M 764 644 L 538 558.9883811067392",
		"M 158 644 L 435 521"
	]);

}
