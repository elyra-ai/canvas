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


describe("validating notContains operator works correctly", () => {
	const controller = new Controller();
	const notContains = controller.getConditionOp("notContains");
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

	it("Test notContains behaves as expected for edge cases", () => {
		// passwordfield can't use notContains, defaults to true
		expect(notContains(wrap(undefinedPlaceholder, "passwordfield"), null, null, controller)).to.equal(true);
		expect(function() {
			notContains(wrap(undefinedPlaceholder), undefinedPlaceholder, undefinedPlaceholder, controller);
		}).to.throw();
	});

	it("Test notContains behaves as expected comparing paramInfo and paramInfo2", () => {
		expect(notContains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(true);
		expect(notContains(wrap("she believed"), wrap("sbeve"), null, controller)).to.equal(true);
		expect(notContains(wrap("sbeve"), wrap("be"), null, controller)).to.equal(false);
		expect(notContains(wrap(null), wrap(null), null, controller)).to.equal(true);
		expect(notContains(wrap([1, 2, 3]), wrap(2), null, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(notContains(wrap(emptyFunc), wrap("string"), null, controller)).to.equal(true);
	});

	it("Test notContains behaves as expected comparing paramInfo and value", () => {
		expect(notContains(wrap(undefinedPlaceholder), null, null, controller)).to.equal(true);
		expect(notContains(wrap("she believed"), undefinedPlaceholder, "sbeve", controller)).to.equal(true);
		expect(notContains(wrap("sbeve"), undefinedPlaceholder, "be", controller)).to.equal(false);
		expect(notContains(wrap(null), undefinedPlaceholder, null, controller)).to.equal(true);
		expect(notContains(wrap([1, 2, 3]), undefinedPlaceholder, 2, controller)).to.equal(false);
		// pass in a function as a way to hit the default switch case
		expect(notContains(wrap(emptyFunc), undefinedPlaceholder, "string", controller)).to.equal(true);
	});


});
