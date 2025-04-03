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

import React from "react";
import MainEditorPropertiesButtons from "../../../src/common-properties/components/main-editor-properties-buttons";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import sinon from "sinon";
import { Provider } from "react-redux";
import { renderWithIntl } from "../../_utils_/intl-utils";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import textfieldParamDef from "../../test_resources/paramDefs/textfield_paramDef.json";
import { cleanup, fireEvent } from "@testing-library/react";

const controller = new Controller();
controller.setTitle("test title");
const form = {
	componentId: "test-id"
};
controller.setForm(form);
const appData = {
	nodeId: "node-id"
};
controller.setAppData(appData);

const okHandler = sinon.spy();
const cancelHandler = sinon.spy();
const applyLabel = "test apply";
const rejectLabel = "test reject";

describe("main-editor-properties-buttons renders correctly", () => {
	beforeEach(() => {
		controller.setSaveButtonDisable(false);
		controller.setErrorMessages({});
	});
	afterEach(() => {
		cleanup();
	});
	it("test main-editor-properties-buttons renders and function correctly", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors
				/>
			</Provider>);

		const { container } = wrapper;
		const buttons = container.querySelectorAll("button");
		expect(buttons).to.have.length(2);

		expect(buttons[0].textContent).to.equal(rejectLabel);
		expect(buttons[1].textContent).to.equal(applyLabel);

		fireEvent.click(buttons[0]);
		expect(cancelHandler).to.have.property("callCount", 1);
		fireEvent.click(buttons[1]);
		expect(okHandler).to.have.property("callCount", 1);
	});

	it("test main-editor-properties-buttons save button when disableSaveOnRequiredErrors is false", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors={false}
				/>
			</Provider>);
		const { container } = wrapper;
		const buttons = container.querySelectorAll("button");
		expect(buttons).to.have.length(2);
		const applyButton = buttons[1];

		// Save button should be enabled by default
		expect(applyButton.hasAttribute("disabled")).to.equal(false);

		// Controller sets save button to disabled
		controller.setSaveButtonDisable(true);
		expect(controller.getSaveButtonDisable()).to.be.true;
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors={false}
				/>
			</Provider>);
		expect(applyButton.hasAttribute("disabled")).to.equal(true);

		// Controller sets save button to enabled
		controller.setSaveButtonDisable(false);
		expect(controller.getSaveButtonDisable()).to.be.false;
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors={false}
				/>
			</Provider>);
		expect(applyButton.hasAttribute("disabled")).to.equal(false);
	});

	it("test main-editor-properties-buttons save button when disableSaveOnRequiredErrors is true", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors
				/>
			</Provider>);
		const { container } = wrapper;
		const buttons = container.querySelectorAll("button");
		expect(buttons).to.have.length(2);
		const applyButton = buttons[1];

		// If there are no error messages and disableSaveOnRequiredErrors is true, button should be enabled
		expect(applyButton.hasAttribute("disabled")).to.equal(false);

		// If there are required error messages and disableSaveOnRequiredErrors is true, button should be disabled
		controller.setErrorMessages({
			testcontrol: {
				type: "error",
				text: "You must enter a value for string with char limit.",
				validation_id: "required_string_charLimit_713.1789411411248",
				required: true
			}
		});
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors
				/>
			</Provider>);
		expect(applyButton.hasAttribute("disabled")).to.equal(true);

		// If there are no required error messages and disableSaveOnRequiredErrors is true, button should be enabled
		controller.setErrorMessages({
			testcontrol: {
				type: "error",
				text: "You must enter a value for string with char limit.",
				validation_id: "required_string_charLimit_713.1789411411248",
				required: false
			}
		});
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<MainEditorPropertiesButtons
					controller={controller}
					okHandler={okHandler}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons
					disableSaveOnRequiredErrors
				/>
			</Provider>);
		expect(applyButton.hasAttribute("disabled")).to.equal(false);

	});

	it("main-editor-properties-buttons should be disabled if required fields are not filled", () => {
		// disableSaveOnRequiredErrors should be enabled only if 'applyOnBlur' is set to false
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldParamDef, { applyOnBlur: false, disableSaveOnRequiredErrors: true });
		const wrapper = renderedObject.wrapper;
		const rcontroller = renderedObject.controller;

		const actualErrors = rcontroller.getAllErrorMessages();
		const expectedErrors = {
			"string_empty": {
				"type": "error",
				"text": "You must enter a value for Empty.",
				"validation_id": "required_string_empty_938.7063182960883",
				"required": true,
				"displayError": false,
				"propertyId": {
					"name": "string_empty"
				}
			}
		};
		expect(actualErrors).to.eql(expectedErrors);

		// Save button should be disabled by default because there are required fields not filled
		const { container } = wrapper;
		let applyButton = container.querySelector("button.properties-apply-button");
		expect(applyButton).to.have.property("disabled").to.equal(true);

		// Enter value for required control
		const textWrapper = container.querySelector("div[data-id='properties-string_empty']");
		const input = textWrapper.querySelector("input");
		fireEvent.change(input, { target: { value: "not empty" } });

		// Save nutton should not be disabled anymore
		applyButton = container.querySelector("button.properties-apply-button");
		expect(applyButton).to.have.property("disabled").to.equal(false);
		expect(rcontroller.getAllErrorMessages()).to.eql({});
	});
});
