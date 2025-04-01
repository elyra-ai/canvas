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
import SelectSchemaControl from "../../../src/common-properties/controls/dropdown";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import selectschemaParamDef from "../../test_resources/paramDefs/selectschema_paramDef.json";
import { fireEvent } from "@testing-library/react";


const controller = new Controller();

const emptyValueIndicator = "...";

const control = {
	"name": "selectschema",
	"label": {
		"text": "selectschema"
	},
	"description": {
		"text": "selectschema with parameter value set to 'Drugs_0'"
	},
	"controlType": "selectschema",
	"valueDef": {
		"propType": "structure",
		"isList": false,
		"isMap": false
	},
	"required": true
};

const propertyId = { name: "test-selectschema" };

const mockSelectSchema = jest.fn();
jest.mock("../../../src/common-properties/controls/dropdown",
	() => (props) => mockSelectSchema(props)
);

mockSelectSchema.mockImplementation((props) => {
	const SelectSchemaComp = jest.requireActual(
		"../../../src/common-properties/controls/dropdown",
	).default;
	return <SelectSchemaComp {...props} />;
});

// controls selectColumn, selectSchema and oneofselect are all dropdown controls.
// a set of dropdown basic unit test cases are defined in oneofselect-test.js and
// do not need to be repeated in selectColumn and selectSchema.
describe("selectschema renders correctly", () => {

	it("props should have been defined", () => {
		render(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockSelectSchema).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});
	it("should have '...' as first selected option for empty list", () => {
		controller.setPropertyValues(
			{ "test-selectschema": null }
		);
		const wrapper = render(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const { container } = wrapper;
		let dropdownWrapper = container.querySelector("div[data-id='properties-test-selectschema']");
		expect(dropdownWrapper.querySelector("button > span").textContent).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropdownWrapper = container.querySelector("div[data-id='properties-test-selectschema']");
		const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList[0].textContent).to.equal(emptyValueIndicator);
	});
});

describe("selectschema works correctly in common-properties", () => {
	const expectedOptions = ["...", "Drugs_0", "1", "Drugs_2", "Drugs_3", "random", "5", "6"];
	let wrapper;
	let propertiesController;
	beforeEach(() => {
		const flyout = propertyUtilsRTL.flyoutEditorForm(selectschemaParamDef);
		propertiesController = flyout.controller;
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate selectschema rendered correctly", () => {
		const { container } = wrapper;
		const dropDownButton = container.querySelector("button.cds--list-box__field");
		fireEvent.click(dropDownButton);
		const dropDownItems = container.querySelectorAll(".cds--list-box__menu-item__option");
		const options = [];
		dropDownItems.forEach((element) =>
			options.push(element.textContent)
		);
		expect(options).to.eql(expectedOptions);
	});
	it("Validate selectschema_placeholder rendered correctly", () => {
		const dropDown = wrapper.container.querySelector("div[data-id='properties-selectschema_placeholder']");
		expect(dropDown.querySelector("button > span").textContent).to.equal("None...");
	});
	it("Validate selectschema can select ''", () => {
		const { container } = wrapper;
		let dropDown = container.querySelector("div[data-id='properties-selectschema']");
		// open the dropdown
		const dropdownButton = dropDown.querySelector("button");
		fireEvent.click(dropdownButton);
		// select the first item
		dropDown = container.querySelector("div[data-id='properties-selectschema'] ");
		const dropdownList = dropDown.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[0]);
		expect(propertiesController.getPropertyValue({ name: "selectschema" })).to.equal("");
	});
	it("selectschema control should have aria-label", () => {
		const dropDown = wrapper.container.querySelector("div[data-id='properties-selectschema']");
		const dropdownAriaLabelledby = dropDown.querySelector(".cds--list-box__menu").getAttribute("aria-labelledby");
		expect(dropDown.querySelector(`label[id='${dropdownAriaLabelledby}']`).textContent).to.equal("selectschema(required)");
	});
});

describe("selectschema classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
		Element.prototype.getBoundingClientRect = jest.fn()
			.mockReturnValue({
				height: 1000, // This is used to measure the panel height
				width: 1000
			});

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(selectschemaParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("selectschema should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".selectschema-control-class")).to.have.length(1);
	});

	it("selectschema should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "selectschema_table-error-panel");
		expect(wrapper.container.querySelectorAll(".table-selectschema-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-on-panel-selectschema-control-class")).to.have.length(1);
		expect(wrapper.container.querySelectorAll(".table-subpanel-selectschema-control-class")).to.have.length(1);
	});
});
