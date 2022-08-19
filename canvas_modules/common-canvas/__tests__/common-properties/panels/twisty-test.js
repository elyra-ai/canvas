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

import propertyUtils from "./../../_utils_/property-utils";
import twistypanelParamDef from "./../../test_resources/paramDefs/twistyPanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

import { expect } from "chai";

describe("twisty panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(twistypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the twisty panel with first panel closed and 2nd panel open", () => {
		const twisty = wrapper.find("div[data-id='properties-TwistyPanel1']");
		expect(twisty.find("li.bx--accordion__item")).to.have.length(1);
		expect(twisty.find("li.bx--accordion__item--active")).to.have.length(0);

		const tableTwisty = wrapper.find("div[data-id='properties-TableTwisty']");
		expect(tableTwisty.find("li.bx--accordion__item")).to.have.length(1);
		expect(tableTwisty.find("li.bx--accordion__item--active")).to.have.length(1);
	});

	it("should expand content when twisty panel link clicked", () => {
		let twisty = wrapper.find("div[data-id='properties-TwistyPanel1']");
		expect(twisty.find("li.bx--accordion__item")).to.have.length(1);
		expect(twisty.find("li.bx--accordion__item--active")).to.have.length(0);
		const twistyButton = twisty.find("button.bx--accordion__heading");
		twistyButton.simulate("click");
		twisty = wrapper.find("div[data-id='properties-TwistyPanel1']");
		expect(twisty.find("li.bx--accordion__item")).to.have.length(1);
		expect(twisty.find("li.bx--accordion__item--active")).to.have.length(1);
	});
});

describe("twisty panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("twisty panel and controls should be disabled", () => {
		const disableTwisty = wrapper.find("div[data-id='properties-disableTwistyPanel']");
		const disabledCheckbox = disableTwisty.find("input[type='checkbox']");
		let twistyPanel = wrapper.find("div[data-id='properties-twisty-panel1']");

		// check initial state of enabled
		expect(disabledCheckbox.getDOMNode().checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the panel and confirm
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel1']");
		expect(controller.getPropertyValue({ name: "disableTwistyPanel" })).to.equal(true);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
		expect(twistyPanel.find("li.bx--accordion__item--disabled")).to.have.length(1);


		// can also disable a twisty that is opened
		// enable and open the twistypanel
		disabledCheckbox.getDOMNode().checked = false;
		disabledCheckbox.simulate("change");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel1']");
		twistyPanel.find("button")
			.at(0)
			.simulate("click");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel1']");
		expect(twistyPanel.find("li.bx--accordion__item")).to.have.length(1);
		expect(twistyPanel.find("li.bx--accordion__item--active")).to.have.length(1);

		const numberfields = twistyPanel.find("input[type='number']");
		expect(numberfields).to.have.length(2);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the open twisty disableTwistyPanel
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel1']");
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
		expect(twistyPanel.find("li.bx--accordion__item--disabled")).to.have.length(1);

	});

	it("twisty panel and controls should be hidden", () => {
		const hiddenTwisty = wrapper.find("div[data-id='properties-hideTwistyPanel']");
		const hiddenCheckbox = hiddenTwisty.find("input[type='checkbox']");
		let twistyPanel = wrapper.find("div[data-id='properties-twisty-panel2']");

		// check initial state of enabled
		expect(hiddenCheckbox.getDOMNode().checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");

		// hide the panel and confirm
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.hasClass("hide")).to.equal(true);

		// can also hide a twisty that is opened
		// make panel visible and confirm
		hiddenCheckbox.getDOMNode().checked = false;
		hiddenCheckbox.simulate("change");
		twistyPanel.find("button")
			.at(0)
			.simulate("click");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel2']");
		expect(twistyPanel.find("li.bx--accordion__item")).to.have.length(1);
		expect(twistyPanel.find("li.bx--accordion__item--active")).to.have.length(1);
		const numberfield = twistyPanel.find("input[type='number']");
		expect(numberfield).to.have.length(1);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("visible");

		// hide the panel and confirm
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");
		twistyPanel = wrapper.find("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.hasClass("hide")).to.equal(true);
	});
});

describe("twisty panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("text panel should have custom classname defined", () => {
		const twistyPanelcategory = wrapper.find("div.properties-category-container").at(5); // TWISTY PANEL category
		expect(twistyPanelcategory.find(".twisty-panel1-group-twistypanel-class")).to.have.length(1);
	});
});
