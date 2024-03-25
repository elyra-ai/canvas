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

import { expect } from "chai";
import sinon from "sinon";
import deepFreeze from "deep-freeze";
import { merge } from "lodash";
import propertyUtils from "../_utils_/property-utils";
import Controller from "../../src/common-properties/properties-controller";
import Form from "../../src/common-properties/form/Form";
import conditionForm from "../test_resources/json/conditions-summary-form.json";
import datasetMetadata from "../test_resources/json/datasetMetadata.json";
import structureListEditorParamDef from "../test_resources/paramDefs/structurelisteditor_paramDef.json";
import structureTableParamDef from "../test_resources/paramDefs/structuretable_paramDef.json";
import checkboxsetParamDef from "../test_resources/paramDefs/checkboxset_paramDef.json";
import tabParamDef from "../test_resources/paramDefs/tab_paramDef.json";
import checkboxParamDef from "../test_resources/paramDefs/checkbox_paramDef.json";
import actionParamDef from "../test_resources/paramDefs/action_paramDef.json";
import numberfieldParamDef from "../test_resources/paramDefs/numberfield_paramDef.json";
import oneofselectParamDef from "../test_resources/paramDefs/oneofselect_paramDef.json";
import structuretablePropertyValues from "../test_resources/json/structuretable_propertyValues.json";
import ExpressionInfo from "../test_resources/json/expression-function-list.json";
import readonlyTableParamDef from "../test_resources/paramDefs/readonlyTable_paramDef.json";

import testUtils from "../_utils_/property-utils";

import EqualsOverride from "../_utils_/custom-condition-ops/equals-override";
import CustomInvalidOp from "../_utils_/custom-condition-ops/customInvalid";
import CustomMax from "../_utils_/custom-condition-ops/customMax";

const propValues = {
	param_int: 5,
	param_str: "Testing a string parameter",
	param_str_array: ["value1", "value2", "value3", "value4"],
	param_mix_table: [
		["field1", true, 10, 0.674, "DSX"],
		["field2", null, 10, 0.674, "WDP"],
		["field3", false, null, 0.674, "WML"],
		["field4", true, 10, null, ""],
		["field5", false, 10, 0.674, null]],
	param_message1: [],
	param_message2: [],
	param_null: null,
	param_empty: "",
	param_complex: [3, "col in complex type", "zoom"],
	structureeditor: [1, 2, 3]
};
deepFreeze(propValues);

// dummy set of controls to prevent warnings
const controls = [
	{
		name: "param_int",
		valueDef: {
			isList: false,
			propType: "integer"
		}
	},
	{
		name: "hidden_required_control",
		controlType: "hidden",
		required: true,
		valueDef: {
			defaultValue: undefined,
			isList: false,
			isMap: false,
			propType: "string"
		}
	},
	{
		name: "param_enum",
		valueDef: {
			isList: true,
			propType: "string"
		},
		values: ["red", "green"],
		valueLabels: ["Red", "Green"]
	},
	{
		"name": "param_complex",
		"controlType": "structureeditor",
		"valueDef": {
			"propType": "structure",
			"isList": false,
			"isMap": false,
		},
		"subControls": [
			{
				"name": "zoom_value",
				"controlType": "numberfield",
				"valueDef": {
					"propType": "double",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "zoom_desc",
				"controlType": "textfield",
				"valueDef": {
					"propType": "string",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "zoom_label",
				"controlType": "textfield",
				"valueDef": {
					"propType": "string",
					"isList": false,
					"isMap": false
				}
			}
		]
	},
	{
		"name": "param_mix_table",
		"controlType": "structurelisteditor",
		"valueDef": {
			"propType": "structure",
			"isList": true,
			"isMap": false,
			"defaultValue": []
		},
		"subControls": [
			{
				"name": "field",
				"controlType": "textfield",
				"role": "column",
				"valueDef": {
					"propType": "structure",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "boolean_param",
				"controlType": "checkbox",
				"valueDef": {
					"propType": "boolean",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "number_param",
				"controlType": "numberfield",
				"valueDef": {
					"propType": "integer",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "double_param",
				"controlType": "numberfield",
				"valueDef": {
					"propType": "double",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "str_param",
				"controlType": "textfield",
				"valueDef": {
					"propType": "string",
					"isList": false,
					"isMap": false
				}
			}
		],
		"keyIndex": -1,
		"defaultRow": []
	},
	{
		"name": "structureeditor",
		"controlType": "structureeditor",
		"valueDef": {
			"propType": "structure",
			"isList": false,
			"isMap": false,
		},
		"subControls": [
			{
				"name": "dummy1",
				"controlType": "numberfield",
				"valueDef": {
					"propType": "double",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "single_element",
				"controlType": "numberfield",
				"valueDef": {
					"propType": "integer",
					"isList": false,
					"isMap": false
				}
			},
			{
				"name": "label",
				"controlType": "textfield",
				"valueDef": {
					"propType": "string",
					"isList": false,
					"isMap": false
				}
			}
		]
	}
];


const propStates = {
	"param_int": {
		value: "enabled"
	},
	"param_str_array": {
		value: "hidden"
	},
	"param_mix_table": {
		"0": {
			"3": {
				value: "enabled"
			},
			"4": {
				value: "disabled"
			}
		},
		"1": {
			"3": {
				value: "hidden"
			}
		},
		"2": {
			"0": {
				value: "disabled"
			}
		},
		"3": {
			"3": {
				value: "visible"
			},
			"4": {
				value: "hidden"
			}
		}
	},
	"structureeditor": {
		"1": {
			value: "visible"
		}
	}
};
deepFreeze(propStates);

const v1DataModel = {
	"fields": [
		{
			"name": "age",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		},
		{
			"name": "BP",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		},
		{
			"name": "Na",
			"type": "double",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		}
	]
};
deepFreeze(v1DataModel);
const dataModel = [{
	"fields": [
		{
			"name": "age",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		},
		{
			"name": "BP",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		},
		{
			"name": "Na",
			"type": "double",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input"
			}
		}
	]
}];
deepFreeze(dataModel);
const errorMessages = {
	param_int: {
		validation_id: "param_int",
		type: "warning",
		text: "Bad integer value"
	},
	param_str_array: {
		"2": {
			validation_id: "param_str_array",
			type: "error",
			text: "Bad array value"
		}
	},
	param_mix_table: {
		"0": {
			"2": {
				validation_id: "param_mix_table",
				type: "warning",
				text: "Bad table value"
			}
		}
	},
	param_complex: {
		"1": {
			validation_id: "param_complex",
			type: "error",
			text: "Bad value in column"
		}
	},
	structureeditor: {
		"1": {
			validation_id: "single_element",
			type: "error",
			text: "Bad data value"
		}
	}
};
deepFreeze(errorMessages);

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

var controller = new Controller();
function reset() {
	// setting of states needs to be done after property values.
	// conditions are ran on each set and update of property values
	controller = new Controller();
	testUtils.setControls(controller, getCopy(controls));
	controller.setPropertyValues(getCopy(propValues));
	controller.setDatasetMetadata(getCopy(dataModel));
	controller.setErrorMessages(getCopy(errorMessages));
	controller.setControlStates(getCopy(propStates));
}

describe("Properties Controller property values", () => {
	it("should set property values correctly", () => {
		reset();
		const actualValues = controller.getPropertyValues();
		expect(getCopy(propValues)).to.eql(actualValues);
	});
	it("should update a simple property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_int" }, 10);
		const actualValues = controller.getPropertyValues();
		const expectedValues = getCopy(propValues);
		expectedValues.param_int = 10;
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a row property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_mix_table", row: 5 }, [null, null, null, null, null]);
		const actualValues = controller.getPropertyValues();
		const expectedValues = getCopy(propValues);
		expectedValues.param_mix_table[5] = [null, null, null, null, null];
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a col only property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_complex", col: 0 }, 21);
		const actualValues = controller.getPropertyValues();
		const expectedValues = getCopy(propValues);
		expectedValues.param_complex[0] = 21;
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a cell property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_mix_table", row: 2, col: 3 }, 10);
		const actualValues = controller.getPropertyValues();
		const expectedValues = getCopy(propValues);
		expectedValues.param_mix_table[2][3] = 10;
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a structureeditor property value correctly", () => {
		reset();
		controller.updatePropertyValue({
			name: "structureeditor",
			col: 1 },
		10);
		const actualValues = controller.getPropertyValues();
		const expectedValues = getCopy(propValues);
		expectedValues.structureeditor[1] = 10;
		expect(expectedValues).to.eql(actualValues);
	});
	it("should remove a property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_removed" }, 10);
		let actualValues = controller.getPropertyValues();
		let expectedValues = getCopy(propValues);
		expectedValues.param_removed = 10;
		expect(expectedValues).to.eql(actualValues);
		controller.removePropertyValue({ name: "param_removed" });
		actualValues = controller.getPropertyValues();
		expectedValues = getCopy(propValues);
		expect(expectedValues).to.eql(actualValues);
	});
	it("should get a simple property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_str" });
		expect(actualValue).to.equal(propValues.param_str);
	});
	it("should get a row property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_str_array", row: 3 });
		expect(actualValue).to.equal(propValues.param_str_array[3]);
	});
	it("should get a col only property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_complex", col: 1 });
		expect(actualValue).to.equal(propValues.param_complex[1]);
	});
	it("should get a cell property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_mix_table", row: 3, col: 4 });
		expect(actualValue).to.equal(propValues.param_mix_table[3][4]);
	});
	it("should get a structureeditor property value correctly", () => {
		reset();
		const propertyId = {
			name: "structureeditor",
			col: 1 };
		const actualValue = controller.getPropertyValue(propertyId);
		expect(actualValue).to.equal(propValues.structureeditor[1]);
	});
	it("should get filtered a property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_mix_table" }, { "filterHiddenDisabled": true });
		const expectedValue = [
			["field1", true, null, 0.674, "DSX"],
			["field2", null, 10, 0.674, "WDP"],
			["field3", false, null, 0.674, "WML"],
			["field4", null, 10, null, ""],
			[null, false, 10, null, null]];
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get filtered `undefined` property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_undefined" }, { "filterHiddenDisabled": true });
		expect(actualValue).to.be.undefined;
	});
	it("should get filtered `null` property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_null" }, { "filterHiddenDisabled": true });
		expect(actualValue).to.equal(null);
	});
	it("should get filtered property values correctly", () => {
		reset();
		// Set value for hidden control
		controller.updatePropertyValue({ name: "hidden_required_control" }, "test");

		// Get all properties
		const expectedAllProperties = {
			param_int: 5,
			param_str: "Testing a string parameter",
			param_str_array: ["value1", "value2", "value3", "value4"],
			param_mix_table: [
				["field1", true, 10, 0.674, "DSX"],
				["field2", null, 10, 0.674, "WDP"],
				["field3", false, null, 0.674, "WML"],
				["field4", true, 10, null, ""],
				["field5", false, 10, 0.674, null]
			],
			param_message1: [],
			param_message2: [],
			param_null: null,
			param_empty: "",
			param_complex: [3, "col in complex type", "zoom"],
			structureeditor: [1, 2, 3],
			hidden_required_control: "test"
		};
		const actualAllProperties = controller.getPropertyValues();
		expect(expectedAllProperties).to.eql(actualAllProperties);

		// filterHiddenControls: Only filter controls having controlType "hidden"
		// Note - hidden_required_control is filtered because it's a hidden control
		const expectedFilteredHiddenProperties = {
			param_int: 5,
			param_str: "Testing a string parameter",
			param_str_array: ["value1", "value2", "value3", "value4"],
			param_mix_table: [
				["field1", true, 10, 0.674, "DSX"],
				["field2", null, 10, 0.674, "WDP"],
				["field3", false, null, 0.674, "WML"],
				["field4", true, 10, null, ""],
				["field5", false, 10, 0.674, null]
			],
			param_message1: [],
			param_message2: [],
			param_null: null,
			param_empty: "",
			param_complex: [3, "col in complex type", "zoom"],
			structureeditor: [1, 2, 3]
		};
		const actualFilteredHiddenProperties = controller.getPropertyValues({ filterHiddenControls: true });
		expect(expectedFilteredHiddenProperties).to.eql(actualFilteredHiddenProperties);

		// filterHiddenDisabled: Only filter controls having state "hidden" or "disabled"
		// Note - param_str_array is filtered because it has state hidden
		const expectedFilteredHiddenDisabled = {
			param_int: 5,
			param_str: "Testing a string parameter",
			param_mix_table: [
				["field1", true, null, 0.674, "DSX"],
				["field2", null, 10, 0.674, "WDP"],
				["field3", false, null, 0.674, "WML"],
				["field4", null, 10, null, ""],
				[null, false, 10, null, null]],
			param_message1: [],
			param_message2: [],
			param_null: null,
			param_empty: "",
			param_complex: [3, "col in complex type", "zoom"],
			structureeditor: [1, 2, 3],
			hidden_required_control: "test"
		};
		const actualFilteredHiddenDisabled = controller.getPropertyValues({ filterHiddenDisabled: true });
		expect(expectedFilteredHiddenDisabled).to.eql(actualFilteredHiddenDisabled);

		// filterHiddenControls, filterHiddenDisabled: Filter controls having state "hidden" or "disabled" AND control type "hidden"
		// Note - hidden_required_control, param_str_array both are filtered
		const expectedFilteredValues = {
			param_int: 5,
			param_str: "Testing a string parameter",
			param_mix_table: [
				["field1", true, null, 0.674, "DSX"],
				["field2", null, 10, 0.674, "WDP"],
				["field3", false, null, 0.674, "WML"],
				["field4", null, 10, null, ""],
				[null, false, 10, null, null]],
			param_message1: [],
			param_message2: [],
			param_null: null,
			param_empty: "",
			param_complex: [3, "col in complex type", "zoom"],
			structureeditor: [1, 2, 3]
		};
		const actualFilteredValues = controller.getPropertyValues({ filterHiddenControls: true, filterHiddenDisabled: true });
		expect(expectedFilteredValues).to.eql(actualFilteredValues);
	});
});

