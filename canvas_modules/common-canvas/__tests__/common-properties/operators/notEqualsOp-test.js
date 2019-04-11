/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";


describe("validating notEquals operator works correctly", () => {
	const controller = new Controller();
	const notEquals = controller.getConditionOp("notEquals");
	let undefinedPlaceholder;

	function wrap(val, role = null) {
		return { value: val, control: { controlType: role } };
	}

	function emptyFunc() {
		return;
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test notEquals behaves as expected for edge cases", () => {
		// passwordfield can't use notEquals, defaults to true
		expect(notEquals(wrap(undefinedPlaceholder, "passwordfield"), null, null, controller)).to.equal(true);
		expect(function() {
			notEquals(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
	});

	it("Test notEquals behaves as expected comparing paramInfo and paramInfo2", () => {
		expect(notEquals(wrap(undefinedPlaceholder), undefinedPlaceholder, null, controller)).to.equal(true);
		expect(notEquals(wrap(undefinedPlaceholder), wrap(undefinedPlaceholder), null, controller)).to.equal(false);

		expect(notEquals(wrap(true), wrap(true), null, controller)).to.equal(false);
		expect(notEquals(wrap("string"), wrap("string2"), null, controller)).to.equal(true);

		expect(notEquals(wrap(1), wrap(1), null, controller)).to.equal(false);
		expect(notEquals(wrap(null), wrap(null), null, controller)).to.equal(false);
		expect(notEquals(wrap({ temp: "value" }), wrap({ temp: "value2" }), null, controller)).to.equal(true);
		// pass in a function as a way to hit the default switch case
		expect(notEquals(wrap(emptyFunc), null, null, controller)).to.equal(true);
	});

	it("Test notEquals behaves as expected comparing paramInfo and value", () => {
		expect(notEquals(wrap("string"), undefinedPlaceholder, "string2", controller)).to.equal(true);
		expect(notEquals(wrap(undefinedPlaceholder), undefinedPlaceholder, "not undefined", controller)).to.equal(true);

		expect(notEquals(wrap(true), undefinedPlaceholder, true, controller)).to.equal(false);
		expect(notEquals(wrap("string"), undefinedPlaceholder, "string2", controller)).to.equal(true);

		expect(notEquals(wrap(1), undefinedPlaceholder, 1, controller)).to.equal(false);
		expect(notEquals(wrap(null), undefinedPlaceholder, null, controller)).to.equal(false);
		expect(notEquals(wrap({ temp: "value" }), undefinedPlaceholder, { temp: "value2" }, controller)).to.equal(true);
		// pass in a function as a way to hit the default switch case
		expect(notEquals(wrap(emptyFunc), undefinedPlaceholder, null, controller)).to.equal(true);
	});


});
