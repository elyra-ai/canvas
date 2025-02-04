
/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import dataset from "../../test_resources/json/deriveDatasetMetadata.json";
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { cleanup } from "@testing-library/react";

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
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("colNotExists works correctly when in a table cell", () => {
		const cellId = { name: "structuretableRenameFields", row: 0, col: 1 };
		expect(renderedController.getErrorMessage(cellId)).to.equal(null);
		// update value in cell to match the a dataModel value outside of current row
		renderedController.updatePropertyValue(cellId, "Ag");
		const expectedError = {
			"propertyId": {
				"col": 1,
				"name": "structuretableRenameFields",
				"row": 0,
			},
			"required": false,
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

