/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import sinon from "sinon";
import _ from "underscore";
import deepFreeze from "deep-freeze";
import Controller from "../../src/common-properties/properties-controller";

const controller = new Controller();
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
	param_message2: []
};
deepFreeze(propValues);
const propStates = {
	param_int: {
		value: "enabled"
	},
	param_str_array: {
		value: "hidden"
	},
	param_mix_table: {
		"0": {
			"2": {
				value: "disabled"
			}
		},
		"3": {
			"0": {
				value: "enabled"
			},
			"1": {
				value: "hidden"
			},
			"3": {
				value: "visible"
			}
		},
		"4": {
			"0": {
				value: "disabled"
			},
			"3": {
				value: "hidden"
			}
		}
	}
};
deepFreeze(propStates);
const dataModel = {
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
deepFreeze(dataModel);
const errorMessages = {
	param_int: {
		type: "warning",
		text: "Bad integer value"
	},
	param_str_array: {
		"2": {
			type: "error",
			text: "Bad array value"
		}
	},
	param_mix_table: {
		"0": {
			"2": {
				type: "warning",
				text: "Bad table value"
			}
		}
	}
};
deepFreeze(errorMessages);

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}
function reset() {
	// setting of states needs to be done after property values.
	// conditions are ran on each set and update of property values
	controller.setPropertyValues(getCopy(propValues));
	controller.setDatasetMetadata(getCopy(dataModel));
	controller.setErrorMessages(getCopy(errorMessages));
	controller.setControlStates(getCopy(propStates));
}

describe("Properties Controller property values", () => {
	it("should set property values correctly", () => {
		reset();
		const actualValues = controller.getPropertyValues();
		expect(_.isEqual(getCopy(propValues), actualValues)).to.be.true;
	});
	it("should update a simple property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_int" }, 10);
		const actualValues = controller.getPropertyValues();
		const expectValues = getCopy(propValues);
		expectValues.param_int = 10;
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should update a row property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_mix_table", row: 5 }, [null, null, null, null, null]);
		const actualValues = controller.getPropertyValues();
		const expectValues = getCopy(propValues);
		expectValues.param_mix_table[5] = [null, null, null, null, null];
		expect(_.isEqual(expectValues, actualValues)).to.be.true;

	});
	it("should update a cell property value correctly", () => {
		reset();
		controller.updatePropertyValue({ name: "param_mix_table", row: 2, col: 3 }, 10);
		const actualValues = controller.getPropertyValues();
		const expectValues = getCopy(propValues);
		expectValues.param_mix_table[2][3] = 10;
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
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
	it("should get a cell property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_mix_table", row: 3, col: 4 });
		expect(actualValue).to.equal(propValues.param_mix_table[3][4]);
	});
	it("should get filtered a property value correctly", () => {
		reset();
		const actualValue = controller.getPropertyValue({ name: "param_mix_table" }, true);
		const expectedValue = [
			["field1", true, null, 0.674, "DSX"],
			["field2", null, 10, 0.674, "WDP"],
			["field3", false, null, 0.674, "WML"],
			["field4", null, 10, null, ""],
			[null, false, 10, null, null]];
		expect(_.isEqual(expectedValue, actualValue)).to.be.true;
	});
	it("should get filtered property values correctly", () => {
		reset();
		const actualValue = controller.getPropertyValues(true);
		const expectedValue = {
			param_int: 5,
			param_str: "Testing a string parameter",
			param_mix_table: [
				["field1", true, null, 0.674, "DSX"],
				["field2", null, 10, 0.674, "WDP"],
				["field3", false, null, 0.674, "WML"],
				["field4", null, 10, null, ""],
				[null, false, 10, null, null]],
			param_message1: [],
			param_message2: []
		};
		expect(_.isEqual(expectedValue, actualValue)).to.be.true;
	});
});

