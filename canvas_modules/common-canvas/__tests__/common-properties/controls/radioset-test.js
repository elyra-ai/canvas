/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-undefined: "off"*/

// import RadiosetControl from "../../../src/common-properties/editor-controls/radioset-control.jsx";
import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";
import radioParamDef from "../../test_resources/paramDefs/radio_paramDef.json";

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
		let radios = input.find("input[type='radio']");
		expect(radios).to.have.length(3);
		radios.forEach((radio) => {
			// console.log("radio propsss " + JSON.stringify(radio.props()));
			expect(radio.is("[disabled]")).to.equal(true);
		});
		expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

		let checkbox = wrapper.find("#editor-control-checkboxEnable");
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

		checkbox = wrapper.find("#editor-control-checkboxEnable");
		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: false, id: "Enable" } });
		wrapper.update();
		expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

		radios = wrapper.find("#editor-control-radiosetColor").find("input[type='radio']");
		radios.forEach((radio) => {
			expect(radio.is("[disabled]")).to.equal(true);
		});
	});
});

describe("radio renders and works correctly with different enum types", () => {

	const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
	const wrapper = renderedObject.wrapper;
	const renderedController = renderedObject.controller;

	const labels = wrapper.find(".control-label");

	it("radioset control with string enum", () => {
		expect(labels.at(0).text()).to.equal("Radio String");
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("entropy");
		const radioStringGini = wrapper.find("input[value='gini'][name='radioString']");
		radioStringGini.simulate("change", { target: { checked: true, value: "gini" } });
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("gini");
	});

	it("radioset control with boolean enum", () => {
		expect(labels.at(1).text()).to.equal("Radio Boolean");
		expect(renderedController.getPropertyValue({ name: "radioBoolean" })).to.equal(true);
		const radioFalseBoolean = wrapper.find("input[value=false][name='radioBoolean']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBoolean" })).to.equal(false);
	});

	it("radioset control for boolean without enum", () => {
		expect(labels.at(2).text()).to.equal("Radio Boolean Without Enum");
		expect(renderedController.getPropertyValue({ name: "radioBoolean2" })).to.equal(true);
		const radioFalseBoolean = wrapper.find("input[value=false][name='radioBoolean2']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBoolean2" })).to.equal(false);
	});

	it("radioset control with number enum", () => {
		expect(labels.at(3).text()).to.equal("Radio Number");
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(2);
		const radioIntegerOne = wrapper.find("input[value=1][name='radioInteger']");
		radioIntegerOne.simulate("change", { target: { checked: true, value: 1 } });
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(1);
	});

	it("radioset control with boolean enum", () => {
		expect(labels.at(4).text()).to.equal("Radio Double");
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(1.23);
		const radioDouble = wrapper.find("input[name='radioDouble']");
		radioDouble.at(0).simulate("change", { target: { checked: false, value: 3.23 } });
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(3.23);
	});

	it("radioset control with default value", () => {
		expect(labels.at(5).text()).to.equal("Radio Default");
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(23);
		const radioDefault = wrapper.find("input[value=23][name='radioDefault']");
		radioDefault.simulate("change", { target: { checked: true, value: 32 } });
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(32);
	});

	it("radioset control undefined", () => {
		expect(labels.at(6).text()).to.equal("Radio Undefined");
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal(undefined);
		const radioUndefined = wrapper.find("input[value='entropy'][name='radioUndefined']");
		radioUndefined.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal("entropy");
	});

	it("radioset control with null value", () => {
		expect(labels.at(7).text()).to.equal("Radio Null");
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal(null);
		const radioNull = wrapper.find("input[value='entropy'][name='radioNull']");
		radioNull.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal("entropy");
	});

	it("radioset control with error", () => {
		expect(labels.at(8).text()).to.equal("Radio Error");
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("gini");
		let radioError = wrapper.find("input[value='entropy'][name='radioError']");
		radioError.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("entropy");
		let error = wrapper.find(".form__validation--error");
		expect(error).to.have.length(1);
		expect(error.at(0).text()).to.equal("Needs to be gini");
		radioError = wrapper.find("input[value='entropy'][name='radioError']");
		radioError.simulate("change", { target: { checked: true, value: "gini" } });
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("gini");
		wrapper.update();
		error = wrapper.find(".form__validation--error");
		expect(error).to.have.length(0);
	});

	it("radioset control with warning enum", () => {
		expect(labels.at(9).text()).to.equal("Radio Warning");
		expect(renderedController.getPropertyValue({ name: "radioWarning" })).to.equal("gini");
		let radioWarning = wrapper.find("input[value='gini'][name='radioWarning']");
		radioWarning.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioWarning" })).to.equal("entropy");
		let warning = wrapper.find(".form__validation--warning");
		expect(warning).to.have.length(1);
		expect(warning.at(0).text()).to.equal("Needs to be gini");
		radioWarning = wrapper.find("input[value='gini'][name='radioWarning']");
		radioWarning.simulate("change", { target: { checked: true, value: "gini" } });
		expect(renderedController.getPropertyValue({ name: "radioWarning" })).to.equal("gini");
		wrapper.update();
		warning = wrapper.find(".form__validation--warning");
		expect(warning).to.have.length(0);
	});

	it("radioset control disabled", () => {
		expect(labels.at(10).text()).to.equal("Radio Disabled");
		const checkboxDisable = wrapper.find("#editor-control-disable");
		checkboxDisable.simulate("change", { target: { checked: false } });
		wrapper.update();
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("gini");
		const radioDisable = wrapper.find("input[value='gini'][name='radioDisable']");
		radioDisable.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("entropy");
	});

	it("radioset control hidden", () => {
		expect(labels.at(11).text()).to.equal("Radio Hidden");
		const checkboxHide = wrapper.find("#editor-control-hide");
		checkboxHide.simulate("change", { target: { checked: false } });
		wrapper.update();
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("gini");
		const radioHidden = wrapper.find("input[value='gini'][name='radioHidden']");
		radioHidden.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("entropy");
	});

	it("Validate radioFilter should have options filtered by enum_filter", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // get the CONDITIONS category
		const checkbox = category.find("#editor-control-filter").at(0);
		const evt = { target: { checked: true } };
		checkbox.simulate("change", evt);
		const select = category.find("#editor-control-radioFilter").at(0);
		const options = select.find("label");
		expect(options).to.have.length(2);
	});
});
