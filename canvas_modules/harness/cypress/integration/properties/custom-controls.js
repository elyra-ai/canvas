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

describe("Test of custom panels", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openPropertyDefinition("CustomPanel_paramDef.json");
	});

	it("Test custom panels are working correctly", function() {
		cy.get(".harness-custom-control-custom-toggle label").first()
			.click();
		// custom toggle should have an error
		cy.get("#custom_toggle2").should("have.attr", "disabled");
		cy.toggleCategory("Slider");
		cy.openSubPanel("Configure Slider");
		verifySliderDropDown(6);
		// move slider to be above 60
		cy.get(".harness-custom-control-slider .bx--slider__thumb")
			.trigger("mousedown")
			.trigger("mousemove", { clientX: 900 })
			.trigger("mouseup");
		verifySliderDropDown(3);
		cy.saveWideflyout();
		cy.saveFlyout();
		cy.document().then((doc) => {
			const lastEventLog = testUtils.getLastEventLogData(doc);
			expect(60).to.be.lt(parseInt(lastEventLog.data.form.custom_slider, 10));
			expect(lastEventLog.data.form.custom_toggle).to.be.false;
			// expect 2 error message from custom panels
			expect(2).to.equal(lastEventLog.data.messages.length);
		});
	});
});

function verifySliderDropDown(elements) {
	cy.get("div[data-id='properties-color']").click();
	cy.get("#properties-color-dropdown__menu > div")
		.should("have.length", elements);
	cy.get("div[data-id='properties-color']").click();
}
