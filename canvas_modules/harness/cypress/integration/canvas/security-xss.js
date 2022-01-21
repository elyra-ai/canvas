/*
 * Copyright 2022 Elyra Authors
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

		const stub = cy.stub();
		cy.on("window:alert", stub);

		cy.openCanvasDefinition("securityXss.json")
			.then(() => {
				expect(stub).to.not.be.called;
			});

		cy.verifyCommentExists("<img src onerror=alert(origin)>");

		cy.rightClickToDisplayContextMenu(400, 100);
		cy.clickOptionFromContextMenu("New comment");
		cy.editTextInComment("", "<img src onerror=alert(origin)> 1")
			.then(() => {
				expect(stub).to.not.be.called;
			});

		cy.verifyCommentExists("<img src onerror=alert(origin)> 1");

	});
});
