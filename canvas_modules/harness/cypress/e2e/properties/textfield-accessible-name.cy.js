/*
 * Copyright 2017-2026 Elyra Authors
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

// Regression for NGP-TWC/wml-canvas-planning#23176
// An empty textfield/textarea with a visible label must keep a rendered <label for=id>.
// Jest (jsdom) does not evaluate SCSS, so the display:none regression can only be caught in a real browser.

const CASES = [
	{ file: "textField_paramDef.json", selector: "input.cds--text-input", names: ["string_empty", "string_undefined", "string_null"] },
	{ file: "textArea_paramDef.json", selector: "textarea.cds--text-area", names: ["string_empty", "string_undefined", "string_null"] }
];

CASES.forEach(({ file, selector, names }) => {
	describe(`${file}: empty control keeps an accessible name from its label`, function() {
		beforeEach(() => {
			cy.visit("/");
			cy.toggleCommonPropertiesSidePanel();
			cy.selectPropertiesContainerType("Flyout");
			cy.toggleCommonPropertiesSidePanel();
			cy.openPropertyDefinition(file);
		});

		names.forEach((name) => {
			it(`${name} is named by a label that is not display:none`, function() {
				cy.get(`div[data-id='properties-${name}'] ${selector}`).then(($ctl) => {
					expect($ctl.val(), "control is empty").to.equal("");
					const id = $ctl.attr("id");
					const label = Cypress.$(`label[for='${id}']`);
					expect(label, "label[for=id] exists").to.have.length(1);
					expect(label.text().trim(), "label has text").to.not.equal("");
					// The actual regression: display:none removes the label from the accessibility tree.
					expect(label.css("display"), "label is not display:none").to.not.equal("none");
					expect(label.css("visibility"), "label is not visibility:hidden").to.not.equal("hidden");
				});
			});
		});
	});
});