describe("Properties Controller states", () => {
	it("should set property states correctly", () => {
		reset();
		const actualValues = controller.getControlStates();
		expect(getCopy(propStates)).to.eql(actualValues);
	});
	it("should update a simple property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_int" }, "hidden");
		const actualValues = controller.getControlStates();
		const expectedValues = getCopy(propStates);
		expectedValues.param_int = {
			value: "hidden"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a row property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_str_array", row: 2 }, "disabled");
		const actualValues = controller.getControlStates();
		const expectedValues = getCopy(propStates);
		expectedValues.param_str_array[2] = {
			value: "disabled"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a cell property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_mix_table", row: 2, col: 3 }, "hidden");
		const actualValues = controller.getControlStates();
		const expectedValues = getCopy(propStates);
		expectedValues.param_mix_table[2][3] = {
			value: "hidden"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a structureeditor element property state correctly", () => {
		reset();
		controller.updateControlState({
			name: "structureeditor",
			col: 1 },
		"hidden");
		const actualValues = controller.getControlStates();
		const expectedValues = getCopy(propStates);
		expectedValues.structureeditor[1] = {
			value: "hidden"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should get a simple property state correctly", () => {
		reset();
		const actualValue = controller.getControlState({ name: "param_str_array" });
		expect(actualValue).to.equal(propStates.param_str_array.value);
	});
	it("should get a row property state correctly", () => {
		reset();
		const actualValue = controller.getControlState({ name: "param_str_array", row: 3 });
		expect(actualValue).to.equal("hidden");
	});
	it("should get a cell property state correctly", () => {
		reset();
		const actualValue = controller.getControlState({ name: "param_mix_table", row: 3, col: 3 });
		expect(actualValue).to.equal("visible");
	});
	it("should get a structureeditor property state correctly", () => {
		reset();
		const actualValue = controller.getControlState({
			name: "structureeditor",
			col: 1
		});
		expect(actualValue).to.equal("visible");
	});
	it("should get property states correctly", () => {
		reset();
		const actualValues = controller.getControlStates();
		expect(propStates).to.eql(actualValues);
	});

	it("disabled controls can be set to hidden/visible", () => {
		const renderedObject = testUtils.flyoutEditorForm(checkboxsetParamDef);
		// const wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;

		const disableAndHiddenCheckboxId = { name: "disable_and_hide" };
		const disableAndHiddenCheckboxsetId = { name: "checkboxset_disable_and_hide" };

		// verify the control is initially disabled
		let controlState = controller.getControlState(disableAndHiddenCheckboxsetId);
		expect(controlState).to.equal("disabled");

		controller.updatePropertyValue(disableAndHiddenCheckboxId, true);
		controlState = controller.getControlState(disableAndHiddenCheckboxsetId);
		expect(controlState).to.equal("hidden");

		controller.updatePropertyValue(disableAndHiddenCheckboxId, false);
		controlState = controller.getControlState(disableAndHiddenCheckboxsetId);
		expect(controlState).to.equal("disabled");
	});
});

describe("Properties Controller datasetMetadata", () => {
	it("should set datasetMetadata correctly.", () => {
		reset();
		const actualValue = controller.getDatasetMetadata();
		expect(dataModel).to.eql(actualValue);
	});
	it("should set datasetMetadata correctly when datamodel isn't an array.", () => {
		reset();
		controller.setDatasetMetadata(v1DataModel);
		const actualValue = controller.getDatasetMetadata();
		expect(dataModel[0]).to.eql(actualValue);
	});
	it("should set datasetMetadata correctly when datamodel is null.", () => {
		reset();
		controller.setDatasetMetadata(null);
		const actualValue = controller.getDatasetMetadata();
		expect(actualValue).to.equal(null);
	});
	it("should set datasetMetadata correctly when datamodel is undefined.", () => {
		reset();
		controller.setDatasetMetadata();
		const actualValue = controller.getDatasetMetadata();
		expect(actualValue).to.be.undefined;
	});
	it("should set datasetMetadata correctly when multiple schemas and fields defined.", () => {
		reset();
		controller.setDatasetMetadata(datasetMetadata);
		const fields = controller.getDatasetMetadataFields();
		const expectedFields = [
			{
				"name": "0.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "0",
				"origName": "Age"
			},
			{
				"name": "0.age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "0",
				"origName": "age"
			},
			{
				"name": "data_1.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "data_1",
				"origName": "Age"
			},
			{
				"name": "data_2.Drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "data_2",
				"origName": "Drug"
			},
			{
				"name": "data_2.drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "data_2",
				"origName": "drug"
			},
			{
				"name": "data_2.drug2",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "data_2",
				"origName": "drug2"
			},
			{
				"name": "3.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "3",
				"origName": "Age"
			},
			{
				"name": "3.drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "3",
				"origName": "drug"
			},
			{
				"name": "3.drug2",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "3",
				"origName": "drug2"
			},
			{
				"name": "3.drug3",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "3",
				"origName": "drug3"
			},
			{
				"name": "schema.Age",
				"type": "integer",
				"metadata": {
					"description": "",
					"measure": "range",
					"modeling_role": "input"
				},
				"schema": "schema",
				"origName": "Age"
			},
			{
				"name": "schema.drug",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "schema",
				"origName": "drug"
			},
			{
				"name": "schema.drugs",
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "set",
					"modeling_role": "input"
				},
				"schema": "schema",
				"origName": "drugs"
			}
		];
		expect(fields).to.have.deep.members(expectedFields);
		const schemas = controller.getDatasetMetadataSchemas();
		expect(schemas).to.eql(["0", "data_1", "data_2", "3", "schema"]);
	});
});

