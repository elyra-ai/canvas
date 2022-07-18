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
		"text": "toggle"
	},
	"values": [
		"Ascending",
		"Descending"
	],
	"valueLabels": [
		"Sort Ascending",
		"Sort Descending"
	],
	"valueIcons": [
		"/images/up-triangle.svg",
		"/images/down-triangle.svg"
	]
};

propertyUtils.setControls(controller, [control]);

const propertyId = { name: "toggle" };

describe("toggle renders correctly", () => {

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ toggle: "Ascending" }
		);
	});

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
