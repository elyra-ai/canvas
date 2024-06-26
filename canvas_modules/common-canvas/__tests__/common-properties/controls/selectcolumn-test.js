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
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtils from "../../_utils_/property-utils";
import selectcolumnParamDef from "../../test_resources/paramDefs/selectcolumn_paramDef.json";
import selectcolumnMultiInputParamDef from "../../test_resources/paramDefs/selectcolumn_multiInput_paramDef.json";

const emptyValueIndicator = "...";

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

	propertyUtils.setControls(controller, [control]);

	beforeEach(() => {
		controller.setDatasetMetadata({ fields: fields });
	});
	afterEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});
	it("props should have been defined", () => {
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("controller")).to.equal(controller);
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
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		const messageWrapper = dropdownWrapper.find("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});

	it("should have '...' as first selected option", () => {
		controller.setPropertyValues(
			{ "targetField": null }
		);
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});
	it("should have '...' as first selected option when fields is empty", () => {
		controller.setDatasetMetadata([]);
		controller.setPropertyValues(
			{ "targetField": null }
		);
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});

	it("should allow empty string to be set as valid field in selectcolumn control", () => {
		controller.setPropertyValues(
			{ "targetField": "age" }
		);
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		let dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		expect(dropdownWrapper.find("button > span").text()).to.equal("age"); // should be the value for the control
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-targetField']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal("");
	});
	it("SelectColumn helperText is rendered correctly", () => {
		control.helperText = "SelectColumn helperText";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<SelectColumn
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.find("div[data-id='properties-targetField']");
		expect(helpTextWrapper.find("div.cds--form__helper-text").text()).to.equal(control.helperText);
	});
});

