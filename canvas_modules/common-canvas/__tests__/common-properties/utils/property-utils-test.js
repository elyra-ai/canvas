/*
 * Copyright 2017-2020 IBM Corporation
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

import { expect } from "chai";
import PropertyUtils from "./../../../src/common-properties/util/property-utils.js";
import testUtils from "./../../_utils_/property-utils";
import Controller from "./../../../src/common-properties/properties-controller";
import propertyUtils from "./../../_utils_/property-utils";
import structureTableParamDef from "./../../test_resources/paramDefs/structuretable_paramDef.json";


describe("dynamic text with expressions", () => {
	const controller = new Controller();
	const controls = [
		{
			name: "int",
			valueDef: {
				isList: false,
				propType: "integer"
			}
		},
		{
			name: "int2",
			valueDef: {
				isList: false,
				propType: "integer"
			}
		},
		{
			name: "str",
			valueDef: {
				isList: false,
				propType: "string"
			}
		}
	];
	testUtils.setControls(controller, controls);
	it("test sum expression", () => {
		let result = PropertyUtils.evaluateText("Sum: ${sum(1,2,3,4)}", controller);
		expect(result).to.equal("Sum: 10");
		controller.updatePropertyValue({ name: "int" }, 0);
		result = PropertyUtils.evaluateText("Sum: ${sum(int)}", controller);
		expect(result).to.equal("Sum: 0");
		controller.updatePropertyValue({ name: "int" }, -1);
		result = PropertyUtils.evaluateText("Sum: ${sum(int)}", controller);
		expect(result).to.equal("Sum: -1");
		// multiple properties
		controller.updatePropertyValue({ name: "int2" }, 500);
		result = PropertyUtils.evaluateText("Sum: ${sum(int, int2, -2, int)}. Sum: ${sum(int2)}", controller);
		expect(result).to.equal("Sum: 496. Sum: 500");
		// invalid property name and string property
		controller.updatePropertyValue({ name: "str" }, "hello");
		result = PropertyUtils.evaluateText("Sum: ${sum(int3)}. Sum: ${sum(str)}", controller);
		expect(result).to.equal("Sum: 0. Sum: 0");
		// bad expression
		result = PropertyUtils.evaluateText("Sum: ${sum()}. Sum: ${sum(int}", controller);
		expect(result).to.equal("Sum: 0. Sum: 0");
	});
	it("test percent expression", () => {
		let result = PropertyUtils.evaluateText("Percent: ${percent(1029, 6)}", controller);
		expect(result).to.equal("Percent: 0.097182");
		controller.updatePropertyValue({ name: "int" }, 0);
		result = PropertyUtils.evaluateText("Percent: ${percent(int)}", controller);
		expect(result).to.equal("Percent: 0");
		controller.updatePropertyValue({ name: "int" }, -1);
		result = PropertyUtils.evaluateText("Percent: ${percent(int)}", controller);
		expect(result).to.equal("Percent: -100");
		// multiple expressions
		controller.updatePropertyValue({ name: "int2" }, 33);
		result = PropertyUtils.evaluateText("Percent: ${percent(int2, 2)}. Percent: ${percent(int2, 5)}", controller);
		expect(result).to.equal("Percent: 3.03. Percent: 3.03030");
		// invalid property name and string property
		controller.updatePropertyValue({ name: "str" }, "hello");
		result = PropertyUtils.evaluateText("Percent: ${percent(int3)}. Percent: ${percent(str)}", controller);
		expect(result).to.equal("Percent: 0. Percent: 0");
		// bad expression
		result = PropertyUtils.evaluateText("Percent: ${percent()}. Percent: ${percent(int}", controller);
		expect(result).to.equal("Percent: 0. Percent: 0");
	});
	it("test different text expressions", () => {
		// function that doesn't exist
		let result = PropertyUtils.evaluateText("Percent: ${none(0.1)}", controller);
		expect(result).to.equal("Percent: ");
		controller.updatePropertyValue({ name: "int" }, 0);
		result = PropertyUtils.evaluateText("Some text without an expression", controller);
		expect(result).to.equal("Some text without an expression");
	});
});

describe("getDMFieldIcon retrieves correct icon type for each measurement level ", () => {
	var wrapper;
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureTableParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("measure level of range should return measurementScale icon", () => {
		// Open rename fields Summary Panel in structuretableParamDef
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Age", "measure");
		expect(icon).to.equal("measurementScale");
	});
	it("measure level of ordered_set should return measurementOrdinal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Sex", "measure");
		expect(icon).to.equal("measurementOrdinal");
	});
	it("measure level of discrete should return measurementDiscrete icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "BP", "measure");
		expect(icon).to.equal("measurementDiscrete");
	});
	it("measure level of set should return measurementNominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Cholesterol", "measure");
		expect(icon).to.equal("measurementNominal");
	});
	it("measure level of flag should return measurementFlag icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Na", "measure");
		expect(icon).to.equal("measurementFlag");
	});
	it("measure level of collection should return measurementNominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "K", "measure");
		expect(icon).to.equal("measurementNominal");
	});
	it("measure level of geospatial should return measurementNominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Drug", "measure");
		expect(icon).to.equal("measurementNominal");
	});
	it("field with no measurement level should return empty icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Ag", "measure");
		expect(icon).to.equal("measurementEmpty");
	});
});
