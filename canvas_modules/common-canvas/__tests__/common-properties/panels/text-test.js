/*
 * Copyright 2017-2020 IBM Corporation
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
import propertyUtils from "./../../_utils_/property-utils";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

describe("textPanel render correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
	const wrapper = renderedObject.wrapper;

	it("should have displayed correct number of textPanel elements", () => {
		const panel = wrapper.find("div[data-id='properties-text-panels']");
		const staticText = panel.find("div.properties-text-panel");
		expect(staticText).to.have.length(4);
		const labels = panel.find("div.panel-label");
		expect(labels).to.have.length(4);
		const descriptions = panel.find("div.panel-description");
		expect(descriptions).to.have.length(3);
	});
	it("should have displayed correct text in textPanel elements", () => {
		let panel = wrapper.find("div[data-id='properties-text-panels']");
		const labels = panel.find("div.panel-label");
		expect(labels.at(0).text()).to.equal("Oranges");
		let descriptions = panel.find("div.panel-description");
		expect(descriptions.at(0).text()).to.equal("An orange tree can grow to reach 30 feet and live for over a hundred years.");
		expect(descriptions.at(1).text()).to.equal("Percent: 9.090909 with 6 decimals. Percent: 9.09 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 22 with (number, number). Sum: 24 with (number, 2, number)");
		const input = panel.find("[type='number']");
		input.simulate("change", { target: { value: 0.52, validity: { badInput: false } } });
		panel = wrapper.find("div[data-id='properties-text-panels']");
		descriptions = panel.find("div.panel-description");
		expect(descriptions.at(1).text()).to.equal("Percent: 192.307692 with 6 decimals. Percent: 192.31 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 1.04 with (number, number). Sum: 3.04 with (number, 2, number)");
	});
	it("should not show a description when one isn't provided", () => {
		const panel = wrapper.find("div[data-id='properties-text-panels']");
		const textPanel = panel.find("div.properties-text-panel").at(3); // panel without description
		expect(textPanel.find("div.panel-label").text()).to.equal("This panel shouldn't have a description");
		expect(textPanel.find("div.panel-description")).to.have.length(0);
	});
});

describe("text panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let panels;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		const textPanelcategory = wrapper.find("div.properties-category-container").at(0); // TEXT PANEL category
		panels = textPanelcategory.find("div.properties-text-panel");
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("text panel should be disabled", () => {
		expect(panels).to.have.length(2);
		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("enabled");
		controller.updatePropertyValue({ name: "disableTextPanel" }, true);
		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("disabled");
	});

	it("text panel should be hidden", () => {
		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("visible");
		controller.updatePropertyValue({ name: "hideTextPanel" }, true);
		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("hidden");
	});
});
