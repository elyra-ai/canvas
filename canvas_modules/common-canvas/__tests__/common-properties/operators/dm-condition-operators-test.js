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
import conditionOpParamDef from "../../test_resources/paramDefs/dmConditionOp_paramDef.json";

describe("dm condition operators work correctly", () => {
	var wrapper;
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(conditionOpParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("checkbox control become enabled if selected item has a dmType equal to string", () => {
		expect(controller.getControlState({ name: "checkbox" })).to.equal("disabled");
		const dropDown = wrapper.find("div[data-id='properties-ctrl-dmTypeEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		dropdownList.at(3).simulate("click");
		wrapper.update();
		expect(dropdownList).to.be.length(14);
		expect(controller.getControlState({ name: "checkbox" })).to.equal("enabled");

	});

	it("checkbox control become visible if selected item does not have a dmType equal to string", () => {
		expect(controller.getControlState({ name: "checkbox1" })).to.equal("hidden");
		const dropDown = wrapper.find("div[data-id='properties-ctrl-dmTypeNotEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		dropdownList.at(1).simulate("click");
		wrapper.update();
		expect(controller.getControlState({ name: "checkbox1" })).to.equal("visible");
	});

	it("checkbox control becomes enabled if selected item has a dmRole equal to input", () => {
		expect(controller.getControlState({ name: "checkbox2" })).to.equal("disabled");
		const dropDown = wrapper.find("div[data-id='properties-ctrl-dmRoleEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		dropdownList.at(1).simulate("click");
		wrapper.update();
		expect(controller.getControlState({ name: "checkbox2" })).to.equal("enabled");
	});

	it("checkbox control become visible if selected item does not have a dmRole equal to input", () => {
		expect(controller.getControlState({ name: "checkbox3" })).to.equal("hidden");
		const dropDown = wrapper.find("div[data-id='properties-ctrl-dmRoleNotEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		dropdownList.at(2).simulate("click");
		wrapper.update();
		expect(controller.getControlState({ name: "checkbox3" })).to.equal("visible");
	});

	it("selectColumn control becomes validated if selected item has a dmRole equal to discrete", () => {
		const dropDown = wrapper.find("div[data-id='properties-dmMeasurementEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		dropdownList.at(0).simulate("click"); // Trigger Error Message
		let errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.not.equal({});
		expect(errorMessages.dmMeasurementEqualList.type).to.equal("error");
		dropdownButton.simulate("click");
		dropdownList.at(3).simulate("click"); // Fulfill Condition by selecting item with dmRole discrete
		errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.deep.equal({});
	});

	it("selectColumn control become validated if selected item does not have a dmRole equal to discrete", () => {
		const dropDown = wrapper.find("div[data-id='properties-dmMeasurementNotEqualList']");
		const dropdownButton = dropDown.find("button").at(0);
		dropdownButton.simulate("click");
		const dropdownList = wrapper.find("div.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		dropdownList.at(3).simulate("click"); // Trigger Error Message by selecting item with dmRole discrete
		let errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.not.equal({});
		expect(errorMessages.dmMeasurementNotEqualList.type).to.equal("error");
		dropdownButton.simulate("click");
		dropdownList.at(1).simulate("click"); // Fulfill Condition by selecting item with dmRole input
		errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.deep.equal({});
	});
});
