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
	});

	it("Testing bottom pannel seizing", function() {
	// Open right side menu & toggle bottomPanel
		cy.setCanvasConfig({ "selectedShowBottomPanel": true });

		// Resize the bottom pannel & verify it's height
		cy.moveBottomPanelDivider(-150);
		cy.verifyBoottomPanelHeight(243);

		cy.moveBottomPanelDivider(300);
		cy.verifyBoottomPanelHeight(543);
	});
});
