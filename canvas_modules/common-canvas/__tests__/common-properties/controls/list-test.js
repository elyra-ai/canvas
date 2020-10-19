/*
 * Copyright 2020 IBM Corporation
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
import List from "../../../src/common-properties/controls/list";
import { mountWithIntl, shallowWithIntl } from "../../_utils_/intl-utils";
import { Provider } from "react-redux";
import { expect } from "chai";
import { setControls } from "../../_utils_/property-utils";
import { getTableRows, selectCheckboxes } from "./../../_utils_/table-utils";
import Controller from "../../../src/common-properties/properties-controller";

const controlString = {
	"name": "test-list-string",
	"label": {
		"text": "test list string control"
	},
	"description": {
		"text": "list control description"
	},
	"controlType": "list",
	"valueDef": {
		"isList": true,
		"isMap": false,
		"propType": "string"
	}
};
const controlInteger = {
	"name": "test-list-integer",
	"label": {
		"text": "test list integer control"
	},
	"description": {
		"text": "list control description"
	},
	"controlType": "list",
	"valueDef": {
		"isList": true,
		"isMap": false,
		"propType": "integer"
	}
};

const listStringCurrentValues = ["list item 1", ""];
const listIntegerCurrentValues = [10, null];

/* eslint max-len: ["error", { "ignoreStrings": true }] */
const listLongStringCurrentValues = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."];

const listStringPopertyId = { name: "test-list-string" };
const listIntegerPopertyId = { name: "test-list-integer" };

describe("list renders correctly for array[string]", () => {
	const controller = new Controller();
	setControls(controller, [controlString]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues({ "test-list-string": listStringCurrentValues });
	});

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<List
				store={controller.getStore()}
				control={controlString}
				controller={controller}
				propertyId={listStringPopertyId}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(controlString);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(listStringPopertyId);
	});

	it("should render a `list` control of array[string]", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(2);

		textfields.forEach((textfield, index) => {
			const value = textfield.prop("value");
			expect(value).to.equal(listStringCurrentValues[index]);
		});

		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(getTableRows(wrapper)).to.have.length(2);
	});

	it("should be able to modify value in `list` control textfield", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(2);

		const inputValue = "new string value in the list control of array[string]";
		const input = textfields.at(1).find("input");
		input.simulate("change", { target: { value: inputValue } });
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([
			listStringCurrentValues[0],
			inputValue
		]);
	});

	it("should add/remove Textfield rows to `list` control when clicking add/remove button", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const addButton = wrapper.find("button.properties-add-fields-button");
		let removeButton = wrapper.find("button.properties-remove-fields-button");

		// add 2 rows
		addButton.simulate("click");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat(["", ""]));
		expect(wrapper.find("TextfieldControl")).to.have.length(4); // Ensure new Textfields are added
		expect(removeButton.prop("disabled")).to.equal(true);

		// select the third row in the table
		const tableData = getTableRows(wrapper);
		expect(tableData).to.have.length(4);
		selectCheckboxes(wrapper, [2]);
		// ensure removed button is enabled and select it
		removeButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeButton.prop("disabled")).to.equal(false);
		removeButton.simulate("click");
		// validate the third row is deleted
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql(listStringCurrentValues.concat([""]));
	});

	it("should be able to add row when no propertyValues are set", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		controller.setPropertyValues({});
		const addButton = wrapper.find("button.properties-add-fields-button");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listStringPopertyId)).to.eql([""]);
	});

	it("should render a readonly text input for long values", () => {
		controller.setPropertyValues({ "test-list-string": listLongStringCurrentValues });
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlString}
					controller={controller}
					propertyId={listStringPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-string']");
		const textfields = listWrapper.find("TextfieldControl");
		expect(textfields).to.have.length(1);
		expect(listWrapper.find(".properties-textinput-readonly")).to.have.length(1);
		const validationMsg = listWrapper.find("div.properties-validation-message.inTable");
		expect(validationMsg).to.have.length(1);
		expect(validationMsg.find("svg.canvas-state-icon-error")).to.have.length(1);
	});
});

describe("list renders correctly for array[integer]", () => {
	const controller = new Controller();
	setControls(controller, [controlInteger]);

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues({ "test-list-integer": listIntegerCurrentValues });
	});

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<List
				store={controller.getStore()}
				control={controlInteger}
				controller={controller}
				propertyId={listIntegerPopertyId}
			/>
		);
		expect(wrapper.dive().prop("control")).to.equal(controlInteger);
		expect(wrapper.dive().prop("controller")).to.equal(controller);
		expect(wrapper.dive().prop("propertyId")).to.equal(listIntegerPopertyId);
	});

	it("should render a `list` control of array[integer]", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.find("NumberfieldControl");
		expect(numberfields).to.have.length(2);

		numberfields.forEach((textfield, index) => {
			const value = textfield.prop("value");
			expect(value).to.equal(listIntegerCurrentValues[index]);
		});

		expect(wrapper.find("button.properties-add-fields-button")).to.have.length(1);
		expect(wrapper.find("button.properties-remove-fields-button")).to.have.length(1);
		expect(getTableRows(wrapper)).to.have.length(2);
	});

	it("should be able to modify value in `list` control numberfield", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const listWrapper = wrapper.find("div[data-id='properties-test-list-integer']");
		const numberfields = listWrapper.find("NumberfieldControl");
		expect(numberfields).to.have.length(2);

		const inputValue = "1234567890";
		const input = numberfields.at(1).find("input");
		input.simulate("change", { target: { value: inputValue } });
		expect(controller.getPropertyValue(listIntegerPopertyId)).to.eql([
			listIntegerCurrentValues[0],
			1234567890
		]);
	});

	it("should add/remove Numberfield rows to `list` control when clicking add/remove button", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<List
					store={controller.getStore()}
					control={controlInteger}
					controller={controller}
					propertyId={listIntegerPopertyId}
				/>
			</Provider>
		);
		const addButton = wrapper.find("button.properties-add-fields-button");
		let removeButton = wrapper.find("button.properties-remove-fields-button");

		// add 2 rows
		addButton.simulate("click");
		addButton.simulate("click");
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null, null]));
		expect(wrapper.find("NumberfieldControl")).to.have.length(4); // Ensure new Numberfields are added
		expect(removeButton.prop("disabled")).to.equal(true);

		// select the third row in the table
		const tableData = getTableRows(wrapper);
		expect(tableData).to.have.length(4);
		selectCheckboxes(wrapper, [2]);
		// ensure removed button is enabled and select it
		removeButton = wrapper.find("button.properties-remove-fields-button");
		expect(removeButton.prop("disabled")).to.equal(false);
		removeButton.simulate("click");
		// validate the third row is deleted
		expect(controller.getPropertyValue(listIntegerPopertyId))
			.to.eql(listIntegerCurrentValues.concat([null]));
	});
});
