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

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import { expect } from "chai";
import ExpressionInfo from "../../test_resources/json/expression-function-list.json";
import CodeParamdef from "../../test_resources/paramDefs/code_paramDef.json";

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

const propertiesConfig = { containerType: "Custom", rightFLyout: true };
const propertiesInfo = {
	appData: {},
	additionalComponents: {},
};

describe("code control tests", () => {
	it("Code control doesn't render with validateLink", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		propertiesInfo.expressionInfo.validateLink = true;
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(CodeParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("button.validateLink")).to.have.length(0); // no validation links should be shown for code controls
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
