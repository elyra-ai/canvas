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


import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { expect } from "chai";
import customControlParamDef from "../../test_resources/paramDefs/custom-ctrl-op_paramDef.json";
import { cleanup } from "@testing-library/react";

describe("validating custom operators work correctly", () => {
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(customControlParamDef);
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});
	it("custom_op_num parameter should have error when greater than 100 using a custom op", () => {
		const propertyId = { name: "custom_op_num" };
		let actual = controller.getErrorMessage(propertyId);
		expect(actual).to.equal(null);
		controller.updatePropertyValue(propertyId, 101);
		actual = controller.getErrorMessage(propertyId);
		const expected = {
			propertyId: {
				"name": "custom_op_num",
			},
			required: false,
			validation_id: "custom_op_num",
			type: "error",
			text: "Value needs to be less than 100"
		};
		expect(actual).to.eql(expected);
	});
});
