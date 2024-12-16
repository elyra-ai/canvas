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
describe("Test whether cross site scripting is possible", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test adding nodes from palette, link nodes, link comment to node, delete node, delete comment", function() {

		// This will help detect if an alert has been displayed.
		const stub = cy.stub();
		cy.on("window:alert", stub);

		// The canvas securityXss.json contains a comment, node label and text decoration
		// that all contain the following as text "<img src onerror=alert(origin)>"
		// If this HTML text has not been escaped properly in any of these elements
		// it will cause an alert to be displayed. This would indicate the possibility
		// for a XSS attack. Therefore, we check to make sure the stub is NOT called
		// which indicates that the alert was NOT displayed. Note: Cypress doesn't
		// actually display alerts so this is the way to detect if one would have been
		// displayed.
		cy.openCanvasDefinition("securityXss.json")
			.then(() => {
				expect(stub).to.not.be.called;
			});

		cy.verifyCommentExists("<img src onerror=alert(origin)>");

		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");

		// After entering the HTML into the comment verify that an alert would
		// NOT have been displayed on the screen.
		cy.editTextInComment("", "<img src onerror=alert(origin)> 1")
			.then(() => {
				expect(stub).to.not.be.called;
			});

		cy.verifyCommentExists("<img src onerror=alert(origin)> 1");

	});
});
