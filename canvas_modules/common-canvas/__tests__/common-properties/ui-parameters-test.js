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
import propertyUtilsRTL from "../_utils_/property-utilsRTL";
import { expect } from "chai";
import { cleanup, fireEvent } from "@testing-library/react";

function applyPropertyChanges(form, appData, additionalInfo, undoInfo, uiProperties) {
	const expectedUiProperties = {
		uiOnlyField1: "My new value",
		uiOnlyField2: ["alpha", "beta", "gamma", "delta"],
		uiOnlyField3: 23
	};
	expect(uiProperties).to.eql(expectedUiProperties);
}

describe("Ui parameters render from paramdef", () => {
	let wrapper;
	let renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(uiItemsParamDef);
		wrapper = renderedObject.wrapper;
		renderedController = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("Ui parameters should be treated as normal parameters in controller", () => {
		const expectedProperties = {
			uiOnlyField1: "test",
			uiOnlyField2: ["alpha", "beta", "gamma", "delta"],
			uiOnlyField3: 23,
			radioset: "Include",
			textfield: ""
		};
		expect(renderedController.getPropertyValues()).to.eql(expectedProperties);
	});

	it("Ui parameters should be rendered as specified", () => {
		const { container } = wrapper;
		const uiParamDiv = container.querySelector("div[data-id='properties-uiOnlyField3']");
		expect(uiParamDiv.querySelectorAll("div[data-id='properties-uiOnlyField3']")).to.exist;
	});

});

describe("Ui parameters are returned correctly", () => {

	it("Change a UI only property and make sure it is returned in callback", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(uiItemsParamDef, null, { applyPropertyChanges: applyPropertyChanges });
		const wrapper = renderedObject.wrapper;
		// change one of the ui properties values
		const { container } = wrapper;
		const uiParamDiv = container.querySelectorAll("div[data-id='properties-uiOnlyField1']");
		expect(uiParamDiv).to.have.length(1);
		const uiParamDivInput = container.querySelector("div[data-id='properties-uiOnlyField1']");
		const input = uiParamDivInput.querySelectorAll("input");
		fireEvent.change(input[0], { target: { value: "My new value" } });
		// close the common properties edit
		const closeIcon = container.querySelector("div.properties-close-button");
		const closeIconButton = closeIcon.querySelectorAll("button");
		fireEvent.click(closeIconButton[0]);
		// validation is in the applyPropertiesChanges function above
	});
});

