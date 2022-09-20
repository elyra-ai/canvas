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
	var controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(codeParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});
	it("should be hidden initially", () => {
		expect(wrapper.find("div.tearsheet-panel")).to.have.length(0);
	});
	it("should be visible from the controller method", () => {
		controller.setActiveTearsheet("tearsheet1");
		wrapper.update();
		expect(wrapper.find("div.properties-tearsheet-panel")).to.have.length(1);
	});
	it("should be hidden from DON on the tearsheet close button", () => {
		controller.setActiveTearsheet("tearsheet1");
		wrapper.update();
		wrapper.find("div.properties-tearsheet-panel button.bx--modal-close").simulate("click");
		wrapper.update();
		expect(wrapper.find("div.tearsheet-panel")).to.have.length(0);
		expect(controller.getActiveTearsheet()).to.equal(null);
	});
});
