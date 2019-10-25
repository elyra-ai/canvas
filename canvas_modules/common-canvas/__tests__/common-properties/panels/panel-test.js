/*
 * Copyright 2017-2019 IBM Corporation
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

// Test suite for generic panel testing

import React from "react";
import { expect } from "chai";
import propertyUtils from "./../../_utils_/property-utils";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import customPanelParamDef from "./../../test_resources/paramDefs/CustomPanel_paramDef.json";
import AddtlCmptsTest from "./../../_utils_/custom-components/AddtlCmptsTest.jsx";


// possibly move these under each panel
describe("empty panels render correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
	const wrapper = renderedObject.wrapper;

	it("should render each panel", () => {
		const panelContainer = wrapper.find("div[data-id='properties-empty-panels-container']");
		expect(panelContainer).to.have.length(1);
		expect(panelContainer.children()).to.have.length(10);
	});
});

describe("additional components are rendered correctly", () => {
	it("when additional components are added to a tab group, it should be rendered at the same level as the other controls", () => {
		const propertiesInfo = { additionalComponents: { "toggle-panel": <AddtlCmptsTest /> } };
		const propertiesConfig = { rightFlyout: true };
		const renderedObject = propertyUtils.flyoutEditorForm(customPanelParamDef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;

		const customPanel = wrapper.find(".properties-custom-container");
		expect(customPanel).to.have.length(1);
		const togglePanelContainer = customPanel.find(".properties-category-container").at(0);
		const togglePanelContent = togglePanelContainer.find(".properties-category-content");
		expect(togglePanelContent.children()).to.have.length(2); // Default Component & Additional Component

	});
});
