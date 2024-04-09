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
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";

import { expect } from "chai";

describe("nested panels visible and enabled conditions work correctly", () => {
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

	it("top level panel should disable all child panels and controls", () => {
		// ensure all are enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("enabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;

		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("enabled");

		// disable level1
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.find("div[data-id='properties-disablePanelLevel1'] input");
		expect(disabledCheckbox.getDOMNode().checked).to.equal(false);
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("top level panel should hide all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel1'] input");
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level1
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("mid level panel should disable all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.find("div[data-id='properties-disablePanelLevel2'] input");
		expect(disabledCheckbox.props().checked).to.equal(false);

		// disable level2
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");

		// ensure level 1 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		// level1 text panel should not be set and level2 text panel should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("mid level panel should hide all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel2'] input");
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level2
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		// level1 text panel should not be set and level2 text panel should not be "hidden"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("lower level panel should disable all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.find("div[data-id='properties-disablePanelLevel3'] input");
		expect(disabledCheckbox.props().checked).to.equal(false);

		// disable level3
		disabledCheckbox.getDOMNode().checked = true;
		disabledCheckbox.simulate("change");

		// ensure level1 and lavel2 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");


		// all text panels should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("lower level panel should hide all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel3'] input");
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level3
		hiddenCheckbox.getDOMNode().checked = true;
		hiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		// all text panels should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("lower, mid, and top level panel should disable all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		let lvl1DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel1'] input");
		expect(lvl1DisabledCheckbox.props().checked).to.equal(false);
		let lvl2DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel2'] input");
		expect(lvl2DisabledCheckbox.props().checked).to.equal(false);
		let lvl3DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl3DisabledCheckbox.props().checked).to.equal(false);

		// disable level3
		lvl3DisabledCheckbox.getDOMNode().checked = true;
		lvl3DisabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// disable level2
		lvl2DisabledCheckbox.getDOMNode().checked = true;
		lvl2DisabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// disable level1
		lvl1DisabledCheckbox.getDOMNode().checked = true;
		lvl1DisabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		lvl1DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel1'] input");
		lvl2DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel3'] input");

		expect(lvl2DisabledCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		lvl1DisabledCheckbox.getDOMNode().checked = false;
		lvl1DisabledCheckbox.simulate("change");
		lvl2DisabledCheckbox.getDOMNode().checked = false;
		lvl2DisabledCheckbox.simulate("change");

		// ensure low level still disabled after enabling level2
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("lower, mid, and top level panel should hide all child panels and controls", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		let lvl1HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel1'] input");
		expect(lvl1HiddenCheckbox.props().checked).to.equal(false);
		let lvl2HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel2'] input");
		expect(lvl2HiddenCheckbox.props().checked).to.equal(false);
		let lvl3HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel3'] input");
		expect(lvl3HiddenCheckbox.props().checked).to.equal(false);

		// hide level3
		lvl3HiddenCheckbox.getDOMNode().checked = true;
		lvl3HiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level2
		lvl2HiddenCheckbox.getDOMNode().checked = true;
		lvl2HiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level1
		lvl1HiddenCheckbox.getDOMNode().checked = true;
		lvl1HiddenCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		lvl1HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel1'] input");
		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel2'] input");
		lvl3HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel3'] input");
		expect(lvl2HiddenCheckbox).to.have.length(0); // Hidden controls are not rendered
		expect(lvl3HiddenCheckbox).to.have.length(0); // Hidden controls are not rendered

		// Unhide level 1 then level 2
		lvl1HiddenCheckbox.getDOMNode().checked = false;
		lvl1HiddenCheckbox.simulate("change");
		wrapper.update();
		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel2'] input");
		lvl2HiddenCheckbox.getDOMNode().checked = false;
		lvl2HiddenCheckbox.simulate("change");

		// ensure lower level still hidden after enabling mid level

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("visible");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("visible");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("disable hide and disable different levels of panels", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.props().checked).to.equal(false);
		});
		const lvl1DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel1'] input");
		let lvl2HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel2'] input");
		let lvl3DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel3'] input");

		// disable level3
		lvl3DisabledCheckbox.getDOMNode().checked = true;
		lvl3DisabledCheckbox.simulate("change");

		// ensure level1 and lavel2 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// hide level2
		lvl2HiddenCheckbox.getDOMNode().checked = true;
		lvl2HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden"); // should be hidden

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden"); // should be hidden

		// disable level1
		lvl1DisabledCheckbox.getDOMNode().checked = true;
		lvl1DisabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.getDOMNode().checked = false;
		lvl1DisabledCheckbox.simulate("change");

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.getDOMNode().checked = false;
		lvl2HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("visible");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("disabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("visible");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.getDOMNode().checked = false;
		lvl3DisabledCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("visible");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("enabled");

		expect(controller.getActionState({ name: "moon" })).to.equal("visible");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("enabled");
	});

	// Skipping because "ensure mid level is enabled after enabling mid level" - this step isn't enabling mid level
	it.skip("hide disable and hide different levels of panels", () => {
		const category = wrapper.find("div[data-id='properties-panels-in-panels']");
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);

		const lvl1HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel1'] input");
		const lvl2DisabledCheckbox = category.find("div[data-id='properties-disablePanelLevel2'] input");
		const lvl3HiddenCheckbox = category.find("div[data-id='properties-hidePanelLevel3'] input");

		// hide level3
		lvl3HiddenCheckbox.getDOMNode().checked = true;
		lvl3HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// disable level2
		lvl2DisabledCheckbox.getDOMNode().checked = true;
		lvl2DisabledCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level1
		lvl1HiddenCheckbox.getDOMNode().checked = true;
		lvl1HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("hidden");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure mid level still disabled even when top level is visible
		lvl1HiddenCheckbox.getDOMNode().checked = false;
		lvl1HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("disabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure mid level is enabled after enabling mid level
		lvl2DisabledCheckbox.getDOMNode().checked = false;
		lvl2DisabledCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("hidden");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure all are visible after enabling lower level
		lvl3HiddenCheckbox.getDOMNode().checked = false;
		lvl3HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("visible");
		expect(controller.getControlState({ name: "moon_phase" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disable_button_text" })).to.equal("visible");

		expect(controller.getActionState({ name: "moon" })).to.equal("enabled");
		expect(controller.getActionState({ name: "button_cond_disable" })).to.equal("visible");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("visible");
	});
});
describe("complex nested panels visible and enabled conditions work correctly", () => {
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

	it("Init properties at disable hide and disable different levels of panels", () => {
		const category = wrapper.find("div[data-id='properties-init-panels-in-panels']");
		const lvl1DisabledCheckbox = category.find("div[data-id='properties-disableInit1PanelLevel1'] input");
		let lvl2HiddenCheckbox = category.find("div[data-id='properties-hideInit1PanelLevel2'] input");
		let lvl3DisabledCheckbox = category.find("div[data-id='properties-disableInit1PanelLevel3'] input");

		// the initial state at load is disable, hide disable.
		// verify that all conditions are at that state.
		lvl1DisabledCheckbox.getDOMNode().checked = true;
		lvl1DisabledCheckbox.simulate("change");
		lvl2HiddenCheckbox.getDOMNode().checked = true;
		lvl2HiddenCheckbox.simulate("change");
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("hidden");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.getDOMNode().checked = false;
		lvl1DisabledCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("hidden");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.getDOMNode().checked = false;
		lvl2HiddenCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("disabled");

		lvl2HiddenCheckbox = wrapper.find("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = wrapper.find("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.getDOMNode().checked = false;
		lvl3DisabledCheckbox.simulate("change");
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("enabled");
	});
});


describe("Primary panel conditions work correctly", () => {
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

	it("Primary panel can be hidden", () => {
		let textPanel = wrapper.find("div[data-id='properties-text-panels']");
		expect(textPanel).to.have.length(1);
		controller.updatePropertyValue({ name: "hideTextPanels" }, true);
		wrapper.update();
		textPanel = wrapper.find("div[data-id='properties-text-panels']");
		expect(textPanel).to.have.length(0);
	});

});
