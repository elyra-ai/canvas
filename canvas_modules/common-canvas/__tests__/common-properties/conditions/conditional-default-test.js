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
import propertyUtilsRTL from "./../../_utils_/property-utilsRTL";
import defaultsParamDef from "./../../test_resources/paramDefs/defaults_paramDef.json";
import { expect } from "chai";

describe("Condition default_value test cases", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(defaultsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("If default value is defined in current_parameters, use default value from current_parameters", () => {
		// current_parameters_default has default value defined in current_parameters and default_value condition.
		// Higher preference is given to the value in current_parameters
		const { container } = wrapper;
		const field2 = container.querySelectorAll("div[data-id='properties-current_parameters_default'] input");
		expect(field2).to.have.length(1);
		expect(field2[0].value).to.equal(defaultsParamDef.current_parameters.current_parameters_default);
	});

	it("If default value is defined in current_ui_parameters, use default value from current_ui_parameters", () => {
		// current_ui_parameters_default has default value defined in current_ui_parameters and default_value condition.
		// Higher preference is given to the value in current_ui_parameters
		const { container } = wrapper;
		const uiField2 = container.querySelectorAll("div[data-id='properties-current_ui_parameters_default'] input");
		expect(uiField2).to.have.length(1);
		expect(uiField2[0].value).to.equal(defaultsParamDef.current_ui_parameters.current_ui_parameters_default);
	});

	it(`If default value is NOT defined in current_parameters and default_value condition is defined,
 use value from default_value condition if the condition evaluate to true`, () => {
		// conditional_default has default value defined in default_value condition
		// Verify "mode" is "Include"
		const { container } = wrapper;
		expect(controller.getPropertyValue({ name: "mode" })).to.equal("Include");

		// default_value condition evaluate to true when mode is Include.
		const field1 = container.querySelectorAll("div[data-id='properties-conditional_default'] textarea");
		expect(field1).to.have.length(1);
		const defaultValueConditions = defaultsParamDef.conditions.filter((cond) => cond.default_value.parameter_ref === "conditional_default");
		expect(field1[0].textContent).to.equal(defaultValueConditions[0].default_value.value.join());
	});

	it(`If default value is NOT defined in current_parameters and default_value condition is defined,
 use default value from parameters if the condition evaluate to false`, () => {
		// default_value condition for ui_conditional_default evaluate to false
		// Verify "mode" is "Include"
		const { container } = wrapper;
		expect(controller.getPropertyValue({ name: "mode" })).to.equal("Include");

		// default_value condition evaluate to false because mode is NOT Discard
		const uiField1 = container.querySelectorAll("div[data-id='properties-ui_conditional_default'] textarea");
		expect(uiField1).to.have.length(1);
		const uiParameterDefinition = defaultsParamDef.uihints.ui_parameters.filter((param) => param.id === "ui_conditional_default");
		expect(uiField1[0].textContent).to.equal(uiParameterDefinition[0].default.join());
		expect(uiField1[0].textContent).to.not.equal(defaultsParamDef.conditions[0].default_value.value.join());
	});

	it("If default value is NOT defined in current_parameters and default_value condition, use default value from parameters", () => {
		// parameters_default has default value defined ONLY in parameters
		const { container } = wrapper;
		const field3 = container.querySelectorAll("div[data-id='properties-parameters_default'] input");
		expect(field3).to.have.length(1);
		const parameterDefinition = defaultsParamDef.parameters.filter((param) => param.id === "parameters_default");
		expect(field3[0].value).to.equal(parameterDefinition[0].default);
	});

	it("If default value is NOT defined in current_ui_parameters and default_value condition, use default value from ui_parameters", () => {
		// ui_parameters_default has default value defined ONLY in ui_parameters
		const { container } = wrapper;
		const uiField3 = container.querySelectorAll("div[data-id='properties-ui_parameters_default'] input");
		expect(uiField3).to.have.length(1);
		const uiParameterDefinition = defaultsParamDef.uihints.ui_parameters.filter((param) => param.id === "ui_parameters_default");
		expect(uiField3[0].value).to.equal(uiParameterDefinition[0].default);
	});

	it("If multiple default_value conditions evaluate to true, only first one is used.", () => {
		// 2 default_value conditions evaluate to true for conditional_default control
		const { container } = wrapper;
		const defaultValueConditions = defaultsParamDef.conditions.filter((cond) => cond.default_value.parameter_ref === "conditional_default");
		expect(defaultValueConditions).to.have.length(2);
		const field1 = container.querySelector("div[data-id='properties-conditional_default'] textarea");
		// Verify value from 1st condition is used
		expect(field1.textContent).to.equal(defaultValueConditions[0].default_value.value.join());
		// Verify value from 2nd condition is NOT used
		expect(field1.textContent).to.not.equal(defaultValueConditions[1].default_value.value.join());
	});

	it("If default value is NOT defined in current_parameters, default_value condition and parameters default, don't set any default value", () => {
		// no_default doesn't have any default value
		const { container } = wrapper;
		const field4 = container.querySelectorAll("div[data-id='properties-no_default'] input");
		expect(field4).to.have.length(1);
		expect(field4[0].value).to.equal("");
	});
});
