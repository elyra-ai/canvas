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

import propertyUtils from "./../../_utils_/property-utils";
import { expect } from "chai";
import PANEL_SELECTOR_PARAM_DEF from "./../../test_resources/paramDefs/panelSelector_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

describe("'panel selector insert' renders correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(PANEL_SELECTOR_PARAM_DEF);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("it should have 3 text panels", () => {
		// Properties should have 3 text panels description
		const descriptions = wrapper.find("div[data-id='properties-fruit-color2'] .panel-description");
		expect(descriptions).to.have.length(3);

		// Check the descriptions are as expected.
		expect(descriptions.at(0).text()).to.equal("Apples ripen six to 10 times faster at room temperature than if they are refrigerated.");
		expect(descriptions.at(1).text()).to.equal("Blueberries freeze in just 4 minutes.");
		expect(descriptions.at(2).text()).to.equal("Lemons are a hybrid between a sour orange and a citron.");

		// Check that the red(0) text panel is enabled and blue (1) and yellow (2)
		// text panels are disabled.
		var redState = controller.getPanelState({ "name": "red2" });
		expect(redState).to.equal("enabled");
		var blueState = controller.getPanelState({ "name": "blue2" });
		expect(blueState).to.equal("disabled");
		var yellowState = controller.getPanelState({ "name": "yellow2" });
		expect(yellowState).to.equal("disabled");

		// Simulate a click on blue (1) radio button
		const input = wrapper.find("div[data-id='properties-fruit-color2']");
		expect(input).to.have.length(1);
		const radios = input.find("input[type='radio']");
		expect(radios).to.have.length(3);

		const radioBlue = radios.find("input[value='blue2']");
		radioBlue.simulate("change", { target: { checked: true, value: "blue2" } });

		// Check that the blue (1) text panel is enabled and red (0) and yellow (2)
		// text panels are disabled.
		redState = controller.getPanelState({ "name": "red2" });
		expect(redState).to.equal("disabled");
		blueState = controller.getPanelState({ "name": "blue2" });
		expect(blueState).to.equal("enabled");
		yellowState = controller.getPanelState({ "name": "yellow2" });
		expect(yellowState).to.equal("disabled");
	});

	it("panel selector and controls should be disabled", () => {

		// disabled
		const checkboxWrapper = wrapper.find("div[data-id='properties-disablePanelSelector']");
		const disabledCheckbox = checkboxWrapper.find("input");
		expect(disabledCheckbox.props().checked).to.equal(true);

		expect(controller.getControlState({ name: "fruit-color11" })).to.equal("disabled");
		expect(controller.getControlState({ name: "number" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "panel-selector-fields11" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "dynamicTextPercent" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "dynamicTextSum" })).to.equal("disabled");

		// enable
		const node = disabledCheckbox.getDOMNode();
		node.checked = false;
		disabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "fruit-color11" })).to.equal("enabled");
		expect(controller.getControlState({ name: "number" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "panel-selector-fields11" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "dynamicTextPercent" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "dynamicTextSum" })).to.equal("enabled");
	});

	it("panel selector and controls should be hidden", () => {

		// hidden
		const checkboxWrapper = wrapper.find("div[data-id='properties-hidePanelSelector']");
		const hiddenCheckbox = checkboxWrapper.find("input");
		expect(hiddenCheckbox.props().checked).to.equal(true);

		expect(controller.getControlState({ name: "fruit-color21" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "panel-selector-fields21" })).to.equal("hidden");

		// visible
		hiddenCheckbox.getDOMNode().checked = false;
		hiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "fruit-color21" })).to.equal("visible");
		expect(controller.getPanelState({ name: "panel-selector-fields21" })).to.equal("visible");
	});

	it("all panels for selected type should be enabled", () => {

		expect(controller.getPropertyValue({ name: "fruit-color3" })).to.equal("red3");
		expect(controller.getPanelState({ name: "red3" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "blue3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "yellow3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "apple-text" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "apple-types-ctl" })).to.equal("enabled");
		expect(controller.getControlState({ name: "apple-types" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "blue-text" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blueberry-size-ctl" })).to.equal("disabled");
		expect(controller.getControlState({ name: "blueberry-size" })).to.equal("disabled");

		// change selection
		const input = wrapper.find("div[data-id='properties-fruit-color3']");
		expect(input).to.have.length(1);
		const radios = input.find("input[type='radio']");
		expect(radios).to.have.length(6);

		const radioBlue = radios.find("input[value='blue3']");
		radioBlue.simulate("change", { target: { checked: true, value: "blue3" } });

		expect(controller.getPropertyValue({ name: "fruit-color3" })).to.equal("blue3");
		expect(controller.getPanelState({ name: "red3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blue3" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "yellow3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "apple-text" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "apple-types-ctl" })).to.equal("disabled");
		expect(controller.getControlState({ name: "apple-types" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blue-text" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "blueberry-size-ctl" })).to.equal("enabled");
		expect(controller.getControlState({ name: "blueberry-size" })).to.equal("enabled");

		// change selection
		const radioYellow = radios.find("input[value='yellow3']");
		radioYellow.simulate("change", { target: { checked: true, value: "yellow3" } });

		expect(controller.getPropertyValue({ name: "fruit-color3" })).to.equal("yellow3");
		expect(controller.getPanelState({ name: "red3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blue3" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "yellow3" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "apple-text" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "apple-types-ctl" })).to.equal("disabled");
		expect(controller.getControlState({ name: "apple-types" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blue-text" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "blueberry-size-ctl" })).to.equal("disabled");
		expect(controller.getControlState({ name: "blueberry-size" })).to.equal("disabled");

	});
});

describe("text panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("selector panel should have custom classname defined", () => {
		const panelSelectorWrapper = wrapper.find("div[data-id='properties-panel-selector2']");
		expect(panelSelectorWrapper.find(".panel-selector2-group-panelselector-class")).to.have.length(1);
	});
});
