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

import { cleanup, waitFor } from "@testing-library/react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tabParamDef from "./../../test_resources/paramDefs/tab_paramDef.json";
import { expect } from "chai";

describe("subtabs renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(tabParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed the 4 tabs created with 6 nested subtabs", () => {
		const { container } = wrapper;
		const tabContainer = container.querySelector("div[data-id='properties-Primary'] div.properties-sub-tab-container");
		// should render 1 control panel
		expect(tabContainer.querySelectorAll("button.properties-subtab")).to.have.length(10);
	});
});

describe("subtabs visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(tabParamDef, { categoryView: "tabs" });
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("subtabs and controls should be disabled", async() => {
		const { container } = wrapper;
		let subTab = container.querySelector("button[data-id='properties-fruit-subtab']");
		// check initial state of enabled
		expect(subTab.getAttribute("aria-disabled")).to.equal("false");
		controller.updatePropertyValue({ name: "disable" }, true);
		await waitFor(() => {
			subTab = container.querySelector("button[data-id='properties-fruit-subtab']");
			expect(subTab.getAttribute("aria-disabled")).to.equal("true");
		});
	});

	it("subtabs and controls should be hidden", async() => {
		const { container } = wrapper;
		let subTab = container.querySelectorAll("button[data-id='properties-table-subtab']");
		expect(subTab).to.have.length(1);
		controller.updatePropertyValue({ name: "hide" }, true);
		await waitFor(() => {
			subTab = container.querySelectorAll("button[data-id='properties-table-subtab']");
			expect(subTab).to.have.length(0);
		});

	});

	it("hidden and non hidden tabs display correctly", async() => {
		const { container } = wrapper;
		let primaryTabs = container.querySelector(".properties-primaryTabs");
		let tab1 = primaryTabs.querySelectorAll("button[title='Tab Test']");
		let tab2 = primaryTabs.querySelectorAll("button[title='Tab Test2']");
		let tab3 = primaryTabs.querySelectorAll("button[title='Tab Test3']");
		let tab4 = primaryTabs.querySelectorAll("button[title='Tab Test4']");
		expect(tab1).to.have.length(1);
		expect(tab2).to.have.length(1);
		expect(tab3).to.have.length(1);
		expect(tab4).to.have.length(1);

		controller.updatePropertyValue({ name: "hideTab1" }, true);
		controller.updatePropertyValue({ name: "hideTab4" }, true);

		await waitFor(() => {
			primaryTabs = container.querySelector(".properties-primaryTabs");
			tab1 = primaryTabs.querySelectorAll("button[title='Tab Test']");
			tab2 = primaryTabs.querySelectorAll("button[title='Tab Test2']");
			tab3 = primaryTabs.querySelectorAll("button[title='Tab Test3']");
			tab4 = primaryTabs.querySelectorAll("button[title='Tab Test4']");

			expect(tab1).to.have.length(0);
			expect(tab2).to.have.length(1);
			expect(tab3).to.have.length(1);
			expect(tab4).to.have.length(0);
		});

	});
});

describe("subtabs classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(tabParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("subtab container should have custom classname defined", () => {
		const { container } = wrapper;
		const mainTab = container.querySelector("div.maintab-panel-class");
		expect(mainTab.querySelectorAll("div.subtab-panel-class")).to.have.length(1);
	});

	it("subtabs should have custom classname defined", () => {
		const { container } = wrapper;
		const subTabs = container.querySelector("div.properties-sub-tab-container");
		expect(subTabs.querySelectorAll(".range-fields-subtab-control-class")).to.have.length(1);
		expect(subTabs.querySelectorAll(".table-subtab-control-class")).to.have.length(1);
		expect(subTabs.querySelectorAll(".fruit-subtab-control-class")).to.have.length(1);
	});
});

describe("subtabs renders correctly in a Tearsheet container", () => {
	beforeEach(() => {
		propertyUtilsRTL.flyoutEditorForm(tabParamDef, { rightFlyout: false, containerType: "Tearsheet" });
	});

	afterEach(() => {
		cleanup();
	});

	it("should have rendered subtabs with leftnav classnames", () => {
		const primaryTabs = document.querySelectorAll("div.properties-primary-tab-panel.tearsheet-container");
		expect(primaryTabs).to.have.length(5);

		const primaryTab = primaryTabs[2]; // Tab Test2
		expect(primaryTab.querySelectorAll("div.properties-sub-tab-container.vertical.properties-leftnav-container")).to.have.length(1);

		const leftNav = primaryTab.querySelector("div.properties-subtabs.properties-leftnav-subtabs");
		expect(leftNav).to.not.be.null;
		expect(leftNav.querySelectorAll("button.properties-leftnav-subtab-item")).to.have.length(3);
	});
});


