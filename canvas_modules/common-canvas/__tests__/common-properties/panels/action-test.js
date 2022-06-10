/*
 * Copyright 2017-2022 Elyra Authors
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
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

describe("action panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("action panels should be hidden", () => {
		const category = wrapper.find("div[data-id='properties-action-panels']");
		const hiddenCheckbox = category.find("div[data-id='properties-actionHide'] input");
		expect(hiddenCheckbox.props().checked).to.equal(false);
		expect(wrapper.find("div.properties-action-panel .hide")).to.have.length(0);
		// hide action panel
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");
		// action panel should be hidden "hidden"
		expect(controller.getPanelState({ name: "action-buttons-panel" })).to.equal("hidden");
		expect(wrapper.find("div.properties-action-panel.hide")).to.have.length(1);
	});
	it("action panels should be disabled", () => {
		const category = wrapper.find("div[data-id='properties-action-panels']");
		const disableCheckbox = category.find("div[data-id='properties-actionDisable'] input");
		expect(disableCheckbox.props().checked).to.equal(false);
		expect(wrapper.find("div[data-id='properties-action-buttons-panel']").prop("disabled")).to.equal(false);
		// hide action panel
		disableCheckbox.getDOMNode().checked = true;
		disableCheckbox.simulate("change");

		// action panel should be hidden "hidden"
		expect(controller.getPanelState({ name: "action-buttons-panel" })).to.equal("disabled");
		expect(wrapper.find("div[data-id='properties-action-buttons-panel']").prop("disabled")).to.equal(true);
	});
	it("action panels should have label and description", () => {
		const actionPanel = wrapper.find("div[data-id='properties-action-buttons-panel']");
		const labelContainer = actionPanel.find(".properties-label-container");
		expect(labelContainer).to.have.length(1);
		// Verify label
		expect(labelContainer.find("label.properties-control-label").text()).to.equal("Action panel label");

		// Verify description in tooltip
		const tooltip = labelContainer.find("div.tooltip-container");
		expect(tooltip).to.have.length(1);
		// tooltip icon
		expect(tooltip.find("svg.canvas-state-icon-information-hollow")).to.have.length(1);
		// tooltip text
		expect(tooltip.find("div.common-canvas-tooltip span").text()).to.equal("Action panel description");
	});
});

describe("action panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("action panel should have custom classname defined", () => {
		const actionPanelWrapper = wrapper.find("div[data-id='properties-action-panels']");
		expect(actionPanelWrapper.find(".action-buttons-panel-group-actionpanel-class")).to.have.length(1);
	});

	it("nested action panel should have custom classname defined", () => {
		const panelsWrapper = wrapper.find("div[data-id='properties-panels-in-panels']");
		expect(panelsWrapper.find(".disable-button-action-panel-group-actionpanel-class")).to.have.length(1);
	});
});
