/*
 * Copyright 2017-2025 Elyra Authors
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
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import StructureEditorControl from "../../../src/common-properties/controls/structureeditor";
import structureeditorParamDef from "../../test_resources/paramDefs/structureeditor_paramDef.json";
import { fireEvent, waitFor, cleanup } from "@testing-library/react";


const emptyValueIndicator = "...";

const mockStructureEditor = jest.fn();
jest.mock("../../../src/common-properties/controls/structureeditor",
	() => (props) => mockStructureEditor(props)
);

mockStructureEditor.mockImplementation((props) => {
	const StructureEditorComp = jest.requireActual(
		"../../../src/common-properties/controls/structureeditor",
	).default;
	return <StructureEditorComp {...props} />;
});

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
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					store={controller.getStore()}
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);

		expectJest(mockStructureEditor).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("structureeditor renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad value"
		});
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		const dropdownWrapper = wrapper.container.querySelector("div[data-id='properties-group-o-fields']");
		const messageWrapper = dropdownWrapper.querySelectorAll("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("should have '...' as first selected option", () => {
		controller.setPropertyValues(
			{ "group-o-fields": null }
		);
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		expect(dropdownList[0].textContent).to.equal(emptyValueIndicator);
	});

	it("should have '...' as first selected option when fields is empty", () => {
		controller.setDatasetMetadata([]);
		controller.setPropertyValues(
			{ "group-o-fields": null }
		);
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList[0].textContent).to.equal(emptyValueIndicator);
	});

	it("should allow empty string to be set as valid field in structureeditor control", () => {
		controller.setPropertyValues(
			{ "group-o-fields": ["age", true] }
		);
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<StructureEditorControl
					control={control}
					propertyId={propertyId}
					controller = {controller}
				/>
			</Provider>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal("age"); // should be the value for the control
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-group-o-fields_0']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(4);
		fireEvent.click(dropdownList[0]);
		const value = controller.getPropertyValue(propertyId);
		expect(value).to.eql(["", true]);
	});
});

describe("structureeditor control renders correctly with paramDef", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("structureeditor control will lay out controls in the proper order", () => {
		const structWrapper = wrapper.container.querySelector("div[data-id='properties-layout_struct']");
		expect(structWrapper).not.to.be.null;
		const rows = structWrapper.querySelectorAll("tr");
		expect(rows.length).to.equal(2);
		const cells = rows[0].querySelectorAll("td");
		expect(cells.length).to.equal(2);
		const checkbox = cells[0].querySelector("div[data-id='properties-layout_struct_2']");
		expect(checkbox).not.to.be.null;
		const textbox = cells[1].querySelector("div[data-id='properties-layout_struct_1']");
		expect(textbox).not.to.be.null;
	});

	it("structureeditor conditions work correctly", () => {
		const { container } = wrapper;
		let checkboxWrapper = container.querySelector("div[data-id='properties-field_type_2']");
		let checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(false);
		// Verify the disabled state
		let textboxWrapper = container.querySelector("div[data-id='properties-field_type_1']");
		expect(textboxWrapper.querySelector("input").disabled).to.equal(true);
		// Check the checkbox
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox);
		expect(controller.getPropertyValue({ name: "field_type" })[2]).to.equal(true);
		// Verify the enabled state
		textboxWrapper = container.querySelector("div[data-id='properties-field_type_1']");
		expect(textboxWrapper.querySelector("input").disabled).to.equal(false);

		checkboxWrapper = container.querySelector("div[data-id='properties-layout_struct_2']");
		checkbox = checkboxWrapper.querySelector("input");
		expect(checkbox.checked).to.equal(false);
		// Verify the disabled state
		textboxWrapper = container.querySelector("div[data-id='properties-layout_struct_1']");
		expect(textboxWrapper.querySelector("input").disabled).not.to.be.null;
		// Check the checkbox
		checkbox.setAttribute("checked", true);
		fireEvent.click(checkbox, true);
		const structValue = controller.getPropertyValue({ name: "layout_struct" });
		expect(structValue[2]).to.equal(true);
		// Verify the enabled state
		textboxWrapper = container.querySelector("div[data-id='properties-layout_struct_1']");
		expect(textboxWrapper.querySelector("input").disabled).to.equal(false);
	});

	it("structureeditor control will have updated options by the controller", () => {
		const { container } = wrapper;
		let dropdownField1 = container.querySelector("div[data-id='properties-field_type_0']");
		let dropdownButton1 = dropdownField1.querySelector("button");
		fireEvent.click(dropdownButton1);
		let field1Options = dropdownField1.querySelectorAll(".cds--list-box__menu-item__option"); // Field1 Panel
		let options = [];
		field1Options.forEach((element) => {
			options.push(element.textContent);
		});
		const field1OptionsExpectedOptions = ["...", "Field 1", "Field 2", "Field 3", "Field 4", "Field 5", "Field 6", "Field 7", "Field 8", "Field 9", "Field 10"];
		expect(options).to.eql(field1OptionsExpectedOptions);
		fireEvent.click(dropdownButton1);

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
		dropdownField1 = container.querySelector("div[data-id='properties-field_type_0']");
		dropdownButton1 = dropdownField1.querySelector("button");
		fireEvent.click(dropdownButton1);
		field1Options = dropdownField1.querySelectorAll(".cds--list-box__menu-item__option"); // Field1 Panel
		options = [];
		field1Options.forEach((element) => {
			options.push(element.textContent);
		});

		const dropDownValue1 = "stringAndDiscrete2";
		const dropDownValue2 = "stringAndSet2";
		field1OptionsExpectedOptions.push(dropDownValue1);
		field1OptionsExpectedOptions.push(dropDownValue2);
		expect(options).to.eql(field1OptionsExpectedOptions);
	});

	it("structureeditor control can be disabled in one go", async() => {
		controller.updatePropertyValue({ name: "disabler" }, true);
		await waitFor(() => {
			const structWrapper = wrapper.container.querySelector("div[data-id='properties-ci-layout_struct']");
			expect(structWrapper).not.to.be.null;
			expect(structWrapper.outerHTML.includes("disabled")).to.be.true;
		});

	});

	it("structureeditor control can be hidden in one go", async() => {
		controller.updatePropertyValue({ name: "hider" }, true);
		await waitFor(() => {
			const structWrapper = wrapper.container.querySelectorAll("div[data-id='properties-layout_struct']");
			expect(structWrapper).to.have.length(0);
		});

		controller.updatePropertyValue({ name: "hider" }, false);
		await waitFor(() => {
			const structWrapper = wrapper.container.querySelectorAll("div[data-id='properties-layout_struct']");
			expect(structWrapper).to.have.length(1);
		});
	});

});

describe("structureeditor control renders correctly in a nested structure", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("structureeditor control can be nested in a structureeditor", () => {
		const { container } = wrapper;
		const propertyId = { name: "nestedStructureeditor" };
		const structure = container.querySelector("div[data-id='properties-ci-nestedStructureeditor']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructureeditor;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		const addressInput = structure.querySelector("div[data-id='properties-ctrl-userAddress']").querySelector("input");
		fireEvent.change(addressInput, { target: { value: "some new address" } });

		const zipInput = structure.querySelector("div[data-id='properties-ctrl-userZip']").querySelector("input");
		fireEvent.change(zipInput, { target: { value: 99999 } });

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
		const { container } = wrapper;
		const propertyId = { name: "nestedStructureeditorTable" };
		let structure = container.querySelector("div[data-id='properties-ci-nestedStructureeditorTable']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructureeditorTable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// Add a new row to the nested table
		const addValueBtn = structure.querySelectorAll("button.properties-add-fields-button");
		expect(addValueBtn).to.have.length(1);
		fireEvent.click(addValueBtn[0]);
		// addValueBtn.simulate("click");

		// Verify there are three rows
		structure = container.querySelector("div[data-id='properties-ci-nestedStructureeditorTable']");
		const tableRows = structure.querySelectorAll("tr[data-role='properties-data-row']");
		expect(tableRows).to.have.length(3);
		const thirdRow = tableRows[2];

		// Modify values in the third row
		const addressInput = thirdRow.querySelector(".properties-textfield").querySelector("input");
		fireEvent.change(addressInput, { target: { value: "add third address" } });
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
		const editButton = thirdRow.querySelectorAll("button.properties-subpanel-button");
		expect(editButton).to.have.length(1);
		fireEvent.click(editButton[0]);

		const zipInput = container.querySelector("div[data-id='properties-ctrl-userZipTable']").querySelector("input");
		fireEvent.change(zipInput, { target: { value: 99999 } });
		const annotationInput = container.querySelector("div[data-id='properties-ctrl-annotationTable']").querySelector("textarea");
		fireEvent.change(annotationInput, { target: { value: "Set a dummy zip code" } });

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
		const { container } = wrapper;
		const propertyId = { name: "nestedStructuretable" };
		let structure = container.querySelector("div[data-id='properties-ci-nestedStructuretable']");
		let actual = controller.getPropertyValue(propertyId);
		let expected = structureeditorParamDef.current_parameters.nestedStructuretable;
		expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

		// Add a new row to the nested table
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ci-userFieldsInfo");
		tableUtilsRTL.fieldPicker(fieldPicker, ["Field 3"]);

		// Verify there are two rows
		structure = container.querySelector("div[data-id='properties-ci-nestedStructuretable']");
		const tableRows = structure.querySelectorAll("tr[data-role='properties-data-row']");
		expect(tableRows).to.have.length(2);
		const firstRow = tableRows[0];

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
		const editButton = firstRow.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton);
		const userFields = container.querySelector("div[data-id='properties-userFieldsTable']");
		fireEvent.change(userFields.querySelector("textarea"), { target: { value: "annotation for newly added Field 3" } });

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
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("structureeditor should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".structureeditor-control-class")).to.have.length(1);
	});

	it("structureeditor should have custom classname defined in table cells", () => {
		const parent = wrapper.container.querySelectorAll(".nested-structureeditor-control-class");
		expect(parent).to.have.length(1);
		expect(parent[0].querySelectorAll(".nested-structureeditor-cell-control-class")).to.have.length(1);
		expect(parent[0].querySelectorAll(".double-nested-structureeditor-cell-control-class")).to.have.length(1);
	});
});
