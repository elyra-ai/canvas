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
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import twistypanelParamDef from "./../../test_resources/paramDefs/twistyPanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";

describe("twisty panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed the twisty panel with first panel closed and 2nd panel open", () => {
		const { container } = wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(0);

		const tableTwisty = container.querySelector("div[data-id='properties-TableTwisty']");
		expect(tableTwisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(tableTwisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
	});

	it("should expand content when twisty panel link clicked", () => {
		const { container } = wrapper;
		let twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(0);
		const twistyButton = twisty.querySelector("button.cds--accordion__heading");
		fireEvent.click(twistyButton);
		twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
	});
});

describe("twisty panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("twisty panel and controls should be disabled", async() => {
		const { container } = wrapper;
		const disableTwisty = container.querySelector("div[data-id='properties-disableTwistyPanel']");
		const disabledCheckbox = disableTwisty.querySelector("input[type='checkbox']");
		let twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");

		// check initial state of enabled
		expect(disabledCheckbox.checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the panel and confirm
		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = true;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(controller.getPropertyValue({ name: "disableTwistyPanel" })).to.equal(true);
			expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--disabled")).to.have.length(1);
		});

		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = false;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			const button = twistyPanel.querySelectorAll("button")[0];
			fireEvent.click(button);
		});

		await waitFor(() => {
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
		});

		const numberfields = twistyPanel.querySelectorAll("input[type='number']");
		expect(numberfields).to.have.length(2);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the open twisty disableTwistyPanel
		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = true;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--disabled")).to.have.length(1);
		});

	});

	it("twisty panel and controls should be hidden", () => {
		const { container } = wrapper;
		const hiddenTwisty = container.querySelector("div[data-id='properties-hideTwistyPanel']");
		const hiddenCheckbox = hiddenTwisty.querySelector("input[type='checkbox']");
		let twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		// check initial state of enabled
		expect(hiddenCheckbox.checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");

		// hide the panel and confirm
		fireEvent.click(hiddenCheckbox);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.classList.contains("hide")).to.equal(true);

		// can also hide a twisty that is opened
		// make panel visible and confirm
		fireEvent.click(hiddenCheckbox);
		const button = twistyPanel.querySelectorAll("button")[0];
		fireEvent.click(button);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(twistyPanel.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twistyPanel.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
		const numberfield = twistyPanel.querySelectorAll("input[type='number']");
		expect(numberfield).to.have.length(1);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("visible");

		// hide the panel and confirm
		fireEvent.click(hiddenCheckbox);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.classList.contains("hide")).to.equal(true);
	});
});

describe("twisty panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("text panel should have custom classname defined", () => {
		const { container } = wrapper;
		const twistyPanelcategory = container.querySelectorAll("div.properties-category-container")[6]; // TWISTY PANEL category
		expect(twistyPanelcategory.querySelectorAll(".twisty-panel1-group-twistypanel-class")).to.have.length(1);
	});
});
