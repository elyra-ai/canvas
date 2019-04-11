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


describe("validating contains operator works correctly", () => {
	const controller = new Controller();
	const contains = controller.getConditionOp("contains");
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

	it("Test contains behaves as expected for edge cases", () => {
		// passwordfield can't use contains, defaults to true
		expect(contains(wrap(undefinedPlaceholder, "passwordfield"), null, null, controller)).to.equal(true);
		expect(function() {
			contains(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
	});

	it("Test contains behaves as expected comparing paramInfo and paramInfo2", () => {
		expect(contains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(false);
		expect(contains(wrap("she believed"), wrap("sbeve"), null, controller)).to.equal(false);
		expect(contains(wrap("sbeve"), wrap("be"), null, controller)).to.equal(true);
		expect(contains(wrap(null), wrap(null), null, controller)).to.equal(false);
		expect(contains(wrap([1, 2, 3]), wrap(2), null, controller)).to.equal(true);
		// pass in a function as a way to hit the default switch case
		expect(contains(wrap(emptyFunc), wrap("string"), null, controller)).to.equal(true);
	});

	it("Test contains behaves as expected comparing paramInfo and value", () => {
		expect(contains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(false);
		expect(contains(wrap("she believed"), undefinedPlaceholder, "sbeve", controller)).to.equal(false);
		expect(contains(wrap("sbeve"), undefinedPlaceholder, "be", controller)).to.equal(true);
		expect(contains(wrap(null), undefinedPlaceholder, null, controller)).to.equal(false);
		expect(contains(wrap([1, 2, 3]), undefinedPlaceholder, 2, controller)).to.equal(true);
		// pass in a function as a way to hit the default switch case
		expect(contains(wrap(emptyFunc), undefinedPlaceholder, "string", controller)).to.equal(true);
	});


});
