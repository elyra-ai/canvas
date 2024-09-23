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

import React from "react";
import SelectColumn from "../../../src/common-properties/controls/dropdown";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import selectcolumnParamDef from "../../test_resources/paramDefs/selectcolumn_paramDef.json";
import selectcolumnMultiInputParamDef from "../../test_resources/paramDefs/selectcolumn_multiInput_paramDef.json";
import { fireEvent } from "@testing-library/react";

const emptyValueIndicator = "...";

const mockSelectColumn = jest.fn();
jest.mock("../../../src/common-properties/controls/dropdown",
	() => (props) => mockSelectColumn(props)
);

mockSelectColumn.mockImplementation((props) => {
	const SelectColumnComp = jest.requireActual(
		"../../../src/common-properties/controls/dropdown",
	).default;
	return <SelectColumnComp {...props} />;
});

// controls selectColumn, selectSchema and oneofselect are all dropdown controls.
// a set of dropdown basic unit test cases are defined in oneofselect-test.js and
// do not need to be repeated in selectColumn and selectSchema.
describe("selectcolumn control renders correctly", () => {
	const control = {
		"name": "targetField",
		"label": {
			"text": "Target column"
		},
		"description": {
			"text": "Select a target column"
		},
		"controlType": "selectcolumn",
		"valueDef": {
			"propType": "string",
			"isList": false,
			"isMap": false,
			"defaultValue": ""
		},
		"required": true
	};
	const fields = [
		{
			"name": "age",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		},
		{
			"name": "BP",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		},
		{
			"name": "Na",
			"type": "double",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		}
	];
	const propertyId = { name: control.name };
	const controller = new Controller();

	propertyUtilsRTL.setControls(controller, [control]);

	beforeEach(() => {
		controller.setDatasetMetadata({ fields: fields });
	});
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		expectJest(mockSelectColumn).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("dropdown renders correctly in a table", () => {
		// TODO:  Need to ad this test case
	});
	it("dropdown renders error messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad dropdown value"
		});
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-targetField']");
		const messageWrapper = dropdownWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});

	it("should have '...' as first selected option", () => {
		controller.setPropertyValues(
			{ "targetField": null }
		);
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		expect(dropdownList[0].textContent).to.equal(emptyValueIndicator);
	});
	it("should have '...' as first selected option when fields is empty", () => {
		controller.setDatasetMetadata([]);
		controller.setPropertyValues(
			{ "targetField": null }
		);
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList[0].textContent).to.equal(emptyValueIndicator);
	});

	it("should allow empty string to be set as valid field in selectcolumn control", () => {
		controller.setPropertyValues(
			{ "targetField": "age" }
		);
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal("age"); // should be the value for the control
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		fireEvent.click(dropdownList[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal("");
	});
	it("SelectColumn helperText is rendered correctly", () => {
		control.helperText = "SelectColumn helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-targetField']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("SelectColumn readonly is rendered correctly", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);
		const readOnlyWrapper = wrapper.container.querySelector("div[data-id='properties-targetField']");
		expect(readOnlyWrapper.querySelector("div[id='properties-targetField-dropdown']").className.includes("readonly")).to.equal(control.readOnly);
	});
});

