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
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

import { expect } from "chai";

describe("column panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the column panel with 2 sub panels", () => {
		const columnPanel = wrapper.find("div[data-id='properties-panel-columns']");
		// should render 2 control panels
		expect(columnPanel.find("div.properties-control-panel")).to.have.length(2);
		// each column adds a new `auto` to grid
		expect(columnPanel.get(0).props.style).to.have.property("gridTemplateColumns", "1fr 1fr");
	});
});

describe("column panel visible and enabled conditions work correctly", () => {
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

	it("column panel and controls should be disabled", () => {
		let columnPanel = wrapper.find("div[data-id='properties-column-panels-cond']");
		expect(columnPanel.prop("disabled")).to.equal(false);
		// check initial state of enabled
		controller.updatePropertyValue({ name: "colDisable" }, true);
		wrapper.update();
		columnPanel = wrapper.find("div[data-id='properties-column-panels-cond']");
		expect(columnPanel.prop("disabled")).to.equal(true);
	});

	it("column panel and controls should be hidden", () => {
		let columnPanel = wrapper.find("div[data-id='properties-column-panels-cond']");
		expect(columnPanel.hasClass("hide")).to.equal(false);
		controller.updatePropertyValue({ name: "colHide" }, true);
		wrapper.update();
		columnPanel = wrapper.find("div[data-id='properties-column-panels-cond']");
		expect(columnPanel.hasClass("hide")).to.equal(true);
	});
});

describe("column panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("column panel should have custom classname defined", () => {
		const columnPanelWrapper = wrapper.find("div[data-id='properties-column-panels']");
		expect(columnPanelWrapper.find(".column-panels-cond-group-columnpanel-class")).to.have.length(1);
	});
});
