/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
