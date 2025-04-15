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

import { expect } from "chai";
import propertyUtilsRTL from "../_utils_/property-utilsRTL";
import uiItemParamDef from "../test_resources/paramDefs/uiItems_paramDef.json";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";
import panelParamDefWide from "../test_resources/paramDefs/widePanel_paramDef.json";
import { cleanup, fireEvent } from "@testing-library/react";

describe("editor-form renders correctly with correct uiItems", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(uiItemParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});
	it("should have displayed correct number of staticText elements", () => {
		const { container } = wrapper;
		const staticText = container.querySelectorAll("div.properties-static-text");
		expect(staticText).to.have.length(4);
		const staticTextIcons = container.querySelectorAll("div.properties-static-text-container svg");
		expect(staticTextIcons).to.have.length(1);
		const staticTextWithIcon = container.querySelectorAll("div.properties-static-text.info");
		expect(staticTextWithIcon).to.have.length(1);
	});
	it("should have displayed correct text in staticText elements", () => {
		const { container } = wrapper;
		let staticText = container.querySelectorAll("div.properties-static-text");
		expect(staticText[0].textContent).to.equal("Some helpful text before the control");
		const staticTextWithIcon = container.querySelectorAll("div.properties-static-text.info");
		expect(staticTextWithIcon[0].textContent).to.equal("Hint: should have a separator after and icon");
		expect(staticText[3].textContent).to.equal("Sum: 2 with (numberfield, 2, numberfield). Percent: 0");
		const input = container.querySelector("div[data-id='properties-numberfield'] input");
		fireEvent.change(input, { target: { value: "44" } });
		staticText = container.querySelectorAll("div.properties-static-text");
		expect(staticText[3].textContent).to.equal("Sum: 90 with (numberfield, 2, numberfield). Percent: 2.27");
	});
	it("should have displayed correct number of separator elements", () => {
		const { container } = wrapper;
		const separators = container.querySelectorAll("hr.properties-h-separator");
		expect(separators).to.have.length(2);
	});
});

describe("uiItemParamDef render correctly when the control label is hidden", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(uiItemParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have not displayed control label when labelVisible:false", () => {
		const { container } = wrapper;
		const controllabels = container.querySelectorAll("label.properties-control-label");
		expect(controllabels).to.have.length(5);
	});
});

describe("Flyout editor has the correct width", () => {
	let wrapper;
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});
	it("should display a fly out editor at normal width", () => {
		const { container } = wrapper;
		const flyout = container.querySelectorAll("aside.properties-right-flyout.properties-small");
		expect(flyout).to.have.length(1);
	});
	it("should display a wide fly out editor at wider width", () => {
		renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDefWide);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const flyout = container.querySelectorAll("aside.properties-right-flyout.properties-medium");
		expect(flyout).to.have.length(1);
	});
});
