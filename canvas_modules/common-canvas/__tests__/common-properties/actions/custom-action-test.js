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

// import React from "react";
import { expect } from "chai";
// import sinon from "sinon";
// import Controller from "../../../src/common-properties/properties-controller";
import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { prettyDOM } from "@testing-library/dom";
import { fireEvent, within, waitFor } from "@testing-library/react";

describe("custom action renders correctly", () => {
	let wrapper;
	// let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ACTION_PARAMDEF);
		wrapper = renderedObject.wrapper;
		// controller = renderedObject.controller;
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

	it.only("updating custom actions should work correctly", async() => {
		const { container } = wrapper;
		const customActionLeft = container.querySelectorAll("div.custom-action-left");
		expect(customActionLeft).to.have.length(1);
		// Readonly text shows default text
		const readonlyText = container.querySelector("div[data-id='properties-ctrl-readonly_text']").querySelector(".properties-field-type");
		expect(readonlyText.textContent).to.equal(ACTION_PARAMDEF.current_parameters.readonly_text);

		// Select 1st item from overflow menu
		const overflowMenuButton = within(customActionLeft[0]).getByRole("button");
		fireEvent.click(overflowMenuButton);

		await waitFor(() => {
			// const firstMenuItem = container.querySelectorAll("button.overflow-menu-item");
			const firstMenuItem = container.querySelector("ul.cds--overflow-menu-options");
			console.log(prettyDOM(firstMenuItem));
		});
		
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