describe("Properties Controller property messages", () => {
	it("should set property messages correctly", () => {
		reset();
		const actualValues = controller.getAllErrorMessages();
		expect(getCopy(errorMessages)).to.eql(actualValues);
	});
	it("should update a simple property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_int" }, {
			validation_id: "param_int",
			type: "error",
			text: "Testing error messages"
		});
		const actualValues = controller.getAllErrorMessages();
		const expectedValues = getCopy(errorMessages);
		expectedValues.param_int = {
			validation_id: "param_int",
			type: "error",
			text: "Testing error messages"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a row property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_str_array", row: 2 }, {
			validation_id: "param_str_array",
			type: "warning",
			text: "warning in array"
		});
		const actualValues = controller.getAllErrorMessages();
		const expectedValues = getCopy(errorMessages);
		expectedValues.param_str_array = {};
		expectedValues.param_str_array[2] = {
			validation_id: "param_str_array",
			type: "warning",
			text: "warning in array"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a cell property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_mix_table", row: 2, col: 3 }, {
			validation_id: "param_mix_table",
			type: "error",
			text: "Bad cell value"
		});
		const actualValues = controller.getAllErrorMessages();
		const expectedValues = getCopy(errorMessages);
		expectedValues.param_mix_table[2] = {};
		expectedValues.param_mix_table[2][3] = {
			validation_id: "param_mix_table",
			type: "error",
			text: "Bad cell value"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should update a structureeditor property message correctly", () => {
		reset();
		const propertyId = {
			name: "structureeditor",
			col: 1 };
		controller.updateErrorMessage(propertyId, {
			validation_id: "single_element",
			type: "error",
			text: "Bad data value"
		});
		const actualValues = controller.getAllErrorMessages();
		const expectedValues = getCopy(errorMessages);
		expectedValues.structureeditor = {
			"1": {
				validation_id: "single_element",
				type: "error",
				text: "Bad data value"
			}
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should get a table property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_mix_table" });
		const expectedValue = {
			validation_id: "param_mix_table",
			type: "warning",
			text: "Bad table value"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get a row property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_str_array", row: 2 });
		const expectedValue = {
			validation_id: "param_str_array",
			type: "error",
			text: "Bad array value"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get a cell property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_mix_table", row: 0, col: 2 });
		const expectedValue = {
			validation_id: "param_mix_table",
			type: "warning",
			text: "Bad table value"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get a structureeditor property message correctly", () => {
		reset();
		const propertyId = {
			name: "structureeditor",
			col: 1 };
		const actualValue = controller.getErrorMessage(propertyId);
		const expectedValue = {
			validation_id: "single_element",
			type: "error",
			text: "Bad data value"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get pipeline property messages correctly", () => {
		reset();
		const actualValues = controller.getErrorMessages(true);
		const expectedValues = [
			{
				id_ref: "param_int",
				validation_id: "param_int",
				type: "warning",
				text: "Bad integer value"
			},
			{
				id_ref: "param_str_array",
				validation_id: "param_str_array",
				type: "error",
				text: "Bad array value"
			},
			{
				id_ref: "param_mix_table",
				validation_id: "param_mix_table",
				type: "warning",
				text: "Bad table value"
			},
			{
				id_ref: "param_complex",
				validation_id: "param_complex",
				type: "error",
				text: "Bad value in column"
			},
			{
				id_ref: "structureeditor",
				validation_id: "single_element",
				type: "error",
				text: "Bad data value"
			}
		];
		expect(expectedValues).to.eql(actualValues);
	});
	it("should get a col only property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_complex", col: 1 });
		const expectedValue = {
			validation_id: "param_complex",
			type: "error",
			text: "Bad value in column"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should set a col only property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_complex", col: 1 }, {
			validation_id: "param_complex",
			type: "warning",
			text: "Pick a better value"
		});
		const actualValues = controller.getAllErrorMessages();
		const expectedValues = getCopy(errorMessages);
		expectedValues.param_complex[1] = {
			validation_id: "param_complex",
			type: "warning",
			text: "Pick a better value"
		};
		expect(expectedValues).to.eql(actualValues);
	});
	it("should not get messages for hidden/disabled controls", () => {
		reset();
		controller.setErrorMessages({});
		const goodParamId = { name: "param_good" };
		const hiddenParamId = { name: "param_hidden" };
		const disabledParamId = { name: "param_disabled" };
		controller.updateErrorMessage(goodParamId, {
			validation_id: "param_good",
			type: "warning",
			text: "This message should be returned"
		});
		controller.updateErrorMessage(hiddenParamId, {
			validation_id: "param_hidden",
			type: "warning",
			text: "This message should NOT be returned"
		});
		controller.updateErrorMessage(disabledParamId, {
			validation_id: "param_disabled",
			type: "error",
			text: "This message should NOT be returned"
		});
		controller.updateControlState(hiddenParamId, "hidden");
		controller.updateControlState(disabledParamId, "disabled");

		const expectedMessage = {
			validation_id: "param_good",
			type: "warning",
			text: "This message should be returned"
		};
		const expectedValue = { "param_good": expectedMessage };

		expect(controller.getErrorMessage(goodParamId, true)).to.eql(expectedMessage);
		expect(controller.getErrorMessage(hiddenParamId, true)).to.be.null;
		expect(controller.getErrorMessage(disabledParamId, true)).to.be.null;

		const actualValues = controller.getErrorMessages(null, true);
		expect(expectedValue).to.eql(actualValues);
	});
	it("should return a null message", () => {
		controller.setForm(conditionForm);
		const propertyId = { name: "numberfieldCheckpointInterval" };
		const filterSuccess = true;
		const filterHiddenDisable = false;
		const shouldBeNull = controller.getErrorMessage(propertyId, filterHiddenDisable, filterSuccess);
		expect(shouldBeNull).to.equal(null);
	});
});

function validateExpressionInfo(actualValue) {
	// validate the operators part of the object
	expect(ExpressionInfo.actual.operators).to.eql(actualValue.operators);

	// validate the functionCategories array of objects.
	const keys = Object.keys(ExpressionInfo.actual.functionCategories);
	keys.forEach((category) => {
		expect(JSON.stringify(ExpressionInfo.actual.functionCategories[category])).to
			.equal(JSON.stringify(actualValue.functionCategories[category]));
	});
}

describe("Properties Controller expression information", () => {
	it("should set expression info correctly", () => {
		reset();
		controller.setExpressionInfo(ExpressionInfo.input);
		let actualValue = controller.getExpressionInfo();
		expect(ExpressionInfo.actual.operators).to.eql(actualValue.operators);
		validateExpressionInfo(actualValue);
		// call set again and make sure only one parameter list is generated
		controller.setExpressionInfo(ExpressionInfo.input);
		actualValue = controller.getExpressionInfo();
		validateExpressionInfo(actualValue);

	});
});

