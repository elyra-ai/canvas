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

// Test suite for generic panel testing

import React from "react";
import { expect } from "chai";
import propertyUtils from "./../../_utils_/property-utils";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import customPanelParamDef from "./../../test_resources/paramDefs/CustomPanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import nestedPanelParamDef from "./../../test_resources/paramDefs/panelNested_paramDef.json";
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
		const togglePanelContent = togglePanelContainer.find(".cds--accordion__content");
		expect(togglePanelContent.children()).to.have.length(2); // Default Component & Additional Component

	});
});

describe("group panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("group panels should have custom classname defined", () => {
		// top level group panels
		expect(wrapper.find(".text-panels-group-panels-class")).to.have.length(1);
		// double nested panels
		expect(wrapper.find(".level1-group-panels-class")).to.have.length(1);
		// deeply nested group panels
		expect(wrapper.find(".level3-group-panels-class")).to.have.length(1);
	});
});

describe("nested panels render correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(nestedPanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Text panels should be nested when nested_panel is set to true", () => {
		// Default text panel
		const defaultTextPanel = wrapper.find(".default-textpanel-class");
		expect(defaultTextPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested text panel
		const nestedTextPanel = wrapper.find(".nested-textpanel-class");
		expect(nestedTextPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});

	it("Column selection panels should be nested when nested_panel is set to true", () => {
		// Default columnSelection panel
		const defaultColumnSelectionPanel = wrapper.find(".default-columnselection-class");
		expect(defaultColumnSelectionPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested columnSelection panel
		const nestedColumnSelectionPanel = wrapper.find(".nested-columnselection-class");
		expect(nestedColumnSelectionPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});

	it("Summary panels should be nested when nested_panel is set to true", () => {
		// Default summary panel
		const defaultSummaryPanel = wrapper.find(".default-summarypanel-class");
		expect(defaultSummaryPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested summary panel
		const nestedSummaryPanel = wrapper.find(".nested-summarypanel-class");
		expect(nestedSummaryPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});

	it("Twisty panels should be nested when nested_panel is set to true", () => {
		// Default twisty panel
		const defaultTwistyPanel = wrapper.find(".default-twistypanel-class");
		expect(defaultTwistyPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested twisty panel
		const nestedTwistyPanel = wrapper.find(".nested-twistypanel-class");
		expect(nestedTwistyPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});

	it("Action panels should be nested when nested_panel is set to true", () => {
		// Default action panel
		const defaultActionPanel = wrapper.find(".default-actionpanel-class");
		expect(defaultActionPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested action panel
		const nestedActionPanel = wrapper.find(".nested-actionpanel-class");
		expect(nestedActionPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});

	it("Column panels should be nested when nested_panel is set to true", () => {
		// Default column panel
		const defaultColumnPanel = wrapper.find(".default-columnpanel-class");
		expect(defaultColumnPanel.hasClass("properties-control-nested-panel")).to.equal(false);

		// Nested column panel
		const nestedColumnPanel = wrapper.find(".nested-columnpanel-class");
		expect(nestedColumnPanel.hasClass("properties-control-nested-panel")).to.equal(true);
	});
});
