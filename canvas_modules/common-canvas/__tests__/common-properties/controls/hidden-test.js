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

/* eslint no-sparse-arrays: "off"*/

import { expect } from "chai";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import hiddenParamDef from "../../test_resources/paramDefs/hidden_paramDef.json";
import { fireEvent } from "@testing-library/react";

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("hidden control works correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(hiddenParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate hidden control isn't shown", () => {
		const { container } = wrapper;
		const hiddenPropertyId = { name: "hidden" };
		const hiddenControl = container.querySelector("div[data-id='properties-hidden']");
		expect(hiddenControl).not.to.be.undefined;
		// should still set/get value correctly
		expect(controller.getPropertyValue(hiddenPropertyId)).to.equal("hidden");
		// expect control item for the textfield control, table in paramDef, and textfield control in table
		expect(container.querySelectorAll("div.properties-control-item")).to.have.length(3);
	});

	it("validate hidden table control isn't shown", () => {
		const { container } = wrapper;
		const hiddenControl = container.querySelector("div[data-id='properties-hidden_table_ctl']");
		expect(hiddenControl).not.to.be.undefined;
	});


	it("validate hidden table control isn't shown", () => {
		const { container } = wrapper;
		const hiddenPropertyId = { name: "hidden_table" };
		// validate only 1 cell value is visible
		expect(container.querySelectorAll("div.properties-table-cell-control")).to.have.length(1);
		// validate only 1 header for textfield
		expect(container.querySelectorAll("th.properties-vt-column")).to.have.length(2); // checkbox and 'textfield' columns
		fireEvent.click(container.querySelector("button.properties-add-fields-button"));
		fireEvent.change(container.querySelector("div[data-id='properties-hidden_table_1_1'] input"), { target: { value: "My new value" } });
		expect(controller.getPropertyValue(hiddenPropertyId)).to.eql([["Hopper", "Turing"], [, "My new value"]]);
	});

});

describe("hidden classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(hiddenParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("hidden should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".hidden-control-class")).to.have.length(1);
	});

	it("hidden should not have custom classname defined in table cells", () => {
		const { container } = wrapper;
		// hidden controls are not rendered in table, classname should not be found
		expect(container.querySelectorAll(".table-hidden-control-class")).to.have.length(0);
	});
});