describe("Properties Controller handlers", () => {
	const propertyListener = sinon.spy();
	beforeEach(() => {
		reset();
		propertyListener.resetHistory();
		controller.setHandlers({
			propertyListener: propertyListener
		});
	});
	it("should fire event on setPropertyValues", () => {
		controller.setPropertyValues({
			param_str: "Testing listener",
			param_int: "5"
		}
		);
		expect(propertyListener).to.have.property("callCount", 1);
	});
	it("should be able to set null values with setPropertyValues ", () => {
		const form = Form.makeForm(structureListEditorParamDef);
		controller.setForm(form);
		const values = {
			"structuretableReadonlyColumnStartValue": [],
			"structuretableReadonlyColumnDefaultIndex": [],
			"structuretableNoButtons": [],
			"structuretableNoHeader": [],
			"structuretableSortableColumns": [],
			"structuretableErrors": [],
			"enableSortByTable": true,
			"structuretableSortOrder": [],
			"showRenameFieldsTable": true,
			"structuretableRenameFields": [],
			"dummy_types": [],
			"ST_mse_table": [],
			"structuretableObjectType": [],
			"structuretableLongValue": [],
			"nestedStructureObject": [{
				"field": "Cholesterol",
				"nestedStructure_readonly_int": null,
				"nestedStructure_sort_order": "Ascending",
				"nestedStructure_table": [
					{
						"nestedStructure_table_readonly_col_index": null,
						"nestedStructure_table_name": "hi",
						"nestedStructure_table_data_type": ""
					}
				]
			}],
			"nestedStructureObjectArray": [],
			"nestedStructureArrayArray": [],
			"nestedStructureArrayObject": [[
				"Cholesterol",
				5,
				"Ascending",
				[]
			]],
			"nestedStructureMap": [],
			"nestedStructureeditor": [],
			"structuretable_filter": []
		};
		controller.setPropertyValues(values);
		expect(propertyListener).to.have.property("callCount", 4);
		const actual = controller.getPropertyValues();
		expect(actual).to.eql(values);
	});
	it("should set default values when setPropertyValues() is called with option { setDefaultValues: true }", () => {
		const renderedObject = testUtils.flyoutEditorForm(checkboxParamDef);
		controller = renderedObject.controller;
		controller.setHandlers({
			propertyListener: propertyListener
		});

		const filteredValues = controller.getPropertyValues({ filterHiddenDisabled: true });
		// We filtered hidden and disabled properties, so "checkbox_hidden" property doesn't exist in filteredValues
		expect(filteredValues).not.to.have.property("checkbox_hidden");

		// setDefaultValues is not set
		controller.setPropertyValues(filteredValues);
		// Verify value is not set for checkbox_hidden
		expect(controller.getPropertyValues()).not.to.have.property("checkbox_hidden");
		// Verify filteredValues are set
		expect(controller.getPropertyValues()).to.eql(filteredValues);

		// setDefaultValues is set to true
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a value is set for checkbox_hidden
		expect(controller.getPropertyValues()).to.have.property("checkbox_hidden", true);
		// Verify filteredValues and default values are set
		const allProperties = merge({ "checkbox_hidden": true }, filteredValues);
		expect(controller.getPropertyValues()).to.eql(allProperties);

		// setDefaultValues is set to true - 2nd time
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a value is set for checkbox_hidden
		expect(controller.getPropertyValues()).to.have.property("checkbox_hidden", true);
		// Verify filteredValues and default values are set
		expect(controller.getPropertyValues()).to.eql(allProperties);

		// setDefaultValues is set to true - 3rd time
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a value is set for checkbox_hidden
		expect(controller.getPropertyValues()).to.have.property("checkbox_hidden", true);
		// Verify filteredValues and default values are set
		expect(controller.getPropertyValues()).to.eql(allProperties);

		// Verify there's a single call to the propertyListener()
		expect(propertyListener.calledWith({
			action: "SET_PROPERTIES"
		})).to.be.true;
	});
	it("should set default values having 0 or ' ' when setPropertyValues() is called with option { setDefaultValues: true }", () => {
		const renderedObject = testUtils.flyoutEditorForm(oneofselectParamDef);
		controller = renderedObject.controller;
		controller.setHandlers({
			propertyListener: propertyListener
		});

		const filteredValues = controller.getPropertyValues({ filterHiddenDisabled: true });
		// We filtered hidden and disabled properties, some hidden properties don't exist in filteredValues
		expect(filteredValues).not.to.have.property("oneofselect_hidden");
		expect(filteredValues).not.to.have.property("fill");
		expect(filteredValues).not.to.have.property("viewonly");

		// setDefaultValues is not set
		controller.setPropertyValues(filteredValues);
		// Verify value is not set for hidden properties
		expect(controller.getPropertyValues()).not.to.have.property("oneofselect_hidden");
		expect(controller.getPropertyValues()).not.to.have.property("fill");
		expect(controller.getPropertyValues()).not.to.have.property("viewonly");
		// Verify filteredValues are set
		expect(controller.getPropertyValues()).to.eql(filteredValues);

		// setDefaultValues is set to true - 1st time
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a default value is set for hidden properties
		expect(controller.getPropertyValues()).to.have.property("fill", 0);
		expect(controller.getPropertyValues()).to.have.property("viewonly", " ");
		// Verify filteredValues and default values are set
		const allProperties = merge({ "fill": 0, "viewonly": " " }, filteredValues);
		expect(controller.getPropertyValues()).to.eql(allProperties);

		// setDefaultValues is set to true - 2nd time
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a default value is set for hidden properties
		expect(controller.getPropertyValues()).to.have.property("fill", 0);
		expect(controller.getPropertyValues()).to.have.property("viewonly", " ");
		// Verify filteredValues and default values are set
		expect(controller.getPropertyValues()).to.eql(allProperties);

		// setDefaultValues is set to true - 3rd time
		controller.setPropertyValues(filteredValues, { setDefaultValues: true });
		// Verify a default value is set for hidden properties
		expect(controller.getPropertyValues()).to.have.property("fill", 0);
		expect(controller.getPropertyValues()).to.have.property("viewonly", " ");
		// Verify filteredValues and default values are set
		expect(controller.getPropertyValues()).to.eql(allProperties);
	});
	it("should fire event on updatePropertyValue", () => {
		controller.updatePropertyValue({ name: "param_int" }, 10);
		expect(propertyListener).to.have.property("callCount", 1);
	});
	it("should fire event on updatePropertyValue returning object values", () => {
		const form = Form.makeForm(structureListEditorParamDef);
		controller.setForm(form);
		const internalValue = [[
			2,
			"test",
			"World",
			"string",
			"Readonly phrase"
		]];
		const returnValue = [{
			"readonly_numbered_column_index": 2,
			"name": "test",
			"description": "World",
			"data_type": "string",
			"readonly": "Readonly phrase"
		}];
		const type = {
			type: "initial_load"
		};
		const propertyId = { name: "structurelisteditorObjectType" };
		const initialValue = controller.getPropertyValue(propertyId);
		controller.updatePropertyValue(propertyId, internalValue, true, type);
		expect(propertyListener).to.have.property("callCount", 4);
		expect(propertyListener.calledWith({
			action: "UPDATE_PROPERTY",
			property: propertyId,
			value: returnValue,
			previousValue: initialValue,
			type
		})).to.be.true;
	});
	it("should callback after all properties are loaded", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef, null, { propertyListener: propertyListener });
		expect(propertyListener.calledWith({ action: "PROPERTIES_LOADED" })).to.be.true;

		// Verify values and messages are set after PROPERTIES_LOADED
		const actualRequiredMessages = renderedObject.controller.getRequiredErrorMessages();
		const expectedRequiredMessages = {
			"number_undefined": {
				"type": "error",
				"text": "You must enter a value for Undefined.",
				"validation_id": "required_number_undefined_272.9520234285945",
				"propertyId": {
					"name": "number_undefined"
				},
				"required": true,
				"displayError": false
			},
			"number_null": {
				"type": "error",
				"text": "You must enter a value for Null.",
				"validation_id": "required_number_null_401.11526920064296",
				"propertyId": {
					"name": "number_null"
				},
				"required": true,
				"displayError": false
			}
		};
		expect(expectedRequiredMessages).to.eql(actualRequiredMessages);
		const expectedValues = Object.assign({}, numberfieldParamDef.current_parameters, {
			"number_default": 3,
			"number_zero_default": 0
		});
		const actualValues = renderedObject.controller.getPropertyValues();
		expect(expectedValues).to.eql(actualValues);
	});
});

describe("Properties Controller controls", () => {
	it("should get simple control", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.getControl({ name: "numberfieldMaxBins" });
		const expectedValue = {
			"name": "numberfieldMaxBins",
			"label": {
				"text": "Maximum number of bins"
			},
			"description": {
				"text": "Maximum number of bins"
			},
			"controlType": "numberfield",
			"valueDef": {
				"propType": "integer",
				"isList": false,
				"isMap": false,
				"defaultValue": 32
			},
			"summary": true,
			"required": true,
			"summaryPanelId": "summary-panel",
			"parentCategoryId": "Numberfield",
			"summaryLabel": "Maximum number of bins"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should get table control", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.getControl({ name: "structuretableSortOrder", col: 0 });
		const expectedValue = {
			"name": "field",
			"label": {
				"text": "Field"
			},
			"controlType": "selectcolumn",
			"valueDef": {
				"propType": "string",
				"isList": false,
				"isMap": false,
				"defaultValue": ""
			},
			"role": "column",
			"summary": true,
			"visible": true,
			"width": 28,
			"parameterName": "structuretableSortOrder",
			"columnIndex": 0,
			"parentCategoryId": "Tables"
		};
		expect(expectedValue).to.eql(actualValue);
	});
	it("should return if control is required", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.isRequired({ name: "numberfieldMaxBins" });
		expect(actualValue).to.equal(true);
	});
	it("should return if control is not required", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.isRequired({ name: "numberfieldMaxDepth" });
		expect(actualValue).to.equal(false);
	});
	it("should return if control is in summary", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.isSummary({ name: "numberfieldMaxBins" });
		expect(actualValue).to.equal(true);
	});
	it("should return if table control is in summary", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.isSummary({ name: "structuretableSortOrder", col: 0 });
		expect(actualValue).to.equal(true);
	});
	it("should return if control is not in summary", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.isSummary({ name: "numberfieldMinInfoGain" });
		expect(actualValue).to.equal(false);
	});
	it("should return control type", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.getControlType({ name: "numberfieldMaxBins" });
		expect(actualValue).to.equal("numberfield");
	});
	it("should return table control type", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValue = controller.getControlType({ name: "structuretableSortOrder", col: 0 });
		expect(actualValue).to.equal("selectcolumn");
	});
	it("should save the correct control when duplicate controls exist in groups", () => {
		const custom = {
			"name": "priors",
			"controlType": "custom",
			"parentCategoryId": "priors-panel"
		};
		const priors = {
			"name": "priors",
			"controlType": "structurelisteditor",
			"parentCategoryId": "priors-panel"
		};
		const priors2 = {
			"name": "priors2",
			"controlType": "structurelisteditor",
			"parentCategoryId": "priors-panel"
		};

		reset();
		controller.saveControls([custom, priors]);
		let foundControl = controller.getControl({ name: priors.name });
		expect(foundControl.controlType).to.equal(priors.controlType);
		// change array order
		reset();
		controller.saveControls([priors, custom]);
		foundControl = controller.getControl({ name: priors.name });
		expect(foundControl.controlType).to.equal(priors.controlType);
		// validate custom controls get set when another control doesn't override it
		reset();
		controller.saveControls([priors2, custom]);
		foundControl = controller.getControl({ name: custom.name });
		expect(foundControl.controlType).to.equal(custom.controlType);
		foundControl = controller.getControl({ name: priors2.name });
		expect(foundControl.controlType).to.equal(priors2.controlType);
	});


});

