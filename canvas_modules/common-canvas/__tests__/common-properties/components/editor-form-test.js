/*
 * Copyright 2017-2022 Elyra Authors
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

describe("tabs and subtabs should be rendered correctly", () => {
	let wrapper;
	beforeEach(() => {
		const flyout = propertyUtils.flyoutEditorForm(TAB_PARAM_DEF);
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate subtabs work correctly", () => {
		let category = wrapper.find("div[data-id='properties-Primary2']");
		const subTabsContainer = category.find("div.properties-subtabs");
		expect(subTabsContainer).to.have.length(1);
		const subTabs = subTabsContainer.find("button.bx--tabs--scrollable__nav-link");
		expect(subTabs).to.have.length(3);
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		let tabContent = category.find("div.properties-sub-tab-container TabContent");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on the same tab again to make sure it stays open
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.find("div.properties-sub-tab-container TabContent");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on a new tab and validate that tab opens
		subTabs.at(1).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.find("div.properties-sub-tab-container TabContent");
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
		expect(wrapper.find(".bx--form-requirement")).to.have.length(1);
		// valide no catagories(tabs) are created
		expect(wrapper.find(".properties-categories")).to.have.length(0);
	});
});
