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


describe("validating isEmpty operator works correctly", () => {
	const controller = new Controller();
	const isEmpty = controller.getConditionOp("isEmpty");
	let undefinedPlaceholder;

	function wrap(val) {
		return { value: val };
	}

	function emptyFunc() {
		return;
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test isEmpty behaves as expected", () => {
		expect(isEmpty(wrap(undefinedPlaceholder), null, null, controller)).to.equal(true);
		expect(isEmpty(wrap(true), null, null, controller)).to.equal(false);
		// string cases
		expect(isEmpty(wrap(""), null, null, controller)).to.equal(true);
		expect(isEmpty(wrap("  "), null, null, controller)).to.equal(true);
		expect(isEmpty(wrap("not empty string"), null, null, controller)).to.equal(false);
		// object cases
		expect(isEmpty(wrap(1, "textfield"), null, null, controller)).to.equal(false);
		expect(isEmpty(wrap([]), null, null, controller)).to.equal(true);
		expect(isEmpty(wrap({ temp: "value" }), null, null, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(isEmpty(wrap(emptyFunc), null, null, controller)).to.equal(true);
	});


});