describe("selectcolumn control renders correctly with paramDef", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("selectcolumn control will have updated options by the controller", () => {
		let { container } = wrapper;
		let dropdownField1 = container.querySelector("div[data-id='properties-field1_panel']");
		let dropdownButton1 = dropdownField1.querySelector(".cds--list-box__field");
		fireEvent.click(dropdownButton1);

		let field1Options = dropdownField1.querySelectorAll(".cds--list-box__menu-item__option");	// Field1 Panel
		let options = [];
		field1Options.forEach((element) => {
			options.push(element.textContent);
		});
		const field1OptionsExpectedOptions = ["...", "age", "Na", "drug", "age2", "BP2", "Na2", "drug2", "age3", "BP3", "Na3", "drug3", "age4", "BP4", "Na4", "drug4"];

		expect(options).to.eql(field1OptionsExpectedOptions);

		let dropdownField2 = container.querySelector("div[data-id='properties-field2_panel']");
		let dropdownButton2 = dropdownField2.querySelector(".cds--list-box__field");
		fireEvent.click(dropdownButton2);
		let field2Options = dropdownField2.querySelectorAll(".cds--list-box__menu-item__option");	// Field2 Panel
		options = [];
		field2Options.forEach((element) => {
			options.push(element.textContent);
		});
		const field2OptionsExpectedOptions = ["...", "BP", "Na", "drug", "age2", "BP2", "Na2", "drug2", "age3", "BP3", "Na3", "drug3", "age4", "BP4", "Na4", "drug4"];

		expect(options).to.eql(field2OptionsExpectedOptions);
		wrapper.unmount();
		const rendered = propertyUtilsRTL.flyoutEditorForm(selectcolumnParamDef);
		wrapper = rendered.wrapper;
		container = wrapper.container;
		controller = rendered.controller;
		const datasetMetadata = controller.getDatasetMetadata();

		const newField1 = {
			"name": "stringAndDiscrete2",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		};

		const newField2 = {
			"name": "stringAndSet2",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "set",
				"modeling_role": "input"
			}
		};

		datasetMetadata[0].fields.push(newField1);
		datasetMetadata[0].fields.push(newField2);
		controller.setDatasetMetadata(datasetMetadata);

		dropdownField1 = container.querySelector("div[data-id='properties-field1_panel']");
		dropdownButton1 = dropdownField1.querySelector("button.cds--list-box__field");
		fireEvent.click(dropdownButton1);

		field1Options = dropdownField1.querySelectorAll(".cds--list-box__menu-item__option");	// Field1 Panel
		const options1 = [];
		field1Options.forEach((element) => {
			options1.push(element.textContent);
		});
		dropdownField2 = container.querySelector("div[data-id='properties-field2_panel']");
		dropdownButton2 = dropdownField2.querySelector(".cds--list-box__field");
		fireEvent.click(dropdownButton2);
		field2Options = dropdownField2.querySelectorAll(".cds--list-box__menu-item__option");	// Field2 Panel
		const options2 = [];
		field2Options.forEach((element) => {
			options2.push(element.textContent);
		});

		const dropDownValue1 = "stringAndDiscrete2";

		const dropDownValue2 = "stringAndSet2";

		field1OptionsExpectedOptions.push(dropDownValue1);
		field1OptionsExpectedOptions.push(dropDownValue2);
		field2OptionsExpectedOptions.push(dropDownValue1);
		field2OptionsExpectedOptions.push(dropDownValue2);

		expect(options2).to.eql(field2OptionsExpectedOptions);
	});

	it("should filter values from selectcolumn control", () => {
		const { container } = wrapper;
		const typeDropDown = container.querySelector("div[data-id='properties-field_filter_type']");
		const typeDropDownButton = typeDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(typeDropDownButton);
		const typeOptions = typeDropDown.querySelectorAll(".cds--list-box__menu-item__option"); // by Type
		let options = [];
		typeOptions.forEach((element) => {
			options.push(element.textContent);
		});

		let expectedOptions = ["...", "age", "age2", "age3", "age4"];

		expect(options).to.eql(expectedOptions);
		const typesDropDown = container.querySelector("div[data-id='properties-field_filter_types']");
		const typesDropDownButton = typesDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(typesDropDownButton);
		const typesOptions = typesDropDown.querySelectorAll(".cds--list-box__menu-item__option"); // by Types
		options = [];
		typesOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "age", "Na", "age2", "Na2", "age3", "Na3", "age4", "Na4"];
		expect(options).to.eql(expectedOptions);
		const measurementDropDown = container.querySelector("div[data-id='properties-field_filter_measurement']");
		const measurementDropDownButton = measurementDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(measurementDropDownButton);
		const measurementOptions = measurementDropDown.querySelectorAll(".cds--list-box__menu-item__option"); // by Measurement
		options = [];
		measurementOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "BP", "BP2", "BP3", "BP4"];
		expect(options).to.eql(expectedOptions);

		const measurementsDropDown = container.querySelector("div[data-id='properties-field_filter_measurements']");
		const measurementsDropDownButton = measurementsDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(measurementsDropDownButton);
		const measurementsOptions = measurementsDropDown.querySelectorAll(".cds--list-box__menu-item__option");// by Measurements
		options = [];
		measurementsOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "BP", "drug", "BP2", "drug2", "BP3", "drug3", "BP4", "drug4"];
		expect(options).to.eql(expectedOptions);

		const andDropDown = container.querySelector("div[data-id='properties-field_filter_and']");
		const andDropDownButton = andDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(andDropDownButton);
		const andOptions = andDropDown.querySelectorAll(".cds--list-box__menu-item__option"); // by Type and Measurement
		options = [];
		andOptions.forEach((element) => {
			options.push(element.textContent);
		});

		expectedOptions = ["...", "drug", "drug2", "drug3", "drug4"];
		expect(options).to.eql(expectedOptions);

		const orDropDown = container.querySelector("div[data-id='properties-field_filter_or']");
		const orDropDownButton = orDropDown.querySelector("button.cds--list-box__field");
		fireEvent.click(orDropDownButton);
		const orOptions = orDropDown.querySelectorAll(".cds--list-box__menu-item__option"); // by Type or Measurement
		options = [];
		orOptions.forEach((element) => {
			options.push(element.textContent);
		});

		expectedOptions = ["...", "drug", "drug2", "drug3", "drug4", "age", "age2", "age3", "age4"];
		expect(options).to.eql(expectedOptions);
	});

	it("should not show an error for a non-selection if the property isn't required", () => {
		const { container } = wrapper;
		let selectField = container.querySelector("div[data-id='properties-field_placeholder']");
		let dropdownButton = selectField.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		selectField = container.querySelector("div[data-id='properties-field_placeholder']");
		let dropdownList = selectField.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[2]);
		selectField = container.querySelector("div[data-id='properties-field_placeholder']");
		dropdownButton = selectField.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		selectField = container.querySelector("div[data-id='properties-field_placeholder']");
		dropdownList = selectField.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[0]);
		selectField = container.querySelector("div[data-id='properties-field_placeholder']");
		const errorMsgDiv = selectField.querySelectorAll("div.cds--form-requirement");
		expect(errorMsgDiv).to.have.length(0);
	});

	it("should render inline in structurelisteditor control", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "selectcolumn_table-error-panel");
		const selectField = wrapper.container.querySelectorAll("div[data-id='properties-selectcolumn_table_error_0_0'] select");
		expect(selectField).to.have.length(1); // validate dropdown rendered in table cell
	});

	it("selectcolumn control should have aria-label", () => {
		const selectColumnWrapper = wrapper.container.querySelector("div[data-id='properties-ctrl-field1_panel']");
		const selectColumnAriaLabelledby = selectColumnWrapper.querySelector(".cds--list-box__menu").getAttribute("aria-labelledby");
		expect(selectColumnWrapper.querySelector(`label[id='${selectColumnAriaLabelledby}']`).textContent).to.equal("Field1 Panel(required)");
	});

	it("selectcolumn control should show warning for invalid selected values", () => {
		// Verify there are 2 alerts
		// get alerts tabs
		const { container } = wrapper;
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (2)");
		fireEvent.click(alertButton);

		// ensure that alert tab is open
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertDiv = alertCategory.querySelectorAll("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		const alertList = alertDiv[0].querySelectorAll("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList[0].textContent).to.equal("Invalid Field, field not found in data set.");
		expect(alertList[1].textContent).to.equal("Invalid Field Warning, field not found in data set.");

		// Fix the warnings by selecting one of the options from dropdown menu
		let fieldWrapperDropdown = container.querySelector("div[data-id='properties-field']");
		let dropdownButton = fieldWrapperDropdown.querySelector("button");
		fireEvent.click(dropdownButton);
		fieldWrapperDropdown = container.querySelector("div[data-id='properties-field']");
		let dropdownList = fieldWrapperDropdown.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[2]);

		let fieldWarningWrapperDropdown = container.querySelector("div[data-id='properties-field_warning']");
		dropdownButton = fieldWarningWrapperDropdown.querySelector("button");
		fireEvent.click(dropdownButton);

		fieldWarningWrapperDropdown = container.querySelector("div[data-id='properties-field_warning']");
		dropdownList = fieldWarningWrapperDropdown.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[2]);


		// Verify alerts are cleared by checking first tab is not the alert tab
		const firstCategory = container.querySelectorAll("div.properties-category-container")[0];
		const firstTab = firstCategory.querySelector("button.cds--accordion__heading");
		expect(firstTab.textContent).to.equal("Values");
	});
});

