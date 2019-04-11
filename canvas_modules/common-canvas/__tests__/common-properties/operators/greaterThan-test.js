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


describe("validating greaterThan operator works correctly", () => {
	const controller = new Controller();
	const greaterThan = controller.getConditionOp("greaterThan");
	let undefinedPlaceholder;

	function wrap(val, role = null) {
		return { value: val, control: { controlType: role } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test greaterThan behaves as expected for edge cases", () => {
		// only undefined, number, object can be used, string defaults to true
		expect(greaterThan(wrap("string"), null, null, controller)).to.equal(true);
		expect(function() {
			greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
		// object paramInfo with 4 switch case branches
		expect(greaterThan(wrap({ temp: "value" }), wrap(null), null, controller)).to.equal(true);
		expect(greaterThan(wrap(null), wrap(0), null, controller)).to.equal(true);
		expect(greaterThan(wrap(null), wrap(null), "value", controller)).to.equal(true);
		expect(greaterThan(wrap({ temp: "value" }), wrap({ temp: "value2" }), "value3", controller)).to.equal(false);
	});

	it("Test greaterThan behaves as expected comparing paramInfo and paramInfo2", () => {
		// type undefined paramInfo
		expect(greaterThan(wrap(undefinedPlaceholder), wrap(1), null, controller)).to.equal(false);
		expect(greaterThan(wrap(undefinedPlaceholder), wrap("bad string"), null, controller)).to.equal(false);
		// type number paramInfo
		expect(greaterThan(wrap(1), wrap(1), null, controller)).to.equal(false);
		expect(greaterThan(wrap(1), wrap("bad string"), null, controller)).to.equal(false);
	});
	it("Test greaterThan behaves as expected comparing paramInfo and value", () => {
		// type undefined paramInfo
		expect(greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, 1, controller)).to.equal(false);
		expect(greaterThan(wrap(undefinedPlaceholder), undefinedPlaceholder, "null", controller)).to.equal(true);
		// type number paramInfo
		expect(greaterThan(wrap(1), undefinedPlaceholder, 2, controller)).to.equal(false);
		expect(greaterThan(wrap(1), undefinedPlaceholder, "null", controller)).to.equal(true);
	});

});
