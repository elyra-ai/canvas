/*
 * Copyright 2017-2025 Elyra Authors
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

describe("Test using region select to select canvas objects", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test region selects a node when fully covered by the region", function() {
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(80, 96, 200, 200);
		cy.verifyNodeIsSelected("Binding (entry) node");
	});

	it("Test region selects a node when partially covered by the region", function() {
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(80, 96, 120, 120);
		cy.verifyNodeIsSelected("Binding (entry) node");
	});

	it("Test region selects a comment when fully covered by the region", function() {
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(5, 5, 250, 92);
		cy.verifyCommentIsSelected("This canvas shows the 4 different node types and three link types: " +
			"node links, association links and comments links.");
	});

	it("Test region selects a comment when partially covered by the region", function() {
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(5, 5, 200, 92);
		cy.verifyCommentIsSelected("This canvas shows the 4 different node types and three link types: " +
			"node links, association links and comments links.");
	});

	it("Test region selects a data link with straight lines when partially covered by the region", function() {
		cy.setCanvasConfig({ "selectedLinkType": "Straight" });
		cy.setCanvasConfig({ "selectedLinkSelection": "LinkOnly" });
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(420, 140, 440, 350);
		cy.verifyLinkIsSelected("a81684aa-9b09-4620-aa59-54035a5de913");
	});

	it("Test region selects a comment link when partially covered by the region", function() {
		cy.setCanvasConfig({ "selectedLinkType": "Straight" });
		cy.setCanvasConfig({ "selectedLinkSelection": "LinkOnly" });
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(240, 100, 280, 140);
		cy.verifyNumberOfSelectedObjects(1);
	});

	it("Test region selects a comment and node link when partially covered by the region", function() {
		cy.setCanvasConfig({ "selectedLinkType": "Straight" });
		cy.setCanvasConfig({ "selectedLinkSelection": "LinkOnly" });
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(240, 100, 280, 240);
		cy.verifyNumberOfSelectedObjects(2);
	});

	it("Test region selects a comment & node & assoc link when partially covered by the region", function() {
		cy.setCanvasConfig({ "selectedLinkType": "Straight" });
		cy.setCanvasConfig({ "selectedLinkSelection": "LinkOnly" });
		cy.verifyNumberOfSelectedObjects(0);
		cy.selectWithRegion(700, 150, 730, 370);
		cy.verifyNumberOfSelectedObjects(3);
	});

});
