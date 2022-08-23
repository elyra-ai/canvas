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

import React from "react";
import Toggle from "../../../src/common-properties/controls/toggle";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import toggleParamDef from "../../test_resources/paramDefs/toggle_paramDef.json";

const controller = new Controller();

const control = {
	"name": "toggle",
	"label": {
		"text": "Toggle"
	},
	"values": [
		"On",
		"Off"
	],
};

propertyUtils.setControls(controller, [control]);

const propertyId = { name: "toggle" };

describe("toggle renders correctly", () => {

	it("toggle props should have been defined", () => {
		const wrapper = mount(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("controller")).to.equal(controller);
	});

	it("toggle renders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mount(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggleWrapper = wrapper.find("div[data-id='properties-toggle']");
		expect(toggleWrapper.hasClass("hide")).to.equal(true);
	});

	it("toggle should set correct value", () => {
		const wrapper = mount(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const toggle = wrapper.find("div.properties-toggle");

		const image = toggle.find("svg");
		expect(image).to.have.length(1);
		image.simulate("click");

		const toggleLableOn = toggle.find("span.bx--toggle__text--on");
		const toggleLableOff = toggle.find("span.bx--toggle__text--off");

		expect(toggleLableOn.text()).to.equal(control.values[0]);
		expect(toggleLableOff.text()).to.equal(control.values[1]);
	});

});

describe("toggle classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(toggleParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("toggle should have custom classname defined", () => {
		expect(wrapper.find(".toggle-control-class")).to.have.length(1);
	});

	it("toggle should have custom classname defined in table cells", () => {
		propertyUtils.openSummaryPanel(wrapper, "toggle-table-summary");
		expect(wrapper.find(".table-toggle-control-class")).to.have.length(2);
		expect(wrapper.find(".table-on-panel-toggle-control-class")).to.have.length(2);
		expect(wrapper.find(".table-subpanel-toggle-control-class")).to.have.length(2);
	});
});
