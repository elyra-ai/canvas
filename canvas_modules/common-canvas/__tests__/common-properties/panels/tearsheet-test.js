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
	it("should be have only one tearsheet rendered", () => {
		expect(wrapper.find("div.properties-tearsheet-panel")).to.have.length(1);
	});
	it("should be visible from the controller method", () => {
		controller.setActiveTearsheet("tearsheet1");
		wrapper.update();
		expect(wrapper.find("div.properties-tearsheet-panel.is-visible")).to.have.length(1);
	});
	it("should have title and description set", () => {
		controller.setActiveTearsheet("tearsheet1");
		wrapper.update();
		expect(wrapper.find("div.properties-tearsheet-panel .bx--modal-header h3").text()).to.equal("Python");
		expect(wrapper.find("div.properties-tearsheet-panel .bx--modal-header p").text()).to.equal("Your change is automatically saved.");
	});
	it("should be hidden but not removed from DOM on the tearsheet close button", () => {
		controller.setActiveTearsheet("tearsheet1");
		wrapper.update();
		wrapper.find("div.properties-tearsheet-panel button.bx--modal-close").simulate("click");
		wrapper.update();
		expect(wrapper.find("div.properties-tearsheet-panel.is-visible")).to.have.length(0);
		expect(wrapper.find("div.properties-tearsheet-panel")).to.have.length(1);
		expect(controller.getActiveTearsheet()).to.equal(null);
	});
	it("should show tearsheet content which is previously hidden", () => {
		expect(wrapper.find("div.properties-tearsheet-panel")).to.have.length(1);
		expect(wrapper.find("div.properties-tearsheet-panel.is-visible")).to.have.length(0);
		expect(wrapper.find("div.properties-tearsheet-panel div[data-id='properties-ctrl-code_rows']")).to.have.length(0);
		wrapper.update();
		wrapper.find("div[data-id='properties-hide'] input[type='checkbox']").simulate("click");
		wrapper.update();
		wrapper.find("div[data-id='properties-ctrl-code_rows'] button.maximize").simulate("click");
		wrapper.update();
		expect(wrapper.find("div.properties-tearsheet-panel.is-visible")).to.have.length(1);
		expect(wrapper.find("div.properties-tearsheet-panel .bx--modal-header h3").text()).to.equal("Python 2");
		expect(wrapper.find("div.properties-tearsheet-panel div[data-id='properties-ctrl-code_rows']")).to.have.length(1);
	});
});