describe("selectcolumn control renders correctly with paramDef", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("selectcolumn control will have updated options by the controller", () => {
		let dropdownField1 = wrapper.find("div[data-id='properties-field1_panel'] Dropdown");
		let field1Options = dropdownField1.prop("items");	// Field1 Panel
		const field1OptionsExpectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" },
			{ label: "age2", value: "age2" },
			{ label: "BP2", value: "BP2" },
			{ label: "Na2", value: "Na2" },
			{ label: "drug2", value: "drug2" },
			{ label: "age3", value: "age3" },
			{ label: "BP3", value: "BP3" },
			{ label: "Na3", value: "Na3" },
			{ label: "drug3", value: "drug3" },
			{ label: "age4", value: "age4" },
			{ label: "BP4", value: "BP4" },
			{ label: "Na4", value: "Na4" },
			{ label: "drug4", value: "drug4" }
		];

		expect(field1Options).to.eql(field1OptionsExpectedOptions);

		let dropdownField2 = wrapper.find("div[data-id='properties-field2_panel'] Dropdown");

		let field2Options = dropdownField2.prop("items");	// Field2 Panel
		const field2OptionsExpectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" },
			{ label: "age2", value: "age2" },
			{ label: "BP2", value: "BP2" },
			{ label: "Na2", value: "Na2" },
			{ label: "drug2", value: "drug2" },
			{ label: "age3", value: "age3" },
			{ label: "BP3", value: "BP3" },
			{ label: "Na3", value: "Na3" },
			{ label: "drug3", value: "drug3" },
			{ label: "age4", value: "age4" },
			{ label: "BP4", value: "BP4" },
			{ label: "Na4", value: "Na4" },
			{ label: "drug4", value: "drug4" }
		];

		expect(field2Options).to.eql(field2OptionsExpectedOptions);

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
		wrapper.update();
		dropdownField1 = wrapper.find("div[data-id='properties-field1_panel'] Dropdown");
		field1Options = dropdownField1.prop("items");
		dropdownField2 = wrapper.find("div[data-id='properties-field2_panel'] Dropdown");
		field2Options = dropdownField2.prop("items");

		const dropDownValue1 = {
			"label": "stringAndDiscrete2",
			"value": "stringAndDiscrete2"
		};

		const dropDownValue2 = {
			"label": "stringAndSet2",
			"value": "stringAndSet2"
		};

		field1OptionsExpectedOptions.push(dropDownValue1);
		field1OptionsExpectedOptions.push(dropDownValue2);
		field2OptionsExpectedOptions.push(dropDownValue1);
		field2OptionsExpectedOptions.push(dropDownValue2);

		expect(field1Options).to.eql(field1OptionsExpectedOptions);
		expect(field2Options).to.eql(field2OptionsExpectedOptions);

	});

	it("should filter values from selectcolumn control", () => {
		const typeDropDown = wrapper.find("div[data-id='properties-field_filter_type'] Dropdown");
		let options = typeDropDown.prop("items"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "age4", value: "age4" }
		];
		expect(options).to.eql(expectedOptions);
		const typesDropDown = wrapper.find("div[data-id='properties-field_filter_types'] Dropdown");
		options = typesDropDown.prop("items"); // by Types
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "age2", value: "age2" },
			{ label: "Na2", value: "Na2" },
			{ label: "age3", value: "age3" },
			{ label: "Na3", value: "Na3" },
			{ label: "age4", value: "age4" },
			{ label: "Na4", value: "Na4" }
		];
		expect(options).to.eql(expectedOptions);
		const measurementDropDown = wrapper.find("div[data-id='properties-field_filter_measurement'] Dropdown");
		options = measurementDropDown.prop("items"); // by Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "BP2", value: "BP2" },
			{ label: "BP3", value: "BP3" },
			{ label: "BP4", value: "BP4" }
		];
		expect(options).to.eql(expectedOptions);
		const measurementsDropDown = wrapper.find("div[data-id='properties-field_filter_measurements'] Dropdown");
		options = measurementsDropDown.prop("items"); // by Measurements
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "drug", value: "drug" },
			{ label: "BP2", value: "BP2" },
			{ label: "drug2", value: "drug2" },
			{ label: "BP3", value: "BP3" },
			{ label: "drug3", value: "drug3" },
			{ label: "BP4", value: "BP4" },
			{ label: "drug4", value: "drug4" }
		];
		expect(options).to.eql(expectedOptions);
		const andDropDown = wrapper.find("div[data-id='properties-field_filter_and'] Dropdown");
		options = andDropDown.prop("items"); // by Type and Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "drug", value: "drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "drug4", value: "drug4" }
		];
		expect(options).to.eql(expectedOptions);
		const orDropDown = wrapper.find("div[data-id='properties-field_filter_or'] Dropdown");
		options = orDropDown.prop("items"); // by Type or Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "drug", value: "drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "drug4", value: "drug4" },
			{ label: "age", value: "age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "age4", value: "age4" }
		];
		expect(options).to.eql(expectedOptions);
	});

	it("should not show an error for a non-selection if the property isn't required", () => {
		let selectField = wrapper.find("div[data-id='properties-field_placeholder'] Dropdown");
		let dropdownButton = selectField.find("button");
		dropdownButton.simulate("click");
		// select the first item
		selectField = wrapper.find("div[data-id='properties-field_placeholder'] Dropdown");
		let dropdownList = selectField.find("li.cds--list-box__menu-item");
		dropdownList.at(2).simulate("click");
		selectField = wrapper.find("div[data-id='properties-field_placeholder'] Dropdown");
		dropdownButton = selectField.find("button");
		dropdownButton.simulate("click");
		// select the first item
		selectField = wrapper.find("div[data-id='properties-field_placeholder'] Dropdown");
		dropdownList = selectField.find("li.cds--list-box__menu-item");
		dropdownList.at(0).simulate("click");
		selectField = wrapper.find("div[data-id='properties-field_placeholder'] Dropdown");
		const errorMsgDiv = selectField.find("div.cds--form-requirement");
		expect(errorMsgDiv).to.have.length(0);
	});

	it("should render inline in structurelisteditor control", () => {
		propertyUtils.openSummaryPanel(wrapper, "selectcolumn_table-error-panel");
		const selectField = wrapper.find("div[data-id='properties-selectcolumn_table_error_0_0'] select");
		expect(selectField).to.have.length(1); // validate dropdown rendered in table cell
	});

	it("selectcolumn control should have aria-label", () => {
		const selectColumnWrapper = wrapper.find("div[data-id='properties-ctrl-field1_panel']");
		const selectColumnAriaLabelledby = selectColumnWrapper.find(".cds--list-box__menu").prop("aria-labelledby");
		expect(selectColumnWrapper.find(`label[id='${selectColumnAriaLabelledby}']`).text()).to.equal("Field1 Panel(required)");
	});

	it("selectcolumn control should show warning for invalid selected values", () => {
		// Verify there are 2 alerts
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.cds--accordion__heading");
		expect(alertButton.text()).to.equal("Alerts (2)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertDiv = alertCategory.find("li.properties-category-content.show"); // Alerts div
		expect(alertDiv).to.have.length(1);
		const alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("Invalid Field, field not found in data set.");
		expect(alertList.at(1).text()).to.equal("Invalid Field Warning, field not found in data set.");

		// Fix the warnings by selecting one of the options from dropdown menu
		let fieldWrapperDropdown = wrapper.find("div[data-id='properties-field'] Dropdown");
		let dropdownButton = fieldWrapperDropdown.find("button");
		dropdownButton.simulate("click");
		fieldWrapperDropdown = wrapper.find("div[data-id='properties-field'] Dropdown");
		let dropdownList = fieldWrapperDropdown.find("li.cds--list-box__menu-item");
		dropdownList.at(2).simulate("click");

		let fieldWarningWrapperDropdown = wrapper.find("div[data-id='properties-field_warning'] Dropdown");
		dropdownButton = fieldWarningWrapperDropdown.find("button");
		dropdownButton.simulate("click");
		fieldWarningWrapperDropdown = wrapper.find("div[data-id='properties-field_warning'] Dropdown");
		dropdownList = fieldWarningWrapperDropdown.find("li.cds--list-box__menu-item");
		dropdownList.at(2).simulate("click");

		// Verify alerts are cleared by checking first tab is not the alert tab
		const firstCategory = wrapper.find("div.properties-category-container").at(0);
		const firstTab = firstCategory.find("button.cds--accordion__heading");
		expect(firstTab.text()).to.equal("Values");
	});
});

