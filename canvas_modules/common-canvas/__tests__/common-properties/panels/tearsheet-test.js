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

// Test suite for generic tearsheet testing
import React from "react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { expect } from "chai";
import { renderWithIntl } from "../../_utils_/intl-utils";
import TearSheet from "./../../../src/common-properties/panels/tearsheet";
import codeParamDef from "./../../test_resources/paramDefs/code_paramDef.json";
import Sinon from "sinon";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

describe("tearsheet tests", () => {
	let controller;
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtilsRTL.flyoutEditorForm(codeParamDef);
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});
	it("should be have only one tearsheet rendered", () => {
		expect(document.querySelectorAll("div.properties-tearsheet-panel")).to.have.length(1);
	});
	it("should be visible from the controller method", async() => {
		controller.setActiveTearsheet("tearsheet1");
		await waitFor(() => {
			const tearsheetpanel = document.querySelector("div.properties-tearsheet-panel.is-visible");
			expect(tearsheetpanel).to.not.be.null;
		});
	});
	it("should have title and description set", async() => {
		controller.setActiveTearsheet("tearsheet1");
		await waitFor(() => {
			expect(document.querySelector("div.properties-tearsheet-panel .properties-tearsheet-header h2").textContent).to.equal("Python");
			expect(document.querySelector("div.properties-tearsheet-panel .properties-tearsheet-header p").textContent).to.equal("Your change is automatically saved.");
		});
	});
	it("should be hidden but not removed from DOM on the tearsheet close button", async() => {
		controller.setActiveTearsheet("tearsheet1");
		await waitFor(() => {
			const buttonModalClose = document.querySelector("div.properties-tearsheet-panel");
			expect(buttonModalClose).to.not.be.null;
			expect(buttonModalClose.classList.contains("is-visible")).to.be.false;

			const closeButton = document.querySelector("button.cds--modal-close");
			expect(closeButton).to.not.be.null;
			fireEvent.click(closeButton);
			expect(document.querySelectorAll("div.properties-tearsheet-panel.is-visible")).to.have.length(0);
			expect(document.querySelectorAll("div.properties-tearsheet-panel")).to.have.length(1);
			expect(controller.getActiveTearsheet()).to.equal(null);
		});

	});
	it("should show tearsheet content which is previously hidden", async() => {
		expect(document.querySelectorAll("div.properties-tearsheet-panel")).to.have.length(1);
		expect(document.querySelectorAll("div.properties-tearsheet-panel.is-visible")).to.have.length(0);
		expect(document.querySelectorAll("div.properties-tearsheet-panel div[data-id='properties-ctrl-code_rows']")).to.have.length(0);
		controller.updatePropertyValue({ name: "hide" }, false);
		await waitFor(() => {
			const maximizeButton = document.querySelector("div[data-id='properties-ctrl-code_rows']");
			const btnClick = maximizeButton.querySelector("button.maximize");
			fireEvent.click(btnClick);
			expect(document.querySelector("div.properties-tearsheet-panel.is-visible")).to.not.be.null;
			expect(document.querySelector("div.properties-tearsheet-panel .properties-tearsheet-header h2").textContent).to.equal("Python 2");
			expect(document.querySelector("div.properties-tearsheet-panel div[data-id='properties-ctrl-code_rows']")).to.not.be.null;
		});
	});
});

describe("Tearsheet renders correctly", () => {
	it("should not display buttons in tearsheet if showPropertiesButtons is false", () => {
		const wrapper = renderWithIntl(<TearSheet
			open
			onCloseCallback={Sinon.spy()}
			tearsheet={{
				title: "test title",
				content: "test content"
			}}
			showPropertiesButtons={false}
			applyOnBlur
		/>);
		const { container } = wrapper;
		const tearsheet = container.getElementsByClassName("properties-tearsheet-panel");
		expect(tearsheet).to.not.be.null;
		const header = screen.getByText("test title", { selector: "h2" });
		expect(header).to.exist;
		expect(header.tagName).to.equal("H2");

		const body = screen.getByText("test content");
		expect(body).to.exist;
		expect(container.querySelectorAll("div.properties-tearsheet-body.with-buttons")).to.have.length(0);
		expect(container.querySelectorAll("div.properties-modal-buttons")).to.have.length(0);
	});

	it("should display buttons in tearsheet if showPropertiesButtons is true and applyOnBlur is false", () => {
		const wrapper = renderWithIntl(<TearSheet
			open
			onCloseCallback={null}
			tearsheet={{
				title: "test title",
				content: "test content"
			}}
			applyLabel="Save"
			rejectLabel="Cancel"
			okHandler={Sinon.spy()}
			cancelHandler={Sinon.spy()}
			showPropertiesButtons
		/>);
		const { container } = wrapper;
		const tearsheet = container.querySelectorAll("properties-tearsheet-panel");
		expect(tearsheet).to.not.be.null;
		expect(container.querySelectorAll("div.properties-tearsheet-body.with-buttons")).to.not.be.null;
		expect(container.querySelectorAll("div.properties-modal-buttons")).to.not.be.null;


		// Verify close button is not visible
		expect(container.querySelectorAll("div.properties-tearsheet-header.hide-close-button")).to.not.be.null;
	});
});
