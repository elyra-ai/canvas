/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import propertyUtils from "../../_utils_/property-utils";
import NumberfieldControl from "../../../src/common-properties/controls/numberfield";
import EditorForm from "../../../src/common-properties/components/editor-form";
import ControlItem from "../../../src/common-properties/components/control-item";
import { mount } from "enzyme";
import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import isEqual from "lodash/isEqual";

import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";


const CONDITIONS_TEST_FORM_DATA = require("../../test_resources/json/conditions-test-formData.json");

const controller = new Controller();

const control = {
	name: "test-numberfield",
	charLimit: 15,
	additionalText: "Enter number",
	valueDef: {
		isList: false,
		propType: "integer"
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
	return mountWithIntl(editorForm);
}

const propertyId = { name: "test-numberfield" };


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
		input.simulate("change", { target: { value: "", validity: { badInput: false } } });
		wrapper.update();

		const numberfieldSeedErrorMessages = {
			"validation_id": "numberfieldSeed",
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
		input.simulate("change", { target: { value: "-100" } });
		wrapper.update();

		const numberfieldCheckpointIntervalErrorMessages = {
			"validation_id": "numberfieldCheckpointInterval",
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
		input.simulate("change", { target: { value: "", validity: { badInput: false } } });
		wrapper.update();

		const numberfieldCheckpointIntervalErrorMessages = {
			"validation_id": "required_numberfieldCheckpointInterval_F26$7s#9)",
			"type": "error",
			"text": "Required parameter 'Checkpoint Interval' has no value",
		};
		const actual = controller.getErrorMessage({ name: "numberfieldCheckpointInterval" });
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldCheckpointIntervalErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with multi-control conditions", () => {
	it("Control should generate error message on focus_parameter_ref control only ", () => {
		propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const maxBinId = { name: "numberfieldMaxBins" };
		const maxDepthId = { name: "numberfieldMaxDepth" };

		// Generate the error condition
		controller.updatePropertyValue(maxBinId, 1);
		controller.updatePropertyValue(maxDepthId, null);

		const multiControlErrorMessages = {
			text: "Maximum number of bins must be >= 2 or Maximum depth cannot be empty",
			type: "error",
			validation_id: "numberfieldMaxBins"
		};

		// focus_parameter_ref max bins should have the error and max Depth should not
		let actual = controller.getErrorMessage(maxBinId);
		expect(isEqual(JSON.parse(JSON.stringify(multiControlErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		actual = controller.getErrorMessage(maxDepthId);
		expect(isEqual(null, actual)).to.be.true;
	});

	it("control should have required error message from null input in multi-control condition", () => {
		propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);
		const maxBinId = { name: "numberfieldMaxBins" };
		const maxDepthId = { name: "numberfieldMaxDepth" };
		// set max number of bins to empty
		controller.updatePropertyValue(maxBinId, null);

		// should create this error
		const numberfieldMaxBinsErrorMessages = {
			text: "Required parameter 'Maximum number of bins' has no value",
			type: "error",
			validation_id: "required_numberfieldMaxBins_F26$7s#9)"
		};
		let actual = controller.getErrorMessage(maxBinId);
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldMaxBinsErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;

		// set max depth to null, this should not clear out the max bins error
		controller.updatePropertyValue(maxDepthId, null);

		// required parameter error should still exist
		actual = controller.getErrorMessage(maxBinId);
		expect(isEqual(JSON.parse(JSON.stringify(numberfieldMaxBinsErrorMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
	});
});

describe("condition messages should add alerts tab", () => {
	it("numberfield control should have error message from null input and generator should trigger validation", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		const wrapper = renderedObject.wrapper;

		let integerInput = wrapper.find("input[id='editor-control-number_int']");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "", validity: { badInput: false } } });
		wrapper.update();

		const randomInput = wrapper.find("input[id='editor-control-number_random']");
		expect(randomInput).to.have.length(1);
		randomInput.simulate("change", { target: { value: "", validity: { badInput: false } } });
		wrapper.update();

		// get alerts tabs
		let alertCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // alert category
		expect(alertCategory.find(".category-title-right-flyout-panel").text()).to.equal("ALERTS (2)");
		alertCategory
			.find(".category-title-right-flyout-panel")
			.simulate("click");
		wrapper.update();

		// ensure that alert tab is open
		const alertDiv = alertCategory.find(".panel-container-open-right-flyout-panel"); // ALERTS div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find(".link-text-container");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		expect(alertList.at(1).text()).to.equal("Required parameter 'Random' has no value");

		// go to VALUES tab by clicking on error message
		alertList.at(0)
			.find(".link-text.error")
			.simulate("click");
		wrapper.update();
		let valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // VALUES category
		expect(valuesCategory.find(".category-title-right-flyout-panel").text()).to.equal("VALUES (2)");

		// regenerate random number should decrease alert list
		let valuesDiv = valuesCategory.find(".panel-container-open-right-flyout-panel"); // VALUES div
		expect(valuesDiv).to.have.length(1);
		const generator = valuesDiv.find(".number-generator");
		expect(generator).to.have.length(1);
		generator.simulate("click");
		wrapper.update();

		alertCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // alert category
		expect(alertCategory.find(".category-title-right-flyout-panel").text()).to.equal("ALERTS (1)");
		alertCategory
			.find(".category-title-right-flyout-panel")
			.simulate("click");
		wrapper.update();

		alertList = alertCategory.find(".link-text-container");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		alertList.at(0)
			.find(".link-text.error")
			.simulate("click");
		wrapper.update();

		// enter new integer value to remove all Alerts
		valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // VALUES category
		expect(valuesCategory.find(".category-title-right-flyout-panel").text()).to.equal("VALUES (1)");

		valuesDiv = valuesCategory.find(".panel-container-open-right-flyout-panel").at(0); // VALUES category
		expect(valuesDiv).to.have.length(1);
		integerInput = valuesDiv.find("input[id='editor-control-number_int']");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "1" } });
		wrapper.update();

		valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // VALUES category
		expect(valuesCategory.find(".category-title-right-flyout-panel").text()).to.equal("VALUES");
	});
});

describe("NumberField control works correctly", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should render an integer number correctly", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("#editor-control-number_int");
		expect(integerNumber).not.to.be.undefined;
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should allow an integer value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("#editor-control-number_int");
		integerNumber.simulate("change", { target: { value: "44" } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(44);
	});
	it("should allow a null value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("#editor-control-number_int");
		integerNumber.simulate("change", { target: { value: "", validity: { badInput: false } } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(null);
	});
	it("should not allow a double value to be set in an integer field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("#editor-control-number_int");
		integerNumber.simulate("change", { target: { value: "4.4" } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should render an double number correctly", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("#editor-control-number_dbl");
		expect(doubleNumber).not.to.be.undefined;
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(11.012);
	});
	it("should allow an double value to be set in an double field", () => {
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("#editor-control-number_dbl");
		doubleNumber.simulate("change", { target: { value: "4.04" } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(4.04);
	});
	it("should allow a delete of a decimal value to be set in a double field", () => {
		// this is a special case.  It simulates a double number ".3" delete with a backspace
		// it is a particular case handled in the code.
		const numPropertyId = { name: "number_dbl" };
		const doubleNumber = wrapper.find("#editor-control-number_dbl");
		doubleNumber.simulate("change", { target: { value: ".3", validity: { badInput: false } } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(0.3);
		doubleNumber.simulate("change", { target: { value: "", validity: { badInput: true } } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(null);
	});
	it("should not allow a bad value to be set in a field", () => {
		const numPropertyId = { name: "number_int" };
		const integerNumber = wrapper.find("#editor-control-number_int");
		integerNumber.simulate("change", { target: { value: "", validity: { badInput: true } } });
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(10);
	});
	it("should render the correct default value ", () => {
		const numPropertyId = { name: "number_default" };
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(3);
	});
	it("should render the correct zero value default value ", () => {
		const numPropertyId = { name: "number_zero_default" };
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(0);
	});
	it("should not render default value if control value is zero", () => {
		const numPropertyId = { name: "number_zero" };
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(0);
	});
	it("should render a null value", () => {
		const numPropertyId = { name: "number_null" };
		expect(renderedController.getPropertyValue(numPropertyId)).to.equal(null);
	});
	it("should render a undefined value as undefined", () => {
		const numPropertyId = { name: "number_undefined" };
		expect(renderedController.getPropertyValue(numPropertyId)).to.be.undefined;
	});
	it("should render a placeholder text for a undefined field", () => {
		const phNumber = wrapper.find("#editor-control-number_placeholder");
		expect(phNumber.get(0).placeholder).to.equal("Enter a number");
	});
});
