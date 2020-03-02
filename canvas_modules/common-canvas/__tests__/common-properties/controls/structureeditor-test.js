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

import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { shallowWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtils from "../../_utils_/property-utils";
import StructureEditorControl from "../../../src/common-properties/controls/structureeditor";
import structureeditorParamDef from "../../test_resources/paramDefs/structureeditor_paramDef.json";


const emptyValueIndicator = "...";

describe("structureeditor control renders correctly", () => {
	const control = {
		"name": "group-o-fields",
		"label": {
			"text": "A group of fields"
		},
		"description": {
			"text": "Yes"
		},
		"controlType": "structureeditor",
		"labelVisible": true,
		"subControls": [
			{
				"columnIndex": 0,
				"controlType": "selectcolumn",
				"editStyle": "inline",
				"label": { "text": "Input name" },
				"labelVisible": true,
				"name": "input",
				"parameterName": "group-o-fields",
				"role": "column",
				"valueDef": { "propType": "string", "isList": false, "isMap": false },
				"visible": true
			},
			{
				"columnIndex": 1,
				"controlType": "checkbox",
				"editStyle": "inline",
				"label": { "text": "A checkbox" },
				"labelVisible": true,
				"name": "checker",
				"parameterName": "group-o-fields",
				"valueDef": { "propType": "boolean", "isList": false, "isMap": false },
				"visible": true
			}
		],
		"valueDef": {
			"propType": "structure",
			"isList": false,
			"isMap": false,
			"defaultValue": []
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

		const wrapper = shallowWithIntl(
			<StructureEditorControl
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

	it("structureeditor renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad value"
		});
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		const dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields']");
		const messageWrapper = dropdownWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("should have '...' as first selected option", () => {
		controller.setPropertyValues(
			{ "group-o-fields": null }
		);
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});

	it("should have '...' as first selected option when fields is empty", () => {
		controller.setDatasetMetadata([]);
		controller.setPropertyValues(
			{ "group-o-fields": null }
		);
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.find("div > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});

	it("should allow empty string to be set as valid field in structureeditor control", () => {
		controller.setPropertyValues(
			{ "group-o-fields": ["age", true] }
		);
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);

		let dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.find("div > span").text()).to.equal("age"); // should be the value for the control
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("div[role='button']");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		dropdownList.at(0).simulate("click");
		const value = controller.getPropertyValue(propertyId);
		expect(value).to.eql(["", true]);
	});
});

describe("structureeditor control renders correctly with paramDef", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("structureeditor control will lay out controls in the proper order", () => {
		const structWrapper = wrapper.find("div[data-id='properties-layout_struct']");
		expect(structWrapper).not.to.be.null;
		const rows = structWrapper.find("tr");
		expect(rows.length).to.equal(2);
		const cells = rows.at(0).find("td");
		expect(cells.length).to.equal(2);
		const checkbox = cells.at(0).find("div[data-id='properties-layout_struct_2']");
		expect(checkbox).not.to.be.null;
		const textbox = cells.at(1).find("div[data-id='properties-layout_struct_1']");
		expect(textbox).not.to.be.null;
	});

	it("structureeditor conditions work correctly", () => {
		let checkboxWrapper = wrapper.find("div[data-id='properties-field_type_2']");
		let checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		// Verify the disabled state
		let textboxWrapper = wrapper.find("div[data-id='properties-field_type_1']");
		expect(textboxWrapper.find("input").prop("disabled")).to.equal(true);
		// Check the checkbox
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		expect(controller.getPropertyValue({ name: "field_type" })[2]).to.equal(true);
		// Verify the enabled state
		textboxWrapper = wrapper.find("div[data-id='properties-field_type_1']");
		expect(textboxWrapper.find("input").prop("disabled")).to.equal(false);

		checkboxWrapper = wrapper.find("div[data-id='properties-layout_struct_2']");
		checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(false);
		// Verify the disabled state
		textboxWrapper = wrapper.find("div[data-id='properties-layout_struct_1']");
		expect(textboxWrapper.find("input").prop("disabled")).not.to.be.null;
		// Check the checkbox
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		const structValue = controller.getPropertyValue({ name: "layout_struct" });
		expect(structValue[2]).to.equal(true);
		// Verify the enabled state
		textboxWrapper = wrapper.find("div[data-id='properties-layout_struct_1']");
		expect(textboxWrapper.find("input").prop("disabled")).to.equal(false);
	});

	it("structureeditor control will have updated options by the controller", () => {
		let dropdownField1 = wrapper.find("div[data-id='properties-field_type_0'] DropdownV2");
		let field1Options = dropdownField1.prop("items");	// Field1 Panel
		const field1OptionsExpectedOptions = [
			{ label: "...", value: "" },
			{ label: "Field 1", value: "Field 1" },
			{ label: "Field 2", value: "Field 2" },
			{ label: "Field 3", value: "Field 3" },
			{ label: "Field 4", value: "Field 4" },
			{ label: "Field 5", value: "Field 5" },
			{ label: "Field 6", value: "Field 6" },
			{ label: "Field 7", value: "Field 7" },
			{ label: "Field 8", value: "Field 8" },
			{ label: "Field 9", value: "Field 9" },
			{ label: "Field 10", value: "Field 10" }
		];
		expect(field1Options).to.eql(field1OptionsExpectedOptions);

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
		dropdownField1 = wrapper.find("div[data-id='properties-field_type_0'] DropdownV2");
		field1Options = dropdownField1.prop("items");

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
		expect(field1Options).to.eql(field1OptionsExpectedOptions);
	});

	it("structureeditor control can be disabled in one go", () => {
		controller.updatePropertyValue({ name: "disabler" }, true);
		wrapper.update();
		const structWrapper = wrapper.find("div[data-id='properties-ci-layout_struct']");
		expect(structWrapper).not.to.be.null;
		expect(structWrapper.prop("disabled")).to.be.true;
	});

	it("structureeditor control can be hidden in one go", () => {
		controller.updatePropertyValue({ name: "hider" }, true);
		wrapper.update();
		const structWrapper = wrapper.find("div[data-id='properties-layout_struct']");
		expect(structWrapper).not.to.be.null;
		expect(structWrapper.hasClass("hide")).to.be.true;
	});

});
