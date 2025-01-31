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
import propertyUtils from "../_utils_/property-utils";
import uiItemParamDef from "../test_resources/paramDefs/uiItems_paramDef.json";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";
import panelParamDefWide from "../test_resources/paramDefs/widePanel_paramDef.json";

describe("editor-form renders correctly with correct uiItems", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(uiItemParamDef);
	const wrapper = renderedObject.wrapper;
	it("should have displayed correct number of staticText elements", () => {
		const staticText = wrapper.find("div.properties-static-text");
		expect(staticText).to.have.length(4);
		const staticTextIcons = wrapper.find("div.properties-static-text-container svg");
		expect(staticTextIcons).to.have.length(1);
		const staticTextWithIcon = wrapper.find("div.properties-static-text.info");
		expect(staticTextWithIcon).to.have.length(1);
	});
	it("should have displayed correct text in staticText elements", () => {
		let staticText = wrapper.find("div.properties-static-text");
		expect(staticText.at(0).text()).to.equal("Some helpful text before the control");
		const staticTextWithIcon = wrapper.find("div.properties-static-text.info");
		expect(staticTextWithIcon.at(0).text()).to.equal("Hint: should have a separator after and icon");
		expect(staticText.at(3).text()).to.equal("Sum: 2 with (numberfield, 2, numberfield). Percent: 0");
		const input = wrapper.find("div[data-id='properties-numberfield'] input");
		input.simulate("change", { target: { value: "44", validity: { badInput: false } } });
		staticText = wrapper.find("div.properties-static-text");
		expect(staticText.at(3).text()).to.equal("Sum: 90 with (numberfield, 2, numberfield). Percent: 2.27");
	});
	it("should have displayed correct number of separator elements", () => {
		const separators = wrapper.find("hr.properties-h-separator");
		expect(separators).to.have.length(2);
	});
});

describe("uiItemParamDef render correctly when the control label is hidden", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(uiItemParamDef);
	const wrapper = renderedObject.wrapper;

	it("should have not displayed control label when labelVisible:false", () => {
		const controllabels = wrapper.find("label.properties-control-label");
		expect(controllabels).to.have.length(6);

		const controlDisabledLabled = controllabels.find(".properties-control-label-disabled");
		controlDisabledLabled.forEach((label) => {
			const displayStyle = label.getDOMNode().style.display;
			expect(displayStyle).to.equal("none");
		});
	});
});

describe("Flyout editor has the correct width", () => {
	it("should display a fly out editor at normal width", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
		const wrapper = renderedObject.wrapper;
		const flyout = wrapper.find("aside.properties-right-flyout.properties-small");
		expect(flyout).to.have.length(1);
	});
	it("should display a wide fly out editor at wider width", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDefWide);
		const wrapper = renderedObject.wrapper;
		const flyout = wrapper.find("aside.properties-right-flyout.properties-medium");
		expect(flyout).to.have.length(1);
	});
});
