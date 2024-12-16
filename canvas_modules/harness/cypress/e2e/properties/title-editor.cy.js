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

describe("Properties title editor test", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openPropertyDefinition("numberfield_paramDef.json");
	});

	it("Test multi-line warning message", function() {
		// Edit title
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("My new title");

		// Title length exceeds 10 characters. Verify multi-line warning message is displayed
		cy.verifyMessageInPropertiesTitleEditor(
			"Title exceeds 10 characters. This is a warning message. There is no restriction on message length." +
      " Height is adjusted for multi-line messages.",
			"warning"
		);
	});

	it("Test single line error message", function() {
		// Edit title
		cy.clickPropertiesFlyoutTitleEditIcon();
		cy.enterNewPropertiesFlyoutTitle("My new long title");

		// Title length exceeds 15 characters. Verify error message is displayed
		cy.verifyMessageInPropertiesTitleEditor(
			"Only 15 characters are allowed in title.",
			"error"
		);
	});
});