describe("Properties Controller states", () => {
	it("should set property states correctly", () => {
		reset();
		const actualValues = controller.getControlStates();
		expect(_.isEqual(getCopy(propStates), actualValues)).to.be.true;
	});
	it("should update a simple property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_int" }, "hidden");
		const actualValues = controller.getControlStates();
		const expectValues = getCopy(propStates);
		expectValues.param_int = {
			value: "hidden"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should update a row property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_str_array", row: 2 }, "disabled");
		const actualValues = controller.getControlStates();
		const expectValues = getCopy(propStates);
		expectValues.param_str_array[2] = {
			value: "disabled"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should update a cell property state correctly", () => {
		reset();
		controller.updateControlState({ name: "param_mix_table", row: 2, col: 3 }, "hidden");
		const actualValues = controller.getControlStates();
		const expectValues = getCopy(propStates);
		expectValues.param_mix_table[2] = {};
		expectValues.param_mix_table[2][3] = {
			value: "hidden"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
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
	it("should get a row property state correctly", () => {
		reset();
		const actualValue = controller.getControlState({ name: "param_mix_table", row: 3, col: 3 });
		expect(actualValue).to.equal("visible");
	});
	it("should get property states correctly", () => {
		reset();
		const actualValues = controller.getControlStates();
		expect(_.isEqual(propStates, actualValues)).to.be.true;
	});
});

describe("Properties Controller datasetMetadata", () => {
	it("should set datasetMetadata correctly", () => {
		reset();
		const actualValue = controller.getDatasetMetadata();
		expect(_.isEqual(dataModel, actualValue)).to.be.true;
	});
});
describe("Properties Controller property messages", () => {
	it("should set property messages correctly", () => {
		reset();
		const actualValues = controller.getErrorMessages();
		expect(_.isEqual(getCopy(errorMessages), actualValues)).to.be.true;
	});
	it("should update a simple property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_int" }, {
			type: "error",
			text: "Testing error messages"
		});
		const actualValues = controller.getErrorMessages();
		const expectValues = getCopy(errorMessages);
		expectValues.param_int = {
			type: "error",
			text: "Testing error messages"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should update a row property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_str_array", row: 2 }, {
			type: "warning",
			text: "warning in array"
		});
		const actualValues = controller.getErrorMessages();
		const expectValues = getCopy(errorMessages);
		expectValues.param_str_array = {};
		expectValues.param_str_array[2] = {
			type: "warning",
			text: "warning in array"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should update a cell property message correctly", () => {
		reset();
		controller.updateErrorMessage({ name: "param_mix_table", row: 2, col: 3 }, {
			type: "error",
			text: "Bad cell value"
		});
		const actualValues = controller.getErrorMessages();
		const expectValues = getCopy(errorMessages);
		expectValues.param_mix_table[2] = {};
		expectValues.param_mix_table[2][3] = {
			type: "error",
			text: "Bad cell value"
		};
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
	it("should get a table property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_mix_table" });
		const expectValue = {
			type: "warning",
			text: "Bad table value"
		};
		expect(_.isEqual(expectValue, actualValue)).to.be.true;
	});
	it("should get a row property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_str_array", row: 2 });
		const expectValue = {
			type: "error",
			text: "Bad array value"
		};
		expect(_.isEqual(expectValue, actualValue)).to.be.true;
	});
	it("should get a cell property message correctly", () => {
		reset();
		const actualValue = controller.getErrorMessage({ name: "param_mix_table", row: 0, col: 2 });
		const expectValue = {
			type: "warning",
			text: "Bad table value"
		};
		expect(_.isEqual(expectValue, actualValue)).to.be.true;
	});
	it("should get pipeline property messages correctly", () => {
		reset();
		const actualValues = controller.getErrorMessages(true);
		const expectValues = [
			{
				id_ref: "param_int",
				type: "warning",
				text: "Bad integer value"
			},
			{
				"id_ref": "param_str_array",
				"type": "error",
				"text": "Bad array value"
			},
			{
				"id_ref": "param_mix_table",
				"type": "warning",
				"text": "Bad table value"
			}
		];
		expect(_.isEqual(expectValues, actualValues)).to.be.true;
	});
});
describe("Properties Controller handlers", () => {
	const controller2 = new Controller();
	const propertyListener = sinon.spy();
	controller2.setHandlers({
		propertyListener: propertyListener
	});
	it("should fire event on setPropertyValues", () => {
		controller2.setPropertyValues({
			param_str: "Testing listener",
			param_int: "5"
		}
		);
		expect(propertyListener).to.have.property("callCount", 1);
	});
	it("should fire event on updatePropertyValue", () => {
		controller2.updatePropertyValue({ name: "param_int" }, 10);
		expect(propertyListener).to.have.property("callCount", 2);
	});
});