describe("Properties Controller getResource ", () => {
	it("should return resource given key ", () => {
		reset();
		const form = Form.makeForm(structureListEditorParamDef);
		controller.setForm(form);
		const value = controller.getResource("structurelisteditorTableInput.name.label", "Default value");
		expect(value).to.equal("Name");
	});
	it("should return default value if resource key does not exist", () => {
		reset();
		const form = Form.makeForm(structureListEditorParamDef);
		controller.setForm(form);
		const value = controller.getResource("resource.name", "Default value");
		expect(value).to.equal("Default value");
	});
	it("should return default value if no resource exists", () => {
		reset();
		controller.setForm(conditionForm);
		const value = controller.getResource("resource.name", "Default value");
		expect(value).to.equal("Default value");
	});
});

describe("Properties Controller summary panel", () => {
	it("should get summary panel controls", () => {
		reset();
		controller.setForm(conditionForm);
		const actualValues = controller.getSummaryPanelControls("summary-panel");
		expect(Object.keys(actualValues).length).to.equal(4);
	});
});

describe("Properties Controller updatePropertyValue validation", () => {
	it("should get skip[ validation on update", () => {
		reset();
		controller.setForm(conditionForm);
		// no error messages to start with
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));

		// skip validation on update, no error messages
		controller.updatePropertyValue({ name: "numberfieldCheckpointInterval" }, -2, true);
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));

		// validate on update, generate an error messages
		controller.updatePropertyValue({ name: "numberfieldCheckpointInterval" }, -2);
		const errorMessage = {
			numberfieldCheckpointInterval:
			{
				type: "error",
				text: "The checkpoint interval value must either be >= 1 or -1 to disable",
				validation_id: "numberfieldCheckpointInterval",
				propertyId: { name: "numberfieldCheckpointInterval" },
				required: false
			}
		};
		expect(JSON.stringify(controller.getAllErrorMessages())).to.equal(JSON.stringify(errorMessage));
	});

	it("should removePropertyValue if the value is undefined", () => {
		reset();
		controller.setForm(conditionForm);
		const propertyId = { name: "numberfieldImpurity" };
		expect(controller.getPropertyValue(propertyId)).to.equal("entropy");

		// updatePropertyValue with new value undefined
		/* eslint no-undefined: "off" */
		controller.updatePropertyValue(propertyId, undefined);

		// Verify undefined property is removed
		expect(controller.getPropertyValues()).to.not.have.own.property(propertyId.name);
	});
});

describe("Properties Controller updateControlEnumValues validation", () => {
	const propertyId = { name: "param_enum" };
	beforeEach(() => {
		reset(); // could do this for all tests
	});
	it("should set the values and valuesLabels correctly on a control", () => {
		controller.updateControlEnumValues(propertyId, [{ value: "orange", label: "Orange" }, { value: "tan", label: "Tan" }]);
		const control = controller.getControl(propertyId);
		expect(control.values).to.eql(["orange", "tan"]);
		expect(control.valueLabels).to.eql(["Orange", "Tan"]);
	});

	it("should set the values and valuesLabels correctly on a control when no labels supplied", () => {
		controller.updateControlEnumValues(propertyId, [{ value: "orange" }, { value: "tan" }]);
		const control = controller.getControl(propertyId);
		expect(control.values).to.eql(["orange", "tan"]);
		expect(control.valueLabels).to.eql(["orange", "tan"]);
	});

	it("should not update values or valueLabels when nothing passed in or invalid control", () => {
		console.warn = jest.fn();
		controller.updateControlEnumValues(propertyId);
		const control = controller.getControl(propertyId);
		expect(control.values).to.eql(["red", "green"]);
		expect(control.valueLabels).to.eql(["Red", "Green"]);
		expect(console.warn.mock.calls[0][0]).to.equal("[WARNING]: properties-controller: updateControlEnumValues - control not found or valuesObj not valid");
		controller.updateControlEnumValues({ name: "invalid_control" }, []);
		expect(console.warn.mock.calls[1][0]).to.equal("[WARNING]: properties-controller: updateControlEnumValues - control not found or valuesObj not valid");
	});

	it("should update values or valueLabels when empty array passed in", () => {
		controller.updateControlEnumValues(propertyId, []);
		const control = controller.getControl(propertyId);
		expect(control.values).to.eql([]);
		expect(control.valueLabels).to.eql([]);
	});
});

describe("Properties Controller condition operators methods", () => {
	const standardOpCount = Object.keys(controller.getConditionOps()).length;
	it("set an invalid custom operator", () => {
		reset();
		// this will print out a warn message to the console
		controller.setConditionOps([CustomInvalidOp]);
		expect(standardOpCount).to.equal(Object.keys(controller.getConditionOps()).length);
	});
	it("overwrite an existing operator", () => {
		reset();
		controller.setConditionOps([EqualsOverride]);
		expect(standardOpCount).to.equal(Object.keys(controller.getConditionOps()).length);
		const newOp = controller.getConditionOp("equals");
		expect(newOp()).to.equal("testing");
	});
	it("add a custom operator", () => {
		reset();
		controller.setConditionOps([CustomMax]);
		expect(standardOpCount + 1).to.equal(Object.keys(controller.getConditionOps()).length);
		const paramInfo = {
			control: {
				controlType: "numberfield"
			},
			value: 101
		};
		const newOp = controller.getConditionOp("customMax");
		expect(newOp(paramInfo, null, 100, controller)).to.equal(false);
		expect(newOp(paramInfo, null, 102, controller)).to.equal(true);
	});
	it("set operators with no custom operators", () => {
		reset();
		controller.setConditionOps();
		expect(standardOpCount).to.equal(Object.keys(controller.getConditionOps()).length);
	});
	it("set operators without array", () => {
		reset();
		controller.setConditionOps(CustomMax);
		expect(standardOpCount).to.equal(Object.keys(controller.getConditionOps()).length);
	});
});

