/*
 * Copyright 2017-2022 Elyra Authors
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
import { propertyOf } from "lodash";
import * as PropertyUtils from "./../../../src/common-properties/util/property-utils.js";
import testUtils from "./../../_utils_/property-utils";
import Controller from "./../../../src/common-properties/properties-controller";
import propertyUtils from "./../../_utils_/property-utils";
import structureTableParamDef from "./../../test_resources/paramDefs/structuretable_paramDef.json";
import convertValuesDataTypesParamDef from "./../../test_resources/paramDefs/convertValueDataTypes_paramDef.json";

import { ParameterMetadata } from "./../../../src/common-properties/form/ParameterInfo";

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

	it("measure level of range should return measurement-scale icon", () => {
		// Open rename fields Summary Panel in structuretableParamDef
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Age", "measure");
		expect(icon).to.equal("measurement-scale");
	});
	it("measure level of ordered_set should return measurement-ordinal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Sex", "measure");
		expect(icon).to.equal("measurement-ordinal");
	});
	it("measure level of discrete should return measurement-discrete icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "BP", "measure");
		expect(icon).to.equal("measurement-discrete");
	});
	it("measure level of set should return measurement-nominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Cholesterol", "measure");
		expect(icon).to.equal("measurement-nominal");
	});
	it("measure level of flag should return measurement-flag icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Na", "measure");
		expect(icon).to.equal("measurement-flag");
	});
	it("measure level of collection should return measurement-nominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "K", "measure");
		expect(icon).to.equal("measurement-nominal");
	});
	it("measure level of geospatial should return measurement-nominal icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Drug", "measure");
		expect(icon).to.equal("measurement-nominal");
	});
	it("field with no measurement level should return empty icon", () => {
		const fields = controller.getDatasetMetadataFields();
		const icon = PropertyUtils.getDMFieldIcon(fields, "Ag", "measure");
		expect(icon).to.equal("measurement-empty");
	});
});

describe("convertObjectStructureToArray and convertArrayStructureToObject returns correct values ", () => {
	const subControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }];
	const arrayValues = [[1, 20, "hi"], [33, 404, "hello"], [55005, 612345, "hola"]];
	const objectValues = [{ field1: 1, field2: 20, field3: "hi" }, { field1: 33, field2: 404, field3: "hello" }, { field1: 55005, field2: 612345, field3: "hola" }];

	const structureEditorSubControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }, { name: "field4" }];
	const structureEditorArrayValues = [1, ["string1", "string2"], "hi", null];
	const structureEditorObjectValues = { field1: 1, field2: ["string1", "string2"], field3: "hi", field4: null };

	it("isSubControlStructureObjectType returns false when there are no structures of type object", () => {
		const controlArray = { structureType: "array" };
		let actual = PropertyUtils.isSubControlStructureObjectType(controlArray);
		expect(actual).to.eql(false);

		const subControlsArray = [{ name: "fieldA", structureType: "array", subControls: subControls }];
		actual = PropertyUtils.isSubControlStructureObjectType(subControlsArray);
		expect(actual).to.eql(false);

		const nestedSubControlsArray = [{ name: "field1" }, { name: "field2", subControls: subControlsArray }, { name: "field3" }];
		const controlNested = { structureType: "array", subControls: nestedSubControlsArray };
		actual = PropertyUtils.isSubControlStructureObjectType(controlNested);
		expect(actual).to.eql(false);
	});

	it("isSubControlStructureObjectType returns true when there are structures of type object", () => {
		const controlArray = { structureType: "object" };
		let actual = PropertyUtils.isSubControlStructureObjectType(controlArray);
		expect(actual).to.eql(true);

		const subControlsObject = [{ name: "field1" }, { name: "field2", structureType: "object" }, { name: "field3" }];
		const subControlObject = { structureType: "array", subControls: subControlsObject };
		actual = PropertyUtils.isSubControlStructureObjectType(subControlObject);
		expect(actual).to.eql(true);

		const nestedSubControlsObject = [{ name: "field1" }, { name: "field2", subControls: subControlsObject }, { name: "field3" }];
		const controlNested = { structureType: "array", subControls: nestedSubControlsObject };
		actual = PropertyUtils.isSubControlStructureObjectType(controlNested);
		expect(actual).to.eql(true);
	});

	it("convertObjectStructureToArray returns correct values for lists", () => {
		const actual = PropertyUtils.convertObjectStructureToArray(true, subControls, objectValues);
		expect(actual).to.eql(arrayValues);
	});

	it("convertArrayStructureToObject returns correct values for lists", () => {
		const actual = PropertyUtils.convertArrayStructureToObject(true, subControls, arrayValues, true);
		expect(actual).to.eql(objectValues);
	});

	it("convertObjectStructureToArray returns correct values when key:values are missing for lists", () => {
		const missingArrayValues = [[1, null, "hi"], [null, 404, "hello"], [55005, null, null]];
		const missingObjectValues = [{ field1: 1, field3: "hi" }, { field2: 404, field3: "hello" }, { field1: 55005 }];

		const actual = PropertyUtils.convertObjectStructureToArray(true, subControls, missingObjectValues);
		expect(actual).to.eql(missingArrayValues);
	});

	it("convertObjectStructureToArray returns correct values when values are missing for lists", () => {
		const missingArrayValues = [[1, null, ""], [null, 404, null], [null, "", null]];
		const missingObjectValues = [{ field1: 1, field2: null, field3: "" }, { field1: null, field2: 404, field3: null }, { field1: null, field2: "", field3: null }];

		const actual = PropertyUtils.convertObjectStructureToArray(true, subControls, missingObjectValues);
		expect(actual).to.eql(missingArrayValues);
	});

	it("convertArrayStructureToObject returns correct values for non lists", () => {
		const actual = PropertyUtils.convertArrayStructureToObject(false, structureEditorSubControls, structureEditorArrayValues);
		expect(actual).to.eql(structureEditorObjectValues);
	});

	it("convertObjectStructureToArray returns correct values when key:values are missing for non lists", () => {
		const missingArrayValues = [1, ["string1", "string2"], null, null];
		const missingObjectValues = { field1: 1, field2: ["string1", "string2"] };

		const actual = PropertyUtils.convertObjectStructureToArray(false, structureEditorSubControls, missingObjectValues);
		expect(actual).to.eql(missingArrayValues);
	});

	const nestedStructuresArray = [
		[
			"Cholesterol",
			5,
			[
				[
					1,
					"hi",
					"string"
				]
			]
		]
	];

	it("convertObjectStructureToArray/convertArrayStructureToObject returns correct values for nested structures - objects of objects", () => {
		const nestedSubControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }];
		const subControlObj = [{ name: "fieldA" }, { name: "fieldB" }, { name: "fieldC", structureType: "object", subControls: nestedSubControls, valueDef: { isList: true } }];
		const currentValues = [{
			"fieldA": "Cholesterol",
			"fieldB": 5,
			"fieldC": [{
				"field1": 1,
				"field2": "hi",
				"field3": "string"
			}]
		}];

		let actual = PropertyUtils.convertObjectStructureToArray(true, subControlObj, currentValues);
		expect(actual).to.eql(nestedStructuresArray);

		actual = PropertyUtils.convertArrayStructureToObject(true, subControlObj, nestedStructuresArray, true);
		expect(actual).to.eql(currentValues);
	});

	it("convertObjectStructureToArray/convertArrayStructureToObject returns correct values for nested structures - objects of arrays", () => {
		const nestedSubControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }];
		const subControlObj = [{ name: "fieldA" }, { name: "fieldB" }, { name: "fieldC", structureType: "array", subControls: nestedSubControls, valueDef: { isList: true } }];
		const currentValues = [{
			"fieldA": "Cholesterol",
			"fieldB": 5,
			"fieldC": [[
				1,
				"hi",
				"string"
			]]
		}];

		let actual = PropertyUtils.convertObjectStructureToArray(true, subControlObj, currentValues);
		expect(actual).to.eql(nestedStructuresArray);

		actual = PropertyUtils.convertArrayStructureToObject(true, subControlObj, nestedStructuresArray, true);
		expect(actual).to.eql(currentValues);
	});

	it("convertObjectStructureToArray/convertArrayStructureToObject returns correct values for nested structures - arrays of arrays", () => {
		const nestedSubControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }];
		const subControlObj = [{ name: "fieldA" }, { name: "fieldB" }, { name: "fieldC", structureType: "array", subControls: nestedSubControls, valueDef: { isList: true } }];
		const currentValues = [
			[
				"Cholesterol",
				5,
				[
					[
						1,
						"hi",
						"string"
					]
				]
			]
		];

		let actual = PropertyUtils.convertObjectStructureToArray(true, subControlObj, currentValues);
		expect(actual).to.eql(nestedStructuresArray);

		actual = PropertyUtils.convertArrayStructureToObject(true, subControlObj, nestedStructuresArray);
		expect(actual).to.eql(currentValues);
	});

	it("convertObjectStructureToArray/convertArrayStructureToObject returns correct values for nested structures - arrays of objects", () => {
		const nestedSubControls = [{ name: "field1" }, { name: "field2" }, { name: "field3" }];
		const subControlObj = [{ name: "fieldA" }, { name: "fieldB" }, { name: "fieldC", structureType: "object", subControls: nestedSubControls, valueDef: { isList: true } }];
		const currentValues = [
			[
				"Cholesterol",
				5,
				[{
					"field1": 1,
					"field2": "hi",
					"field3": "string"
				}]
			]
		];

		let actual = PropertyUtils.convertObjectStructureToArray(true, subControlObj, currentValues);
		expect(actual).to.eql(nestedStructuresArray);

		actual = PropertyUtils.convertArrayStructureToObject(true, subControlObj, nestedStructuresArray);
		expect(actual).to.eql(currentValues);
	});
});

describe("convertValueDataTypestests", () => {
	const parameters = propertyOf(convertValuesDataTypesParamDef)("parameters");
	const uihints = propertyOf(convertValuesDataTypesParamDef)("uihints");
	const parameterMetadata = ParameterMetadata.makeParameterMetadata(
		parameters,
		propertyOf(uihints)("parameter_info"),
		propertyOf(uihints)("ui_parameters"));

	it("convertValueDataTypes correctly converts currentParameters data types to what is defined in parameter definitions", () => {
		const initialValues = propertyOf(convertValuesDataTypesParamDef)("current_parameters");
		const actualValues = PropertyUtils.convertValueDataTypes(initialValues, parameterMetadata.paramDefs);

		const expectedValues = {
			// eslint-disable-next-line max-len
			"readonly_text": "This example parameterDef has currentParameters that are in the incorrect data type as defined in the paramter definition. There will be errors on the console where prop checks fail. ",
			"string_value": "This is a string",
			"string_value_convert": "true",
			"integer_value": 0,
			"integer_value_convert": 0,
			"double_value": 1.25,
			"double_value_convert": 1.25,
			"boolean_value": true,
			"boolean_value_convert": false,
			"null_value": null,
			"time_value": "05:45:09",
			"timestamp_value": -1847548800000,
			"dropdown_value": true,
			"list_value": ["list item 1", "list item 2", "list item 3"],
			"table_value": [["Age", "age", ""], ["BP", "BP-1", "number"]]
		};

		expect(actualValues).to.eql(expectedValues);
	});
});
