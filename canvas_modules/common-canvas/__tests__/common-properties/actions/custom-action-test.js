/*
 * Copyright 2025 Elyra Authors
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
import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { fireEvent } from "@testing-library/react";

describe("custom action renders correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ACTION_PARAMDEF);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show the correct custom actions", () => {
		const { container } = wrapper;
		const customActions = container.querySelectorAll("div.properties-custom-action");
		expect(customActions).to.have.length(2);

		const customActionLeft = container.querySelectorAll("div.custom-action-left");
		expect(customActionLeft).to.have.length(1);

		const customActionRight = container.querySelectorAll("div.custom-action-right");
		expect(customActionRight).to.have.length(1);

		// Readonly text shows default text
		const readonlyText = container.querySelector("div[data-id='properties-ctrl-readonly_text']").querySelector(".properties-field-type");
		expect(readonlyText.textContent).to.equal(ACTION_PARAMDEF.current_parameters.readonly_text);
	});

	it("updating custom actions should work correctly", () => {
		const { container } = wrapper;
		const customActionLeft = container.querySelectorAll("div.custom-action-left");
		expect(customActionLeft).to.have.length(1);
		const customActionRight = container.querySelectorAll("div.custom-action-right");
		expect(customActionRight).to.have.length(1);
		// Readonly text shows default text
		const readonlyTextPropertyId = { name: "readonly_text" };
		let readonlyText = container.querySelector("div[data-id='properties-ctrl-readonly_text']").querySelector(".properties-field-type");
		expect(readonlyText.textContent).to.equal(ACTION_PARAMDEF.current_parameters.readonly_text);
		expect(controller.getPropertyValue(readonlyTextPropertyId)).to.equal(ACTION_PARAMDEF.current_parameters.readonly_text);

		// Select 1st item from overflow menu of custom action left
		let overflowMenuButton = customActionLeft[0].querySelector("button.harness-custom-action");
		fireEvent.click(overflowMenuButton);
		let dropdownList = container.querySelectorAll("li.cds--overflow-menu-options__option button");
		expect(dropdownList).to.be.length(2);
		fireEvent.click(dropdownList[0]);

		// then check for the text update
		readonlyText = container.querySelector("div[data-id='properties-ctrl-readonly_text']").querySelector(".properties-field-type");
		expect(readonlyText.textContent).to.equal("Menu item 1");
		expect(controller.getPropertyValue(readonlyTextPropertyId)).to.equal("Menu item 1");

		// Select 2nd item from overflow menu of custom action right
		overflowMenuButton = customActionRight[0].querySelector("button.harness-custom-action");
		fireEvent.click(overflowMenuButton);
		dropdownList = container.querySelectorAll("li.cds--overflow-menu-options__option button");
		expect(dropdownList).to.be.length(2);
		fireEvent.click(dropdownList[1]);

		// then check for the text update
		readonlyText = container.querySelector("div[data-id='properties-ctrl-readonly_text']").querySelector(".properties-field-type");
		expect(readonlyText.textContent).to.equal("Menu item 2");
		expect(controller.getPropertyValue(readonlyTextPropertyId)).to.equal("Menu item 2");
	});
});

describe("custom action classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ACTION_PARAMDEF);
		wrapper = renderedObject.wrapper;
	});

	it("custom action should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".custom-action-left")).to.have.length(1);
		expect(container.querySelectorAll(".custom-action-right")).to.have.length(1);
	});
});