describe("selectcolumn works correctly with multi input schemas", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnMultiInputParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show correct values from selectcolumn control", () => {
		const { container } = wrapper;
		let selectField = container.querySelector("div[data-id='properties-field']");
		const selectFieldButton = selectField.querySelector("button.cds--list-box__field");
		fireEvent.click(selectFieldButton);
		const selectFieldOptions = selectField.querySelectorAll(".cds--list-box__menu-item__option");
		const actualOptions = [];
		selectFieldOptions.forEach((element) => {
			actualOptions.push(element.textContent);
		});
		const expectedOptions = ["...", "0.age", "0.BP", "0.Na", "0.drug", "0.age2", "0.BP2", "0.Na2", "0.drug2", "0.age3",
			"0.BP3", "0.Na3", "0.drug3", "1.age", "1.BP", "1.Na", "1.drug", "1.intAndRange", "1.stringAndDiscrete", "1.stringAndSet"];
		expect(actualOptions).to.eql(expectedOptions);

		// Make sure you can select a item from the multiple databases
		// the dropdown is already open from the previous button
		selectField = container.querySelector("div[data-id='properties-field'] ");
		const dropdownList = selectField.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[15]);
		const expectedValue = { link_ref: "1", field_name: "Na" };
		expect(controller.getPropertyValue({ name: "field" })).to.eql(expectedValue);
	});

	it("should filter values from selectcolumn control", () => {
		const { container } = wrapper;
		const filterCategory = container.querySelectorAll("div.properties-category-container")[1]; // FILTER category
		const dropDowns = filterCategory.querySelectorAll("div.properties-ctrl-wrapper");
		expect(dropDowns).to.have.length(5);
		let button = dropDowns[0].querySelector("button.cds--list-box__field");
		fireEvent.click(button);
		let dropDownOptions = dropDowns[0].querySelectorAll(".cds--list-box__menu-item__option"); // by Type
		let options = [];
		dropDownOptions.forEach((element) => {
			options.push(element.textContent);
		});
		let expectedOptions = ["...", "0.age", "0.age2", "0.age3", "1.age", "1.intAndRange"];
		expect(options).to.eql(expectedOptions);


		button = dropDowns[1].querySelector("button.cds--list-box__field");
		fireEvent.click(button);
		dropDownOptions = dropDowns[1].querySelectorAll(".cds--list-box__menu-item__option"); // by Measurement
		options = [];
		dropDownOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "0.BP", "0.BP2", "0.BP3", "1.BP", "1.stringAndDiscrete"];
		expect(options).to.eql(expectedOptions);


		button = dropDowns[2].querySelector("button.cds--list-box__field");
		fireEvent.click(button);
		dropDownOptions = dropDowns[2].querySelectorAll(".cds--list-box__menu-item__option"); // by Model Role
		options = [];
		dropDownOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "0.drug", "0.drug2", "0.drug3", "1.drug"];
		expect(options).to.eql(expectedOptions);

		button = dropDowns[3].querySelector("button.cds--list-box__field");
		fireEvent.click(button);
		dropDownOptions = dropDowns[3].querySelectorAll(".cds--list-box__menu-item__option"); // by Type and Measurement
		options = [];
		dropDownOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = ["...", "0.drug", "0.drug2", "0.drug3", "1.drug", "1.stringAndSet"];
		expect(options).to.eql(expectedOptions);

		button = dropDowns[4].querySelector("button.cds--list-box__field");
		fireEvent.click(button);
		dropDownOptions = dropDowns[4].querySelectorAll(".cds--list-box__menu-item__option"); // by Type or Measurement
		options = [];
		dropDownOptions.forEach((element) => {
			options.push(element.textContent);
		});
		expectedOptions = [
			"...", "0.drug", "0.drug2", "0.drug3", "1.drug", "1.stringAndSet", "0.age", "0.age2", "0.age3", "1.age", "1.intAndRange"
		];
		expect(options).to.have.deep.members(expectedOptions);
	});
});

describe("selectcolumn classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("selectcolumn should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".selectcolumn-control-class")).to.have.length(1);
	});

	it("selectcolumn should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "selectcolumn_table-error-panel");
		expect(wrapper.container.querySelectorAll(".table-selectcolumn-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-selectcolumn-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-selectcolumn-control-class")).to.have.length(1);
	});
});

describe("Empty list selectcolumn control with default and custom placeholder text", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("should have default placeholder text when fields is empty", () => {
		// No resource_key added for field_empty_list property
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-field_empty_list']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// Verify dropdown is enabled
		expect(dropdownWrapper.querySelector("div[id='properties-field_empty_list-dropdown']").className.includes("disabled")).to.equal(false);
	});
	it("should have custom placeholder text when fields is empty and selectcolumn control should be disabled", () => {
		// "field_empty_list_custom_placeholder.emptyList.placeholder" resource key is added in paramDef
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-field_empty_list_custom_placeholder']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal("Custom empty list placeholder text");
		// Verify dropdown is disabled
		expect(dropdownWrapper.querySelector("div[id='properties-field_empty_list_custom_placeholder-dropdown']").className.includes("disabled")).to.equal(true);
	});
});
