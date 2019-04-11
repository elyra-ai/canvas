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


describe("validating cellNotEmpty operator works correctly", () => {
	const controller = new Controller();
	const cellNotEmpty = controller.getConditionOp("cellNotEmpty");

	function wrap(val, role) {
		return { value: val, control: { controlType: role } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test cellNotEmpty behaves as expected", () => {
		expect(cellNotEmpty(wrap("not empty", "structuretable"), null, null, controller)).to.equal(true);
		expect(cellNotEmpty(wrap(null, "structuretable"), null, null, controller)).to.equal(false);
		// defaults to true. TODO: get sinon-chai package approved so that console output can be checked for expected warnings
		expect(cellNotEmpty(wrap("not empty", "wrongcontrol"), null, null, controller)).to.equal(true);
	});


});
