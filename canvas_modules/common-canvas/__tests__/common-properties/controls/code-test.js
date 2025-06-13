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

// code is a subset of expression control. Most tests are under the expression control.
import React from "react";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { expect } from "chai";
import ExpressionInfo from "../../test_resources/json/expression-function-list.json";
import Expression from "../../../src/common-properties/controls/expression";
import CodeParamdef from "../../test_resources/paramDefs/code_paramDef.json";
import { Button } from "@carbon/react";
import { Code } from "@carbon/react/icons";
import sinon from "sinon";
import Controller from "../../../src/common-properties/properties-controller";
import { renderWithIntl } from "../../_utils_/intl-utils";

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

const propertiesConfig = { containerType: "Custom", rightFLyout: true };
const propertiesInfo = {
	appData: {},
	additionalComponents: {},
};
const controller = new Controller();
const propertyId = { name: "code" };
const control = {
	name: "code",
	label: {
		"text": "Code"
	},
	description: {
		"text": "Enter Python code",
		"placement": "as_tooltip"
	},
	labelVisible: true,
	controlType: "code",
	valueDef: {
		"propType": "string",
		"isList": false,
		"isMap": false
	},
	language: "text/x-python",
	enableMaximize: true
};

const customHeaderHandlerFunction = function(propId) {
	if (propId.name === "code") {
		return (
			<Button
				kind="ghost"
				renderIcon={Code}
				size="sm"
				className="button-returned-from-callback"
			>
				Test
			</Button>
		);
	}
	return null;
};
const customHeaderHandler = sinon.spy(customHeaderHandlerFunction);

describe("code control tests", () => {
	it("Code control doesn't render with validateLink", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		propertiesInfo.expressionInfo.validateLink = true;
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(CodeParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("button.validateLink")).to.have.length(0); // no validation links should be shown for code controls
	});
	it("If customHeaderHandler callback is NOT defined, code control does not have header", () => {
		controller.setHandlers({});
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const codeHeader = container.querySelectorAll(".properties-code-header");
		expect(codeHeader).to.have.length(0);
	});
	it("If customHeaderHandler callback is defined, code control has a header", () => {
		controller.setHandlers({
			customHeaderHandler: customHeaderHandler
		});
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const codeHeader = container.querySelectorAll(".properties-code-header");
		expect(codeHeader).to.have.length(1);

		// Verify content returned from customHeaderHandler callback is rendered in UI
		const testButton = wrapper.getByRole("button", { name: /Test/i });
		expect(testButton).to.exist;

		// Verify the content returned from customHeaderHandler callback is in the codeHeader
		expect(container.querySelector(".properties-code-header").querySelector("button.button-returned-from-callback")).to.exist;
	});
});

describe("code classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(CodeParamdef);
		wrapper = renderedObject.wrapper;
	});

	it("code should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".code-control-class")).to.have.length(1);
	});
});
