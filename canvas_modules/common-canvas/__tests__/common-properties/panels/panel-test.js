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
import { cleanup } from "@testing-library/react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";
import customPanelParamDef from "./../../test_resources/paramDefs/CustomPanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import nestedPanelParamDef from "./../../test_resources/paramDefs/panelNested_paramDef.json";
import AddtlCmptsTest from "./../../_utils_/custom-components/AddtlCmptsTest.jsx";


// possibly move these under each panel
describe("empty panels render correctly", () => {
	const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelParamDef);
	const wrapper = renderedObject.wrapper;
	it("should render each panel", () => {
		const { container } = wrapper;
		const panelContainer = container.querySelector("div[data-id='properties-empty-panels-container']");
		expect(panelContainer).to.exist;
		const children = panelContainer.children;
		expect(children.length).to.equal(7); // Receiving 7 childrens as per RTL children method
	});
});

describe("additional components are rendered correctly", () => {
	it("when additional components are added to a tab group, it should be rendered at the same level as the other controls", () => {
		const propertiesInfo = { additionalComponents: { "toggle-panel": <AddtlCmptsTest /> } };
		const propertiesConfig = { rightFlyout: true };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(customPanelParamDef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;

		const { container } = wrapper;
		const customPanel = container.querySelector(".properties-custom-container");
		expect(customPanel).to.exist;
		const togglePanelContainer = customPanel.querySelector(".properties-category-container");
		expect(togglePanelContainer).to.exist;
		const togglePanelContent = togglePanelContainer.querySelector(".cds--accordion__content");
		expect(togglePanelContent).to.exist;
		const children = togglePanelContent.children;
		expect(children).to.have.length(2); // Default Component & Additional Component*/
	});
});

describe("group panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("group panels should have custom classname defined", () => {
		const { container } = wrapper;
		// top level group panels
		expect(container.querySelectorAll(".text-panels-group-panels-class")).to.have.length(1);
		// double nested panels
		expect(container.querySelectorAll(".level1-group-panels-class")).to.have.length(1);
		// deeply nested group panels
		expect(container.querySelectorAll(".level3-group-panels-class")).to.have.length(1);
	});
});

describe("nested panels render correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(nestedPanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("Text panels should be nested when nested_panel is set to true", () => {
		const { container } = wrapper;
		// Default text panel
		const defaultTextPanel = container.querySelector(".default-textpanel-class");
		expect(defaultTextPanel.classList.contains("properties-control-nested-panel")).to.equal(false);

		// Nested text panel
		const nestedTextPanel = container.querySelector(".nested-textpanel-class");
		expect(nestedTextPanel.classList.contains("properties-control-nested-panel")).to.equal(true);
	});

	it("Column selection panels should be nested when nested_panel is set to true", () => {
		const { container } = wrapper;
		// Default columnSelection panel
		const defaultColumnSelectionPanel = container.querySelector(".default-columnselection-class");
		expect(defaultColumnSelectionPanel.classList.contains("properties-control-nested-panel")).to.equal(false);

		// Nested columnSelection panel
		const nestedColumnSelectionPanel = container.querySelector(".nested-columnselection-class");
		expect(nestedColumnSelectionPanel.classList.contains("properties-control-nested-panel")).to.equal(true);

	});

	it("Summary panels should be nested when nested_panel is set to true", () => {
		const { container } = wrapper;
		// Default summary panel
		const defaultSummaryPanel = container.querySelector(".default-summarypanel-class");
		expect(defaultSummaryPanel.classList.contains("properties-control-nested-panel")).to.equal(false);

		// Nested summary panel
		const nestedSummaryPanel = container.querySelector(".nested-summarypanel-class");
		expect(nestedSummaryPanel.classList.contains("properties-control-nested-panel")).to.equal(true);

	});

	it("Twisty panels should be nested when nested_panel is set to true", () => {
		const { container } = wrapper;
		// Default twisty panel
		const defaultTwistyPanel = container.querySelector(".default-twistypanel-class");
		expect(defaultTwistyPanel.classList.contains("properties-control-nested-panel")).to.equal(false);

		// Nested twisty panel
		const nestedTwistyPanel = container.querySelector(".nested-twistypanel-class");
		expect(nestedTwistyPanel.classList.contains("properties-control-nested-panel")).to.equal(true);
	});

	it("Action panels should be nested when nested_panel is set to true", () => {
		const { container } = wrapper;
		// Default action panel
		const defaultActionPanel = container.querySelector(".default-actionpanel-class");
		expect(defaultActionPanel.classList.contains("properties-control-nested-panel")).to.be.equal(false);

		// Nested action panel
		const nestedAction = container.querySelector(".nested-actionpanel-class");
		expect(nestedAction.classList.contains("properties-control-nested-panel")).to.equal(true);
	});

	it("Column panels should be nested when nested_panel is set to true", () => {
		// Default column panel
		const { container } = wrapper;
		const defaultColumnPanel = container.querySelector(".default-columnpanel-class");
		expect(defaultColumnPanel.classList.contains("properties-control-nested-panel")).to.equal(false);

		// Nested column panel
		const nestedColumnPanel = container.querySelector(".nested-columnpanel-class");
		expect(nestedColumnPanel.classList.contains("properties-control-nested-panel")).to.equal(true);

	});
});
