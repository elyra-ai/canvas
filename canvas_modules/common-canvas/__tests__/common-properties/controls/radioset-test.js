/*
 * Copyright 2017-2023 Elyra Authors
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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import radioParamDef from "../../test_resources/paramDefs/radio_paramDef.json";
import { fireEvent, waitFor } from "@testing-library/react";

describe("radio renders and works correctly with different enum types", () => {

	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("radioset tooltip with string enum Gini & Entropy are displayed ", async() => {
		const tooltipContainer1 = wrapper.queryAllByText("desc for Gini");
		const tooltipContainer2 = wrapper.queryAllByText("desc for Entropy");
		// Verify Entropy Tooltips text
		expect(tooltipContainer1[0].textContent).to.equal("desc for Gini");
		expect(tooltipContainer1[0].parentElement.className).to.equal("tooltipContainer");
		// Verify Gini Tooltips text
		expect(tooltipContainer2[0].textContent).to.equal("desc for Entropy");
		expect(tooltipContainer2[0].parentElement.className).to.equal("tooltipContainer");
	});

	it("radioset control with string enum", async() => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioString']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio String");
		expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("entropy");

		const radioGroup = container.querySelector("div[data-id='properties-radioString']");
		const radioStringGini = radioGroup.querySelector("input[value='gini']");
		fireEvent.click(radioStringGini);
		await waitFor(() => {
			expect(renderedController.getPropertyValue({ name: "radioString" })).to.equal("gini");
		});
	});

	it("radioset control with string enum helper text is visible", () => {
		const controlDiv = wrapper.container.querySelector("div[data-id='properties-ci-radioString']");
		expect(controlDiv.querySelector("div.cds--form__helper-text").textContent).to.equal("RadioSet with enum string type");
	});

	it("radioset control with string enum with readonly prop", () => {
		const controlDivWrapper = wrapper.container.querySelector("div[data-id='properties-ci-radioString_readonly']");
		expect(controlDivWrapper.querySelector("fieldset").className.includes("readonly")).to.equal(true);
	});

	it("radioset control with boolean enum", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioBooleanWithEnum']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Boolean with Enum");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithEnum" })).to.equal(true);
		const radioGroup = container.querySelector("div[data-id='properties-radioBooleanWithEnum']");
		const radioFalseBoolean = radioGroup.querySelector("input[value='false']");
		fireEvent.click(radioFalseBoolean);
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithEnum" })).to.equal(false);
	});

	it("radioset control for boolean without enum", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioBooleanWithoutEnum']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Boolean without Enum");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithoutEnum" })).to.equal(true);
		const radioGroup = container.querySelector("div[data-id='properties-radioBooleanWithoutEnum']");
		const radioFalseBoolean = radioGroup.querySelector("input[value='false']");
		fireEvent.click(radioFalseBoolean);
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithoutEnum" })).to.equal(false);
	});

	it("radioset control for boolean with labels", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioBooleanWithLabels']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Boolean with Labels");
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithLabels" })).to.equal(false);
		const radioGroup = container.querySelector("div[data-id='properties-radioBooleanWithLabels']");
		const radioTrueBoolean = radioGroup.querySelector("input[value='true']");
		fireEvent.click(radioTrueBoolean);
		expect(renderedController.getPropertyValue({ name: "radioBooleanWithLabels" })).to.equal(true);
	});

	it("radioset control with number enum", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioInteger']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Number");
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(2);
		const radioGroup = container.querySelector("div[data-id='properties-radioInteger']");
		const radioIntegerOne = radioGroup.querySelector("input[value='1']");
		fireEvent.click(radioIntegerOne);
		expect(renderedController.getPropertyValue({ name: "radioInteger" })).to.equal(1);
	});

	it("radioset control with double enum", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioDouble']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Double");
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(1.23);
		const radioGroup = container.querySelector("div[data-id='properties-radioDouble']");
		const radioDouble = radioGroup.querySelectorAll("input[type='radio']");
		fireEvent.click(radioDouble[1]);
		expect(renderedController.getPropertyValue({ name: "radioDouble" })).to.equal(3.23);
	});

	it("radioset control with default value", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioDefault']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Default");
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(23);
		const radioGroup = container.querySelector("div[data-id='properties-radioDefault']");
		const radioDefault = radioGroup.querySelector("input[value='32']");
		fireEvent.click(radioDefault);
		expect(renderedController.getPropertyValue({ name: "radioDefault" })).to.equal(32);
	});

	it("radioset control undefined", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioUndefined']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Undefined");
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).is.undefined;
		const radioGroup = container.querySelector("div[data-id='properties-radioUndefined']");
		const radioUndefined = radioGroup.querySelector("input[value='entropy']");
		fireEvent.click(radioUndefined);
		expect(renderedController.getPropertyValue({ name: "radioUndefined" })).to.equal("entropy");
	});

	it("radioset control with null value", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioNull']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Null");
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal(null);
		const radioGroup = container.querySelector("div[data-id='properties-radioNull']");
		const radioNull = radioGroup.querySelector("input[value='entropy']");
		fireEvent.click(radioNull);
		expect(renderedController.getPropertyValue({ name: "radioNull" })).to.equal("entropy");
	});

	it("radioset control with long label wrapped", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioLabelWrapped']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Label Wrapped");
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("firstN");
		const radioGroup = container.querySelector("div[data-id='properties-radioLabelWrapped']");
		const radioOneInN = radioGroup.querySelector("input[value='oneInN']");
		fireEvent.click(radioOneInN);
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("oneInN");
		const radioLongLabel = radioGroup.querySelector("input[value='longLabel']");
		fireEvent.click(radioLongLabel);
		expect(renderedController.getPropertyValue({ name: "radioLabelWrapped" })).to.equal("longLabel");
	});

	it("radioset control with error", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioError']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Error");
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("gini");
		let radioGroup = container.querySelector("div[data-id='properties-radioError']");
		const radioError = radioGroup.querySelector("input[value='entropy']");
		fireEvent.click(radioError);
		expect(renderedController.getPropertyValue({ name: "radioError" })).to.equal("entropy");
		radioGroup = container.querySelector("div[data-id='properties-radioError']");
		const messageWrapper = radioGroup.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("radioset control disabled", () => {
		const { container } = wrapper;
		const controlDiv = container.querySelector("div[data-id='properties-ci-radioDisable']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Disabled");
		const checkboxsetWrapper = container.querySelector("div[data-id='properties-disable']");
		const checkbox = checkboxsetWrapper.querySelector("input");
		// checked the disable box
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("gini");
		const radioGroup = container.querySelector("div[data-id='properties-radioDisable']");
		const radioDisable = radioGroup.querySelector("input[value='entropy']");
		fireEvent.click(radioDisable);
		expect(renderedController.getPropertyValue({ name: "radioDisable" })).to.equal("entropy");
	});

	it("radioset control selected items disabled", () => {
		const { container } = wrapper;
		let checkboxsetWrapper = container.querySelector("div[data-id='properties-disable_one']");
		let checkbox = checkboxsetWrapper.querySelector("input");
		// checked the disable box
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(renderedController.getPropertyValue({ name: "radioDisableSome" })).to.equal("oranges");

		checkboxsetWrapper = container.querySelector("div[data-id='properties-disable_two']");
		checkbox = checkboxsetWrapper.querySelector("input");
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(renderedController.getPropertyValue({ name: "radioDisableSome" })).to.equal("pears");

		const radioGroup = container.querySelector("div[data-id='properties-radioDisableSome']");
		const options = radioGroup.querySelectorAll("div.properties-radioset-panel");
		expect(options).to.have.length(4);
		let radioWrapper = options[1].querySelector("input");
		expect(radioWrapper.disabled).to.equal(true);
		radioWrapper = options[2].querySelector("input");
		expect(radioWrapper.disabled).to.equal(false);
		radioWrapper = options[3].querySelector("input");
		expect(radioWrapper.disabled).to.equal(true);
	});


	it("radioset control hidden", () => {
		const { container } = wrapper;
		let controlDiv = container.querySelectorAll("div[data-id='properties-ci-radioHidden']");
		expect(controlDiv).to.have.length(0);

		const checkboxsetWrapper = container.querySelector("div[data-id='properties-hide']");
		const checkbox = checkboxsetWrapper.querySelector("input");

		// unchecked the hidden box
		checkbox.setAttribute("checked", false);
		fireEvent.click(checkbox);

		controlDiv = container.querySelector("div[data-id='properties-ci-radioHidden']");
		const label = controlDiv.querySelector("label.properties-control-label");
		expect(label.textContent).to.equal("Radio Hidden");

		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("gini");
		const radioGroup = container.querySelector("div[data-id='properties-radioHidden']");
		const radioHidden = radioGroup.querySelector("input[value='entropy']");
		fireEvent.click(radioHidden);
		expect(renderedController.getPropertyValue({ name: "radioHidden" })).to.equal("entropy");
	});

});

describe("radio filtered enum works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate radioFilter should have options filtered by enum_filter", () => {
		const { container } = wrapper;
		let radioGroup = container.querySelector("div[data-id='properties-radioFilter']");
		// validate the correct number of options show up on open
		let options = radioGroup.querySelectorAll("div.properties-radioset-panel");
		expect(options).to.have.length(3);
		// make sure there isn't warning on first open
		expect(radioGroup.querySelectorAll("div.properties-validation-message")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = container.querySelector("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.querySelector("input");
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		radioGroup = container.querySelector("div[data-id='properties-radioFilter']");
		options = radioGroup.querySelectorAll("div.properties-radioset-panel");
		expect(options).to.have.length(2);
	});

	it("Validate radioFilter should clear the property value if filtered", async() => {
		const propertyId = { name: "radioFilter" };
		// value was initially set to "yellow" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.equal(null);
		renderedController.updatePropertyValue(propertyId, "green");
		expect(renderedController.getPropertyValue(propertyId)).to.equal("green");
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "green" isn't part of the filter so the value should be cleared
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.equal(null);
		});
	});

	it("Validate radioFilter should set default value if current value is filtered out", async() => {
		const propertyId = { name: "radioFilterDefault" };
		// value was initially set to "yellow" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.equal("yellow");
		renderedController.updatePropertyValue({ name: "filterDefault" }, true);
		// "yellow" isn't part of the filter so the value should be cleared and the default value should be set
		await waitFor(() => {
			expect(renderedController.getPropertyValue(propertyId)).to.equal("blue");
		});
	});

});

// TODO: add radioset in tables unit test cases.
describe("radioset works in table correctly", () => {
	let wrapper;
	let tableDiv;
	let renderedController;
	const tableRadioPropertyId = { name: "radioset_table_error" };
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
		const controlDiv = wrapper.container.querySelector("button.properties-summary-link-button");
		fireEvent.click(controlDiv);
		// controlDiv.simulate("click");
		tableDiv = wrapper.container.querySelector(".properties-vt");
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validation enum in table cell default to select control instead of radioset", () => {
		const inlineEnum = wrapper.container.querySelectorAll("div[data-id='properties-radioset_table_error_0_0'].properties-dropdown");
		expect(inlineEnum).to.have.length(1);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][0]).to.equal("dog");
	});

	it("Check basic use of onpanel radiosets in table flyout", () => {
		const { container } = wrapper;
		tableUtilsRTL.clickTableRows(tableDiv, [0]);
		tableDiv = container.querySelector(".properties-vt");
		expect(tableDiv.querySelectorAll(".properties-vt-row-selected")).to.have.length(1);

		const onPanelRadioset = container.querySelector("div[data-id='properties-radioset_col2']");
		const onPanelRadios = onPanelRadioset.querySelectorAll("input.cds--radio-button");
		expect(onPanelRadios).to.have.length(4);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("pear");
		fireEvent.click(onPanelRadios[1]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("orange");
	});

	it("Check basic use of subpanel radiosets in table flyout", () => {
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("red");
		const subpanelButton = tableDiv.querySelector(".properties-table-subcell").querySelectorAll("button.properties-subpanel-button");
		expect(subpanelButton).to.have.length(1);
		fireEvent.click(subpanelButton[0]);
		const subpanelRadioset = wrapper.container.querySelector("div[data-id='properties-radioset_col3']");
		const subpanelRadios = subpanelRadioset.querySelectorAll("input.cds--radio-button");
		expect(subpanelRadios).to.have.length(6);
		fireEvent.click(subpanelRadios[1]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("green");
	});

	it("Check disable interactivity in table flyout", () => {
		const { container } = wrapper;
		// test on panel disable
		tableUtilsRTL.clickTableRows(tableDiv, [0]);
		tableDiv = container.querySelector(".properties-vt");
		const onPanelRadioset = container.querySelector("div[data-id='properties-radioset_col2']");
		const onPanelRadios = onPanelRadioset.querySelectorAll("input.cds--radio-button");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("pear");
		fireEvent.click(onPanelRadios[1]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("orange");
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][2]).to.equal(false);
		const disableOnpanelCheckbox = container.querySelector("div[data-id='properties-ci-radioset_col2_checkbox']");
		const checkbox = disableOnpanelCheckbox.querySelector("input");
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][2]).to.equal(true);
		expect(onPanelRadios).to.have.length(4);
		fireEvent.click(onPanelRadios[0]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("apple");
		fireEvent.click(onPanelRadios[2]);
		// confirm that "pear" is disabled and result defaults to first entry in set
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][1]).to.equal("apple");
		// test subpanel disable
		renderedController.updatePropertyValue({ col: 0, row: 0, ...tableRadioPropertyId }, "cat");
		const subpanelButton = tableDiv.querySelector(".properties-table-subcell").querySelector("button.properties-subpanel-button");
		fireEvent.click(subpanelButton);
		const subpanelRadioset = container.querySelector("div[data-id='properties-radioset_col3']");
		const subpanelRadios = subpanelRadioset.querySelectorAll("input.cds--radio-button");
		fireEvent.click(subpanelRadios[1]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("green");
		// selecting the disabled option should default to first radio in the list, red, instead of orange
		fireEvent.click(subpanelRadios[4]);
		expect(renderedController.getPropertyValue(tableRadioPropertyId)[0][3]).to.equal("red");
	});
});

describe("radioset classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("radioset should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".radioset-control-class")).to.have.length(1);
	});

	it("radioset should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "radioset_table-error-panel");
		expect(wrapper.container.querySelectorAll(".table-radioset-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-radioset-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-radioset-control-class")).to.have.length(1);
	});
});

describe("should use Carbon RadioButtonGroup", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(radioParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("radioset should use Carbon RadioButtonGroup", () => {
		const radioBoolean = (wrapper.container.querySelector("div[data-id='properties-radioBooleanWithEnum']"));
		const radioGroup = radioBoolean.querySelectorAll("fieldset.cds--radio-button-group");
		expect(radioGroup).to.have.length(1);
		// horizontal radioset should have carbon's cds--radio-button-group--label-right class
		const radioGroupHorizontal = radioBoolean.querySelectorAll("fieldset.cds--radio-button-group--label-right");
		expect(radioGroupHorizontal).to.have.length(1);
	});

});
