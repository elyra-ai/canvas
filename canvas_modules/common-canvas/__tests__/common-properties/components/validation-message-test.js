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
import ValidationMessage from "../../../src/common-properties/components/validation-message";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";

const mockValidationMessage = jest.fn();
jest.mock("../../../src/common-properties/components/validation-message",
	() => (props) => mockValidationMessage(props)
);

mockValidationMessage.mockImplementation((props) => {
	const ValidationMessageComp = jest.requireActual(
		"../../../src/common-properties/components/validation-message",
	).default;
	return <ValidationMessageComp {...props} />;
});

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
		render(
			<ValidationMessage
				messageInfo={warningMessage}
				state="hidden"
				inTable
				tableOnly
			/>
		);
		expectJest(mockValidationMessage).toHaveBeenCalledWith({
			"messageInfo": warningMessage,
			"state": "hidden",
			"inTable": true,
			"tableOnly": true
		});
	});
	it("validation-message renders error message correctly", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={errorMessage}
			/>
		);
		const { container } = wrapper;
		const messageWrapper = container.getElementsByClassName("properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper[0].getElementsByClassName("canvas-state-icon-error")).to.have.length(0);
		expect(messageWrapper[0].querySelector("span").textContent).to.equal(errorMessage.text);
	});
	it("validation-message renders error message correctly in table", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={errorMessage}
				inTable
			/>
		);
		const { container } = wrapper;
		const messageWrapper = container.getElementsByClassName("properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper[0].getElementsByClassName("canvas-state-icon-error")).to.have.length(1);
		expect(wrapper.getByText(/Testing validation message/).textContent).to.equal(errorMessage.text);
	});
	it("validation-message renders warning message correctly", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={warningMessage}
			/>
		);
		const { container } = wrapper;
		const messageWrapper = container.getElementsByClassName("properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper[0].querySelectorAll("svg.canvas-state-icon-warning")).to.have.length(0);
		expect(messageWrapper[0].querySelector("span").textContent).to.equal(warningMessage.text);

	});
	it("validation-message renders warning message correctly in table", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={warningMessage}
				inTable
			/>
		);
		const { container } = wrapper;
		const messageWrapper = container.getElementsByClassName("properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper[0].getElementsByClassName("canvas-state-icon-warning")).to.have.length(1);
		expect(wrapper.getByText(/Testing validation message/).textContent).to.equal(warningMessage.text);
	});
	it("validation-message renders info message correctly", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={infoMessage}
			/>
		);
		const { container } = wrapper;
		const messageWrapper = container.getElementsByClassName("properties-validation-message");
		expect(messageWrapper).to.have.length(1);
		expect(messageWrapper[0].getElementsByClassName("canvas-state-icon-info")).to.have.length(0);
		expect(messageWrapper[0].querySelector("span").textContent).to.equal(infoMessage.text);
	});
	it("validation-message renders correctly when no message set", () => {
		const wrapper = render(
			<ValidationMessage />
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-validation-message")).to.have.length(0);
	});
	it("validation-message renders correctly when tableOnly set", () => {
		const wrapper = render(
			<ValidationMessage messageInfo={infoMessage} tableOnly />
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-validation-message")).to.have.length(0);
	});
	it("validation-message doesn't display when state 'hidden'", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={errorMessage}
				state={"hidden"}
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-validation-message error hide")).to.have.length(1);
	});
	it("validation-message doesn't display when state 'disabled'", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={errorMessage}
				state={"disabled"}
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-validation-message error hide")).to.have.length(1);
	});
	it("validation-message display when in a table ", () => {
		const wrapper = render(
			<ValidationMessage
				messageInfo={errorMessage}
				inTable
			/>
		);
		const { container } = wrapper;
		expect(container.getElementsByClassName("properties-validation-message error inTable")).to.have.length(1);
	});

});
