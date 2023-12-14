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
import SomeOfSelectControl from "../../../src/common-properties/controls/someofselect";
import { Provider } from "react-redux";
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import SomeOfSelectParamDef from "../../test_resources/paramDefs/someofselect_paramDef.json";

describe("SomeOfSelectControl renders correctly", () => {

	const controller = new Controller();

	const control = {
		"name": "test-someofselect",
		"label": {
			"text": "Merge method"
		},
		"controlType": "someofselect",
		"valueDef": {
			"propType": "string",
			"isList": true,
			"isMap": false
		},
		"values": [
			"Order",
			"Keys",
			"Condition",
			"Gtt"
		],
		"valueLabels": [
			"Order",
			"Keys",
			"Condition",
			"Ranked condition"
		]
	};
	propertyUtils.setControls(controller, [control]);
	const propertyId = { name: "test-someofselect" };

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<SomeOfSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(control);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(propertyId);
	});

	it("should render a SomeOfSelectControl", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);
	});
	it("SomeOfSelectControl updates correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": ["Order"] }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		expect(someofselectCheckbox.at(0).getDOMNode().checked).to.equal(true);
		tableUtils.selectCheckboxes(wrapper, [0]);
		expect(controller.getPropertyValue(propertyId)).to.have.length(0);
	});
	it("SomeOfSelectControl handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": null }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		tableUtils.selectCheckboxes(wrapper, [1]);
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Keys");
	});
	it("SomeOfSelectControl handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		tableUtils.selectCheckboxes(wrapper, [2]);
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Condition");
	});
	it("SomeOfSelectControl renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.prop("disabled")).to.equal(true);
		});
	});
	it("SomeOfSelectControlrenders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		expect(someofselectWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad someofselect value"
		});
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const messageWrapper = someofselectWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
	it("SomeOfSelectControl should have aria-label", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find(".properties-vt-autosizer").find(".ReactVirtualized__Table");
		expect(someofselectWrapper.props()).to.have.property("aria-label", control.label.text);
	});
});

describe("someofselect works correctly in common-properties", () => {
	let wrapper;
	beforeEach(() => {
		const form = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = form.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate someofselect_disabled should have options filtered by enum_filter", () => {
		// verify the original number of entries
		let someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_disabled']");
		let someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(6);

		// deselect the disable checkbox which will filter the list to a smaller number
		const checkboxWrapper = wrapper.find("div[data-id='properties-disable']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(true);
		checkbox.getDOMNode().checked = false;
		checkbox.simulate("change");

		// the number of entries should be filtered
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_disabled']");
		someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(3);
	});
});

describe("someofselect filtered enum works correctly", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate someofselect should have options filtered by enum_filter", () => {
		let someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		// validate the correct number of options show up on open
		expect(tableUtils.getTableRows(someofselectWrapper)).to.have.length(5);
		// make sure there isn't warning on first open
		expect(someofselectWrapper.find("div.properties-validation-message")).to.have.length(0);
		// checked the filter box
		const checkboxWrapper = wrapper.find("div[data-id='properties-filter']");
		const checkbox = checkboxWrapper.find("input");
		checkbox.getDOMNode().checked = true;
		checkbox.simulate("change");
		// validate the correct number of options show up on open
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		expect(tableUtils.getTableRows(someofselectWrapper)).to.have.length(3);
	});

	it("Validate someofselectParamDef should clear the property value if filtered", () => {
		const propertyId = { name: "someofselect_filtered" };
		// value was initially set to "purple" but on open the value is cleared by the filter
		expect(renderedController.getPropertyValue(propertyId)).to.be.eql(["red"]);
		renderedController.updatePropertyValue(propertyId, ["red", "orange"]);
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["red", "orange"]);
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// "orange" isn't part of the filter so the value should be cleared
		expect(renderedController.getPropertyValue(propertyId)).to.eql(["red"]);
	});

});

describe("someofselect classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("someofselect should have custom classname defined", () => {
		expect(wrapper.find(".someofselect-control-class")).to.have.length(1);
	});
});

describe("All checkboxes in someofselect must have labels", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("checkbox in row should have label", () => {
		const someofselect = wrapper.find("div[data-id='properties-ctrl-someofselect']");
		const tableRows = tableUtils.getTableRows(someofselect);
		const rowCheckboxes = tableRows.find(".properties-vt-row-checkbox");
		const secondColumnRows = tableRows.find(".ReactVirtualized__Table__rowColumn");
		expect(secondColumnRows).to.have.length(6);
		const tableName = someofselect.find(".properties-control-label").text();

		secondColumnRows.forEach((row, index) => {
			const rowCheckboxLabel = rowCheckboxes.at(index).text();
			expect(rowCheckboxLabel).to.equal(`Select row ${index + 1} from ${tableName}`);
		});
	});
});

describe("someofselect control multiple rows selection", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should select/deselect multiple rows in someofselect using shift key", () => {
		let someofselectWrapper;
		let someofselectCheckbox;
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(6);

		// Verify no rows are selected
		const selected = tableUtils.validateSelectedRowNum(someofselectWrapper);
		expect(selected).to.have.length(0);

		// select 2nd row
		tableUtils.selectCheckboxes(someofselectWrapper, [1]);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// verify 1 row is selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(1);

		// Shift + select 5th row
		tableUtils.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify 2-5 rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(4);

		// Shift + select 1st row
		tableUtils.shiftSelectCheckbox(someofselectWrapper, 1);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify 1-5 rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(5);

		// Shift + select 5th row
		tableUtils.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_empty_array']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify all rows are deselected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(0);
	});

	it("verify multiple rows select/deselect works fine with filtered enum", () => {
		// Open filters tab
		wrapper.find("button.bx--accordion__heading")
			.at(2)
			.simulate("click");
		let someofselectWrapper;
		let someofselectCheckbox;
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(5);

		// Verify 1 row is selected
		const selected = tableUtils.validateSelectedRowNum(someofselectWrapper);
		expect(selected).to.have.length(1);

		// Shift + select 5th row
		tableUtils.shiftSelectCheckbox(someofselectWrapper, 5);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify all rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(5);

		// Click on filtered enum button
		renderedController.updatePropertyValue({ name: "filter" }, true);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// After filtering only 3 rows are displayed. Verify all 3 rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(3);

		// Remove filter
		renderedController.updatePropertyValue({ name: "filter" }, false);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify 3 rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(3);

		// Shift + select 2nd row
		tableUtils.shiftSelectCheckbox(someofselectWrapper, 2);
		// Update wrapper
		wrapper.update();
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_filtered']");
		someofselectCheckbox = someofselectWrapper.find("input");
		// Verify all rows are selected
		expect(tableUtils.validateSelectedRowNum(someofselectCheckbox)).to.have.length(5);
	});

});
