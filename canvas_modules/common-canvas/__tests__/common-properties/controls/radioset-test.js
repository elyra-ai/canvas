/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import RadiosetControl from "../../../src/common-properties/editor-controls/radioset-control.jsx";
import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const defaultControlStates = {
	"textareaDescription": "hidden",
	"radiosetColor": "disabled",
	"expressionBox": "disabled",
	"field_types[1][3]": "hidden",
	"field_types[1][2]": "disabled",
	"field_types[3][3]": "hidden",
	"field_types[3][2]": "disabled",
	"field_types[4][3]": "hidden",
	"field_types[4][2]": "disabled",
	"field_types[6][3]": "hidden",
	"field_types[6][2]": "disabled"
};

const controller = new Controller();

describe("condition messages renders correctly with radioSet control", () => {
	// test radioSet disabled and warning message
	it("radiosetColor control should have warning message selected yellow", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const propertyId = { name: "radiosetColor" };
		const input = wrapper.find("#editor-control-radiosetColor");
		expect(input).to.have.length(1);
		const radios = input.find("input[type='radio']");
		expect(radios).to.have.length(3);
		radios.forEach((radio) => {
			// console.log("radio propsss " + JSON.stringify(radio.props()));
			expect(radio.is("[disabled]")).to.equal(true);
		});
		expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

		const checkbox = wrapper.find("#editor-control-checkboxEnable");
		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
		wrapper.update();
		radios.forEach((radio) => {
		// console.log("radio propsss " + JSON.stringify(radio.props()));
			expect(radio.is("[disabled]")).to.equal(false);
		});

		expect(controller.getControlState(propertyId)).to.equal("enabled");

		const radioYellow = radios.find("input[value='yellow']");
		radioYellow.simulate("change", { target: { checked: true, value: "yellow" } });
		wrapper.update();
		const radiosetColorWarningMessages = {
			radiosetColor:
						{ type: "warning",
							text: "Are you sure you want to choose yellow?"
						}
		};
		const actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(radiosetColorWarningMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(wrapper.find(".validation-warning-message-icon-checkbox")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);

		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: false, id: "Enable" } });
		wrapper.update();
		expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

		radios.forEach((radio) => {
			expect(radio.is("[disabled]")).to.equal(true);
		});
	});
});
