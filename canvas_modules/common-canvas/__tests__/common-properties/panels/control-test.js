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

import propertyUtils from "./../../_utils_/property-utils";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

import { expect } from "chai";

describe("control panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the 1 control panel", () => {
		const controlPanel = wrapper.find("div[data-id='properties-selectcolumn-values']");
		// should render 1 control panel
		expect(controlPanel.find("div.properties-control-panel")).to.have.length(1);
	});
});

describe("control panel visible and enabled conditions work correctly", () => {
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

	it("control panel and controls should be disabled", () => {
		let controlPanel = wrapper.find("div[data-id='properties-selectcolumn-values']");
		expect(controlPanel.prop("disabled")).to.equal(false);
		// check initial state of enabled
		controller.updatePropertyValue({ name: "disableColumnSelectionPanel" }, true);
		wrapper.update();
		controlPanel = wrapper.find("div[data-id='properties-selectcolumn-values']");
		expect(controlPanel.prop("disabled")).to.equal(true);
	});

	it("control panel and controls should be hidden", () => {
		let controlPanel = wrapper.find("div[data-id='properties-column-selection-panel']");
		expect(controlPanel.hasClass("hide")).to.equal(false);
		controller.updatePropertyValue({ name: "hideColumnSelectionPanel" }, true);
		wrapper.update();
		controlPanel = wrapper.find("div[data-id='properties-column-selection-panel']");
		expect(controlPanel.hasClass("hide")).to.equal(true);
	});
});

describe("control panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("control panels should have custom classname defined", () => {
		// nested panel: controls
		expect(wrapper.find(".textpanels-group-controls-class")).to.have.length(1);
		// deeply nested panel: controls
		expect(wrapper.find(".disable-button-control-panel-group-controls-class")).to.have.length(1);
		// nested panel without a type defined, will default to controls
		propertyUtils.openSummaryPanel(wrapper, "structuretable-summary-panel2");
		expect(wrapper.find(".structuretable-summary2-panel-category-group-controls-class")).to.have.length(1);
	});
});