describe("selectcolumn works correctly with multi input schemas", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnMultiInputParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("should show correct values from selectcolumn control", () => {

		let selectField = wrapper.find("div[data-id='properties-field'] Dropdown");

		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.age", value: "0.age" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.Na", value: "0.Na" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "0.age2", value: "0.age2" },
			{ label: "0.BP2", value: "0.BP2" },
			{ label: "0.Na2", value: "0.Na2" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "0.age3", value: "0.age3" },
			{ label: "0.BP3", value: "0.BP3" },
			{ label: "0.Na3", value: "0.Na3" },
			{ label: "0.drug3", value: "0.drug3" },
			{ label: "1.age", value: "1.age" },
			{ label: "1.BP", value: "1.BP" },
			{ label: "1.Na", value: "1.Na" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "1.intAndRange", value: "1.intAndRange" },
			{ label: "1.stringAndDiscrete", value: "1.stringAndDiscrete" },
			{ label: "1.stringAndSet", value: "1.stringAndSet" }
		];
		const actualOptions = selectField.prop("items");
		expect(actualOptions).to.eql(expectedOptions);

		// Make sure you can select a item from the multiple databases
		// open the dropdown
		const dropdownButton = selectField.find("button");
		dropdownButton.simulate("click");
		// select the first item
		selectField = wrapper.find("div[data-id='properties-field'] Dropdown");
		const dropdownList = selectField.find("li.cds--list-box__menu-item");
		dropdownList.at(15).simulate("click");
		const expectedValue = { link_ref: "1", field_name: "Na" };
		expect(controller.getPropertyValue({ name: "field" })).to.eql(expectedValue);
	});

	it("should filter values from selectcolumn control", () => {
		const filterCategory = wrapper.find("div.properties-category-container").at(1); // FILTER category
		const dropDowns = filterCategory.find("Dropdown");
		expect(dropDowns).to.have.length(5);
		let options = dropDowns.at(0).prop("items"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.age", value: "0.age" },
			{ label: "0.age2", value: "0.age2" },
			{ label: "0.age3", value: "0.age3" },
			{ label: "1.age", value: "1.age" },
			{ label: "1.intAndRange", value: "1.intAndRange" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(1).prop("items"); // by Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.BP2", value: "0.BP2" },
			{ label: "0.BP3", value: "0.BP3" },
			{ label: "1.BP", value: "1.BP" },
			{ label: "1.stringAndDiscrete", value: "1.stringAndDiscrete" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(2).prop("items"); // by Model Role
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "0.drug3", value: "0.drug3" },
			{ label: "1.drug", value: "1.drug" },
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(3).prop("items"); // by Type and Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "0.drug3", value: "0.drug3" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "1.stringAndSet", value: "1.stringAndSet" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(4).prop("items"); // by Type or Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "0.drug2", value: "0.drug2" },
			{ label: "0.drug3", value: "0.drug3" },
			{ label: "0.age", value: "0.age" },
			{ label: "0.age2", value: "0.age2" },
			{ label: "0.age3", value: "0.age3" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "1.stringAndSet", value: "1.stringAndSet" },
			{ label: "1.age", value: "1.age" },
			{ label: "1.intAndRange", value: "1.intAndRange" }
		];
		expect(options).to.have.deep.members(expectedOptions);
	});
});

describe("selectcolumn classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("selectcolumn should have custom classname defined", () => {
		expect(wrapper.find(".selectcolumn-control-class")).to.have.length(1);
	});

	it("selectcolumn should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "selectcolumn_table-error-panel");
		expect(wrapper.find(".table-selectcolumn-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-selectcolumn-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-selectcolumn-control-class")).to.have.length(1);
	});
});

describe("Empty list selectcolumn control with default and custom placeholder text", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});
	it("should have default placeholder text when fields is empty", () => {
		// No resource_key added for field_empty_list property
		const dropdownWrapper = wrapper.find("div[data-id='properties-field_empty_list']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// Verify dropdown is enabled
		expect(dropdownWrapper.find("Dropdown").props()).to.have.property("disabled", false);
	});

	it("should have custom placeholder text when fields is empty and selectcolumn control should be disabled", () => {
		// "field_empty_list_custom_placeholder.emptyList.placeholder" resource key is added in paramDef
		const dropdownWrapper = wrapper.find("div[data-id='properties-field_empty_list_custom_placeholder']");
		expect(dropdownWrapper.find("button > span").text()).to.equal("Custom empty list placeholder text");
		// Verify dropdown is disabled
		expect(dropdownWrapper.find("Dropdown").props()).to.have.property("disabled", true);
	});
});