describe("Properties Controller row selection methods", () => {
	it("should get selected rows using controlName (deprecated)", () => {
		reset();
		controller.updateSelectedRows("control", [2]);
		let selectedRows = controller.getSelectedRows("control");
		expect(selectedRows).to.eql([2]);
		controller.updateSelectedRows("control2", [2, 4]);
		selectedRows = controller.getSelectedRows("control2");
		expect(selectedRows).to.eql([2, 4]);
	});
	it("should clear selected rows using controlName (deprecated)", () => {
		reset();
		controller.updateSelectedRows("control", [2]);
		let selectedRows = controller.getSelectedRows("control");
		expect(selectedRows).to.eql([2]);
		controller.clearSelectedRows("control");
		selectedRows = controller.getSelectedRows("control");
		expect(selectedRows).to.eql([]);
	});
	it("should get selected rows using propertyId", () => {
		reset();
		const propertyId = {
			name: "control"
		};
		const propertyId2 = {
			name: "control2"
		};
		controller.updateSelectedRows(propertyId, [2]);
		let selectedRows = controller.getSelectedRows(propertyId);
		expect(selectedRows).to.eql([2]);
		controller.updateSelectedRows(propertyId2, [2, 4]);
		selectedRows = controller.getSelectedRows(propertyId2);
		expect(selectedRows).to.eql([2, 4]);
	});
	it("should clear selected rows using propertyId", () => {
		reset();
		const propertyId = {
			name: "control"
		};
		controller.updateSelectedRows(propertyId, [2]);
		let selectedRows = controller.getSelectedRows(propertyId);
		expect(selectedRows).to.eql([2]);
		controller.clearSelectedRows(propertyId);
		selectedRows = controller.getSelectedRows(propertyId);
		expect(selectedRows).to.eql([]);
	});
	it("should get selected rows using propertyId with row and col", () => {
		reset();
		const propertyId1 = {
			name: "control"
		};
		const propertyId2 = {
			name: "control",
			row: 1
		};
		const propertyId3 = {
			name: "control",
			row: 2,
			col: 1
		};
		const propertyId4 = {
			name: "control2",
			col: 2
		};
		controller.updateSelectedRows(propertyId1, [1]);
		controller.updateSelectedRows(propertyId2, [2, 4]);
		controller.updateSelectedRows(propertyId3, [3, 6, 9]);
		controller.updateSelectedRows(propertyId4, [4, 8, 12]);
		let selectedRows = controller.getSelectedRows(propertyId1);
		expect(selectedRows).to.eql([1]);
		selectedRows = controller.getSelectedRows(propertyId2);
		expect(selectedRows).to.eql([2, 4]);
		selectedRows = controller.getSelectedRows(propertyId3);
		expect(selectedRows).to.eql([3, 6, 9]);
		selectedRows = controller.getSelectedRows(propertyId4);
		expect(selectedRows).to.eql([4, 8, 12]);
	});
	it("selected rows using propertyId without selection set", () => {
		reset();
		const propertyId1 = {
			name: "control"
		};
		const propertyId2 = {
			name: "control",
			row: 1
		};
		const propertyId3 = {
			name: "control",
			row: 2,
			col: 1
		};
		const propertyId4 = {
			name: "control2",
			col: 2
		};
		let selectedRows = controller.getSelectedRows(propertyId1);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId2);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId3);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId4);
		expect(selectedRows).to.eql([]);
	});

	it("clear selected rows without propertyId to clear all selections", () => {
		reset();
		const propertyId1 = {
			name: "control"
		};
		const propertyId2 = {
			name: "control",
			row: 1
		};
		const propertyId3 = {
			name: "control",
			row: 2,
			col: 1
		};
		const propertyId4 = {
			name: "control2",
			col: 2
		};
		controller.updateSelectedRows(propertyId1, [1]);
		controller.updateSelectedRows(propertyId2, [2, 4]);
		controller.updateSelectedRows(propertyId3, [3, 6, 9]);
		controller.updateSelectedRows(propertyId4, [4, 8, 12]);
		controller.clearSelectedRows();
		let selectedRows = controller.getSelectedRows(propertyId1);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId2);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId3);
		expect(selectedRows).to.eql([]);
		selectedRows = controller.getSelectedRows(propertyId4);
		expect(selectedRows).to.eql([]);
	});
	it("should have a method to listen for row selection changes", () => {
		reset();
		controller.setForm(conditionForm);
		let structuretableSelections = [];
		controller.addRowSelectionListener({ name: "structuretableSortOrder" }, function(selections) {
			structuretableSelections = selections;
		});
		let structurelistSelections = [];
		controller.addRowSelectionListener({ name: "structurelisteditorTableInput" }, function(selections) {
			structurelistSelections = selections;
		});
		let columnSelectSelections = [];
		controller.addRowSelectionListener("columnSelectInputFieldList", function(selections) {
			columnSelectSelections = selections;
		});
		controller.updateSelectedRows({ name: "structuretableSortOrder" }, [2, 4]);
		controller.updateSelectedRows({ name: "structurelisteditorTableInput" }, [1, 3, 5]);
		controller.updateSelectedRows("columnSelectInputFieldList", []);
		expect(structuretableSelections.length === 2).to.equal(true);
		expect(structuretableSelections[0]).to.equal(2);
		expect(structuretableSelections[1]).to.equal(4);
		expect(structurelistSelections.length === 3).to.equal(true);
		expect(structurelistSelections[0]).to.equal(1);
		expect(structurelistSelections[2]).to.equal(5);
		expect(columnSelectSelections.length === 0).to.equal(true);

		// The value shouldn't change after the listener has been removed
		controller.removeRowSelectionListener({ name: "structuretableSortOrder" });
		controller.updateSelectedRows({ name: "structuretableSortOrder" }, [3]);
		expect(structuretableSelections.length === 2).to.equal(true);
		expect(structuretableSelections[0]).to.equal(2);
		expect(structuretableSelections[1]).to.equal(4);
	});

});

describe("Properties Controller action methods", () => {
	it("Test getAction() returns correct value", () => {
		const renderedObject = testUtils.flyoutEditorForm(actionParamDef);
		controller = renderedObject.controller;
		const action = controller.getAction({ name: "decrement" });
		const expected = {
			"name": "decrement",
			"label": {
				"text": "Decrement"
			},
			"actionType": "button",
			"data": {
				"parameter_ref": "number"
			}
		};
		expect(JSON.stringify(action)).to.equal(JSON.stringify(expected));
		expect(controller.getAction({ name: "dne" })).to.be.undefined;
	});
});

describe("Properties Controller getControlPropType", () => {
	beforeEach(() => {
		reset();
	});
	it("should return correct propType from control", () => {
		const propType = controller.getControlPropType({ name: "param_int" });
		expect(propType).to.equal("integer");

		const propType2 = controller.getControlPropType({ name: "param_complex" });
		expect(propType2).to.equal("structure");
	});
	it("should return correct propType from subControl", () => {
		const propType = controller.getControlPropType({ name: "param_complex", col: 0 }); // subcontrol: "zoom_value"
		expect(propType).to.equal("double");

		const propType2 = controller.getControlPropType({ name: "param_complex", col: 2 }); // subcontrol: "zoom_label"
		expect(propType2).to.equal("string");
	});
});

describe("Properties Controller getRequiredDefinitionIds", () => {
	beforeEach(() => {
		reset();
	});
	it("should return correct required definition IDs from required parameters", () => {
		const renderedObject = testUtils.flyoutEditorForm(actionParamDef);
		controller = renderedObject.controller;

		const requiredIds = controller.getRequiredDefinitionIds();
		expect(requiredIds).to.eql([
			"required_oneofselect_201.88122102593735",
			"required_oneofselect_null_895.9146331341876",
			"required_oneofselect_empty_string_963.6717964456162",
			"required_oneofselect_custom_value_667.4461132689746",
			"required_radioString_834.4741085201264",
			"required_radioBooleanWithEnum_167.45387366555846",
			"required_radioBooleanWithoutEnum_836.1233358606064",
			"required_radioBooleanWithLabels_68.57624159959238",
			"required_fields_294.69762842919897"
		]);
	});
});

describe("Properties Controller getRequiredErrorMessages", () => {
	const requiredErrors = {
		"hidden_required_control": {
			"type": "error",
			"text": "You must enter a value for hidden_required_control.",
			"validation_id": "required_hidden_required_control_424.43891381281946",
			"required": true,
			"propertyId": { "name": "hidden_required_control" },
			"displayError": false
		},
		"numberfieldMaxBins": {
			"type": "error",
			"text": "You must enter a value for Maximum number of bins.",
			"validation_id": "required_numberfieldMaxBins_823.4996625010101",
			"required": true,
			"propertyId": { "name": "numberfieldMaxBins" },
			"displayError": false
		},
		"checkboxTypes": {
			"type": "warning",
			"text": "No data types are selected",
			"validation_id": "checkboxTypes",
			"required": false,
			"propertyId": { "name": "checkboxTypes" },
			"displayError": false
		},
		"textfieldName": {
			"type": "warning",
			"text": "password cannot contain name",
			"validation_id": "textfieldtest3",
			"required": true,
			"propertyId": { "name": "textfieldName" },
			"displayError": true
		},
		"textareaDescription": {
			"type": "error",
			"text": "You must enter a value for Description.",
			"validation_id": "required_textareaDescription_708.576019526482",
			"required": false,
			"propertyId": { "name": "textareaDescription" },
			"displayError": true
		},
		"field_types": {
			"7": {
				"0": {
					"type": "warning",
					"text": "Invalid Field, field not found in data set.",
					"validation_id": "validField_field_types[0]_408.7341493615164",
					"required": true,
					"propertyId": { "name": "field_types", "row": 7, "col": 0 },
					"displayError": true
				}
			},
			"8": {
				"0": {
					"type": "warning",
					"text": "Invalid Field, field not found in data set.",
					"validation_id": "validField_field_types[0]_408.7341493615164",
					"required": false,
					"propertyId": { "name": "field_types", "row": 8, "col": 0 },
					"displayError": false
				}
			},
			"9": {
				"0": {
					"type": "warning",
					"text": "Invalid Field, field not found in data set.",
					"validation_id": "validField_field_types[0]_408.7341493615164",
					"required": false,
					"propertyId": { "name": "field_types", "row": 9, "col": 0 },
					"displayError": true
				}
			},
			"10": {
				"0": {
					"type": "warning",
					"text": "Invalid Field, field not found in data set.",
					"validation_id": "validField_field_types[0]_408.7341493615164",
					"required": true,
					"propertyId": { "name": "field_types", "row": 10, "col": 0 },
					"displayError": false
				}
			}
		}
	};
	beforeEach(() => {
		reset();
	});
	it("should return correct required error messages", () => {
		controller.setErrorMessages(requiredErrors);
		const actualRequiredErrors = controller.getRequiredErrorMessages();
		const expectedRequiredErrors = {
			"numberfieldMaxBins": requiredErrors.numberfieldMaxBins,
			"textfieldName": requiredErrors.textfieldName,
			"field_types": {
				"7": {
					"0": requiredErrors.field_types["7"]["0"]
				},
				"10": {
					"0": requiredErrors.field_types["10"]["0"]
				}
			}
		};
		expect(actualRequiredErrors).to.eql(expectedRequiredErrors);
	});

	it("should return correct error messages with filterDisplayError = true", () => {
		controller.setErrorMessages(requiredErrors);
		const actualDisplayErrors = controller.getErrorMessages(false, false, false, true);
		const expectedDisplayErrors = {
			"textfieldName": requiredErrors.textfieldName,
			"textareaDescription": requiredErrors.textareaDescription,
			"field_types": {
				"7": {
					"0": requiredErrors.field_types["7"]["0"]
				},
				"9": {
					"0": requiredErrors.field_types["9"]["0"]
				}
			}
		};
		expect(actualDisplayErrors).to.eql(expectedDisplayErrors);
	});

	it("should return all error messages with filterDisplayError = false", () => {
		controller.setErrorMessages(requiredErrors);
		const actualDisplayErrors = controller.getAllErrorMessages();
		expect(actualDisplayErrors).to.eql(requiredErrors);
	});

	it("should return all required error messages with hidden/disabled errors removed", () => {
		controller.setErrorMessages(requiredErrors);
		// hidden_required_control has controlType "hidden" and required "true"
		const allErrorMessages = controller.getErrorMessages(false, false, false, false);
		expect(allErrorMessages).to.have.property("hidden_required_control");
		// set filterHiddenDisable: true
		const filterHiddenDisableErrors = controller.getErrorMessages(false, true, false, false);
		// Verify error for hidden_required_control is filtered
		expect(filterHiddenDisableErrors).to.not.have.property("hidden_required_control");

		controller.updateControlState(requiredErrors.textfieldName.propertyId, "hidden");
		const actualRequiredErrors = controller.getRequiredErrorMessages();
		const expectedRequiredErrors = {
			"numberfieldMaxBins": requiredErrors.numberfieldMaxBins,
			"field_types": {
				"7": {
					"0": requiredErrors.field_types["7"]["0"]
				},
				"10": {
					"0": requiredErrors.field_types["10"]["0"]
				}
			}
		};
		expect(actualRequiredErrors).to.eql(expectedRequiredErrors);
		// getRequiredErrorMessages() filters error messages for controls having controlType: hidden
		expect(actualRequiredErrors).to.not.have.property("hidden_required_control");

		controller.updateControlState(requiredErrors.numberfieldMaxBins.propertyId, "disabled");
		const actualRequiredErrors2 = controller.getRequiredErrorMessages();
		const expectedRequiredErrors2 = {
			"field_types": {
				"7": {
					"0": requiredErrors.field_types["7"]["0"]
				},
				"10": {
					"0": requiredErrors.field_types["10"]["0"]
				}
			}
		};
		expect(actualRequiredErrors2).to.eql(expectedRequiredErrors2);
	});
});

