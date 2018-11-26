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
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import propertyUtils from "../../_utils_/property-utils";

describe("validating colNotExists operator works correctly", () => {
	const controller = new Controller();
	controller.setDatasetMetadata(dataset);
	const colNotExists = controller.getConditionOp("colNotExists");

	function genParamInfo(value) {
		return { value: value, control: { controlType: "textfield" } };
	}

	it("Test colNotExists works as expected with single dataModel", () => {
		// column already exists in dataModel
		expect(colNotExists(genParamInfo("Age"), null, null, controller)).to.equal(false);
		// column does not exist in dataModel
		expect(colNotExists(genParamInfo("Age-new"), null, null, controller)).to.equal(true);
		// unsupported control.  Throws a console warning.
		expect(colNotExists({ value: "Age", control: { controlType: "numberfield" } }, null, null, controller)).to.equal(true);
	});

});

describe("validating colNotExists operator works correctly in a table", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("colNotExists works correctly when in a table cell", () => {
		const cellId = { name: "structuretableRenameFields", row: 0, col: 1 };
		expect(renderedController.getErrorMessage(cellId)).to.equal(null);
		// update value in cell to match the a dataModel value outside of current row
		renderedController.updatePropertyValue(cellId, "Ag");
		const expectedError = {
			"type": "error",
			"text": "The given column name is already in use",
			"validation_id": "structuretableRenameFields"
		};
		expect(renderedController.getErrorMessage(cellId)).to.eql(expectedError);
		// update value in cell to match the a dataModel value in current row
		renderedController.updatePropertyValue(cellId, "Age");
		expect(renderedController.getErrorMessage(cellId)).to.be.undefined;
	});

});
