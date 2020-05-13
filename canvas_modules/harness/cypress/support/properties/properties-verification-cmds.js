/*
 * Copyright 2017-2020 IBM Corporation
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

Cypress.Commands.add("verifyReadOnlyTextValue", (controlId, value) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.invoke("text")
		.then((text) => {
			expect(value).equal(text);
		});
});

Cypress.Commands.add("verifyReadOnlyTextCSS", (controlId, style, value) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.should("have.css", style, value);
});

Cypress.Commands.add("verifyNoTextOverflow", (controlId) => {
	cy.get("div[data-id='properties-" + controlId + "'] span")
		.invoke("height")
		.should("be.lt", 25);
});

Cypress.Commands.add("verifyPropertiesFlyoutTitle", (givenTitle) => {
	cy.get(".properties-title-editor-input input")
		.should("have.value", givenTitle);
});

Cypress.Commands.add("verifyPropertiesFlyoutDoesNotExist", () => {
	cy.get("#node-title-editor-right-flyout-panel")
		.should("not.exist");
});

Cypress.Commands.add("verifyNewPropertiesFlyoutTitleEntryInConsole", (newTitle) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect(newTitle).to.equal(lastEventLog.data.title);
	});
});
