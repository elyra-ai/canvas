/*
 * Copyright 2024 Elyra Authors
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
describe("Test for verifying the Right Flyout panel functionality and layout in the application", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedShowRightFlyout": true });
	});

	it("Test ensuring Right Flyout panel has the correct default size", function() {
		cy.verifyRightFlyoutPanelWidth(300);
		cy.verifyRightFlyoutPanelHeight(750);
	});

	it("Test ensuring Right Flyout panel has the correct size when positioned under the Canvas toolbar", function() {
		cy.setCanvasConfig({ "selectedRightFlyoutUnderToolbar": true });
		cy.verifyRightFlyoutPanelWidth(300);
		cy.verifyRightFlyoutPanelHeight(709);
	});
});