describe("Properties Controller addRemoveRows", () => {
	beforeEach(() => {
		reset();
	});
	it("should setInitialAddRemoveRows when setting form", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;

		const parameters = Object.keys(structureListEditorParamDef.current_parameters);
		parameters.forEach((parameterName) => {
			if (parameterName === "inlineEditingTableNoButtons") { // 'add_remove_rows' is set to false in parameterDef
				expect(controller.getAddRemoveRows({ name: parameterName })).to.be.false;
			} else {
				expect(controller.getAddRemoveRows({ name: parameterName })).to.be.true;
			}
		});
	});

	it("structure should not show buttoms if addRemoveRows is set to false", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		const propertyId = { name: "structurelisteditorTableInput" };

		// Verify buttons are visible when editor opens
		let summaryPanel = testUtils.openSummaryPanel(wrapper, "structurelisteditorTableInput-summary-panel");
		expect(summaryPanel.find(".properties-at-buttons-container")).to.have.length(1);

		// Set the addRemoveRows to false for this control
		controller.setAddRemoveRows(propertyId, false);
		summaryPanel = testUtils.openSummaryPanel(wrapper, "structurelisteditorTableInput-summary-panel");
		expect(summaryPanel.find(".properties-at-buttons-container")).to.have.length(0);
		expect(controller.getAddRemoveRows(propertyId)).to.be.false;

		// Set the addRemoveRows to true for this control
		controller.setAddRemoveRows(propertyId, true);
		summaryPanel = testUtils.openSummaryPanel(wrapper, "structurelisteditorTableInput-summary-panel");
		expect(summaryPanel.find(".properties-at-buttons-container")).to.have.length(1);
		expect(controller.getAddRemoveRows(propertyId)).to.be.true;
	});

	it("nested structure should not show buttoms if addRemoveRows is set to false", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		const propertyId = { name: "nestedStructurelisteditor", row: 0, col: 3 };

		// Verify buttons are visible when editor opens
		let summaryPanel = testUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		const parentTable = summaryPanel.find("div[data-id='properties-ft-nestedStructurelisteditor']");
		parentTable.find(".properties-subpanel-button").at(0)
			.simulate("click");
		let nestedTable = wrapper.find("div[data-id='properties-nested_structure']");
		expect(nestedTable.find(".properties-at-buttons-container")).to.have.length(1);

		// Set the addRemoveRows to false for this control
		controller.setAddRemoveRows(propertyId, false);
		summaryPanel = testUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		nestedTable = wrapper.find("div[data-id='properties-nested_structure']");
		expect(nestedTable.find(".properties-at-buttons-container")).to.have.length(0);
		expect(controller.getAddRemoveRows(propertyId)).to.be.false;

		// Set the addRemoveRows to true for this control
		controller.setAddRemoveRows(propertyId, true);
		summaryPanel = testUtils.openSummaryPanel(wrapper, "nested-structurelisteditor-summary-panel");
		nestedTable = wrapper.find("div[data-id='properties-nested_structure']");
		expect(nestedTable.find(".properties-at-buttons-container")).to.have.length(1);
		expect(controller.getAddRemoveRows(propertyId)).to.be.true;
	});

	it("deeply nested structure should not show buttoms if addRemoveRows is set to false", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;

		const propertyId = { name: "nestedStructurelisteditor", row: 0, col: 3, propertyId: { row: 0, col: 1 } };
		controller.setAddRemoveRows(propertyId, false);
		expect(controller.getAddRemoveRows(propertyId)).to.be.false;

		controller.setAddRemoveRows(propertyId, true);
		expect(controller.getAddRemoveRows(propertyId)).to.be.true;
	});
});

describe("Properties Controller hideEditButton", () => {
	beforeEach(() => {
		reset();
	});

	it("should setInitialHideEditButton when setting form", () => {
		const renderedObject = testUtils.flyoutEditorForm(readonlyTableParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "outputcolProperties" };
		expect(controller.getHideEditButton(propertyId)).to.be.false;
	});


	it("hideEditButton attribute can reflect latest setted value", () => {
		const renderedObject = testUtils.flyoutEditorForm(readonlyTableParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "outputcolProperties" };

		// Verify hideEditButton parameter can be setup correctly
		controller.setHideEditButton(propertyId, true);
		expect(controller.getHideEditButton(propertyId)).to.be.true;
		controller.setHideEditButton(propertyId, false);
		expect(controller.getHideEditButton(propertyId)).to.be.false;

	});


});

describe("Properties Controller staticRows", () => {
	beforeEach(() => {
		reset();
	});
	it("should update static Rows Indexes for the start rows if valid", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "structurelisteditorTableInput" };
		const staticRowIndexes = [0, 1];
		controller.updateStaticRows(propertyId, staticRowIndexes);
		expect(controller.getStaticRows(propertyId)).to.equal(staticRowIndexes);
	});

	it("should update static Rows Indexes for the end rows if valid", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "structurelisteditorTableInput" };
		const staticRowIndexes = [3, 4];
		controller.updateStaticRows(propertyId, staticRowIndexes);
		expect(controller.getStaticRows(propertyId)).to.equal(staticRowIndexes);
	});

	it("should not update static Rows Indexes for invalid row indexes", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "structurelisteditorTableInput" };
		const staticRowIndexes = [0, 3];
		controller.updateStaticRows(propertyId, staticRowIndexes);
		expect(controller.getStaticRows(propertyId)).to.have.length(0);
	});

	it("should not update static Rows Indexes if not first row or last row index", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "structurelisteditorTableInput" };
		const staticRowIndexes = [2, 3];
		controller.updateStaticRows(propertyId, staticRowIndexes);
		expect(controller.getStaticRows(propertyId)).to.have.length(0);
	});

	it("reset static Rows Indexes for propertyId to empty", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureListEditorParamDef);
		controller = renderedObject.controller;
		const propertyId = { name: "structurelisteditorTableInput" };
		const staticRowIndexes = [0, 1];
		controller.updateStaticRows(propertyId, staticRowIndexes);
		expect(controller.getStaticRows(propertyId)).to.equal(staticRowIndexes);
		controller.clearStaticRows(propertyId);
		expect(controller.getStaticRows(propertyId)).to.have.length(0);
	});

});

describe("Properties Controller paramDef methods", () => {
	it("should set the paramDef in properties controller", () => {
		reset();
		// Using structureTableParamDef because it throws a validation error.
		controller.setParamDef(structureTableParamDef);
		const actualValues = controller.getPropertyValues();
		expect(actualValues).to.eql(structuretablePropertyValues);
	});
});

