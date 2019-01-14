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

describe("validating dmMeasurementNotEquals operators works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const measurementNotEquals = controller.getConditionOp("dmMeasurementNotEquals");

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

	it("Test dmMeasurementNotEquals behaves as expected", () => {
		expect(measurementNotEquals(wrapParam("Age"), null, "range", controller)).to.equal(false);
		expect(measurementNotEquals(wrapParam("Na"), wrap("range"), null, controller)).to.equal(false);
		expect(measurementNotEquals(wrap("Cholesterol"), null, "discrete", controller)).to.equal(false);
		expect(measurementNotEquals(badWrap("Drug"), null, "range", controller)).to.equal(true);
		expect(measurementNotEquals(wrap("K"), wrap("discrete"), null, controller)).to.equal(true);
		expect(measurementNotEquals(wrapParam("Cholesterol"), wrap("discrete"), null, controller)).to.equal(false);
	});

});
