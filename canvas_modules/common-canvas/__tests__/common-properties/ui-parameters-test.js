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

import uiItemsParamDef from "../test_resources/paramDefs/uiItems_paramDef.json";
import propertyUtils from "../_utils_/property-utils";
import { expect } from "chai";

function applyPropertyChanges(form, appData, additionalInfo, undoInfo, uiProperties) {
	const expectedUiProperties = {
		uiOnlyField1: "My new value",
		uiOnlyField2: ["alpha", "beta", "gamma", "delta"],
		uiOnlyField3: 23 };
	expect(uiProperties).to.eql(expectedUiProperties);
}

describe("Ui parameters render from paramdef", () => {
	var wrapper;
	var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(uiItemsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Ui parameters should be treated as normal parameters in controller", () => {
		const expectedProperties = { uiOnlyField1: "test",
			uiOnlyField2: ["alpha", "beta", "gamma", "delta"],
			uiOnlyField3: 23,
			radioset: "Include",
			textfield: "" };
		expect(renderedController.getPropertyValues()).to.eql(expectedProperties);
	});

	it("Ui parameters should be rendered as specified", () => {
		// ensure the 3rd property rendered as a Numberfield control.
		const uiParamDiv = wrapper.find("div[data-id='properties-uiOnlyField3']");
		expect(uiParamDiv.find("div.properties-numberfield")).to.have.length(1);
	});

});

describe("Ui parameters are returned correctly", () => {

	it("Change a UI only property and make sure it is returned in callback", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(uiItemsParamDef, null, { applyPropertyChanges: applyPropertyChanges });
		const wrapper = renderedObject.wrapper;
		// change one of the ui properties values
		const uiParamDiv = wrapper.find("div[data-id='properties-uiOnlyField1']");
		expect(uiParamDiv).to.have.length(1);
		const input = uiParamDiv.find("input");
		input.simulate("change", { target: { value: "My new value" } });
		// close the common properties edit
		const closeIcon = wrapper.find("div.properties-close-button").find("button");
		closeIcon.simulate("click");
		// validation is in the applyPropertiesChanges function above
	});
});
