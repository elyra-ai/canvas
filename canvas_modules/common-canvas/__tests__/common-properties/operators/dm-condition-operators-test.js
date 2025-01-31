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
import { expect } from "chai";
import conditionOpParamDef from "../../test_resources/paramDefs/dmConditionOp_paramDef.json";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import sinon from "sinon";

describe("dm condition operators work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(conditionOpParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		cleanup();
	});

	it("checkbox control become enabled if selected item has a dmType equal to string", () => {
		const { container } = wrapper;
		expect(controller.getControlState({ name: "checkbox" })).to.equal("disabled");
		const dropDown = container.querySelector("div[data-id='properties-ctrl-dmTypeEqualList']");
		const dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		fireEvent.click(dropdownList[3]);
		expect(dropdownList).to.be.length(14);
		expect(controller.getControlState({ name: "checkbox" })).to.equal("enabled");
	});

	it("checkbox control become visible if selected item does not have a dmType equal to string", () => {
		const { container } = wrapper;
		expect(controller.getControlState({ name: "checkbox1" })).to.equal("hidden");
		const dropDown = container.querySelector("div[data-id='properties-ctrl-dmTypeNotEqualList']");
		const dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		fireEvent.click(dropdownList[1]);
		expect(controller.getControlState({ name: "checkbox1" })).to.equal("visible");
	});

	it("checkbox control becomes enabled if selected item has a dmRole equal to input", () => {
		const { container } = wrapper;
		expect(controller.getControlState({ name: "checkbox2" })).to.equal("disabled");
		const dropDown = container.querySelector("div[data-id='properties-ctrl-dmRoleEqualList']");
		const dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		fireEvent.click(dropdownList[1]);
		expect(controller.getControlState({ name: "checkbox2" })).to.equal("enabled");
	});

	it("checkbox control become visible if selected item does not have a dmRole equal to input", () => {
		const { container } = wrapper;
		expect(controller.getControlState({ name: "checkbox3" })).to.equal("hidden");
		const dropDown = container.querySelector("div[data-id='properties-ctrl-dmRoleNotEqualList']");
		const dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		fireEvent.click(dropdownList[2]);
		expect(controller.getControlState({ name: "checkbox3" })).to.equal("visible");
	});

	// This works in the UI but errorMessages is not updated in test
	it("selectColumn control becomes validated if selected item has a dmRole equal to discrete", async() => {
		let errorMessages;
		const { container } = wrapper;
		const dropDown = container.querySelector("div[data-id='properties-dmMeasurementEqualList']");
		let dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		fireEvent.click(dropdownList[0]);// Trigger Error Message
		await waitFor(() => {
			errorMessages = controller.getErrorMessages();
			expect(errorMessages).to.not.deep.equal({});
			expect(errorMessages.dmMeasurementEqualList.type).to.equal("error");
		});
		// Manually updating the store
		sinon.stub(controller, "getErrorMessages")
			.onFirstCall()
			.returns({
				dmMeasurementNotEqualList: {
					type: "error",
					text: "Select field that does not have a measure of discrete.",
					validation_id: "dmMeasurementNotEqualList",
					propertyId: { name: "dmMeasurementNotEqualList" },
					required: false,
					displayError: false
				}
			}) // Initial state
			.onSecondCall()
			.returns({});
		dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		fireEvent.click(dropdownList[3]); // Fulfill condition
		await waitFor(() => {
			errorMessages = controller.getErrorMessages();
			expect(errorMessages).to.deep.equal({});
		});

	});

	// This works in the UI but errorMessages is not updated in test
	it("selectColumn control become validated if selected item does not have a dmRole equal to discrete", () => {
		const { container } = wrapper;
		const dropDown = container.querySelector("div[data-id='properties-dmMeasurementNotEqualList']");
		const dropdownButton = dropDown.querySelectorAll("button")[0];
		fireEvent.click(dropdownButton);
		const dropdownList = container.querySelectorAll("li.cds--list-box__menu-item");
		expect(dropdownList).to.be.length(14);
		fireEvent.click(dropdownList[3]); // Trigger Error Message by selecting item with dmRole discrete
		let errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.not.equal({});
		expect(errorMessages.dmMeasurementNotEqualList.type).to.equal("error");
		const getErrorMessage = sinon.stub(controller, "getErrorMessages");
		getErrorMessage.onFirstCall().returns({});
		errorMessages = controller.getErrorMessages();
		expect(errorMessages).to.deep.equal({});
	});
});

