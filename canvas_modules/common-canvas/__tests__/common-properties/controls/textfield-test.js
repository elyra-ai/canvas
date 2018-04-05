/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import TextfieldControl from "../../../src/common-properties/controls/textfield";
import Controller from "../../../src/common-properties/properties-controller";
import { CHARACTER_LIMITS } from "../../../src/common-properties/constants/constants.js";
import { mount } from "enzyme";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import propertyUtils from "../../_utils_/property-utils";

import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Need for style checking

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const defaultControlStates = {
	"textareaDescription": "hidden",
	"radiosetColor": "disabled",
	"expressionBox": "disabled",
	"field_types[1][3]": "hidden",
	"field_types[1][2]": "disabled",
	"field_types[3][3]": "hidden",
	"field_types[3][2]": "disabled",
	"field_types[4][3]": "hidden",
	"field_types[4][2]": "disabled",
	"field_types[6][3]": "hidden",
	"field_types[6][2]": "disabled"
};

const controller = new Controller();

const control = {
	name: "test-text",
	charLimit: 15,
	additionalText: "Enter file name",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
propertyUtils.setControls(controller, [control]);
const propertyId = { name: "test-text" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-text": "Test value" }
	);
}

describe("textfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `TextfieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		input.simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(propertyId)).to.equal("My new value");
	});

	it("should set correct maxLength in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(control.charLimit);
	});

	it("should set correct control type in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).type).to.equal("text");
	});

	it("should set placeholder text in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should set maxLength correctly without charLimit in `TextfieldControl`", () => {
		const wrapper = mount(
			<TextfieldControl
				control={control2}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".text");
		expect(input.get(0).maxLength).to.equal(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD);
	});
});

describe("condition messages renders correctly with textfields control", () => {
	it("test passwordfield isNotEmpty", () => {
		propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const passwdFieldPropId = { name: "passwordField" };
		const textFieldPropId = { name: "textfieldName" };
		controller.updatePropertyValue(textFieldPropId, "test");
		controller.updatePropertyValue(passwdFieldPropId, "");
		const passwdFieldErrorMessages = {
			passwordField:
						{ type: "error",
							text: "Password cannot be empty, enter \"password\"",
							validation_id: "PW2"
						}
		};
		const actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(passwdFieldErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
	});

	it("test textfield cannot contain passwordfield value", () => {
		propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const passwdFieldPropId = { name: "passwordField" };
		const textFieldPropId = { name: "textfieldName" };
		controller.updatePropertyValue(passwdFieldPropId, "test");
		controller.updatePropertyValue(textFieldPropId, "entering a name that contains test");
		const textfieldNameErrorMessages = {
			passwordField:
						{ type: "warning",
							text: "name cannot contain password",
							validation_id: "PW1"
						}
		};
		const actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(textfieldNameErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
	});

	it("control should be hidden", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");
		expect(textareaDescriptionInput).to.have.length(1);
		expect(textareaDescriptionInput).to.have.style("display", "none");
		expect(controller.getControlState({ name: "textareaDescription" })).to.equal(defaultControlStates.textareaDescription);
	});

	it("textfields control should have error message from invalid input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const passwordInput = wrapper.find("input[id='editor-control-passwordField']");
		expect(passwordInput).to.have.length(1);
		passwordInput.simulate("change", { target: { value: "password" } });
		wrapper.update();
		const textfieldNameInput = wrapper.find("#editor-control-textfieldName");
		const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");

		expect(controller.getControlState({ name: "textareaDescription" })).to.equal("hidden");

		textfieldNameInput.simulate("change", { target: { value: "entering a name with invalid \"quotes'" } });
		wrapper.update();
		let textfieldNameErrorMessages = {
			textfieldName:
						{
							type: "error",
							text: "Name cannot contain double or single \"quotes\"",
							validation_id: "textfieldtest2"
						}
		};
		let actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(textfieldNameErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		textfieldNameInput.simulate("change", { target: { value: "entering a name with invlid / backslash" } });
		wrapper.update();

		textfieldNameErrorMessages = {
			textfieldName:
			{
				type: "error",
				text: "Name cannot contain /",
				validation_id: "textfieldtest1"
			}
		};
		actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(textfieldNameErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		const checkbox = wrapper.find("#editor-control-checkboxEnableDesc");
		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
		textfieldNameInput.simulate("change", { target: { value: "entering a valid name" } });
		textareaDescriptionInput.simulate("change", { target: { value: "entering a valid description" } });
		wrapper.update();

		textfieldNameErrorMessages = {};
		actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(textfieldNameErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		expect(wrapper.find(".form__validation--error")).to.have.length(0);
		expect(wrapper.find(".form__validation--warning")).to.have.length(0);
	});

	it("required textfields control should have error message from null input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");

		const checkbox = wrapper.find("#editor-control-checkboxEnableDesc");
		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
		textareaDescriptionInput.simulate("change", { target: { value: "" } });

		const textfieldNameErrorMessages = {
			textareaDescription:
						{
							validation_id: "required_textareaDescription_F26$7s#9)",
							type: "error",
							text: "Required parameter 'Description' has no value"
						}
		};
		const actual = controller.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(textfieldNameErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		wrapper.update();
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
		expect(wrapper.find(".form__validation--warning")).to.have.length(0);
	});
});
