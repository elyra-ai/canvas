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
import { fireEvent, waitFor, cleanup } from "@testing-library/react";
import { expect } from "chai";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

describe("action panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("action panels should be hidden", () => {
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-action-panels']");
		const hiddenCheckbox = category.querySelector("div[data-id='properties-actionHide'] input");
		expect(hiddenCheckbox.checked).to.equal(false);
		expect(container.querySelectorAll("div.properties-action-panel .hide")).to.have.length(0);

		// hide action panel
		fireEvent.click(hiddenCheckbox);

		// action panel should be hidden "hidden"
		expect(controller.getPanelState({ name: "action-buttons-panel" })).to.equal("hidden");
		expect(container.querySelectorAll("div.properties-action-panel.hide")).to.have.length(1);


	});
	it("action panels should be disabled", async() => {
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-action-panels']");
		const disableCheckbox = category.querySelector("div[data-id='properties-actionDisable'] input");
		expect(disableCheckbox.checked).to.equal(false);
		const actionPanel = container.querySelector("div[data-id='properties-action-buttons-panel']");
		expect(actionPanel.classList.contains("disabled")).to.equal(false);
		// hide action panel
		fireEvent.click(disableCheckbox);
		expect(disableCheckbox.checked).to.equal(true);
		// action panel should be hidden "hidden"
		await waitFor(() => {
			const actionPanelButton = container.querySelector("div[data-id='properties-action-buttons-panel']");
			expect(controller.getPanelState({ name: "action-buttons-panel" })).to.equal("disabled");
			expect(actionPanelButton.classList.contains("disabled"));
		});

	});
	it("action panels should have label and description", async() => {
		const { getByText, container } = wrapper;
		const actionPanel = container.querySelector("div[data-id='properties-action-buttons-panel']");
		const labelContainer = actionPanel.querySelectorAll(".properties-label-container");
		expect(labelContainer).to.have.length(1);
		const label = labelContainer[0].querySelector("label.properties-control-label");
		// Verify label
		expect(label.textContent).to.equal("Action panel label");

		// Verify description in tooltip
		const tooltip = labelContainer[0].querySelectorAll("div.tooltip-container");
		expect(tooltip).to.have.length(1);
		// tooltip icon
		const tooltipIcon = tooltip[0].querySelectorAll("svg.canvas-state-icon-information-hollow");
		expect(tooltipIcon).to.have.length(1);
		// tooltip text
		const tooltipText = getByText(/Action Panel description/i);
		expect(tooltipText).to.exist;

	});
});

describe("action panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("action panel should have custom classname defined", () => {
		const { container } = wrapper;
		const actionPanelWrapper = container.querySelector("div[data-id='properties-action-panels']");
		expect(actionPanelWrapper.querySelectorAll(".action-buttons-panel-group-actionpanel-class")).to.have.length(1);
	});

	it("nested action panel should have custom classname defined", () => {
		const { container } = wrapper;
		const panelsWrapper = container.querySelector("div[data-id='properties-panels-in-panels']");
		expect(panelsWrapper.querySelectorAll(".disable-button-action-panel-group-actionpanel-class")).to.have.length(1);
	});
});
