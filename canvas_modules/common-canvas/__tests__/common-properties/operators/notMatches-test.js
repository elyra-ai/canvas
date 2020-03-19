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


describe("validating notMatches operator works correctly", () => {
	const controller = new Controller();
	const notMatches = controller.getConditionOp("notMatches");

	function wrapParam(desc) {
		return { value: desc, control: { controlType: "string" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test notMatches behaves as expected", () => {
		expect(notMatches(wrapParam("foob"), null, "foo?b", controller)).to.equal(false);
		expect(notMatches(wrapParam("foob"), wrapParam("foo?b"), null, controller)).to.equal(false);
		expect(notMatches(wrapParam("foooob"), null, "^g", controller)).to.equal(true);
		expect(notMatches(wrapParam("foooob"), wrapParam("^g"), null, controller)).to.equal(true);
		expect(notMatches(wrapParam(), null, "foo", controller)).to.equal(true);
		expect(notMatches(wrapParam(""), null, "foo", controller)).to.equal(true);

		// error test cases.  These generate a console.log warning and return true.
		expect(notMatches(wrapParam("foooob"), null, null, controller)).to.equal(true);
		expect(notMatches(wrapParam(1), null, "foo", controller)).to.equal(true);
	});

});
