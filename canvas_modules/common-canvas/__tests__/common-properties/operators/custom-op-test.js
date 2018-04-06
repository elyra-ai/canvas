/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import customControlParamDef from "../../test_resources/paramDefs/custom_paramDef.json";

describe("validating custom operators work correctly", () => {
	var wrapper;
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(customControlParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("custom_op_num parameter should have error when greater than 100 using a custom op", () => {
		const propertyId = { name: "custom_op_num" };
		let actual = controller.getErrorMessage(propertyId);
		expect(actual).to.equal(null);
		controller.updatePropertyValue(propertyId, 101);
		actual = controller.getErrorMessage(propertyId);
		const expected = {
			validation_id: "custom_op_num",
			type: "error",
			text: "Value needs to be less than 100"
		};
		expect(actual).to.eql(expected);
	});
});
