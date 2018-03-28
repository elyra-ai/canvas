/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import PropertyUtils from "../../src/common-properties/util/property-utils.js";
import testUtils from "../_utils_/property-utils";
import Controller from "../../src/common-properties/properties-controller";

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

describe("dynamic text with expressions", () => {
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
