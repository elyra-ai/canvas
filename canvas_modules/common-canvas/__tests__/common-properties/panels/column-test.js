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
import { cleanup, waitFor } from "@testing-library/react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";

describe("column panel renders correctly", () => {
	var wrapper;

	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {

		cleanup();
	});

	it("should have displayed the column panel with 2 sub panels", () => {
		const { container } = wrapper;
		const columnPanel = container.querySelector("div[data-id='properties-panel-columns']");
		expect(columnPanel).to.exist;
		// should render 2 control panels
		const controlPanels = columnPanel.querySelectorAll("div.properties-control-panel");
		expect(controlPanels.length).to.equal(2);
		// each column adds a new `auto` to grid
		expect(columnPanel.style.gridTemplateColumns).to.equal("1fr 1fr");
	});
});

describe("column panel visible and enabled conditions work correctly", () => {
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

	it("column panel and controls should be disabled", async() => {
		const { container } = wrapper;
		let columnPanel = container.querySelector("div[data-id='properties-column-panels-cond']");
		expect(columnPanel.hasAttribute("disabled")).to.equal(false);
		// check initial state of enabled
		controller.updatePropertyValue({ name: "colDisable" }, true);
		await waitFor(() => {
			columnPanel = container.querySelector("div[data-id='properties-column-panels-cond']");
			expect(columnPanel.hasAttribute("disabled")).to.equal(true);
		});

	});

	it("column panel and controls should be hidden", async() => {
		const { container } = wrapper;
		let columnPanel = container.querySelector("div[data-id='properties-column-panels-cond']");
		expect(columnPanel).to.exist;
		expect(columnPanel.classList.contains("hide")).to.equal(false);
		controller.updatePropertyValue({ name: "colHide" }, true);
		await waitFor(() => {
			columnPanel = container.querySelector("div[data-id='properties-column-panels-cond']");
			expect(columnPanel.classList.contains("hide")).to.equal(true);
		});


	});
});

describe("column panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("column panel should have custom classname defined", () => {
		const { container } = wrapper;
		const columnPanelWrapper = container.querySelector("div[data-id='properties-column-panels']");
		expect(columnPanelWrapper.querySelectorAll(".column-panels-cond-group-columnpanel-class")).to.have.length(1);
	});
});
