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


describe("validating matches operator works correctly", () => {
	const controller = new Controller();
	const matches = controller.getConditionOp("matches");

	function wrapParam(desc) {
		return { value: desc, param: "test", control: { controlType: "string" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test matches behaves as expected", () => {
		expect(matches(wrapParam("foo bar"), null, "foo", controller)).to.equal(true);
		expect(matches(wrapParam("foo bar"), wrapParam("foo"), null, controller)).to.equal(true);
		expect(matches(wrapParam("bar bar"), null, "foo", controller)).to.equal(false);
		expect(matches(wrapParam("bar bar"), wrapParam("foo"), null, controller)).to.equal(false);
		expect(matches(wrapParam("foob"), null, "foo?b", controller)).to.equal(true);
		expect(matches(wrapParam("foob"), wrapParam("foo?b"), null, controller)).to.equal(true);
		expect(matches(wrapParam("foooob"), null, "foo?b", controller)).to.equal(false);
		expect(matches(wrapParam("foooob"), wrapParam("foo?b"), null, controller)).to.equal(false);

		// error test cases.  These generate a console.log warning and return true.
		expect(matches(wrapParam("foooob"), null, null, controller)).to.equal(true);
		expect(matches(wrapParam(1), null, "foo", controller)).to.equal(true);
	});

});
