/*
 * Copyright 2017-2022 Elyra Authors
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

import propertyUtils from "./../../_utils_/property-utils";
import { expect } from "chai";
import codeParamDef from "./../../test_resources/paramDefs/code_paramDef.json";

describe("tearsheet tests", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(codeParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("should be hidden initially", () => {
		expect(wrapper.find(".tearsheet-panel")).to.have.length(0);
	});
});
