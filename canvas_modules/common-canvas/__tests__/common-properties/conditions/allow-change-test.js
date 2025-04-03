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
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { expect } from "chai";
import structuretableParamDef from "../../test_resources/paramDefs/structuretable_paramDef.json";
import { fireEvent } from "@testing-library/react";


describe("Condition allow_change test cases", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structuretableParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});


	it("Test the not allow a change to a field.", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		// select the first row in the table
		const tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		fireEvent.click(tableRows[0]);
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		const sportPropertyId = {
			name: "ST_mse_table",
			row: 0,
			col: 2
		};
		const textPropertyId = {
			name: "ST_mse_table",
			row: 0,
			col: 5
		};
		expect(controller.getPropertyValue(sportPropertyId)).to.equal("Soccer");
		expect(controller.getPropertyValue(textPropertyId)).to.equal("European");

		// attempt to change the sport field to "Football"
		const toggleWrapper = container.querySelector("div[data-id='properties-ST_mse_table_0_2']");
		const button = toggleWrapper.querySelector("button");
		fireEvent.click(button);
		// change is not allowed.
		expect(controller.getPropertyValue(sportPropertyId)).to.equal("Soccer");
	});
	it("Test the allow a change to a field.", () => {
		const { container } = wrapper;
		let summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		// select the first row in the table
		const tableRows = tableUtilsRTL.getTableRows(summaryPanel);
		expect(tableRows).to.have.length(4);
		fireEvent.click(tableRows[0]);
		// tableRows.at(0).simulate("click");
		summaryPanel = propertyUtilsRTL.openSummaryPanel(wrapper, "ST_mse_table-summary-panel");

		const sportPropertyId = {
			name: "ST_mse_table",
			row: 2,
			col: 2
		};
		const textPropertyId = {
			name: "ST_mse_table",
			row: 2,
			col: 5
		};
		expect(controller.getPropertyValue(sportPropertyId)).to.equal("Soccer");
		expect(controller.getPropertyValue(textPropertyId)).to.equal("Canadian");

		// attempt to change the sport field to "Football"
		const toggleWrapper = container.querySelector("div[data-id='properties-ST_mse_table_2_2']");
		const button = toggleWrapper.querySelector("button");
		fireEvent.click(button);
		// change is allowed.
		expect(controller.getPropertyValue(sportPropertyId)).to.equal("Football");
	});
});
