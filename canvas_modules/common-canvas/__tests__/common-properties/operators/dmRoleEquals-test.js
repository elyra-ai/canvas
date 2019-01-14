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
import dataset from "../../test_resources/json/deriveDatasetMetadata.json";

describe("validating dmRoleEquals operator works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const roleEquals = controller.getConditionOp("dmRoleEquals");

	function wrapParam(desc) {
		return { value: { link_ref: "0", field_name: desc }, control: { role: "column" } };
	}

	function badWrap(desc) {
		return { value: desc, control: { role: "checkbox" } };
	}

	function wrap(desc) {
		return { value: desc, control: { role: "column" } };
	}

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
	});

	it("Test dmRoleEquals behaves as expected", () => {
		expect(roleEquals(wrapParam("Age"), null, "input", controller)).to.equal(true);
		expect(roleEquals(wrapParam("Na"), wrap("input"), null, controller)).to.equal(true);
		expect(roleEquals(wrap("Cholesterol"), null, "input", controller)).to.equal(true);
		expect(roleEquals(badWrap("Drug"), null, "partition", controller)).to.equal(false);
	});

});
