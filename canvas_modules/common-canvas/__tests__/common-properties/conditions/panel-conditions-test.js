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

import { fireEvent } from "@testing-library/react";
import propertyUtilsRTL from "./../../_utils_/property-utilsRTL";
import React from "react";
import CommonProperties from "./../../../src/common-properties/common-properties.jsx";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";

describe("nested panels visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("top level panel should disable all child panels and controls", () => {
		const { container } = wrapper;
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
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel1'] input");
		expect(disabledCheckbox.checked).to.equal(false);
		disabledCheckbox.setAttribute("checked", true);
		fireEvent.click(disabledCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel1'] input");
		expect(hiddenCheckbox.checked).to.equal(false);

		// hide level1
		hiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(hiddenCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel2'] input");
		expect(disabledCheckbox.checked).to.equal(false);

		// disable level2
		disabledCheckbox.setAttribute("checked", true);
		fireEvent.click(disabledCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		expect(hiddenCheckbox.checked).to.equal(false);

		// hide level2
		hiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(hiddenCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const disabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel3'] input");
		expect(disabledCheckbox.checked).to.equal(false);

		// disable level3
		disabledCheckbox.setAttribute("checked", true);
		fireEvent.click(disabledCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const hiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel3'] input");
		expect(hiddenCheckbox.checked).to.equal(false);

		// hide level3
		hiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(hiddenCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		let lvl1DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel1'] input");
		expect(lvl1DisabledCheckbox.checked).to.equal(false);
		let lvl2DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel2'] input");
		expect(lvl2DisabledCheckbox.checked).to.equal(false);
		let lvl3DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl3DisabledCheckbox.checked).to.equal(false);

		// disable level3
		lvl1DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl3DisabledCheckbox);

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
		lvl2DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl2DisabledCheckbox);

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
		lvl1DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl1DisabledCheckbox);

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

		lvl1DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel1'] input");
		lvl2DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel3'] input");

		expect(lvl2DisabledCheckbox.checked).to.be.true;
		expect(lvl3DisabledCheckbox.checked).to.be.true;

		lvl1DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl1DisabledCheckbox);
		lvl2DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl2DisabledCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		let lvl1HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel1'] input");
		expect(lvl1HiddenCheckbox.checked).to.equal(false);
		let lvl2HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		expect(lvl2HiddenCheckbox.checked).to.equal(false);
		let lvl3HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel3'] input");
		expect(lvl3HiddenCheckbox.checked).to.equal(false);

		// hide level3
		lvl3HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl3HiddenCheckbox);

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
		lvl2HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl2HiddenCheckbox);

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
		lvl1HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl1HiddenCheckbox);

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

		lvl1HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel1'] input");
		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		lvl3HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel3'] input");
		expect(lvl2HiddenCheckbox).to.not.exist; // Hidden controls are not rendered
		expect(lvl3HiddenCheckbox).to.not.exist; // Hidden controls are not rendered

		// Unhide level 1 then level 2
		lvl1HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl1HiddenCheckbox);
		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		lvl2HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl2HiddenCheckbox);

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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const checkboxes = category.querySelectorAll("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.checked).to.equal(false);
		});
		const lvl1DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel1'] input");
		let lvl2HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		let lvl3DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel3'] input");

		// disable level3
		lvl3DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl3DisabledCheckbox);

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
		lvl2HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl2HiddenCheckbox);

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
		lvl1DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl1DisabledCheckbox);

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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl2HiddenCheckbox.checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.not.exist; // Hidden controls are not rendered

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl1DisabledCheckbox);

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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl2HiddenCheckbox.checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.not.exist; // Hidden controls are not rendered

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl2HiddenCheckbox);
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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hidePanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelector("div[data-id='properties-disablePanelLevel3'] input");
		expect(lvl3DisabledCheckbox.checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl3DisabledCheckbox);
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
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-panels-in-panels']");
		const checkboxes = category.querySelectorAll("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);

		const lvl1HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel1'] input");
		const lvl2DisabledCheckbox = category.querySelector("div[data-id='properties-disablePanelLevel2'] input");
		const lvl3HiddenCheckbox = category.querySelector("div[data-id='properties-hidePanelLevel3'] input");

		// hide level3
		lvl3HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl3HiddenCheckbox);
		// lvl3HiddenCheckbox.simulate("change");
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
		lvl2DisabledCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl2DisabledCheckbox);
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
		lvl1HiddenCheckbox.setAttribute("checked", true);
		fireEvent.click(lvl1HiddenCheckbox);
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
		lvl1HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl1HiddenCheckbox);
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
		lvl2DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl2DisabledCheckbox);
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
		lvl3HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl3HiddenCheckbox);
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
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Init properties at disable hide and disable different levels of panels", () => {
		const { container } = wrapper;
		const category = container.querySelector("div[data-id='properties-init-panels-in-panels']");
		const lvl1DisabledCheckbox = category.querySelector("div[data-id='properties-disableInit1PanelLevel1'] input");
		let lvl2HiddenCheckbox = category.querySelector("div[data-id='properties-hideInit1PanelLevel2'] input");
		let lvl3DisabledCheckbox = category.querySelectorAll("div[data-id='properties-disableInit1PanelLevel3'] input");

		// the initial state at load is disable, hide disable.
		// verify that all conditions are at that state.
		lvl1DisabledCheckbox.setAttribute("checked", true);
		fireEvent.change(lvl1DisabledCheckbox);
		lvl2HiddenCheckbox.setAttribute("checked", true);
		fireEvent.change(lvl2HiddenCheckbox);
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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelectorAll("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl2HiddenCheckbox.checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl1DisabledCheckbox);
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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelectorAll("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl2HiddenCheckbox.checked).to.be.true;
		expect(lvl3DisabledCheckbox).to.have.length(0); // Hidden controls are not rendered

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl2HiddenCheckbox);
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

		lvl2HiddenCheckbox = container.querySelector("div[data-id='properties-hideInit1PanelLevel2'] input");
		lvl3DisabledCheckbox = container.querySelector("div[data-id='properties-disableInit1PanelLevel3'] input");
		expect(lvl3DisabledCheckbox.checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.setAttribute("checked", false);
		fireEvent.click(lvl3DisabledCheckbox);
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
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Primary panel can be hidden", () => {
		const { container } = wrapper;
		const { rerender } = wrapper;
		let textPanel = container.querySelectorAll("div[data-id='properties-text-panels']");
		expect(textPanel).to.have.length(1);

		controller.updatePropertyValue({ name: "hideTextPanels" }, true);
		const rerendered = propertyUtilsRTL.flyoutEditorFormRerender(panelConditionsParamDef);
		const { propertiesInfo, propertiesConfig, callbacks, customControls, customConditionOps } = rerendered;
		rerender(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={customControls}
					customConditionOps={customConditionOps}
				/>
			</div>
		);

		textPanel = container.querySelectorAll("div[data-id='properties-text-panels']");
		expect(textPanel).to.have.length(0);
	});

});
