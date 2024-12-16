/*
 * Copyright 2017-2025 Elyra Authors
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
describe("Testing top panel", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("commentColorCanvas.json");
		cy.setCanvasConfig({ "selectedShowTopPanel": true });
	});

	it("Testing bottom panel exists with default height and width", function() {
		// Test top panel is displayed successfully
		cy.verifyTopPanelHeight(97);
		cy.verifyTopPanelWidth(1328);

		// Test top panel stays same size with right flyout open
		cy.setCanvasConfig({ "selectedShowRightFlyout": true });
		cy.verifyTopPanelHeight(97);
		cy.verifyTopPanelWidth(1028);

		// Test top panel stays same size with palette open.
		cy.clickToolbarPaletteOpen();
		cy.verifyTopPanelHeight(97);
		cy.verifyTopPanelWidth(844);

		// Test top panel stays same size with palette open and right flyout closed
		cy.setCanvasConfig({ "selectedShowRightFlyout": false });
		cy.verifyTopPanelHeight(97);
		cy.verifyTopPanelWidth(1143);
	});
});
