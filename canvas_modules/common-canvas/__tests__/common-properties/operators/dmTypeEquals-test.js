/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import dataset from "../../test_resources/json/deriveDatasetMetadata.json";

describe("validating dmTypeEquals and dmTypeNotEquals operators work correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const typeEquals = controller.getConditionOp("dmTypeEquals");
	const typeNotEquals = controller.getConditionOp("dmTypeNotEquals");

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

	it("Test dmTypeEquals behaves as expected", () => {
		expect(typeEquals(wrapParam("Age"), null, "integer", controller)).to.equal(true);
		expect(typeEquals(wrapParam("Na"), wrap("double"), null, controller)).to.equal(true);
		expect(typeEquals(wrap("Cholesterol"), null, "string", controller)).to.equal(true);
		expect(typeEquals(badWrap("Drug"), null, "string", controller)).to.equal(true);
		expect(typeEquals(wrap("K"), wrap("string"), null, controller)).to.equal(false);
		expect(typeEquals(wrapParam("Cholesterol"), wrap("string"), null, controller)).to.equal(true);
	});
	it("Test dmTypeNotEquals behaves as expected", () => {
		expect(typeNotEquals(wrapParam("Age"), null, "integer", controller)).to.equal(false);
		expect(typeNotEquals(wrapParam("Na"), wrap("double"), null, controller)).to.equal(false);
		expect(typeNotEquals(wrap("Cholesterol"), null, "string", controller)).to.equal(false);
		expect(typeNotEquals(badWrap("Drug"), null, "integer", controller)).to.equal(true);
		expect(typeNotEquals(wrap("K"), wrap("string"), null, controller)).to.equal(true);
		expect(typeNotEquals(wrapParam("Cholesterol"), wrap("string"), null, controller)).to.equal(false);
	});

});
