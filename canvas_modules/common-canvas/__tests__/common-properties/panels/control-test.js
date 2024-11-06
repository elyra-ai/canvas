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

import { cleanup, waitFor } from "@testing-library/react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import "@testing-library/jest-dom";
import { expect } from "chai";

describe("control panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed the 1 control panel", () => {
		const { container } = wrapper;
		const controlPanel = container.querySelector("div[data-id='properties-selectcolumn-values']");
		// should render 1 control panel
		const controlPanels = controlPanel.querySelectorAll("div.properties-control-panel");
		expect(controlPanels).to.not.be.null;

	});
});

describe("control panel visible and enabled conditions work correctly", () => {
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

	it("control panel and controls should be disabled", async() => {
		const { container } = wrapper;
		const controlPanel = container.querySelector("div[data-id='properties-selectcolumn-values']");
		expect(controlPanel.classList.contains("disabled")).to.equal(false);
		// check initial state of enabled
		controller.updatePropertyValue({ name: "disableColumnSelectionPanel" }, true);
		await waitFor(() => {
			const updatedControlPanel = container.querySelector("div[data-id='properties-selectcolumn-values']");
			expect(updatedControlPanel.hasAttribute("disabled")).to.equal(true);
		});
	});

	it("control panel and controls should be hidden", async() => {
		const { container } = wrapper;
		let controlPanel = container.querySelector("div[data-id='properties-column-selection-panel']");
		expect(controlPanel.classList.contains("hide")).to.equal(false);
		controller.updatePropertyValue({ name: "hideColumnSelectionPanel" }, true);
		await waitFor(() => {
			controlPanel = container.querySelector("div[data-id='properties-column-selection-panel']");
			expect(controlPanel.classList.contains("hide")).to.equal(true);
		});
	});
});

describe("control panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("control panels should have custom classname defined", () => {
		const { container } = wrapper;
		// nested panel: controls
		expect(container.querySelectorAll(".textpanels-group-controls-class")).to.have.length(1);
		// deeply nested panel: controls
		expect(container.querySelectorAll(".disable-button-control-panel-group-controls-class")).to.have.length(1);
		// nested panel without a type defined, will default to controls
		propertyUtilsRTL.openSummaryPanel(wrapper, "structuretable-summary-panel2");
		expect(container.querySelectorAll(".structuretable-summary2-panel-category-group-controls-class")).to.have.length(1);
	});
});
