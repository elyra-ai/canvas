/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */


// import React from "react";
import propertyUtils from "../_utils_/property-utils";
// import { mount } from "enzyme";
import { expect } from "chai";

// import isEqual from "lodash/isEqual";

const PANEL_SELECTOR_PARAM_DEF = require("../test_resources/paramDefs/panelSelector.json");


describe("'panel selector insert' renders correctly", () => {
	it("it should have 3 text panels", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(PANEL_SELECTOR_PARAM_DEF);
		const wrapper = renderedObject.wrapper;
		wrapper.update();

		// Properties should have 3 text panels each with a description
		expect(wrapper.find("#editor-control-fruit-color2 .text-panel")).to.have.length(3);
		expect(wrapper.find("#editor-control-fruit-color2 .panel-description")).to.have.length(3);

		// Check the descriptions are as expected.
		const descriptions = wrapper.find("#editor-control-fruit-color2 .panel-description");
		expect(descriptions.at(0).text()).to.equal("Apples ripen six to 10 times faster at room temperature than if they are refrigerated.");
		expect(descriptions.at(1).text()).to.equal("Blueberries freeze in just 4 minutes.");
		expect(descriptions.at(2).text()).to.equal("Lemons are a hybrid between a sour orange and a citron.");

		// Check that the red(0) text panel is enabled and blue (1) and yellow (2)
		// text panels are disabled. 
		var redState = renderedObject.controller.getPanelState({ "name": "red2" });
		expect(redState).to.equal("enabled");
		var blueState = renderedObject.controller.getPanelState({ "name": "blue2" });
		expect(blueState).to.equal("disabled");
		var yellowState = renderedObject.controller.getPanelState({ "name": "yellow2" });
		expect(yellowState).to.equal("disabled");

		// Simulate a click on blue (1) radio button
		const input = wrapper.find("#editor-control-fruit-color2");
		expect(input).to.have.length(1);
		const radios = input.find("input[type='radio']");
		expect(radios).to.have.length(3);

		const radioBlue = radios.find("input[value='blue2']");
		radioBlue.simulate("change", { target: { checked: true, value: "blue2" } });
		wrapper.update();

		// Check that the blue (1) text panel is enabled and red (0) and yellow (2)
		// text panels are disabled.
		redState = renderedObject.controller.getPanelState({ "name": "red2" });
		expect(redState).to.equal("disabled");
		blueState = renderedObject.controller.getPanelState({ "name": "blue2" });
		expect(blueState).to.equal("enabled");
		yellowState = renderedObject.controller.getPanelState({ "name": "yellow2" });
		expect(yellowState).to.equal("disabled");
	});
});
