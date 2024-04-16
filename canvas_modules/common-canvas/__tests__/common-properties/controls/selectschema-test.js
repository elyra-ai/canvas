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
import SelectSchemaControl from "../../../src/common-properties/controls/dropdown";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import selectschemaParamDef from "../../test_resources/paramDefs/selectschema_paramDef.json";


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

// controls selectColumn, selectSchema and oneofselect are all dropdown controls.
// a set of dropdown basic unit test cases are defined in oneofselect-test.js and
// do not need to be repeated in selectColumn and selectSchema.
describe("selectschema renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});
	it("should have '...' as first selected option for empty list", () => {
		controller.setPropertyValues(
			{ "test-selectschema": null }
		);
		const wrapper = mount(
			<SelectSchemaControl
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		let dropdownWrapper = wrapper.find("div[data-id='properties-test-selectschema']");
		expect(dropdownWrapper.find("button > span").text()).to.equal(emptyValueIndicator);
		// open the dropdown
		const dropdownButton = dropdownWrapper.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropdownWrapper = wrapper.find("div[data-id='properties-test-selectschema']");
		const dropdownList = dropdownWrapper.find("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(1);
		expect(dropdownList.at(0).text()).to.equal(emptyValueIndicator);
	});
});

describe("selectschema works correctly in common-properties", () => {
	const expectedOptions = [
		{ label: "...", value: "" },
		{ label: "Drugs_0", value: "Drugs_0" },
		{ label: "1", value: "1" },
		{ label: "Drugs_2", value: "Drugs_2" },
		{ label: "Drugs_3", value: "Drugs_3" },
		{ label: "random", value: "random" },
		{ label: "5", value: "5" },
		{ label: "6", value: "6" }
	];
	let wrapper;
	let propertiesController;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(selectschemaParamDef);
		propertiesController = flyout.controller;
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("Validate selectschema rendered correctly", () => {
		const dropDown = wrapper.find("div[data-id='properties-selectschema'] Dropdown");
		const options = dropDown.prop("items"); // selectschema
		expect(options).to.eql(expectedOptions);
	});
	it("Validate selectschema_placeholder rendered correctly", () => {
		const dropDown = wrapper.find("div[data-id='properties-selectschema_placeholder'] Dropdown");
		expect(dropDown.find("button > span").text()).to.equal("None...");
	});
	it("Validate selectschema can select ''", () => {
		let dropDown = wrapper.find("div[data-id='properties-selectschema'] Dropdown");
		// open the dropdown
		const dropdownButton = dropDown.find("button");
		dropdownButton.simulate("click");
		// select the first item
		dropDown = wrapper.find("div[data-id='properties-selectschema'] Dropdown");
		const dropdownList = dropDown.find("li.cds--list-box__menu-item");
		dropdownList.at(0).simulate("click");
		expect(propertiesController.getPropertyValue({ name: "selectschema" })).to.equal("");
	});
	it("selectschema control should have aria-label", () => {
		const dropDown = wrapper.find("div[data-id='properties-selectschema'] Dropdown");
		const dropdownAriaLabelledby = dropDown.find(".cds--list-box__menu").prop("aria-labelledby");
		expect(dropDown.find(`label[id='${dropdownAriaLabelledby}']`).text()).to.equal("selectschema(required)");
	});
});

describe("selectschema classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectschemaParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("selectschema should have custom classname defined", () => {
		expect(wrapper.find(".selectschema-control-class")).to.have.length(1);
	});

	it("selectschema should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "selectschema_table-error-panel");
		expect(wrapper.find(".table-selectschema-control-class")).to.have.length(1);
		expect(wrapper.find(".table-on-panel-selectschema-control-class")).to.have.length(1);
		expect(wrapper.find(".table-subpanel-selectschema-control-class")).to.have.length(1);
	});
});
