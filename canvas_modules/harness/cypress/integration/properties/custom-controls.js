/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
		cy.toggleCategory("Map and Slider");
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
