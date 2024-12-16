/*
 * Copyright 2017-2025 Elyra Authors
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
import TitleEditor from "../../../src/common-properties/components/title-editor";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { fireEvent, within } from "@testing-library/react";

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import ACTION_PARAMDEF from "../../test_resources/paramDefs/action_paramDef.json";

let controller = new Controller();
controller.setTitle("test title");
const form = {
	componentId: "test-id"
};
controller.setForm(form);
const appData = {
	nodeId: "node-id"
};
controller.setAppData(appData);

const helpClickHandler = sinon.spy();
const help = { data: "test-data" };

const titleChangeHandlerFunction = function(title, callbackFunction) {
	// If Title is valid. No need to send anything in callbackFunction
	if (title.length > 15) {
		callbackFunction({ type: "error", message: "Only 15 characters are allowed in title." });
	} else if (title.length > 10 && title.length <= 15) {
		callbackFunction({
			type: "warning",
			message: "Title exceeds 10 characters. This is a warning message. There is no restriction on message length. Height is adjusted for multi-line messages."
		});
	} else if (title === "Invalid") {
		callbackFunction({ "abc": "xyz" });
	}
};
const titleChangeHandler = sinon.spy(titleChangeHandlerFunction);
controller.setHandlers({
	titleChangeHandler: titleChangeHandler
});

const mockTitleEditor = jest.fn();
jest.mock("../../../src/common-properties/components/title-editor",
	() => (props) => mockTitleEditor(props)
);

mockTitleEditor.mockImplementation((props) => {
	const TitleEditorComp = jest.requireActual(
		"../../../src/common-properties/components/title-editor",
	).default;
	return <TitleEditorComp {...props} />;
});

describe("title-editor renders correctly", () => {

	it("props should have been defined", () => {
		renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				help={help}
				icon={"images/nodes/derive.svg"}
				heading={"heading"}
				showHeading
			/>
		);
		expectJest(mockTitleEditor).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"helpClickHandler": helpClickHandler,
			"labelEditable": true,
			"help": help,
			"icon": "images/nodes/derive.svg",
			"heading": "heading",
			"showHeading": true
		});
	});
	it("test help button callback", (done) => {
		function callback(componentId, inData, inAppData) {
			expect(componentId).to.equal("test-id");
			expect(inData).to.equal("test-data");
			expect(inAppData).to.eql(appData);
			done();
		}
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={callback}
				labelEditable
				help={help}
			/>
		);
		const { container } = wrapper;
		const helpButtonCont = container.querySelectorAll(".properties-title-editor-btn[data-id='help']");
		expect(helpButtonCont).to.have.length(1);
		fireEvent.click(helpButtonCont[0]);
	});
	it("test with no help", () => {
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
			/>
		);
		const { container } = wrapper;
		expect(container.querySelector(".properties-title-editor-btn[data-id='help']")).to.not.exist;
	});
	it("test help button without a callback", () => {
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);
		const { container } = wrapper;
		const helpButton = container.querySelector(".properties-title-editor-btn[data-id='help']");
		fireEvent.click(helpButton);
	});
	it("test edit link", () => {
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>, { attachTo: document.body }
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		const titleEdit = container.querySelector(".properties-title-editor-btn[data-id='edit']");
		fireEvent.click(titleEdit);
		expect(input.focus).to.exist;
	});
	it("test editing node title", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		fireEvent.change(input, { target: { value: "My new title" } });
		expect("My new title").to.equal(controller.getTitle());
	});
	it("titleChangeHandler should be called after editing node title", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		const newTitle = "My new title";
		fireEvent.change(input, { target: { value: "My new title" } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;
	});
	it("Warning message returned by titleChangeHandler should be displayed correctly", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		const newTitle = "Short title"; // Title length exceeds 10 characters. Show warning message.
		fireEvent.change(input, { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;
		// Verify warning message is displayed
		const warningMessage = "Title exceeds 10 characters. This is a warning message. There is no restriction on message length. Height is adjusted for multi-line messages.";
		expect(container.getElementsByClassName("cds--text-input__field-wrapper--warning")).to.have.length(1);
		expect(container.querySelector("div.cds--form-requirement").textContent).to.equal(warningMessage);
	});
	it("Error message returned by titleChangeHandler should be displayed correctly", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		const newTitle = "This is a long title."; // Title length exceeds 15 characters. Show error message.
		fireEvent.change(input, { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify error message is displayed
		const errorMessage = "Only 15 characters are allowed in title.";
		expect(container.querySelector(".cds--text-input__field-wrapper[data-invalid=true]")).to.exist;
		expect(container.querySelector("div.cds--form-requirement").textContent).to.equal(errorMessage);
	});
	it("Don't show any error/warning message when titleChangeHandler doesn't return anything", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		const newTitle = "Test"; // Title length is less than 10. titleChangeHandler doesn't return anything when title is valid.
		fireEvent.change(input, { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify no message is displayed
		expect(container.getElementsByClassName("cds--form-requirement")).to.have.length(0);
	});
	it("Don't show any error/warning message when titleChangeHandler response is invalid", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		// For this title, titleChangeHandler returns { "abc": "xyz" }.
		const newTitle = "Invalid";
		fireEvent.change(input, { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify no message is displayed
		expect(container.getElementsByClassName("cds--form-requirement")).to.have.length(0);
	});
	it("test label is readonly", () => {
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable={false}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelector("input");
		expect(input.readOnly).to.equal(true);
	});
	it("heading should render if enabled and passed in", () => {
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				icon={"images/nodes/derive.svg"}
				heading={"heading"}
				showHeading
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-title-heading")).to.have.length(1);
		expect(container.getElementsByClassName("properties-title-editor properties-title-with-heading")).to.have.length(1);
		expect(container.getElementsByClassName("properties-title-heading-label")).to.have.length(1);
	});
	it("heading should not render if disabled", () => {
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				icon={"images/nodes/derive.svg"}
				heading={"heading"}
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-title-heading")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-editor.properties-title-with-heading")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-heading-label")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-heading-icon")).to.have.length(0);
	});
	it("heading should not render if enabled but no uiHints are passed in", () => {
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				showHeading
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-title-heading")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-editor.properties-title-with-heading")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-heading-label")).to.have.length(0);
		expect(container.getElementsByClassName("properties-title-heading-icon")).to.have.length(0);
	});
	it("If heading is enabled, help button should be added in the heading", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
				heading={"heading"}
				showHeading
			/>
		);
		// Help button in heading
		const { container } = wrapper;
		const heading = container.getElementsByClassName("properties-title-heading");
		expect(heading).to.have.length(1);
		const helpButton = heading[0].getElementsByClassName("properties-title-editor-btn");
		expect(helpButton).to.have.length(1);

		// Help button should not be added in title editor
		const titleEditorWithHelp = container.getElementsByClassName("properties-title-editor-with-help");
		expect(titleEditorWithHelp).to.have.length(0);
	});
	it("If heading is disabled, help button should be added next to edit title button", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);
		const { container } = wrapper;
		// Ensure heading is disabled
		const heading = container.getElementsByClassName("properties-title-heading");
		expect(heading).to.have.length(0);

		// Help button next to edit title button
		const titleEditorWithHelp = container.getElementsByClassName("properties-title-editor-with-help");
		expect(titleEditorWithHelp).to.have.length(1);
		const helpButton = container.querySelector("button.properties-title-editor-btn[data-id='help']");
		expect(helpButton).to.exist;

	});

	it("Don't render TitleEditor when title is null", () => {
		controller.setTitle(null);
		helpClickHandler.resetHistory();
		const wrapper = renderWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);
		const { container } = wrapper;
		// Verify TitleEditor isn't rendered
		const titleEditor = container.getElementsByClassName("properties-title-editor");
		expect(titleEditor).to.have.length(0);
	});
});

describe("Title editor actions", () => {
	let renderedObject;
	beforeEach(() => {
		renderedObject = propertyUtilsRTL.flyoutEditorForm(ACTION_PARAMDEF);
		controller = new Controller();
	});

	it("title editor should render actions if defined", () => {
		const spyPropertyActionHandler = sinon.spy();
		renderedObject = propertyUtilsRTL.flyoutEditorForm(ACTION_PARAMDEF, null, { actionHandler: spyPropertyActionHandler }, { appData: appData });
		const { container } = renderedObject.wrapper;
		const actions = container.querySelector(".properties-title-editor-actions");
		const buttons = within(actions).getAllByRole("button");
		expect(buttons.length).to.equal(2);

		expect(buttons[0].textContent).to.equal("Increment");
		expect(buttons[1].textContent).to.equal("Run");

		fireEvent.click(buttons[0]);

		expect(spyPropertyActionHandler.calledOnce).to.equal(true);
		expect(spyPropertyActionHandler.calledWith(
			ACTION_PARAMDEF.uihints.title_info.action_refs[0],
			appData,
			{ parameter_ref: "number" }
		)).to.be.true;
	});
});
