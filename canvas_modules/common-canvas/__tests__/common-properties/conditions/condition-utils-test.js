/*
 * Copyright 2017-2025 Elyra Authors
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
import { validateInput } from "./../../../src/common-properties/ui-conditions/conditions-utils.js";
import propertyUtilsRTL from "./../../_utils_/property-utilsRTL";
import readOnlyParamDef from "./../../test_resources/paramDefs/readonly_paramDef.json";
import { fireEvent } from "@testing-library/react";


describe("validateInput validates input and updates controller correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(readOnlyParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
		controller.setErrorMessages({});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validateInput will update controller error messages when multiple error messages are present in a validation set", () => {
		const summaryPanelTable = propertyUtilsRTL.openSummaryPanel(wrapper, "readonly-table-summary");
		let messages = controller.getErrorMessages();
		expect(JSON.stringify(messages)).to.equal(JSON.stringify({}));
		const propId = { name: "readonly_table_cond", row: 0, col: 0 };
		const control = controller.getControl(propId);
		const rowOneCheckbox = summaryPanelTable.querySelectorAll("input[type='checkbox']")[5];
		rowOneCheckbox.setAttribute("checked", false);
		fireEvent.click(rowOneCheckbox);
		validateInput(propId, controller, control);
		let expected =
			{
				"0": {
					"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond",
						propertyId: {
							name: "readonly_table_cond",
							col: 1,
							row: 0
						}, required: false },
					"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond",
						propertyId: {
							name: "readonly_table_cond",
							col: 2,
							row: 0
						}, required: false }
				}
			};
		messages = controller.getErrorMessages();
		expect(JSON.stringify(messages.readonly_table_cond)).to.eql(JSON.stringify(expected));
		const rowTwoCheckbox = summaryPanelTable.querySelectorAll("input[type='checkbox']")[7];
		rowTwoCheckbox.setAttribute("checked", true);
		fireEvent.click(rowTwoCheckbox);
		rowTwoCheckbox.setAttribute("checked", false);
		fireEvent.click(rowTwoCheckbox);
		validateInput(propId, controller, control);
		expected =
				{
					"0": {
						"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond",
							propertyId: { "name": "readonly_table_cond", "row": 0, "col": 1 }, required: false },
						"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond",
							propertyId: { "name": "readonly_table_cond", "row": 0, "col": 2 }, required: false } },
					"1": {
						"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond",
							propertyId: { "name": "readonly_table_cond", "row": 1, "col": 1 }, required: false },
						"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond",
							propertyId: { "name": "readonly_table_cond", "row": 1, "col": 2 }, required: false } } };
		messages = controller.getErrorMessages();
		expect(messages.readonly_table_cond).to.eql(expected);
	});
});
