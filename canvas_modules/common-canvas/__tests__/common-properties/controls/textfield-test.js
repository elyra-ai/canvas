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
import Textfield from "./../../../src/common-properties/controls/textfield";
import Controller from "./../../../src/common-properties/properties-controller";
import { TRUNCATE_LIMIT } from "./../../../src/common-properties/constants/constants.js";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import { Provider } from "react-redux";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import textfieldParamDef from "../../test_resources/paramDefs/textfield_paramDef.json";
import { fireEvent } from "@testing-library/react";


const controller = new Controller();

const control = {
	name: "test-text",
	charLimit: 15,
	additionalText: "Enter file name",
	valueDef: {
		isList: false
	}
};

const controlList = {
	name: "test-text-list",
	additionalText: "Enter file name",
	valueDef: {
		isList: true
	}
};

const controlList2 = {
	name: "test-text-list",
	additionalText: "Enter file name",
	valueDef: {
		isList: true,
		defaultValue: []
	}
};

const control2 = {
	name: "test-text2",
};

const maxLengthForSingleLineControls = 128;
propertyUtilsRTL.setControls(controller, [control, control2, controlList]);

const mockTextfield = jest.fn();
jest.mock("./../../../src/common-properties/controls/textfield",
	() => (props) => mockTextfield(props)
);

mockTextfield.mockImplementation((props) => {
	const TextfieldComp = jest.requireActual(
		"./../../../src/common-properties/controls/textfield",
	).default;
	return <TextfieldComp {...props} />;
});

describe("textfield renders correctly", () => {
	const propertyId = { name: "test-text" };

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-text": "Test value" }
		);
	});

	it("textfield should not be editable if created with a long value", () => {
		const value = propertyUtilsRTL.genLongString(TRUNCATE_LIMIT + 10);
		controller.setPropertyValues({ "test-text": value });
		const wrapper = render(
			<Provider store={controller.getStore()}>
				<Textfield
					store={controller.getStore()}
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		expect(textWrapper.querySelectorAll(".properties-textinput-readonly")).to.have.length(1);

		const validationMsg = textWrapper.querySelectorAll("div.properties-validation-message");
		expect(validationMsg).to.have.length(1);
	});

	it("textfield props should have been defined", () => {
		render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockTextfield).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("Allow space trimming Handling when trimSpaces set to true", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldParamDef, { trimSpaces: true });
		const wrapper2 = renderedObject.wrapper;
		const controller2 = renderedObject.controller;
		const { container } = wrapper2;

		const actualErrors = controller2.getAllErrorMessages();
		const expectedErrors = {
			"string_empty": {
				"type": "error",
				"text": "You must enter a value for Empty.",
				"validation_id": "required_string_empty_938.7063182960883",
				"required": true,
				"displayError": false,
				"propertyId": {
					"name": "string_empty"
				}
			}
		};
		const textWrapper = container.querySelector("div[data-id='properties-string_empty']");
		const input2 = textWrapper.querySelector("input");
		fireEvent.change(input2, { target: { value: "  " } });

		expect(actualErrors).to.eql(expectedErrors);
	});

	it("Disable the space trimming when trimSpaces set to false", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldParamDef, { trimSpaces: false });
		const wrapper = renderedObject.wrapper;
		const rcontroller = renderedObject.controller;
		const { container } = wrapper;

		const inputWrapper2 = container.querySelector("div[data-id='properties-ctrl-string_empty']");
		const input = inputWrapper2.querySelector("input");

		fireEvent.change(input, { target: { value: "  " } });
		const actualErrors = rcontroller.getAllErrorMessages();
		expect(actualErrors).to.eql({}); // no error because space is a valid input

	});

	it("textfield should update text value", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield should update text value with list delimiter", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const textWrapper = container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "value 1, value2" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("value 1, value2");
	});

	it("textfield should not go over max chars", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const value = propertyUtilsRTL.genLongString(control.charLimit + 10);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: value } });
		expect(controller.getPropertyValue(propertyId)).to.equal(value.substr(0, control.charLimit));
	});

	it("textfield should set maxLengthForSingleLineControls correctly without charLimit set", () => {
		const propertyId2 = { name: "test-text2" };
		controller.setPropertiesConfig({ maxLengthForSingleLineControls: maxLengthForSingleLineControls });
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text2']");
		const input = textWrapper.querySelector("input");
		const value = propertyUtilsRTL.genLongString(maxLengthForSingleLineControls + 10);
		fireEvent.change(input, { target: { value: value } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(value.substr(0, maxLengthForSingleLineControls));
	});

	it("textfield should set placeholder text", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		expect(input.placeholder).to.equal(control.additionalText);
	});

	it("textfield handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-text": null }
		);
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		expect(textWrapper.querySelector("input").disabled).to.equal(true);
	});

	it("textfield does not render when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		expect(textWrapper).to.be.null;
	});

	it("textfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		const messageWrapper = textWrapper.querySelectorAll("div.cds--form-requirement");
		expect(messageWrapper).to.have.length(1);
	});

	it("textfield renders helpertext correctly", () => {
		control.helperText = "textfield helpertext";
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		expect(helpTextWrapper.querySelector("div.cds--form__helper-text").textContent).to.equal(control.helperText);
	});

	it("textfield renders readonly correctly", () => {
		control.readOnly = true;
		controller.setPropertyValues(
			{ }
		);
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);

		const readOnlyWrapper = wrapper.container.querySelector("div[data-id='properties-test-text']");
		expect(readOnlyWrapper.querySelector("input").readOnly).to.equal(control.readOnly);
	});
});

describe("textfield list works correctly", () => {
	const propertyId = { name: "test-text-list" };
	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-text-list": ["item 1", "item 2"] }
		);
	});
	it("textfield should update list value with single value", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text-list']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.eql(["My new value"]);
	});

	it("textfield should update list value with multiple values", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text-list']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "value 1, value 2, value 3" } });
		expect(controller.getPropertyValue(propertyId)).to.eql(["value 1", "value 2", "value 3"]);
	});

	it("textfield should set value to null when no default value is provided", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text-list']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.be.null;
	});

	it("textfield should set value to default value when no value is entered", () => {
		const wrapper = render(
			<Textfield
				store={controller.getStore()}
				control={controlList2}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.container.querySelector("div[data-id='properties-test-text-list']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.eql([]);
	});
});


describe("textfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("textfield should have custom classname defined", () => {
		expect(wrapper.container.querySelectorAll(".string-textfield-control-class")).to.have.length(1);
	});

	it("textfield should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "textfield-table-panels");
		const tableControlDiv = wrapper.container.querySelector("div[data-id='properties-textfield-table-summary-ctrls']");
		// There are 4 rows shown across 2 tables
		expect(tableControlDiv.querySelectorAll(".table-textfield-control-class")).to.have.length(4);
		// From the 4 rows shown, each row has a textfield on-panel and in subpanel
		expect(tableControlDiv.querySelectorAll(".table-on-panel-textfield-control-class")).to.have.length(4);
		expect(tableControlDiv.querySelectorAll(".table-subpanel-textfield-control-class")).to.have.length(4);
	});
});
