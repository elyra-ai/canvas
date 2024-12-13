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

import { expect } from "chai";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";

describe("textPanel render correctly", () => {
	let renderedObject;
	let wrapper;

	beforeEach(() => {
		renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed correct number of textPanel elements", () => {
		const { container } = wrapper;
		const panel = container.querySelector("div[data-id='properties-text-panels']");
		const staticText = panel.querySelectorAll("div.properties-text-panel");
		expect(staticText).to.have.length(5);
		const labels = panel.querySelectorAll("div.panel-label");
		expect(labels).to.have.length(5);
		// 3 on_panel descriptions
		const descriptions = panel.querySelectorAll("div.panel-description");
		expect(descriptions).to.have.length(3);
		// 1 tooltip description
		const tooltipDescription = panel.querySelectorAll("div.properties-text-panel div.properties-label-container");
		expect(tooltipDescription).to.have.length(1);
	});
	it("should have displayed correct text in textPanel elements", () => {
		const { container } = wrapper;
		let panel = container.querySelector("div[data-id='properties-text-panels']");
		const labels = panel.querySelectorAll("div.panel-label");
		expect(labels[0].textContent).to.equal("Oranges");
		let descriptions = panel.querySelectorAll("div.panel-description");
		expect(descriptions[0].textContent).to.equal("An orange tree can grow to reach 30 feet and live for over a hundred years.");
		expect(descriptions[1].textContent).to.equal("Percent: 9.090909 with 6 decimals. Percent: 9.09 with 2 decimals");
		expect(descriptions[2].textContent).to.equal("Sum: 22 with (number, number). Sum: 24 with (number, 2, number)");
		const input = panel.querySelector("[type='number']");
		expect(input.tagName.toLowerCase()).to.equal("input");
		fireEvent.change(input, { target: { value: 0.52, } }); // validity has only getter function
		panel = container.querySelector("div[data-id='properties-text-panels']");
		descriptions = panel.querySelectorAll("div.panel-description");
		expect(descriptions[1].textContent).to.equal("Percent: 192.307692 with 6 decimals. Percent: 192.31 with 2 decimals");
		expect(descriptions[2].textContent).to.equal("Sum: 1.04 with (number, number). Sum: 3.04 with (number, 2, number)");
	});
	it("should not show a description when one isn't provided", () => {
		const { container } = wrapper;
		const panel = container.querySelector("div[data-id='properties-text-panels']");
		const textPanel = panel.querySelectorAll("div.properties-text-panel")[4]; // panel without description
		expect(textPanel.querySelector("div.panel-label").textContent).to.equal("This panel shouldn't have a description");
		const panelDescription = textPanel.querySelectorAll("div.panel-description");
		expect(panelDescription).to.have.length(0);
	});
	it("should have displayed textPanel description in tooltip", async() => {
		const { container } = wrapper;
		const textPanel = container.querySelectorAll(".properties-text-panel")[1]; // panel with description in tooltip
		const textLabel = textPanel.querySelector(".panel-label");
		expect(textLabel.textContent).to.equal("Avocados");
		const labelContainer = textPanel.querySelectorAll(".properties-label-container");
		expect(labelContainer).to.have.length(1);
		// Show description in tooltip
		const tooltipTrigger = textPanel.querySelector(".tooltip-trigger");
		expect(tooltipTrigger).to.not.be.null;
		const tooltipId = tooltipTrigger.getAttribute("aria-labelledby");
		expect(tooltipId).to.not.be.null;
		fireEvent.click(tooltipTrigger);
		await waitFor(() => {
			const textPanelTooltip = document.querySelector(`div[data-id='${tooltipId}']`);
			expect(textPanelTooltip).to.not.be.null;
			const ariaHidden = textPanelTooltip.getAttribute("aria-hidden");
			expect(ariaHidden).to.equal("false");
			expect(textPanelTooltip.textContent).to.equal("An avocado tree can range from 15 to 30 feet tall.");
		});
	});
});

describe("text panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let panels;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const textPanelcategory = container.querySelectorAll("div.properties-category-container")[2]; // TEXT PANEL category
		panels = textPanelcategory.querySelectorAll("div.properties-text-panel");
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("text panel should be disabled", () => {
		expect(panels).to.have.length(2);
		// initially set to visible since there is a primary panel hidden condition
		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("visible");
		controller.updatePropertyValue({ name: "disableTextPanel" }, true);
		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("disabled");
	});

	it("text panel should be hidden", () => {
		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("visible");
		controller.updatePropertyValue({ name: "hideTextPanel" }, true);
		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("hidden");
	});
});

describe("text panel classNames applied correctly", () => {
	let wrapper;
	let panels;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("text panel should have custom classname defined", () => {
		const { container } = wrapper;
		panels = container.querySelectorAll("div.properties-text-panel");
		expect(panels[0].className.includes("orange-panel-group-textpanel-class")).to.equal(true);
		// textPanel within a panelSelector
		expect(panels[4].className.includes("panel-selector-fields1-red1-group-textpanel-class")).to.equal(true);
		// deeply nested textpanel group
		expect(panels[9].className.includes("level3-group-textpanel-class")).to.equal(true);
	});
});