describe("Properties Controller custom table buttons", () => {
	beforeEach(() => {
		reset();
	});
	it("should setInitialTableButtonState when setting form", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureTableParamDef);
		controller = renderedObject.controller;

		const parameters = Object.keys(structureTableParamDef.current_parameters);
		parameters.forEach((parameterName) => {
			let expectedState = {};
			if (parameterName === "structuretableCustomIconButtons") {
				expectedState = { "icon_button_1": false, "icon_button_2": true, "icon_button_3": false, "icon_button_4": true };
			} else if (parameterName === "structuretableCustomLabelButtons") {
				expectedState = { "icon_button_11": true, "icon_button_12": true };
			} else if (parameterName === "structuretableCustomLabelIconButtons") {
				expectedState = { "icon_button_21": true, "icon_button_22": false, "icon_button_23": true, "icon_button_24": true, "icon_button_25": true, "icon_button_26": true };
			}
			expect(controller.getTableButtons({ name: parameterName })).to.eql(expectedState);
		});
	});

	it("structure should render toolbar correctly when custom buttons are set to disabled", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureTableParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		const propertyId = { name: "structuretableCustomIconButtons" };

		// Verify buttons are visible when editor opens
		let summaryPanel = testUtils.openSummaryPanel(wrapper, "structuretableCustomIconButtons-summary-panel");
		let firstTable = summaryPanel.find("div[data-id='properties-structuretableCustomIconButtons']");
		let customButtonToolbar = firstTable.find(".properties-custom-table-buttons");
		expect(customButtonToolbar).to.have.length(1);
		expect(customButtonToolbar.find(".toolbar-item.default")).to.have.length(4);
		let customButtons = customButtonToolbar.find(".toolbar-item.default button");
		expect(customButtons).to.have.length(4);

		expect(customButtons.at(0).prop("disabled")).to.equal(true);
		expect(customButtons.at(1).prop("disabled")).to.equal(false);
		expect(customButtons.at(2).prop("disabled")).to.equal(true);
		expect(customButtons.at(3).prop("disabled")).to.equal(false);

		expect(controller.getTableButtonEnabled(propertyId, "icon_button_3")).to.equal(false);
		expect(controller.getTableButtonEnabled(propertyId, "icon_button_4")).to.equal(true);

		controller.setTableButtonEnabled(propertyId, "icon_button_3", true); // enable button
		controller.setTableButtonEnabled(propertyId, "icon_button_4", false); // disable button

		summaryPanel = testUtils.openSummaryPanel(wrapper, "structuretableCustomIconButtons-summary-panel");
		firstTable = summaryPanel.find("div[data-id='properties-structuretableCustomIconButtons']");
		customButtonToolbar = firstTable.find(".properties-custom-table-buttons");
		customButtons = customButtonToolbar.find(".toolbar-item.default button");
		expect(customButtons.at(0).prop("disabled")).to.equal(true);
		expect(customButtons.at(1).prop("disabled")).to.equal(false);
		expect(customButtons.at(2).prop("disabled")).to.equal(false);
		expect(customButtons.at(3).prop("disabled")).to.equal(true);

		expect(controller.getTableButtonEnabled(propertyId, "icon_button_3")).to.equal(true);
		expect(controller.getTableButtonEnabled(propertyId, "icon_button_4")).to.equal(false);
	});

	it("should setInitialTableButtonState for nested structures when setting form", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureTableParamDef);
		controller = renderedObject.controller;

		const expectedState = { "nested_button_1": false, "nested_button_2": true, "nested_button_3": false, "nested_button_4": true };
		expect(controller.getTableButtons({ "name": "nestedStructureCustomButtons", "row": 0, "col": 2 })).to.eql(expectedState);
		expect(controller.getTableButtons({ "name": "nestedStructureCustomButtons", "row": 1, "col": 2 })).to.eql(expectedState);
	});

	it("nested structure custom table buttons", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureTableParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		const propertyId = { "name": "nestedStructureCustomButtons", "row": 0, "col": 2 };

		let summaryPanel = testUtils.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		let parentTable = summaryPanel.find("div[data-id='properties-ft-nestedStructureCustomButtons']");
		parentTable.find(".properties-subpanel-button").at(0)
			.simulate("click");
		let nestedTable = wrapper.find("div[data-id='properties-nestedStructureCustomButtons_table']");
		let customButtonToolbar = nestedTable.find(".properties-custom-table-buttons");
		expect(customButtonToolbar).to.have.length(1);
		expect(customButtonToolbar.find(".toolbar-item.default")).to.have.length(4);
		let customButtons = customButtonToolbar.find(".toolbar-item.default button");
		expect(customButtons).to.have.length(4);

		expect(customButtons.at(0).prop("disabled")).to.equal(true);
		expect(customButtons.at(1).prop("disabled")).to.equal(false);
		expect(customButtons.at(2).prop("disabled")).to.equal(true);
		expect(customButtons.at(3).prop("disabled")).to.equal(false);

		controller.setTableButtonEnabled(propertyId, "nested_button_3", true); // enable button
		controller.setTableButtonEnabled(propertyId, "nested_button_4", false); // disable button

		const expected = { "nested_button_1": false, "nested_button_2": true, "nested_button_3": true, "nested_button_4": false };
		expect(controller.getTableButtons(propertyId)).to.eql(expected);

		// // Verify buttons are visible when editor opens
		summaryPanel = testUtils.openSummaryPanel(wrapper, "nested-structuretable-summary-panel");
		parentTable = summaryPanel.find("div[data-id='properties-ft-nestedStructureCustomButtons']");
		parentTable.find(".properties-subpanel-button").at(0)
			.simulate("click");
		nestedTable = wrapper.find("div[data-id='properties-nestedStructureCustomButtons_table']");
		customButtonToolbar = nestedTable.find(".properties-custom-table-buttons");
		customButtons = customButtonToolbar.find(".toolbar-item.default button");

		expect(customButtons.at(0).prop("disabled")).to.equal(true);
		expect(customButtons.at(1).prop("disabled")).to.equal(false);
		expect(customButtons.at(2).prop("disabled")).to.equal(false);
		expect(customButtons.at(3).prop("disabled")).to.equal(true);
	});
});

describe("Properties Controller setWideFlyoutPrimaryButtonDisabled", () => {
	beforeEach(() => {
		reset();
	});
	it("should disable OK button in Wide Flyout panel for given summaryPanel", () => {
		const renderedObject = testUtils.flyoutEditorForm(structureTableParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		const id = "structuretableReadonlyColumnStartValue-summary-panel";
		const summaryPanelId = { name: id };

		// Verify OK button is enabled by default
		let summaryPanel = testUtils.openSummaryPanel(wrapper, id);
		let wideFlyoutPrimaryButton = summaryPanel
			.find(".properties-wf-content")
			.find(".properties-modal-buttons")
			.find("button[data-id='properties-apply-button']");
		expect(wideFlyoutPrimaryButton.props()).to.have.property("disabled", false);
		expect(wideFlyoutPrimaryButton.prop("className").includes("cds--btn--disabled")).to.equal(false);

		// Disable OK button for this summary panel using controller method
		controller.setWideFlyoutPrimaryButtonDisabled(summaryPanelId, true);
		summaryPanel = testUtils.openSummaryPanel(wrapper, id);
		wideFlyoutPrimaryButton = summaryPanel
			.find(".properties-wf-content")
			.find(".properties-modal-buttons")
			.find("button[data-id='properties-apply-button']");
		expect(wideFlyoutPrimaryButton.props()).to.have.property("disabled", true);
		expect(wideFlyoutPrimaryButton.prop("className").includes("cds--btn--disabled")).to.equal(true);
		expect(controller.getWideFlyoutPrimaryButtonDisabled(summaryPanelId)).to.be.true;

		// Enable OK button for this summary panel using controller method
		controller.setWideFlyoutPrimaryButtonDisabled(summaryPanelId, false);
		summaryPanel = testUtils.openSummaryPanel(wrapper, id);
		wideFlyoutPrimaryButton = summaryPanel
			.find(".properties-wf-content")
			.find(".properties-modal-buttons")
			.find("button[data-id='properties-apply-button']");
		expect(wideFlyoutPrimaryButton.props()).to.have.property("disabled", false);
		expect(wideFlyoutPrimaryButton.prop("className").includes("cds--btn--disabled")).to.equal(false);
		expect(controller.getWideFlyoutPrimaryButtonDisabled(summaryPanelId)).to.be.false;
	});
});

describe("Properties Controller getTopLevelActiveGroupId", () => {
	it("should get the top level active group id in properties controller", () => {
		reset();
		const renderedObject = testUtils.flyoutEditorForm(checkboxsetParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;
		let topLevelActiveGroupId = controller.getTopLevelActiveGroupId();
		expect(topLevelActiveGroupId).to.equal("checkboxset-values");

		// Select Conditions accordion
		const conditionsCategory = wrapper.find("div.properties-category-container").at(1);
		conditionsCategory.find("button.properties-category-title").simulate("click");
		topLevelActiveGroupId = controller.getTopLevelActiveGroupId();
		expect(topLevelActiveGroupId).to.equal("checkboxset-conditions");

	});
});

describe("Properties Controller setTopLevelActiveGroup", () => {
	it("should set the top level active group id in properties controller", () => {
		reset();
		const renderedObject = testUtils.flyoutEditorForm(tabParamDef);
		controller = renderedObject.controller;
		const wrapper = renderedObject.wrapper;

		controller.setTopLevelActiveGroupId("Primary3");
		let topLevelActiveGroupId = controller.getTopLevelActiveGroupId();
		expect(topLevelActiveGroupId).to.equal("Primary3");

		// Select Condition in accordion
		const conditionsCategory = wrapper.find("div.properties-category-container").at(2);
		conditionsCategory.find("button.properties-category-title").simulate("click");
		topLevelActiveGroupId = controller.getTopLevelActiveGroupId();
		expect(topLevelActiveGroupId).to.equal("Primary2");
	});
});
