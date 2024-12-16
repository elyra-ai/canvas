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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import React from "react";
import CommonProperties from "./../../../src/common-properties/common-properties.jsx";
import { expect } from "chai";
import { fireEvent, within } from "@testing-library/react";
import TAB_PARAM_DEF from "../../test_resources/paramDefs/tab_paramDef.json";
import PARAMS_ONLY_DEF from "../../test_resources/paramDefs/paramsOnly_paramDef.json";
import CODE_PARAM_DEF from "../../test_resources/paramDefs/code_paramDef.json";
import DATEFIELD_PARAM_DEF from "../../test_resources/paramDefs/datefield_paramDef.json";

describe("tabs and subtabs should be rendered correctly", () => {
	let wrapper;
	beforeEach(() => {
		const flyout = propertyUtilsRTL.flyoutEditorForm(TAB_PARAM_DEF);
		wrapper = flyout.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate subtabs work correctly", () => {
		const { container } = wrapper;
		let category = container.querySelector("div[data-id='properties-Primary2']");
		const subTabsContainer = category.getElementsByClassName("properties-subtabs");
		expect(subTabsContainer).to.have.length(1);

		const subTabs = subTabsContainer[0].querySelectorAll("button.cds--tabs__nav-link");
		expect(subTabs).to.have.length(3);
		fireEvent.click(subTabs[2]);

		category = container.querySelector("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		let tabContent = category.getElementsByClassName("properties-subtab-panel");
		expect(tabContent[0].hidden).to.equal(true);
		expect(tabContent[1].hidden).to.equal(true);
		expect(tabContent[2].hidden).to.equal(false);
		// click on the same tab again to make sure it stays open
		fireEvent.click(subTabs[2]);

		category = container.querySelector("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.getElementsByClassName("properties-subtab-panel");
		expect(tabContent[0].hidden).to.equal(true);
		expect(tabContent[1].hidden).to.equal(true);
		expect(tabContent[2].hidden).to.equal(false);
		// click on a new tab and validate that tab opens
		fireEvent.click(subTabs[1]);

		category = container.querySelector("div[data-id='properties-Primary2']");
		// use react object to find tab content.
		tabContent = category.getElementsByClassName("properties-subtab-panel");
		expect(tabContent[0].hidden).to.equal(true);
		expect(tabContent[1].hidden).to.equal(false);
		expect(tabContent[2].hidden).to.equal(true);
	});
});

describe("Tearsheet group type", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const flyout = propertyUtilsRTL.flyoutEditorForm(CODE_PARAM_DEF);
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
		const flyout = propertyUtilsRTL.flyoutEditorForm(PARAMS_ONLY_DEF);
		wrapper = flyout.wrapper;
		controller = flyout.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validate controls show up correctly", () => {
		// 4 controls are rendered on the screen
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-control-item")).to.have.length(4);
		expect(container.querySelectorAll("div[data-id='properties-textfield']")).to.have.length(1);

	});

	it("validate no tabs are present", () => {
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-categories")).to.have.length(0);
		expect(container.getElementsByClassName("properties-single-category")).to.have.length(1);
	});

	it("validate alerts tab isn't created", () => {
		const { container, rerender } = wrapper;
		expect(container.getElementsByClassName("properties-categories")).to.have.length(0);
		const rerendered = propertyUtilsRTL.flyoutEditorFormRerender(PARAMS_ONLY_DEF);
		const { propertiesInfo, propertiesConfig, callbacks, customControls, customConditionOps } = rerendered;
		controller.updatePropertyValue({ name: "textfield" }, null);
		rerender(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={customControls}
					customConditionOps={customConditionOps}
				/>
			</div>);
		// validate message is created
		expect(container.getElementsByClassName("cds--form-requirement")).to.have.length(1);
		// valide no catagories(tabs) are created
		expect(container.getElementsByClassName("properties-categories")).to.have.length(0);
	});
});

describe("Right flyout category views", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	it("For custom container in right flyout, when categoryView=tabs categories should be displayed as tabs", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true, categoryView: "tabs" });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const editorForm = container.getElementsByClassName("properties-editor-form")[0];
		expect(editorForm.className.includes("right-flyout-tabs-view")).to.equal(true);
		// Verify primary tabs
		const primaryTabs = within(editorForm).getAllByRole("tab");
		expect(primaryTabs).to.have.length(3);
		// Elements that have the role set to tabpanel also have the following class name
		const tabPanels = editorForm.querySelectorAll("div[role='tabpanel']");
		expect(tabPanels).to.have.length(3);

		// Verify properties title doesn't have bottom border
		const titleEditor = container.getElementsByClassName("properties-title-editor")[0];
		expect(titleEditor.className.includes("properties-title-right-flyout-tabs-view")).to.equal(true);
	});

	it("For custom container in right flyout, when categoryView=accordions categories should be displayed as accordions", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true, categoryView: "accordions" });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const editorForm = container.getElementsByClassName("properties-editor-form")[0];
		expect(editorForm.className.includes("right-flyout-tabs-view")).to.equal(false);

		const propertiesCategories = editorForm.getElementsByClassName("properties-categories");
		expect(propertiesCategories).to.have.length(1);

		const categoryContainers = editorForm.getElementsByClassName("properties-category-container");
		expect(categoryContainers).to.have.length(3);

		// Verify properties title has bottom border
		const titleEditor = container.getElementsByClassName("properties-title-editor")[0];
		expect(titleEditor.className.includes("properties-title-right-flyout-tabs-view")).to.equal(false);
	});

	it("For custom container in right flyout, when categoryView is not set, categories should be displayed as accordions by default", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(DATEFIELD_PARAM_DEF, { containerType: "Custom", rightFlyout: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const editorForm = container.getElementsByClassName("properties-editor-form")[0];
		expect(editorForm.className.includes("right-flyout-tabs-view")).to.equal(false);

		const propertiesCategories = editorForm.getElementsByClassName("properties-categories");
		expect(propertiesCategories).to.have.length(1);

		const categoryContainers = editorForm.getElementsByClassName("properties-category-container");
		expect(categoryContainers).to.have.length(3);

		// Verify properties title has bottom border
		const titleEditor = container.querySelector(".properties-title-editor");
		expect(titleEditor.className.includes("properties-title-right-flyout-tabs-view")).to.equal(false);
	});
});
