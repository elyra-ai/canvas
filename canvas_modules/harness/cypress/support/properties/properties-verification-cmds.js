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

Cypress.Commands.add("verifyReadOnlyNumericValue", (value) => {
	cy.get(".properties-readonly span").first()
		.invoke("text")
		.then((text) => {
			const num = parseFloat(text);
			expect(value).equal(num);
		});
});

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
