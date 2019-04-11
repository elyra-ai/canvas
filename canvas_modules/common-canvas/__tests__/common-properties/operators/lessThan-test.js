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


describe("validating lessThan operator works correctly", () => {
	const controller = new Controller();
	const lessThan = controller.getConditionOp("lessThan");
	let undefinedPlaceholder;

	function wrap(val, role = null) {
		return { value: val, control: { controlType: role } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test lessThan behaves as expected for edge cases", () => {
		// only undefined, number, object can be used, string defaults to true
		expect(lessThan(wrap("string"), null, null, controller)).to.equal(true);
		expect(function() {
			lessThan(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
		// switch cases for the object case
		expect(lessThan(wrap({ temp: "value" }), wrap(null), null, controller)).to.equal(true);
		expect(lessThan(wrap(null), wrap(0), null, controller)).to.equal(true);
		expect(lessThan(wrap(null), wrap(null), "value", controller)).to.equal(true);
		expect(lessThan(wrap({ temp: "value" }), wrap({ temp: "value2" }), "value3", controller)).to.equal(false);
	});

	it("Test lessThan behaves as expected comparing paramInfo and paramInfo2", () => {
		// type undefined paramInfo
		expect(lessThan(wrap(undefinedPlaceholder), wrap(1), null, controller)).to.equal(false);
		expect(lessThan(wrap(undefinedPlaceholder), wrap("bad string"), null, controller)).to.equal(false);
		// type number paramInfo
		expect(lessThan(wrap(1), wrap(1), null, controller)).to.equal(false);
		expect(lessThan(wrap(1), wrap("bad string"), null, controller)).to.equal(false);
	});

	it("Test lessThan behaves as expected comparing paramInfo and value", () => {
		// type undefined paramInfo
		expect(lessThan(wrap(undefinedPlaceholder), undefinedPlaceholder, 1, controller)).to.equal(false);
		expect(lessThan(wrap(undefinedPlaceholder), undefinedPlaceholder, "null", controller)).to.equal(true);
		// type number paramInfo
		expect(lessThan(wrap(1), undefinedPlaceholder, 2, controller)).to.equal(true);
		expect(lessThan(wrap(1), undefinedPlaceholder, "null", controller)).to.equal(true);
	});

});
