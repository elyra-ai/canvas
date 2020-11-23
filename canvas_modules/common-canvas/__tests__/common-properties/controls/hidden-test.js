/*
 * Copyright 2017-2020 Elyra Authors
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
import propertyUtils from "../../_utils_/property-utils";
import hiddenParamDef from "../../test_resources/paramDefs/hidden_paramDef.json";

describe("hidden control works correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(hiddenParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate hidden control isn't shown", () => {
		const hiddenPropertyId = { name: "hidden" };
		const hiddenControl = wrapper.find("div[data-id='properties-hidden']");
		expect(hiddenControl).not.to.be.undefined;
		// should still set/get value correctly
		expect(controller.getPropertyValue(hiddenPropertyId)).to.equal("hidden");
		// expect 1 control item for the textfield control and table in paramDef
		expect(wrapper.find("div.properties-control-item")).to.have.length(2);
	});

	it("validate hidden table control isn't shown", () => {
		const hiddenControl = wrapper.find("div[data-id='properties-hidden_table_ctl']");
		expect(hiddenControl).not.to.be.undefined;
	});


	it("validate hidden table control isn't shown", () => {
		const hiddenPropertyId = { name: "hidden_table" };
		// validate only 1 cell value is visible
		expect(wrapper.find("div.properties-table-cell-control")).to.have.length(1);
		// validate only 2 headers.  1 for textfield and other for scrollbar
		expect(wrapper.find("div.properties-vt-column")).to.have.length(2);
		wrapper.find("button.properties-add-fields-button").simulate("click");
		wrapper.find("div[data-id='properties-hidden_table_1_1'] input").simulate("change", { target: { value: "My new value" } });
		expect(controller.getPropertyValue(hiddenPropertyId)).to.eql([["Hopper", "Turing"], [, "My new value"]]);
	});

});
