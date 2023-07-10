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
import React from "react";
import * as testUtils from "../../utils/eventlog-utils";
import { Play16 } from "@carbon/icons-react";

describe("Test adding a decorator to a node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("decoratorCanvas.json");
	});

	it("Test adding a new decoration, move decoration, replace decoration," +
  " add label decorations at customized positions", function() {
		// Add a new decoration to the top left position
		cy.setNodeDecorations("No Decorator", [{ "id": "123", "position": "topLeft" }]);
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 10, 5);

		// Move the decoration to the top right position
		cy.setNodeDecorations("No Decorator", [{ "id": "123", "position": "topRight" }]);
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 46, 5);

		// Add a new decoration to the bottom left position along with the existing decoration
		cy.setNodeDecorations("No Decorator",
			[{ "id": "123", "position": "topRight" }, { "id": "345", "position": "bottomLeft" }]);
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 2);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 46, 5);
		cy.verifyDecorationTransformOnNode("No Decorator", "345", 10, 41);

		// Replace decorations with a new decoration at the bottom right position with an image and a hotspot
		cy.setNodeDecorations("No Decorator",
			[{ "id": "678", "position": "bottomRight",
				"image": "/images/decorators/zoom-in_32.svg", "hotspot": true }]);
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "678", 46, 41);
		cy.verifyDecorationImageOnNode("No Decorator", "678", "/images/decorators/zoom-in_32.svg");

		// Click on the hot spot and make sure it calls the callback function
		cy.clickDecoratorHotspotOnNode("678", "No Decorator");
		verifyDecorationHandlerEntryInConsole("678");

		// Add a decoration at a customized position
		cy.setNodeDecorations("No Decorator",
			[{ "id": "999", "x_pos": -20, "y_pos": -25 }]);
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "999", -20, -25);

		// Add a two label decorations at customized positions
		cy.setNodeDecorations("No Decorator",
			[{ "id": "label_1", "x_pos": -20, "y_pos": -25, "label": "A first test label" },
				{ "id": "label_2", "x_pos": 40, "y_pos": 90, "label": "A second test label" }]
		);
		cy.verifyNumberOfLabelDecoratorsOnNode("No Decorator", 2);
		cy.verifyLabelDecorationOnNode("No Decorator", "label_1", "A first test label", -20, -25);
		cy.verifyLabelDecorationOnNode("No Decorator", "label_2", "A second test label", 40, 90);

		// Check the Big Node decorators are all positioned correctly based on their anchor nodePositions
		cy.verifyNumberOfDecoratorsOnNode("Big Node", 9);
		cy.verifyDecorationTransformOnNode("Big Node", "1", 0, 0);
		cy.verifyDecorationTransformOnNode("Big Node", "2", 35, 0);
		cy.verifyDecorationTransformOnNode("Big Node", "3", 70, 0);
		cy.verifyDecorationTransformOnNode("Big Node", "4", 0, 80);
		cy.verifyDecorationTransformOnNode("Big Node", "5", 35, 80);
		cy.verifyDecorationTransformOnNode("Big Node", "6", 70, 80);
		cy.verifyDecorationTransformOnNode("Big Node", "7", 0, 160);
		cy.verifyDecorationTransformOnNode("Big Node", "8", 35, 160);
		cy.verifyDecorationTransformOnNode("Big Node", "9", 70, 160);

	});

	it("Test adding a path decoration to a node", function() {
		// Add a new decoration to the top left position
		cy.setNodeDecorations("Custom position",
			[{ "id": "123", "path": "M 0 0 L 10 10 -10 10 Z",
				"outline": false, "x_pos": -20, "y_pos": 20, "hotspot": true }]
		);
		// TODO: this next click is a workaround, the next click on the toggle won't trigger
		// an onClick unless elsewhere on the panel is clicked first. remove when fixed
		cy.clickOutsideNotificationPanel();
		cy.verifyNumberOfPathDecoratorsOnNode("Custom position", 1);
		cy.verifyDecorationTransformOnNode("Custom position", "123", -20, 20);

		// Click on the hot spot and make sure it calls the callback function
		cy.clickDecoratorHotspotOnNode("123", "Custom position");
		verifyDecorationHandlerEntryInConsole("123");

		// Check the path is correct
		cy.verifyDecorationPathOnNode("Custom position", "123", "M 0 0 L 10 10 -10 10 Z");
	});

	it("Test editable single-line label decoration on a node with max number of characters.", function() {
		cy.setNodeDecorations("No Decorator",
			[{ "id": "123", "position": "bottomRight", "label": "Dec Label",
				"label_editable": true, "label_single_line": true, "height": 28,
				"label_max_characters": 12,
				"x_pos": "20", "y_pos": "-20" }]
		);
		cy.hoverOverNodeDecoration("No Decorator", "123");
		cy.clickEditIconForNodeDecLabel("No Decorator", "123");
		cy.enterLabelForNodeDec("No Decorator", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyLabelDecorationOnNode("No Decorator", "123", "New Label Te", 90, 55);
	});


	it("Test editable multi-line label decoration on a node.", function() {
		cy.setNodeDecorations("No Decorator",
			[{ "id": "123", "position": "bottomRight", "label": "Dec Label",
				"label_editable": true, "label_single_line": false, "height": 28,
				"label_align": "center",
				"x_pos": "20", "y_pos": "-20" }]
		);
		cy.hoverOverNodeDecoration("No Decorator", "123");
		cy.clickEditIconForNodeDecLabel("No Decorator", "123");
		cy.enterLabelForNodeDec("No Decorator", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyLabelDecorationOnNode("No Decorator", "123", "New Label Text", 90, 55);
	});

	it("Test editable multi-line label decoration on a node with label_allow_return_key = 'save'.", function() {
		cy.setNodeDecorations("No Decorator",
			[{ "id": "123", "position": "bottomRight", "label": "Dec Label",
				"label_editable": true, "label_single_line": false, "height": 28,
				"label_align": "center", "label_allow_return_key": "save",
				"x_pos": "20", "y_pos": "-20" }]
		);
		cy.hoverOverNodeDecoration("No Decorator", "123");
		cy.clickEditIconForNodeDecLabel("No Decorator", "123");
		// Enter the label and hit return after which will edit edit and save the label
		cy.enterLabelForNodeDecHitReturn("No Decorator", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyLabelDecorationOnNode("No Decorator", "123", "New Label Text", 90, 55);
	});

	it("Test editable single-line label decoration on a node with label_allow_return_key = 'save'.", function() {
		cy.setNodeDecorations("No Decorator",
			[{ "id": "123", "position": "bottomRight", "label": "Dec Label",
				"label_editable": true, "label_single_line": true, "height": 28,
				"label_align": "center", "label_allow_return_key": "save",
				"x_pos": "20", "y_pos": "-20" }]
		);
		cy.hoverOverNodeDecoration("No Decorator", "123");
		cy.clickEditIconForNodeDecLabel("No Decorator", "123");
		// Enter the label and hit return after which will edit edit and save the label
		cy.enterLabelForNodeDecHitReturn("No Decorator", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyLabelDecorationOnNode("No Decorator", "123", "New Label Text", 90, 55);
	});

	it("Test adding a JSX decoration to a node.", function() {
		cy.setNodeDecorations("Top Left",
			[{ "id": "123", "jsx": (<Play16 />), "x_pos": "20", "y_pos": "-20" }]
		);
		cy.verifyNumberOfDecoratorsOnNode("Top Left", 1);
		cy.verifyJsxDecorationOnNode("Top Left", "123", 20, -20);
	});
});


describe("Test adding a decorator to a link", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("decoratorCanvas.json");
	});

	it("Test adding a new decoration to a link, remove decorations, add label decorator," +
  " add image decorator to a link", function() {
		// Verify number of decorators on existing links
		cy.verifyNumberOfDecoratorsOnLink("Top Left-Top Right", 4);
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 3);

		// Verify decoration transform on existing links
		cy.verifyDecorationTransformOnLink("Top Left-Top Right", "assocDec1", 370, 133.5);
		cy.verifyDecorationTransformOnLink("Top Left-Top Right", "assocDec2", 478, 133.5);
		cy.verifyDecorationTransformOnLink("Top Left-Top Right", "assocDec3", 586, 133.5);

		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "123", 373, 225);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "456", 478, 225);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "789", 583, 225);

		// Remove all decorations from the association link
		cy.setLinkDecorations("Top Left-Top Right", []);
		cy.verifyNumberOfDecoratorsOnLink("Top Left-Top Right", 0);

		// Remove all decorations from the node data link
		cy.setLinkDecorations("Bottom Left-Bottom Right", []);
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 0);

		// Add a rectangle decorator to association link
		cy.setLinkDecorations("Top Left-Top Right", [{ "id": "123" }]);
		cy.verifyNumberOfDecoratorsOnLink("Top Left-Top Right", 1);

		// Add a label decorator to association link
		cy.setLinkDecorations("Top Left-Top Right",
			[{ "id": "123", "label": "Link Decoration" }]
		);
		cy.verifyNumberOfLabelDecoratorsOnLink("Top Left-Top Right", 1);

		// Add an image decorator with a hotspot to the node data link
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "456", "position": "source", "image": "/images/decorators/zoom-in_32.svg", "hotspot": true }]
		);
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);

		// Click on the hotspot and make sure it works
		cy.clickDecoratorHotspotOnLink("456", "Bottom Left-Bottom Right");
		verifyDecorationHandlerEntryInConsole("456");
	});

	it("Test adding a path decoration to a link", function() {
		// Add a new decoration to the top left position
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "555", "path": "M 0 0 L 10 10 -10 10 Z",
				"outline": false, "x_pos": -20, "y_pos": 20, "hotspot": true }]
		);
		cy.verifyNumberOfPathDecoratorsOnLink("Bottom Left-Bottom Right", 1);

		// Click on the hot spot and make sure it calls the callback function
		cy.clickDecoratorHotspotOnLink("555", "Bottom Left-Bottom Right");
		verifyDecorationHandlerEntryInConsole("555");

		// Check the path is correct
		cy.verifyDecorationPathOnLink("Bottom Left-Bottom Right", "555", "M 0 0 L 10 10 -10 10 Z");
	});

	it("Test positioning a decoration using distance on a straight line link", function() {
		// The 'distance' property is only applicable with straight link lines.
		cy.setCanvasConfig({ "selectedLinkType": "Straight" });

		// Test positive distance from source position
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "555", "position": "source",
				"distance": 30 }]
		);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 410, 243.5);

		// Test negative distance from target position
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "555", "position": "target", "distance": -30 }]
		);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 566, 243.5);

		// Test negative distance from middle position
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "555", "position": "middle", "distance": -20 }]
		);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 468, 243.5);

		// Test positive distance from middle position
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "555", "position": "middle", "distance": 20 }]
		);
		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 508, 243.5);
	});

	it("Test editable single-line label decoration on a link with max number of characters.", function() {
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "label": "Dec Label",
				"label_editable": true, "label_single_line": true, "height": 14,
				"label_max_characters": 12,
				"x_pos": "20", "y_pos": "-20" }]
		);
		cy.hoverOverLinkDecoration("Bottom Left-Bottom Right", "123");
		cy.clickEditIconForLinkDecLabel("Bottom Left-Bottom Right", "123");
		cy.enterLabelForLinkDec("Bottom Left-Bottom Right", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);
		// New label should be truncated because max number of characters is 12
		cy.verifyLabelDecorationOnLink("Bottom Left-Bottom Right", "123", "New Label Te", 508, 215);
	});

	it("Test editable multi-line label decoration on a link.", function() {
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "label": "Dec Label",
				"label_editable": true, "label_single_line": false, "height": 28,
				"label_align": "center",
				"x_pos": "20", "y_pos": "-20" }]);
		cy.hoverOverLinkDecoration("Bottom Left-Bottom Right", "123");
		cy.clickEditIconForLinkDecLabel("Bottom Left-Bottom Right", "123");
		cy.enterLabelForLinkDec("Bottom Left-Bottom Right", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);
		cy.verifyLabelDecorationOnLink("Bottom Left-Bottom Right", "123", "New Label Text", 498, 215);
	});

	it("Test editable multi-line label decoration on a link, with label_allow_return_key = 'save'", function() {
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "label": "Dec Label",
				"label_editable": true, "label_single_line": false, "height": 28,
				"label_align": "center", "label_allow_return_key": "save",
				"x_pos": "20", "y_pos": "-20" }]);
		cy.hoverOverLinkDecoration("Bottom Left-Bottom Right", "123");
		cy.clickEditIconForLinkDecLabel("Bottom Left-Bottom Right", "123");
		// Enter the label and hit return after which will edit edit and save the label
		cy.enterLabelForLinkDecHitReturn("Bottom Left-Bottom Right", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);
		cy.verifyLabelDecorationOnLink("Bottom Left-Bottom Right", "123", "New Label Text", 498, 215);
	});

	it("Test editable single-line label decoration on a link, with label_allow_return_key = 'save'", function() {
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "label": "Dec Label",
				"label_editable": true, "label_single_line": true, "height": 28,
				"label_align": "center", "label_allow_return_key": "save",
				"x_pos": "20", "y_pos": "-20" }]);
		cy.hoverOverLinkDecoration("Bottom Left-Bottom Right", "123");
		cy.clickEditIconForLinkDecLabel("Bottom Left-Bottom Right", "123");
		// Enter the label and hit return after which will edit edit and save the label
		cy.enterLabelForLinkDecHitReturn("Bottom Left-Bottom Right", "123", "New Label Text");
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);
		cy.verifyLabelDecorationOnLink("Bottom Left-Bottom Right", "123", "New Label Text", 498, 215);
	});

	// There are more tests for tips on decorations in the tips.js file
	it("Test a tooltip appears on hover over decoration.", function() {
		// Must switch off link tips here otherwise, in Cypress, the link tip
		// appears when hovering over the decoration instead of the decoration tip
		// even though the decoration tip appears correctly in usual operation.
		cy.setCanvasConfig({
			"selectedTipConfig": { "palette": false, "nodes": false, "ports": false,
				"decorations": true, "links": false }
		});
		// Add a decoration with a tooltip.
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "path": "M 0 0 L 0 -20 -10 -30 -20 -20 -20 0 Z",
				"tooltip": "Inform - Educate - Entertain",
				"x_pos": "40", "y_pos": "15" }]);
		cy.hoverOverLinkDecoration("Bottom Left-Bottom Right", "123");
		cy.verifyTipForDecoration("Inform - Educate - Entertain");
	});

	it("Test adding a JSX decoration to a link.", function() {
		cy.setLinkDecorations("Bottom Left-Bottom Right",
			[{ "id": "123", "jsx": (<Play16 />), "x_pos": "20", "y_pos": "-20" }]
		);
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);
		cy.verifyJsxDecorationOnLink("Bottom Left-Bottom Right", "123", 508, 215);
	});
});

function verifyDecorationHandlerEntryInConsole(decoratorId) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal(`decorationHandler() Decoration ID = ${decoratorId}`);
		expect(lastEventLog.data).to.equal(decoratorId);
	});
}
