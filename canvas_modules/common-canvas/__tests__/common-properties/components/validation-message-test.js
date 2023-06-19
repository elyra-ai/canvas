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
import ValidationMessage from "../../../src/common-properties/components/validation-message";
import { mount } from "enzyme";
import { expect } from "chai";

const warningMessage = {
	text: "Testing validation message",
	type: "warning"
};
const errorMessage = {
	text: "Testing validation message",
	type: "error"
};
const infoMessage = {
	text: "Testing validation message",
	type: "info"
};

describe("validation-message renders correctly", () => {
	it("props should have been defined", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={warningMessage}
				state="hidden"
				inTable
				tableOnly
			/>
		);
		expect(wrapper.prop("messageInfo")).to.equal(warningMessage);
		expect(wrapper.prop("state")).to.equal("hidden");
		expect(wrapper.prop("inTable")).to.equal(true);
		expect(wrapper.prop("tableOnly")).to.equal(true);
	});
	it("validation-message renders error message correctly", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={errorMessage}
			/>
		);
		const messageWrapper = wrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.find("div.icon svg.canvas-state-icon-error")).to.have.length(0);
		expect(messageWrapper.find("span").text()).to.equal(errorMessage.text);
	});
	it("validation-message renders error message correctly in table", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={errorMessage}
				inTable
			/>
		);
		const messageWrapper = wrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.find("div.icon svg.canvas-state-icon-error")).to.have.length(1);
		expect(messageWrapper.find("span").text()).to.equal(errorMessage.text);
	});
	it("validation-message renders warning message correctly", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={warningMessage}
			/>
		);
		const messageWrapper = wrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.find("div.icon svg.canvas-state-icon-warning")).to.have.length(0);
		expect(messageWrapper.find("span").text()).to.equal(warningMessage.text);

	});
	it("validation-message renders warning message correctly in table", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={warningMessage}
				inTable
			/>
		);
		const messageWrapper = wrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.find("div.icon svg.canvas-state-icon-warning")).to.have.length(1);
		expect(messageWrapper.find("span").text()).to.equal(warningMessage.text);

	});
	it("validation-message renders info message correctly", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={infoMessage}
			/>
		);
		const messageWrapper = wrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper.find("div.icon svg.canvas-state-icon-info")).to.have.length(0);
		expect(messageWrapper.find("span").text()).to.equal(infoMessage.text);
	});
	it("validation-message renders correctly when no message set", () => {
		const wrapper = mount(
			<ValidationMessage />
		);
		expect(wrapper.find("div.properties-validation-message")).to.have.length(0);
	});
	it("validation-message renders correctly when tableOnly set", () => {
		const wrapper = mount(
			<ValidationMessage messageInfo={infoMessage} tableOnly />
		);
		expect(wrapper.find("div.properties-validation-message")).to.have.length(0);
	});
	it("validation-message doesn't display when state 'hidden'", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={errorMessage}
				state={"hidden"}
			/>
		);
		expect(wrapper.find("div.properties-validation-message.hide")).to.have.length(1);
	});
	it("validation-message doesn't display when state 'disabled'", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={errorMessage}
				state={"disabled"}
			/>
		);
		expect(wrapper.find("div.properties-validation-message.hide")).to.have.length(1);
	});
	it("validation-message display when in a table ", () => {
		const wrapper = mount(
			<ValidationMessage
				messageInfo={errorMessage}
				inTable
			/>
		);
		expect(wrapper.find("div.properties-validation-message.inTable")).to.have.length(1);
	});

});
