/*
 * Copyright 2017-2022 Elyra Authors
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

import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import radioParamDef from "../../test_resources/paramDefs/radio_paramDef.json";

describe("radio renders and works correctly with different enum types", () => {

	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("radioset tooltip with string enum Gini & Entropy are displayed ", () => {
		const radioStringContainer = wrapper.find("div[data-id='properties-ci-radioString']");
		const tooltipConatiner = radioStringContainer.find("div#tooltipContainer");
		// Verify Entropy Tooltips text
		expect(tooltipConatiner.at(0).text()).to.equal("desc for Gini");
		// Verify Gini Tooltips text
		expect(tooltipConatiner.at(1).text()).to.equal("desc for Entropy");
	});

	it("radioset control with string enum", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioString']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio String");
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("entropy");
		const radioGroup = wrapper.find("div[data-id='properties-radioString']");
		const radioStringGini = radioGroup.find("input[value='gini']");
		radioStringGini.simulate("change", { target: { checked: true, value: "gini" } });
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("gini");
	});

	it("radioset control with boolean enum", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioBooleanWithEnum']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Boolean with Enum");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithEnum" })).to.equal(true);
		const radioGroup = wrapper.find("div[data-id='properties-radioBooleanWithEnum']");
		const radioFalseBoolean = radioGroup.find("input[value='false']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithEnum" })).to.equal(false);
	});

	it("radioset control for boolean without enum", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioBooleanWithoutEnum']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Boolean without Enum");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithoutEnum" })).to.equal(true);
		const radioGroup = wrapper.find("div[data-id='properties-radioBooleanWithoutEnum']");
		const radioFalseBoolean = radioGroup.find("input[value='false']");
		radioFalseBoolean.simulate("change", { target: { checked: true, value: false } });
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithoutEnum" })).to.equal(false);
	});

	it("radioset control for boolean with labels", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioBooleanWithLabels']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Boolean with Labels");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithLabels" })).to.equal(false);
		const radioGroup = wrapper.find("div[data-id='properties-radioBooleanWithLabels']");
		const radioTrueBoolean = radioGroup.find("input[value='true']");
		radioTrueBoolean.simulate("change", { target: { checked: true, value: true } });
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithLabels" })).to.equal(true);
	});

	it("radioset control with number enum", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioInteger']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Number");
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(2);
		const radioGroup = wrapper.find("div[data-id='properties-radioInteger']");
		const radioIntegerOne = radioGroup.find("input[value=1]");
		radioIntegerOne.simulate("change", { target: { checked: true, value: 1 } });
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(1);
	});

	it("radioset control with double enum", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioDouble']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Double");
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(1.23);
		const radioGroup = wrapper.find("div[data-id='properties-radioDouble']");
		const radioDouble = radioGroup.find("input[type='radio']");
		radioDouble.at(1).simulate("change", { target: { checked: false, value: 3.23 } });
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(3.23);
	});

	it("radioset control with default value", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioDefault']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Default");
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(23);
		const radioGroup = wrapper.find("div[data-id='properties-radioDefault']");
		const radioDefault = radioGroup.find("input[value=32]");
		radioDefault.simulate("change", { target: { checked: true, value: 32 } });
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(32);
	});

	it("radioset control undefined", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioUndefined']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Undefined");
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).is.undefined;
		const radioGroup = wrapper.find("div[data-id='properties-radioUndefined']");
		const radioUndefined = radioGroup.find("input[value='entropy']");
		radioUndefined.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal("entropy");
	});

	it("radioset control with null value", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioNull']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Null");
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal(null);
		const radioGroup = wrapper.find("div[data-id='properties-radioNull']");
		const radioNull = radioGroup.find("input[value='entropy']");
		radioNull.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal("entropy");
	});

	it("radioset control with long label wrapped", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioLabelWrapped']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Label Wrapped");
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
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioError']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Error");
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
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioDisable']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Disabled");
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-disable']");
		const checkbox = checkboxsetWrapper.find("input");
		// checked the disable box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("gini");
		const radioGroup = wrapper.find("div[data-id='properties-radioDisable']");
		const radioDisable = radioGroup.find("input[value='entropy']");
		radioDisable.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("entropy");
	});

	it("radioset control selected items disabled", () => {
		let checkboxsetWrapper = wrapper.find("div[data-id='properties-disable_one']");
		let checkbox = checkboxsetWrapper.find("input");
		// checked the disable box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(renderedController.getPropertyValue({ name: "radioDisableSome" })).to.equal("oranges");

		checkboxsetWrapper = wrapper.find("div[data-id='properties-disable_two']");
		checkbox = checkboxsetWrapper.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(renderedController.getPropertyValue({ name: "radioDisableSome" })).to.equal("pears");

		const radioGroup = wrapper.find("div[data-id='properties-radioDisableSome']");
		const options = radioGroup.find("div.properties-radioset-panel");
		expect(options).to.have.length(4);
		let radioWrapper = options.at(1).find("input");
		expect(radioWrapper.prop("disabled")).to.equal(true);
		radioWrapper = options.at(2).find("input");
		expect(radioWrapper.prop("disabled")).to.equal(false);
		radioWrapper = options.at(3).find("input");
		expect(radioWrapper.prop("disabled")).to.equal(true);
	});


	it("radioset control hidden", () => {
		const controlDiv = wrapper.find("div[data-id='properties-ci-radioHidden']");
		const label = controlDiv.find("label.properties-control-label");
		expect(label.text()).to.equal("Radio Hidden");
		const checkboxsetWrapper = wrapper.find("div[data-id='properties-hide']");
		const checkbox = checkboxsetWrapper.find("input");
		// checked the hidden box
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("gini");
		const radioGroup = wrapper.find("div[data-id='properties-radioHidden']");
		const radioHidden = radioGroup.find("input[value='entropy']");
		radioHidden.simulate("change", { target: { checked: true, value: "entropy" } });
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("entropy");
	});

});

describe("radio filtered enum works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate radioFilter should have options filtered by enum_filter", () => {
		let radioGroup = wrapper.find("div[data-id='properties-radioFilter']");
		// validate the correct number of options show up on open
		let options = radioGroup.find("div.properties-radioset-panel");
		expect(options).to.have.length(3);
		// make sure there isn't warning on first open
		expect(radioGroup.find("div.properties-validation-message")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = wrapper.find("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		radioGroup = wrapper.find("div[data-id='properties-radioFilter']");
		options = radioGroup.find("div.properties-radioset-panel");
		expect(options).to.have.length(2);
	});

	it("Validate radioFilter should clear the property value if filtered", () => {
		const propertyId = { name: "radioFilter" };
		// value was initially set to "yellow" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "green");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("green");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "green" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.equal(null);
	});

	it("Validate radioFilter should set default value if current value is filtered out", () => {
		const propertyId = { name: "radioFilterDefault" };
		// value was initially set to "yellow" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.equal("yellow");
		renderedController.updatePropertyValue({ name: "filterDefault" }, true);
		// "yellow" isn't part of the filter so the value should be cleared and the default value should be set
		expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
	});

});

// TODO: add radioset in tables unit test cases.
describe("radioset works in table correctly", () => {
	let wrapper;
	let tableDiv;
	let renderedController;
	const tableRadioPropertyId = { name: "radioset_table_error" };
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		const controlDiv = wrapper.find("button.properties-summary-link-button");
		controlDiv.simulate("click");
		tableDiv = wrapper.find(".properties-vt");
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validation enum in table cell default to select control instead of radioset", () => {
		const inlineEnum = wrapper.find("div[data-id='properties-radioset_table_error_0_0'].properties-dropdown");
		expect(inlineEnum).to.have.length(1);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][0]).to.equal("dog");
	});

	it("Check basic use of onpanel radiosets in table flyout", () => {
		tableUtils.clickTableRows(tableDiv, [0]);
		tableDiv = wrapper.find(".properties-vt");
		expect(tableDiv.find(".properties-vt-row-selected")).to.have.length(1);

		const onPanelRadioset = wrapper.find("div[data-id='properties-radioset_col2']");
		const onPanelRadios = onPanelRadioset.find("input.bx--radio-button");
		expect(onPanelRadios).to.have.length(4);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("pear");
		onPanelRadios.at(1).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("orange");
	});

	it("Check basic use of subpanel radiosets in table flyout", () => {
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("red");
		const subpanelButton = tableDiv.find(".properties-table-subcell").find("button.properties-subpanel-button");
		expect(subpanelButton).to.have.length(1);
		subpanelButton.simulate("click");
		const subpanelRadioset = wrapper.find("div[data-id='properties-radioset_col3']");
		const subpanelRadios = subpanelRadioset.find("input.bx--radio-button");
		expect(subpanelRadios).to.have.length(6);
		subpanelRadios.at(1).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("green");
	});

	it("Check disable interactivity in table flyout", () => {
		// test on panel disable
		tableUtils.clickTableRows(tableDiv, [0]);
		tableDiv = wrapper.find(".properties-vt");

		const onPanelRadioset = wrapper.find("div[data-id='properties-radioset_col2']");
		const onPanelRadios = onPanelRadioset.find("input.bx--radio-button");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("pear");
		onPanelRadios.at(1).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("orange");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][2]).to.equal(false);
		const disableOnpanelCheckbox = wrapper.find("div[data-id='properties-ci-radioset_col2_checkbox']");
		const checkbox = disableOnpanelCheckbox.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][2]).to.equal(true);
		expect(onPanelRadios).to.have.length(4);
		onPanelRadios.at(0).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("apple");
		onPanelRadios.at(2).simulate("change");
		// confirm that "pear" is disabled and result defaults to first entry in set
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("apple");
		// test subpanel disable
		renderedController.updatePropertyValue({ col: 0, row: 0, ...tableRadioPropertyId }, "cat");
		const subpanelButton = tableDiv.find(".properties-table-subcell").find("button.properties-subpanel-button");
		subpanelButton.simulate("click");
		const subpanelRadioset = wrapper.find("div[data-id='properties-radioset_col3']");
		const subpanelRadios = subpanelRadioset.find("input.bx--radio-button");
		subpanelRadios.at(1).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("green");
		// selecting the disabled option should default to first radio in the list, red, instead of orange
		subpanelRadios.at(4).simulate("change");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("red");
	});
});

describe("radioset classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("radioset should have custom classname defined", () => {
		expect(wrapper.find(".radioset-control-class")).to.have.length(1);
	});

	it("radioset should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "radioset_table-error-panel");
		expect(wrapper.find(".table-radioset-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-radioset-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-radioset-control-class")).to.have.length(1);
	});
});
