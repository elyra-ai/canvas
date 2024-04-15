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
import TitleEditor from "../../../src/common-properties/components/title-editor";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import sinon from "sinon";
import { mountWithIntl } from "../../_utils_/intl-utils";

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


describe("title-editor renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
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
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("helpClickHandler")).to.equal(helpClickHandler);
		expect(wrapper.prop("labelEditable")).to.equal(true);
		expect(wrapper.prop("help")).to.eql(help);
		expect(wrapper.prop("icon")).to.eql("images/nodes/derive.svg");
		expect(wrapper.prop("heading")).to.eql("heading");
		expect(wrapper.prop("showHeading")).to.eql(true);

	});
	it("test help button callback", (done) => {
		function callback(componentId, inData, inAppData) {
			expect(componentId).to.equal("test-id");
			expect(inData).to.equal("test-data");
			expect(inAppData).to.eql(appData);
			done();
		}
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={callback}
				labelEditable
				help={help}
			/>
		);
		const helpButton = wrapper.find(".properties-title-editor-btn[data-id='help']").hostNodes();
		expect(helpButton).to.have.length(1);
		helpButton.simulate("click");
	});
	it("test with no help", () => {
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
			/>
		);
		expect(wrapper.find(".properties-title-editor-btn[data-id='help']")).to.have.length(0);
	});
	it("test help button without a callback", () => {
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);
		const helpButton = wrapper.find(".properties-title-editor-btn[data-id='help']").hostNodes();
		helpButton.simulate("click");
	});
	it("test edit link", () => {
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>, { attachTo: document.body }
		);
		const titleEdit = wrapper.find(".properties-title-editor-btn[data-id='edit']").hostNodes();
		titleEdit.simulate("click");
		expect(wrapper.find("input").is(":focus")).to.be.true;
	});
	it("test editing node title", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		input.simulate("change", { target: { value: "My new title" } });
		expect("My new title").to.equal(controller.getTitle());
	});
	it("titleChangeHandler should be called after editing node title", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		const newTitle = "My new title";
		input.simulate("change", { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;
	});
	it("Warning message returned by titleChangeHandler should be displayed correctly", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		const newTitle = "Short title"; // Title length exceeds 10 characters. Show warning message.
		input.simulate("change", { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;
		// Verify warning message is displayed
		const warningMessage = "Title exceeds 10 characters. This is a warning message. There is no restriction on message length. Height is adjusted for multi-line messages.";
		expect(wrapper.find(".cds--text-input__field-wrapper--warning")).to.have.length(1);
		expect(wrapper.find("div.cds--form-requirement").text()).to.equal(warningMessage);
	});
	it("Error message returned by titleChangeHandler should be displayed correctly", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		const newTitle = "This is a long title."; // Title length exceeds 15 characters. Show error message.
		input.simulate("change", { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify error message is displayed
		const errorMessage = "Only 15 characters are allowed in title.";
		expect(wrapper.find(".cds--text-input__field-wrapper[data-invalid=true]")).to.have.length(1);
		expect(wrapper.find("div.cds--form-requirement").text()).to.equal(errorMessage);
	});
	it("Don't show any error/warning message when titleChangeHandler doesn't return anything", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		const newTitle = "Test"; // Title length is less than 10. titleChangeHandler doesn't return anything when title is valid.
		input.simulate("change", { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify no message is displayed
		expect(wrapper.find(".cds--form-requirement")).to.have.length(0);
	});
	it("Don't show any error/warning message when titleChangeHandler response is invalid", () => {
		controller.setTitle("test title");
		titleChangeHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
			/>
		);
		const input = wrapper.find("input");
		// For this title, titleChangeHandler returns { "abc": "xyz" }.
		const newTitle = "Invalid";
		input.simulate("change", { target: { value: newTitle } });
		expect(titleChangeHandler.calledOnce).to.equal(true);
		expect(titleChangeHandler.calledWith(newTitle)).to.be.true;

		// verify no message is displayed
		expect(wrapper.find(".cds--form-requirement")).to.have.length(0);
	});
	it("test label is readonly", () => {
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable={false}
			/>
		);
		const input = wrapper.find("input");
		expect(input.prop("readOnly")).to.equal(true);
	});
	it("heading should render if enabled and passed in", () => {
		const wrapper = mountWithIntl(
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
		expect(wrapper.find(".properties-title-heading")).to.have.length(1);
		expect(wrapper.find(".properties-title-editor.properties-title-with-heading")).to.have.length(1);
		expect(wrapper.find(".properties-title-heading-label")).to.have.length(1);
		expect(wrapper.find("InlineSVG.properties-title-heading-icon")).to.have.length(1);
	});
	it("heading should not render if disabled", () => {
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				icon={"images/nodes/derive.svg"}
				heading={"heading"}
			/>
		);
		expect(wrapper.find(".properties-title-heading")).to.have.length(0);
		expect(wrapper.find(".properties-title-editor.properties-title-with-heading")).to.have.length(0);
		expect(wrapper.find(".properties-title-heading-label")).to.have.length(0);
		expect(wrapper.find("InlineSVG.properties-title-heading-icon")).to.have.length(0);
	});
	it("heading should not render if enabled but no uiHints are passed in", () => {
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				helpClickHandler={helpClickHandler}
				labelEditable
				showHeading
			/>
		);
		expect(wrapper.find(".properties-title-heading")).to.have.length(0);
		expect(wrapper.find(".properties-title-editor.properties-title-with-heading")).to.have.length(0);
		expect(wrapper.find(".properties-title-heading-label")).to.have.length(0);
		expect(wrapper.find("InlineSVG.properties-title-heading-icon")).to.have.length(0);
	});
	it("If heading is enabled, help button should be added in the heading", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
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
		const heading = wrapper.find(".properties-title-heading");
		expect(heading).to.have.length(1);
		const helpButton = heading.find("button.properties-title-editor-btn[data-id='help']");
		expect(helpButton).to.have.length(1);

		// Help button should not be added in title editor
		const titleEditorWithHelp = wrapper.find(".properties-title-editor-with-help");
		expect(titleEditorWithHelp).to.have.length(0);
	});
	it("If heading is disabled, help button should be added next to edit title button", () => {
		controller.setTitle("test title");
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);

		// Ensure heading is disabled
		const heading = wrapper.find(".properties-title-heading");
		expect(heading).to.have.length(0);

		// Help button next to edit title button
		const titleEditorWithHelp = wrapper.find(".properties-title-editor-with-help");
		expect(titleEditorWithHelp).to.have.length(1);
		const helpButton = wrapper.find("button.properties-title-editor-btn[data-id='help']");
		expect(helpButton).to.have.length(1);

	});

	it("Don't render TitleEditor when title is null", () => {
		controller.setTitle(null);
		helpClickHandler.resetHistory();
		const wrapper = mountWithIntl(
			<TitleEditor
				store={controller.getStore()}
				controller={controller}
				labelEditable
				help={help}
			/>
		);

		// Verify TitleEditor isn't rendered
		const titleEditor = wrapper.find(".properties-title-editor");
		expect(titleEditor).to.have.length(0);
	});
});
