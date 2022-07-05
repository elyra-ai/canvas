/*
 * Copyright 2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
describe("Testing bottom panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.setCanvasConfig({ "selectedShowBottomPanel": true });
	});

	it("Testing bottom panel sizing", function() {
		// Test bottom panel is reduced in size successfully
		cy.moveBottomPanelDivider(500);
		cy.verifyBottomPanelHeight(209);
		cy.verifyBottomPanelWidth(1328);

		// Test bottom panel is increased in size successfully
		cy.moveBottomPanelDivider(200);
		cy.verifyBottomPanelHeight(509);
		cy.verifyBottomPanelWidth(1328);

		// Test bottom panel is increased in size successfully with right flyout open
		cy.setCanvasConfig({ "selectedShowRightFlyout": true });
		cy.moveBottomPanelDivider(200);
		cy.verifyBottomPanelHeight(509);
		cy.verifyBottomPanelWidth(807.4375);
	});

	it("Testing bottom panel max height", function() {
		// Test bottom panel does not exceed max-size successfully
		cy.moveBottomPanelDivider(50);
		cy.verifyBottomPanelHeight(648);

		// Test bottom panel does not exceed max-size successfully with right flyout open
		cy.setCanvasConfig({ "selectedShowRightFlyout": true });
		cy.moveBottomPanelDivider(50);
		cy.verifyBottomPanelHeight(648);
		cy.verifyBottomPanelWidth(807.4375);
	});

	it("Testing bottom panel min height", function() {
		// Test bottom panel does not go under the min-size
		cy.moveBottomPanelDivider(640);
		cy.verifyBottomPanelHeight(75);

		// Test bottom panel does not exceed max-size successfully with right flyout open
		cy.setCanvasConfig({ "selectedShowRightFlyout": true });
		cy.moveBottomPanelDivider(640);
		cy.verifyBottomPanelHeight(75);
		cy.verifyBottomPanelWidth(807.4375);
	});

});
