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

import React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { shallowWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
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

		expect(wrapper.dive().prop("control")).to.equal(control);
		expect(wrapper.dive().prop("propertyId")).to.equal(propertyId);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
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
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
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
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
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
		expect(dropdownWrapper.find("button > span").text()).to.equal("age"); // should be the value for the control
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
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
		let dropdownField1 = wrapper.find("div[data-id='properties-field_type_0'] Dropdown");
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
		dropdownField1 = wrapper.find("div[data-id='properties-field_type_0'] Dropdown");
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
		let structWrapper = wrapper.find("div[data-id='properties-layout_struct']");
		expect(structWrapper).to.have.length(0);

		controller.updatePropertyValue({ name: "hider" }, false);
		wrapper.update();
		structWrapper = wrapper.find("div[data-id='properties-layout_struct']");
		expect(structWrapper).to.have.length(1);
	});

});

describe("structureeditor control renders correctly in a nested structure", () => {
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

	it("structureeditor control can be nested in a structureeditor", () => {
		const propertyId = { name: "nestedStructureeditor" };
		const structure = wrapper.find("div[data-id='properties-ci-nestedStructureeditor']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructureeditor;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		const addressInput = structure.find("div[data-id='properties-ctrl-userAddress']").find("input");
		addressInput.simulate("change", { target: { value: "some new address" } });

		const zipInput = structure.find("div[data-id='properties-ctrl-userZip']").find("input");
		zipInput.simulate("change", { target: { value: 99999 } });

		// Verify modified values
		actual = controller.getPropertyValue(propertyId);
		expected = [
			"name",
			23,
			[
				"some new address", 99999, "rental address"
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
	});

	it("structurelisteditor control can be nested in a structureeditor", () => {
		const propertyId = { name: "nestedStructureeditorTable" };
		let structure = wrapper.find("div[data-id='properties-ci-nestedStructureeditorTable']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructureeditorTable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// Add a new row to the nested table
		const addValueBtn = structure.find("button.properties-add-fields-button");
		expect(addValueBtn).to.have.length(1);
		addValueBtn.simulate("click");

		// Verify there are three rows
		structure = wrapper.find("div[data-id='properties-ci-nestedStructureeditorTable']");
		const tableRows = structure.find("div[data-role='properties-data-row']");
		expect(tableRows).to.have.length(3);
		const thirdRow = tableRows.at(2);

		// Modify values in the third row
		const addressInput = thirdRow.find(".properties-textfield").find("input");
		addressInput.simulate("change", { target: { value: "add third address" } });
		// Verify modified values
		actual = controller.getPropertyValue(propertyId);
		expected = [
			"name",
			23,
			[
				[
					"address1", 90210, ["rental address"]
				],
				[
					"address2", 90211, ["work address"]
				],
				[
					"add third address", null, []
				]
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// Click on subpanel to edit the hidden fields 'userZipTable' and 'annotationTable'
		const editButton = thirdRow.find("button.properties-subpanel-button");
		expect(editButton).to.have.length(1);
		editButton.simulate("click");

		const zipInput = wrapper.find("div[data-id='properties-ctrl-userZipTable']").find("input");
		zipInput.simulate("change", { target: { value: 99999 } });
		const annotationInput = wrapper.find("div[data-id='properties-ctrl-annotationTable']").find("textarea");
		annotationInput.simulate("change", { target: { value: "Set a dummy zip code" } });

		// Verify modified values
		actual = controller.getPropertyValue(propertyId);
		expected = [
			"name",
			23,
			[
				[
					"address1", 90210, ["rental address"]
				],
				[
					"address2", 90211, ["work address"]
				],
				[
					"add third address", 99999, ["Set a dummy zip code"]
				]
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
	});

	it("structuretable control can be nested in a structureeditor", () => {
		const propertyId = { name: "nestedStructuretable" };
		let structure = wrapper.find("div[data-id='properties-ci-nestedStructuretable']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructuretable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// Add a new row to the nested table
		const fieldPicker = tableUtils.openFieldPicker(wrapper, "properties-ci-userFieldsInfo");
		tableUtils.fieldPicker(fieldPicker, ["Field 3"]);

		// Verify there are two rows
		structure = wrapper.find("div[data-id='properties-ci-nestedStructuretable']");
		const tableRows = structure.find("div[data-role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		const firstRow = tableRows.at(0);

		actual = controller.getPropertyValue(propertyId);
		expected = [
			"name",
			23,
			[
				[
					"Field 3", 1, []
				],
				[
					"Field 5", 2, ["annotation for field 5"]
				]
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// As "Field 3" row is displayed before "Field 5", it will be added as the first row. Modify values in the first row
		const editButton = firstRow.find(".properties-subpanel-button").at(0);
		editButton.simulate("click");
		const userFields = wrapper.find("div[data-id='properties-userFieldsTable']");
		userFields.find("textarea").simulate("change", { target: { value: "annotation for newly added Field 3" } });

		// Verify updated values
		actual = controller.getPropertyValue(propertyId);
		expected = [
			"name",
			23,
			[
				[
					"Field 3", 1, ["annotation for newly added Field 3"]
				],
				[
					"Field 5", 2, ["annotation for field 5"]
				]
			]
		];
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
	});
});

describe("structureeditor classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("structureeditor should have custom classname defined", () => {
		expect(wrapper.find(".structureeditor-control-class")).to.have.length(1);
	});

	it("structureeditor should have custom classname defined in table cells", () => {
		const parent = wrapper.find(".nested-structureeditor-control-class");
		expect(parent).to.have.length(1);
		expect(parent.find(".nested-structureeditor-cell-control-class")).to.have.length(1);
		expect(parent.find(".double-nested-structureeditor-cell-control-class")).to.have.length(1);
	});
});
