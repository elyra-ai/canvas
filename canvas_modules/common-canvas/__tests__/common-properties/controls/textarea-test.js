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
import TextArea from "../../../src/common-properties/controls/textarea";
import { TRUNCATE_LIMIT } from "../../../src/common-properties/constants/constants.js";
import { mount } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import textareaParamDef from "../../test_resources/paramDefs/textarea_paramDef.json";

const controller = new Controller();

const control = {
	name: "test-textarea",
	charLimit: 256,
	additionalText: "Add comment",
	valueDef: {
		isList: false
	}
};
const controlNoLimit = {
	name: "test-textarea",
	charLimit: -1,
	valueDef: {
		isList: false
	}
};
const controlList = {
	name: "test-textarea-list",
	additionalText: "Add comment",
	valueDef: {
		isList: true
	}
};

const propertyId = { name: "test-textarea" };
const propertyIdList = { name: "test-textarea-list" };
const maxLengthForMultiLineControls = 1024;
propertyUtils.setControls(controller, [control, controlList, controlNoLimit]);

describe("textarea control renders correctly", () => {

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ "test-textarea": "Test value",
				"test-textarea-list": ["Hopper", "Turing", "Shannon", "Babbage"]
			}
		);
	});

	it("textarea props should have been defined", () => {
		const wrapper = mount(
			<TextArea
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

	it("textarea should render", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		expect(input).to.have.length(1);
	});

	it("textarea should set correct value", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textarea should set correct list value", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyIdList}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea-list']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: "My new value\nanother line" } });
		expect(controller.getPropertyValue(propertyIdList)).to.eql(["My new value", "another line"]);
	});

	it("textarea should not go over max chars", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const value = propertyUtils.genLongString(control.charLimit + 10);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: value } });
		expect(controller.getPropertyValue(propertyId)).to.equal(value.substr(0, control.charLimit));
	});

	it("textarea should set maxLengthForMultiLineControls correctly without charLimit", () => {
		controller.setPropertiesConfig({ maxLengthForMultiLineControls: maxLengthForMultiLineControls });
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={controlList}
				controller={controller}
				propertyId={propertyIdList}
			/>
		);
		const value = propertyUtils.genLongString(maxLengthForMultiLineControls + 10);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea-list']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: value } });
		expect(controller.getPropertyValue(propertyIdList)).to.eql([value.substr(0, maxLengthForMultiLineControls)]);
	});

	it("textarea should not have a text limit when charList set to -1", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={controlNoLimit}
				controller={controller}
				propertyId={propertyIdList}
			/>
		);
		const value = propertyUtils.genLongString(maxLengthForMultiLineControls + 10);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea-list']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: value } });
		expect(controller.getPropertyValue(propertyIdList)).to.equal(value.substr(0, maxLengthForMultiLineControls + 10));
	});

	it("textarea should set correct control type`", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		expect(input.get(0).type).to.equal("textarea");
	});

	it("textarea should set placeholder text", () => {
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		expect(input.getDOMNode().placeholder).to.equal(control.additionalText);
	});

	it("textarea handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-text": null }
		);
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textarea handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const input = textWrapper.find("textarea");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("textarea renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		expect(textWrapper.find("textarea").prop("disabled")).to.equal(true);
	});

	it("textarea renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		expect(textWrapper.hasClass("hide")).to.equal(true);
	});

	it("textarea renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad checkbox value"
		});
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		const messageWrapper = textWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});

	it("textarea should not be editable if created with a long value", () => {
		const value = propertyUtils.genLongString(TRUNCATE_LIMIT + 10);
		controller.setPropertyValues({ "test-textarea": [value] });
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const textWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		expect(textWrapper.find("textarea").prop("disabled")).to.equal(true);

		const validationMsg = textWrapper.find("div.cds--form-requirement");
		expect(validationMsg).to.have.length(1);
	});

	it("textarea should have helper text", () => {
		control.helperText = "Textarea helperText";
		controller.setPropertyValues({});
		const wrapper = mount(
			<TextArea
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const helpTextWrapper = wrapper.find("div[data-id='properties-test-textarea']");
		expect(helpTextWrapper.find("div.cds--form__helper-text").text()).to.equal(control.helperText);
	});
});

describe("textarea classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(textareaParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("textarea should have custom classname defined", () => {
		expect(wrapper.find(".string-textarea-control-class")).to.have.length(1);
	});

	it("textarea should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "textarea-table-panels");
		const tableControlDiv = wrapper.find("div[data-id='properties-textarea-table-summary-ctrls']");
		// There are 4 rows shown across 2 tables
		expect(tableControlDiv.find(".table-textarea-control-class")).to.have.length(4);
		// From the 4 rows shown, each row has a textarea on-panel and in subpanel
		expect(tableControlDiv.find(".table-on-panel-textarea-control-class")).to.have.length(4);
		expect(tableControlDiv.find(".table-subpanel-textarea-control-class")).to.have.length(4);
	});
});
