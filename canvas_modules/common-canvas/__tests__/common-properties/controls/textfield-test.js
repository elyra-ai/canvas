/*
 * Copyright 2017-2020 Elyra Authors
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
import { CHARACTER_LIMITS, TRUNCATE_LIMIT } from "./../../../src/common-properties/constants/constants.js";
import { mount } from "enzyme";
import { expect } from "chai";
import { Provider } from "react-redux";
import propertyUtils from "../../_utils_/property-utils";
import textfieldParamDef from "../../test_resources/paramDefs/textfield_paramDef.json";


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
propertyUtils.setControls(controller, [control, control2, controlList]);


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
		const value = propertyUtils.genLongString(TRUNCATE_LIMIT + 10);
		controller.setPropertyValues({ "test-text": value });
		const wrapper = mount(
			<Provider store={controller.getStore()}>
				<Textfield
					store={controller.getStore()}
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		expect(textWrapper.find(".properties-textinput-readonly")).to.have.length(1);

		const validationMsg = textWrapper.find("div.properties-validation-message");
		expect(validationMsg).to.have.length(1);
		expect(validationMsg.find("svg.canvas-state-icon-error")).to.have.length(1);
	});

	it("textfield props should have been defined", () => {
		const wrapper = mount(
			<Textfield
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

	it("textfield should update text value", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield should update text value with list delimiter", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "value 1, value2" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("value 1, value2");
	});

	it("textfield should not go over max chars", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const value = propertyUtils.genLongString(control.charLimit + 10);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: value } });
		expect(controller.getPropertyValue(propertyId)).to.equal(value.substr(0, control.charLimit));
	});

	it("textfield should set default charLimit correctly without charLimit set", () => {
		const propertyId2 = { name: "test-text2" };
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control2}
				controller={controller}
				propertyId={propertyId2}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text2']");
		const input = textWrapper.find("input");
		const value = propertyUtils.genLongString(CHARACTER_LIMITS.TEXT_FIELD + 10);
		input.simulate("change", { target: { value: value } });
		expect(controller.getPropertyValue(propertyId2)).to.equal(value.substr(0, CHARACTER_LIMITS.TEXT_FIELD));
	});

	it("textfield should set placeholder text", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});

	it("textfield handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-text": null }
		);
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textfield renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		expect(textWrapper.find("input").prop("disabled")).to.equal(true);
	});

	it("textfield renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		expect(textWrapper.hasClass("hide")).to.equal(true);
	});

	it("textfield renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text']");
		const messageWrapper = textWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
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
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text-list']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.eql(["My new value"]);
	});

	it("textfield should update list value with multiple values", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text-list']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "value 1, value 2, value 3" } });
		expect(controller.getPropertyValue(propertyId)).to.eql(["value 1", "value 2", "value 3"]);
	});

	it("textfield should set value to undefined when no default value is provided", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text-list']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.be.undefined;
	});

	it("textfield should set value to default value when no value is entered", () => {
		const wrapper = mount(
			<Textfield
				store={controller.getStore()}
				control={controlList2}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-text-list']");
		const input = textWrapper.find("input");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.eql([]);
	});
});


describe("textfield classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("textfield should have custom classname defined", () => {
		expect(wrapper.find(".string-textfield-control-class")).to.have.length(1);
	});

	it("textfield should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "textfield-table-panels");
		const tableControlDiv = wrapper.find("div[data-id='properties-textfield-table-summary-ctrls']");
		// There are 4 rows shown across 2 tables
		expect(tableControlDiv.find(".table-textfield-control-class")).to.have.length(4);
		// From the 4 rows shown, each row has a textfield on-panel and in subpanel
		expect(tableControlDiv.find(".table-on-panel-textfield-control-class")).to.have.length(4);
		expect(tableControlDiv.find(".table-subpanel-textfield-control-class")).to.have.length(4);
	});
});
