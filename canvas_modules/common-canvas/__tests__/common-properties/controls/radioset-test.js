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
import radioParamDef from "../../test_resources/paramDefs/radio_paramDef.json";


describe("radio renders and works correctly with different enum types", () => {

	const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
	const wrapper = renderedObject.wrapper;
	const renderedController = renderedObject.controller;

	const labels = wrapper.find("label.properties-control-label");

	it("radioset control with string enum", () => {
		expect(labels.at(0).text()).to.equal("Radio String");
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("entropy");
		const radioGroup = wrapper.find("div[data-id='properties-radioString']");
		const radioStringGini = radioGroup.find("input[value='gini']");
		radioStringGini.simulate("change", { target: { checked: true, value: "gini" } });
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("gini");
	});

	it("radioset control with boolean enum", () => {
		expect(labels.at(1).text()).to.equal("Radio Boolean");
		expect(renderedController.getPropertyValue({ name: "radioBoolean" })).to.equal(true);
		const radioGroup = wrapper.find("div[data-id='properties-radioBoolean']");
		const radioFalseBoolean = radioGroup.find("input[value='false']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBoolean" })).to.equal(false);
	});

	it("radioset control for boolean without enum", () => {
		expect(labels.at(2).text()).to.equal("Radio Boolean Without Enum");
		expect(renderedController.getPropertyValue({ name: "radioBoolean2" })).to.equal(true);
		const radioGroup = wrapper.find("div[data-id='properties-radioBoolean2']");
		const radioFalseBoolean = radioGroup.find("input[value='false']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBoolean2" })).to.equal(false);
	});

	it("radioset control with number enum", () => {
		expect(labels.at(3).text()).to.equal("Radio Number");
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(2);
		const radioGroup = wrapper.find("div[data-id='properties-radioInteger']");
		const radioIntegerOne = radioGroup.find("input[value=1]");
		radioIntegerOne.simulate("change", { target: { checked: true, value: 1 } });
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(1);
	});

	it("radioset control with double enum", () => {
		expect(labels.at(4).text()).to.equal("Radio Double");
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(1.23);
		const radioGroup = wrapper.find("div[data-id='properties-radioDouble']");
		const radioDouble = radioGroup.find("input[type='radio']");
		radioDouble.at(1).simulate("change", { target: { checked: false, value: 3.23 } });
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(3.23);
	});

	it("radioset control with default value", () => {
		expect(labels.at(5).text()).to.equal("Radio Default");
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(23);
		const radioGroup = wrapper.find("div[data-id='properties-radioDefault']");
		const radioDefault = radioGroup.find("input[value=32]");
		radioDefault.simulate("change", { target: { checked: true, value: 32 } });
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(32);
	});

	it("radioset control undefined", () => {
		expect(labels.at(6).text()).to.equal("Radio Undefined");
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal(undefined);
		const radioGroup = wrapper.find("div[data-id='properties-radioUndefined']");
		const radioUndefined = radioGroup.find("input[value='entropy']");
		radioUndefined.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal("entropy");
	});

	it("radioset control with null value", () => {
		expect(labels.at(7).text()).to.equal("Radio Null");
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal(null);
		const radioGroup = wrapper.find("div[data-id='properties-radioNull']");
		const radioNull = radioGroup.find("input[value='entropy']");
		radioNull.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal("entropy");
	});

	it("radioset control with long label wrapped", () => {
		expect(labels.at(8).text()).to.equal("Radio Label Wrapped");
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("firstN");
		const radioGroup = wrapper.find("div[data-id='properties-radioLabelWrapped']");
		const radioOneInN = radioGroup.find("input[value='oneInN']");
		radioOneInN.simulate("change", { target: { checked: true, value: "oneInN" } });
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("oneInN");
		const radioLongLabel = radioGroup.find("input[value='longLabel']");
		radioLongLabel.simulate("change", { target: { checked: true, value: "longLabel" } });
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("longLabel");
	});

	it("radioset control with error", () => {
		expect(labels.at(9).text()).to.equal("Radio Error");
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("gini");
		let radioGroup = wrapper.find("div[data-id='properties-radioError']");
		const radioError = radioGroup.find("input[value='entropy']");
		radioError.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("entropy");
		radioGroup = wrapper.find("div[data-id='properties-radioError']");
		const messageWrapper = radioGroup.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("radioset control disabled", () => {
		expect(labels.at(11).text()).to.equal("Radio Disabled");
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-disable']");
		const checkbox = checkboxsetWrapper.find("input[id='properties-disable']");
		// checked the disable box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		wrapper.update();
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("gini");
		const radioGroup = wrapper.find("div[data-id='properties-radioDisable']");
		const radioDisable = radioGroup.find("input[value='entropy']");
		radioDisable.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("entropy");
	});

	it("radioset control hidden", () => {
		expect(labels.at(12).text()).to.equal("Radio Hidden");
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-hide']");
		const checkbox = checkboxsetWrapper.find("input[id='properties-hide']");
		// checked the hidden box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		wrapper.update();
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("gini");
		const radioGroup = wrapper.find("div[data-id='properties-radioHidden']");
		const radioHidden = radioGroup.find("input[value='entropy']");
		radioHidden.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("entropy");
	});

	it("Validate radioFilter should have options filtered by enum_filter", () => {
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-filter']");
		const checkbox = checkboxsetWrapper.find("input[id='properties-filter']");
		// checked the filter box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		wrapper.update();
		const radioGroup = wrapper.find("div[data-id='properties-radioFilter']");
		const options = radioGroup.find("label");
		expect(options).to.have.length(2);
	});

	// TODO: add radioset in tables unit test cases.
});
