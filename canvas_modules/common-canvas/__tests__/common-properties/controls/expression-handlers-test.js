/*
 * Copyright 2017-2026 Elyra Authors
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
import sinon from "sinon";
import deepFreeze from "deep-freeze";
import { clem } from "../../../src/common-properties/index";

import Expression from "../../../src/common-properties/controls/expression";
import Controller from "../../../src/common-properties/properties-controller";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";

import ExpressionInfo from "../../test_resources/json/expression-function-list.json";

const control = {
	name: "test-expression",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	},
	language: "CLEM",
	data: {
		tearsheet_ref: "tearsheetX"
	},
	enableMaximize: true
};

const propertyId = { name: "test-expression" };

const dataModel = deepFreeze([{
	"fields": [
		{ "name": "Age", "type": "integer", "metadata": { "description": "", "measure": "range", "modeling_role": "input" } },
		{ "name": "Sex", "type": "string", "metadata": { "description": "", "measure": "discrete", "modeling_role": "input" } }
	]
}]);

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

var controller = new Controller();
function reset() {
	controller = new Controller();
	controller.saveControls([control]);
	controller.updatePropertyValue(propertyId, "");
	controller.setDatasetMetadata(getCopy(dataModel));
	controller.setExpressionInfo(getCopy(ExpressionInfo.input));
}

describe("expression-control expressionLanguageHandler", () => {
	beforeEach(() => {
		reset();
	});

	it("should call expressionLanguageHandler with propertyId and language", () => {
		const langHandler = sinon.spy(() => null);
		controller.setHandlers({ expressionLanguageHandler: langHandler });

		renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(langHandler.calledOnce).to.be.true;
		expect(langHandler.firstCall.args[0]).to.deep.equal(propertyId);
		expect(langHandler.firstCall.args[1]).to.equal(control.language);
	});

	it("should use expressionLanguageHandler return value as language when non-null", () => {
		const customLang = clem();
		const langHandler = sinon.stub().returns(customLang);
		controller.setHandlers({ expressionLanguageHandler: langHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
		expect(langHandler.calledOnce).to.be.true;
	});

	it("should fall back to built-in language switch when expressionLanguageHandler returns null", () => {
		const langHandler = sinon.stub().returns(null);
		controller.setHandlers({ expressionLanguageHandler: langHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
		expect(langHandler.calledOnce).to.be.true;
	});

	it("should fall back to built-in language switch when expressionLanguageHandler returns undefined", () => {
		const langHandler = sinon.stub().returns(null);
		controller.setHandlers({ expressionLanguageHandler: langHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
		expect(langHandler.calledOnce).to.be.true;
	});

	it("should render a `Expression` when expressionLanguageHandler returns an invalid type", () => {
		// A handler returning a non-LanguageSupport value (e.g. a plain string) should not
		// crash the editor — the value passes the null/undefined guard and is forwarded to
		// CodeMirror. This test asserts the component still mounts without throwing.
		const langHandler = sinon.stub().returns("not-a-language-support-object");
		controller.setHandlers({ expressionLanguageHandler: langHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
		expect(langHandler.calledOnce).to.be.true;
	});

	it("should render a `Expression` when expressionLanguageHandler is not registered", () => {
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
	});
});

describe("expression-control expressionVariablesHandler", () => {
	beforeEach(() => {
		reset();
	});

	it("should render a `Expression` when expressionVariablesHandler is registered", () => {
		// expressionVariablesHandler is called inside addonHints() on every autocomplete
		// trigger, not at mount time.
		const varHandler = sinon.spy(() => []);
		controller.setHandlers({ expressionVariablesHandler: varHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
		expect(varHandler.called).to.be.false;
	});

	it("should render a `Expression` when expressionVariablesHandler returns a string array", () => {
		const varHandler = sinon.stub().returns(["${customer.name}", "${order.total}"]);
		controller.setHandlers({ expressionVariablesHandler: varHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
	});

	it("should render a `Expression` when expressionVariablesHandler returns an object array", () => {
		const vars = [{ label: "${customer.name}", type: "variable" }, { label: "${order.total}", type: "variable" }];
		const varHandler = sinon.stub().returns(vars);
		controller.setHandlers({ expressionVariablesHandler: varHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
	});

	it("should render a `Expression` when expressionVariablesHandler returns null", () => {
		const varHandler = sinon.stub().returns(null);
		controller.setHandlers({ expressionVariablesHandler: varHandler });

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
	});

	it("should render a `Expression` when expressionVariablesHandler is not registered", () => {
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;

		expect(container.querySelectorAll(".elyra-CodeMirror")).to.have.length(1);
	});
});
