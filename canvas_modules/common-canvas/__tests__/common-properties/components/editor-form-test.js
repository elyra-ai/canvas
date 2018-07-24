/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import TAB_PARAM_DEF from "../../test_resources/paramDefs/tab_paramDef.json";


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
		const subTabsContainer = category.find("nav.properties-subtabs");
		expect(subTabsContainer).to.have.length(1);
		const subTabs = subTabsContainer.find("a.bx--tabs__nav-link");
		expect(subTabs).to.have.length(3);
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		let tabContent = category.find("div.tab-content");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on the same tab again to make sure it stays open
		subTabs.at(2).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		tabContent = category.find("div.tab-content");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(true);
		expect(tabContent.at(2).prop("hidden")).to.equal(false);
		// click on a new tab and validate that tab opens
		subTabs.at(1).simulate("click");
		category = wrapper.find("div[data-id='properties-Primary2']");
		tabContent = category.find("div.tab-content");
		expect(tabContent.at(0).prop("hidden")).to.equal(true);
		expect(tabContent.at(1).prop("hidden")).to.equal(false);
		expect(tabContent.at(2).prop("hidden")).to.equal(true);
	});
});
