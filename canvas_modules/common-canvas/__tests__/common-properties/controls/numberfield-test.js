/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import propertyUtils from "../../_utils_/property-utils";
import NumberfieldControl from "../../../src/common-properties/editor-controls/numberfield-control.jsx";
import EditorForm from "../../../src/common-properties/editor-controls/editor-form.jsx";
import ControlItem from "../../../src/common-properties/editor-controls/control-item.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const controller = new Controller();

const control = {
	name: "test-numberfield",
	charLimit: 15,
	additionalText: "Enter number",
	valueDef: {
		isList: false
	}
};
const control2 = {
};
const form = {
	"componentId": "numberfield",
	"label": "Number Fields",
	"editorSize": "large",
	"uiItems": [
		{
			"itemType": "primaryTabs",
			"tabs": [
				{
					"text": "Values",
					"group": "numberfield-values",
					"content": {
						"itemType": "panel",
						"panel": {
							"id": "numberfield-values",
							"panelType": "general",
							"uiItems": [
								{
									"itemType": "control",
									"control": {
										"name": "test-numberfield",
										"label": {
											"text": "Random",
											"numberGenerator": {
												"label": {
													"default": "Random"
												},
												"range": {
													"min": 1000000,
													"max": 9999999
												}
											}
										},
										"description": {
											"text": "numberfield with parameter with random number generator"
										},
										"controlType": "numberfield",
										"valueDef": {
											"propType": "integer",
											"isList": false,
											"isMap": false
										},
										"separateLabel": true,
										"required": true
									}
								}
							]
						}
					}
				}
			]
		}
	],
	"buttons": [
		{
			"id": "ok",
			"text": "OK",
			"isPrimary": true,
			"url": ""
		},
		{
			"id": "cancel",
			"text": "Cancel",
			"isPrimary": false,
			"url": ""
		}
	],
	"data": {
		"currentParameters": {
			"number_random": 12345
		}
	},
	"conditions": []
};

const showPropertiesButtons = sinon.spy();
function createEditorForm(inController) {
	inController.setForm(form);
	const editorForm = (<EditorForm
		ref="editorForm"
		key="editor-form-key"
		controller={inController}
		showPropertiesButtons={showPropertiesButtons}
	/>);
	return mount(editorForm);
}

const propertyId = { name: "test-numberfield" };

function setPropertyValue() {
	controller.setPropertyValues(
		{ "test-numberfield": 1 }
	);
}

describe("numberfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input).to.have.length(1);
	});

	it("should set correct state value in `NumberfieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: 44 } });
		expect(controller.getPropertyValue(propertyId)).to.equal(44);
	});

	it("should set correct state null in `NumberfieldControl`", () => {
		setPropertyValue();
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: "" } });
		expect(controller.getPropertyValue(propertyId)).to.equal(null);
	});

	it("should set correct control type in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input.get(0).type).to.equal("number");
	});

	it("should set placeholder text in `NumberfieldControl`", () => {
		const wrapper = mount(
			<NumberfieldControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find("[type='number']");
		expect(input.get(0).placeholder).to.equal(control.additionalText);
	});

	it("should create a number_generator in `NumberfieldControl`", () => {
		function generateNumber() {
			// const generator = control.label.numberGenerator;
			// const min = generator.range && generator.range.min ? generator.range.min : 10000;
			// const max = generator.range && generator.range.max ? generator.range.max : 99999;
			// const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			// console.log(newValue);
		}
		const controlObj = (<NumberfieldControl
			control={control2}
			controller={controller}
			propertyId={propertyId}
		/>);
		const numberGenerator = (<label>{"\u00A0\u00A0"}<a className="number-generator" onClick={generateNumber}>
			{"Generate"}
		</a></label>);
		const label = (<div>
			<label className="control-label">{"Test Label"}</label>
			{numberGenerator}
		</div>);
		const wrapper = mount(
			<ControlItem key={"key1"} label={label} control={controlObj} />
		);
		expect(wrapper.find(".number-generator")).to.have.length(1);
	});
});

describe("editor-form renders with random number generator", () => {
	const editorController = new Controller();
	const wrapper = createEditorForm(editorController);
	it("should have displayed random generator link", () => {
		const generator = wrapper.find(".number-generator");
		expect(generator).to.have.length(1);
	});
	it("should click on generator to create a new number", () => {
		const generator = wrapper.find(".number-generator");
		const oldValue = editorController.getPropertyValue(propertyId);
		generator.simulate("click");
		wrapper.update();
		const newValue = editorController.getPropertyValue(propertyId);
		expect(oldValue).not.equal(newValue);
	});
});

describe("condition messages renders correctly with numberfield control", () => {
	it("numberfield control should have error message from null input and generator should trigger validation", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const input = wrapper.find("input[id='editor-control-numberfieldSeed']");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		const numberfieldSeedErrorMessages = {
			"type": "error",
			"text": "Field cannot be null. This is an example of a long error message that might be entered. The message text will wrap around to the next line.",
		};
		const actual = controller.getErrorMessage({ name: "numberfieldSeed" });
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldSeedErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		const generator = wrapper.find(".number-generator");
		expect(generator).to.have.length(1);
		generator.simulate("click");
		wrapper.update();

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
		expect(wrapper.find(".form__validation--error")).to.have.length(0);
	});
	it("numberfield control should have error message from invalid input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const input = wrapper.find("input[id='editor-control-numberfieldCheckpointInterval']");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: -100 } });
		wrapper.update();

		const numberfieldCheckpointIntervalErrorMessages = {
			"type": "error",
			"text": "The checkpoint interval value must either be >= 1 or -1 to disable"
		};
		const actual = controller.getErrorMessage({ name: "numberfieldCheckpointInterval" });
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldCheckpointIntervalErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
	it("required numberfield control should have error message from null input", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		const input = wrapper.find("input[id='editor-control-numberfieldCheckpointInterval']");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "" } });
		wrapper.update();

		const numberfieldCheckpointIntervalErrorMessages = {
			"type": "error",
			"text": "Required parameter numberfieldCheckpointInterval has no value",
		};
		const actual = controller.getErrorMessage({ name: "numberfieldCheckpointInterval" });
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldCheckpointIntervalErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});
