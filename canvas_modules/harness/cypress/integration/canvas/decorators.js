/*
 * Copyright 2017-2020 Elyra Authors
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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test adding a decorator to a node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("decoratorCanvas.json");
		cy.openCanvasAPI("Set Node Decorations");
	});

	it("Test adding a new decoration, move decoration, replace decoration," +
  " add label decorations at customized positions", function() {
		// Add a new decoration to the top left position
		cy.selectNodeForDecoration("No Decorator");
		cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"position\": \"topLeft\"{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 10, 5);

		// Move the decoration to the top right position
		cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"position\": \"topRight\"{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 46, 5);

		// Add a new decoration to the bottom left position along with the existing decoration
		cy.selectNodeForDecoration("No Decorator");
		cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"position\": \"topRight\"{}}," +
    "{{}\"id\": \"345\", \"position\": \"bottomLeft\"{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 2);
		cy.verifyDecorationTransformOnNode("No Decorator", "123", 46, 5);
		cy.verifyDecorationTransformOnNode("No Decorator", "345", 10, 41);

		// Replace decorations with a new decoration at the bottom right position with an image and a hotspot
		cy.selectNodeForDecoration("No Decorator");
		cy.updateDecorationsJSON("[{{}\"id\": \"678\", \"position\": \"bottomRight\"," +
    " \"image\": \"/images/decorators/zoom-in_32.svg\", \"hotspot\": true{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "678", 46, 41);
		cy.verifyDecorationImageOnNode("No Decorator", "678", "/images/decorators/zoom-in_32.svg");

		// Click on the hot spot and make sure it calls the callback function
		cy.clickDecoratorHotspotOnNode("678", "No Decorator");
		verifyDecorationHandlerEntryInConsole("678");

		// Add a decoration at a customized position
		cy.updateDecorationsJSON("[{{}\"id\": \"999\", \"x_pos\": -20, \"y_pos\": -25{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnNode("No Decorator", 1);
		cy.verifyDecorationTransformOnNode("No Decorator", "999", -20, -25);

		// Add a two label decorations at customized positions
		cy.updateDecorationsJSON(
			"[{{}\"id\": \"label_1\", \"x_pos\": -20, \"y_pos\": -25, \"label\": \"A first test label\"{}}," +
      " {{}\"id\": \"label_2\", \"x_pos\": 40, \"y_pos\": 90, \"label\": \"A second test label\"{}}]"
		);
		cy.submitAPI();
		cy.verifyNumberOfLabelDecoratorsOnNode("No Decorator", 2);
		cy.verifyLabelDecoration("No Decorator", "label_1", "A first test label", -20, -25);
		cy.verifyLabelDecoration("No Decorator", "label_2", "A second test label", 40, 90);

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
		cy.selectNodeForDecoration("Custom position");
		cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"path\": \"M 0 0 L 10 10 -10 10 Z\", " +
			"\"outline\": false, \"x_pos\": -20, \"y_pos\": 20, \"hotspot\": true{}}]");
		cy.submitAPI();
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

	// it("Test editable multi-line label decoration on a node.", function() {
	// 	cy.selectNodeForDecoration("No Decorator");
	// 	cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"position\": \"bottomLeft\", \"y_pos\": \"20\"{}}]");
	// 	cy.submitAPI();
	// });

});


describe("Test adding a decorator to a link", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("decoratorCanvas.json");
		cy.openCanvasAPI("Set Link Decorations");
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
		cy.selectLinkForDecoration("Top Left-Top Right");
		cy.updateDecorationsJSON("[]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnLink("Top Left-Top Right", 0);

		// Remove all decorations from the node data link
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 0);

		// Add a rectangle decorator to association link
		cy.selectLinkForDecoration("Top Left-Top Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"123\"{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnLink("Top Left-Top Right", 1);

		// Add a label decorator to association link
		cy.updateDecorationsJSON("[{{}\"id\": \"123\", \"label\": \"Link Decoration\"{}}]");
		cy.submitAPI();
		cy.verifyNumberOfLabelDecoratorsOnLink("Top Left-Top Right", 1);

		// Add an image decorator with a hotspot to the node data link
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"456\", \"position\": \"source\"," +
    " \"image\": \"/images/decorators/zoom-in_32.svg\", \"hotspot\": true{}}]");
		cy.submitAPI();
		cy.verifyNumberOfDecoratorsOnLink("Bottom Left-Bottom Right", 1);

		// Click on the hotspot and make sure it works
		cy.clickDecoratorHotspotOnLink("456", "Bottom Left-Bottom Right");
		verifyDecorationHandlerEntryInConsole("456");
	});

	it("Test adding a path decoration to a link", function() {
		// Add a new decoration to the top left position
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"555\", \"path\": \"M 0 0 L 10 10 -10 10 Z\", " +
			"\"outline\": false, \"x_pos\": -20, \"y_pos\": 20, \"hotspot\": true{}}]");
		cy.submitAPI();
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
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"555\", \"position\": \"source\", " +
			"\"distance\": 30{}}]");
		cy.submitAPI();

		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 410, 243.5);

		// Test negative distance from target position
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"555\", \"position\": \"target\", " +
			"\"distance\": -30{}}]");
		cy.submitAPI();

		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 566, 243.5);

		// Test negative distance from middle position
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"555\", \"position\": \"middle\", " +
			"\"distance\": -20{}}]");
		cy.submitAPI();

		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 468, 243.5);

		// Test positive distance from middle position
		cy.selectLinkForDecoration("Bottom Left-Bottom Right");
		cy.updateDecorationsJSON("[{{}\"id\": \"555\", \"position\": \"middle\", " +
			"\"distance\": 20{}}]");
		cy.submitAPI();

		cy.verifyDecorationTransformOnLink("Bottom Left-Bottom Right", "555", 508, 243.5);
	});
});

function verifyDecorationHandlerEntryInConsole(decoratorId) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal(`decorationHandler() Decoration ID = ${decoratorId}`);
		expect(lastEventLog.data).to.equal(decoratorId);
	});
}
