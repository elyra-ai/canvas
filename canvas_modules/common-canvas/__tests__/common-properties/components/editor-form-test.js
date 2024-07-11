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

import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import TAB_PARAM_DEF from "../../test_resources/paramDefs/tab_paramDef.json";
import PARAMS_ONLY_DEF from "../../test_resources/paramDefs/paramsOnly_paramDef.json";
import CODE_PARAM_DEF from "../../test_resources/paramDefs/code_paramDef.json";
import DATEFIELD_PARAM_DEF from "../../test_resources/paramDefs/datefield_paramDef.json";

describe("tabs and subtabs should be rendered correctly", () => {
	let wrapper;
	beforeEach(() => {
		// TODO revert this test to use rightFlyout once https://github.com/carbon-design-system/carbon/issues/16944 is fixed
		const flyout = propertyUtils.flyoutEditorForm(TAB_PARAM_DEF, { rightFlyout: false, containerType: "Tearsheet" });
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate subtabs work correctly", () => {
		let category = wrapper.find("div[data-id='properties-Primary2']");
		const subTabsContainer = category.find("div.properties-subtabs");
		expect(subTabsContainer).to.have.length(1);
		const subTabs = subTabsContainer.find("button.cds--tabs__nav-link");
		expect(subTabs).to.have.length(3);
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		let tabContent = category.find("div.properties-sub-tab-container div.properties-subtab-panel");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on the same tab again to make sure it stays open
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.find("div.properties-sub-tab-container div.properties-subtab-panel");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on a new tab and validate that tab opens
		subTabs.at(1).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.find("div.properties-sub-tab-container div.properties-subtab-panel");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(false);
		expect(tabContent.at(2).prop("hidden")).to.equal(true);
	});
});

describe("Tearsheet group type", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(CODE_PARAM_DEF);
		wrapper = flyout.wrapper;
		controller = flyout.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("validate tearsheet activates in memory", () => {
		controller.setActiveTearsheet("tearsheet1");
		expect(controller.getActiveTearsheet()).to.equal("tearsheet1");
	});
});

describe("controls should be rendered correctly when no uihints are provided", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(PARAMS_ONLY_DEF);
		wrapper = flyout.wrapper;
		controller = flyout.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate controls show up correctly", () => {
		// 4 controls are rendered on the screen
		expect(wrapper.find(".properties-control-item")).to.have.length(4);
		expect(wrapper.find("div[data-id='properties-textfield']")).to.have.length(1);

	});

	it("validate no tabs are present", () => {
		expect(wrapper.find(".properties-categories")).to.have.length(0);
		expect(wrapper.find(".properties-single-category")).to.have.length(1);
	});

	it("validate alerts tab isn't created", () => {
		expect(wrapper.find(".properties-categories")).to.have.length(0);
		controller.updatePropertyValue({ name: "textfield" }, null);
		wrapper.update();
		// validate message is created
		expect(wrapper.find("div.cds--form-requirement")).to.have.length(1);
		// valide no catagories(tabs) are created
		expect(wrapper.find(".properties-categories")).to.have.length(0);
	});
});

describe("Right flyout category views", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	// TODO enable this test once https://github.com/carbon-design-system/carbon/issues/16944 is fixed
	it.skip("For custom container in right flyout, when categoryView=tabs categories should be displayed as tabs", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true, categoryView: "tabs" });
		wrapper = renderedObject.wrapper;
		const editorForm = wrapper.find(".properties-editor-form");
		expect(editorForm.prop("className").includes("right-flyout-tabs-view")).to.equal(true);
		// Verify primary tabs
		const primaryTabs = editorForm.find("button[role='tab']");
		expect(primaryTabs).to.have.length(3);

		const tabPanels = editorForm.find("div[role='tabpanel']");
		expect(tabPanels).to.have.length(3);

		// Verify properties title doesn't have bottom border
		const titleEditor = wrapper.find(".properties-title-editor");
		expect(titleEditor.prop("className").includes("properties-title-right-flyout-tabs-view")).to.equal(true);
	});

	it("For custom container in right flyout, when categoryView=accordions categories should be displayed as accordions", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true, categoryView: "accordions" });
		wrapper = renderedObject.wrapper;
		const editorForm = wrapper.find(".properties-editor-form");
		expect(editorForm.prop("className").includes("right-flyout-tabs-view")).to.equal(false);

		const propertiesCategories = editorForm.find(".properties-categories");
		expect(propertiesCategories).to.have.length(1);

		const categoryContainers = propertiesCategories.find(".properties-category-container");
		expect(categoryContainers).to.have.length(3);

		// Verify properties title has bottom border
		const titleEditor = wrapper.find(".properties-title-editor");
		expect(titleEditor.prop("className").includes("properties-title-right-flyout-tabs-view")).to.equal(false);
	});

	it("For custom container in right flyout, when categoryView is not set, categories should be displayed as accordions by default", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true });
		wrapper = renderedObject.wrapper;
		const editorForm = wrapper.find(".properties-editor-form");
		expect(editorForm.prop("className").includes("right-flyout-tabs-view")).to.equal(false);

		const propertiesCategories = editorForm.find(".properties-categories");
		expect(propertiesCategories).to.have.length(1);

		const categoryContainers = propertiesCategories.find(".properties-category-container");
		expect(categoryContainers).to.have.length(3);

		// Verify properties title has bottom border
		const titleEditor = wrapper.find(".properties-title-editor");
		expect(titleEditor.prop("className").includes("properties-title-right-flyout-tabs-view")).to.equal(false);
	});
});
