/*
 * Copyright 2017-2019 IBM Corporation
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
import ControlItem from "../../../src/common-properties/components/control-item";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import { mountWithIntl } from "enzyme-react-intl";

const controller = new Controller();
const controlObj = <div className="dummy_control">"Dummy control"</div>;

const control = {
	name: "test-control",
	label: {
		text: "Control Label"
	},
	description: {
		text: "Control Description"
	}
};

const propertyId = {
	name: "test-control"
};

describe("control-item renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				state={"enabled"}
			/>
		);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("control")).to.eql(control);
		expect(wrapper.prop("propertyId")).to.eql(propertyId);
		expect(wrapper.prop("controlObj")).to.equal(controlObj);
		expect(wrapper.prop("state")).to.equal("enabled");
	});

	it("should create label and description without tooltip", () => {
		const controlOnPanel = {
			name: "test-control",
			label: {
				text: "Control Label"
			},
			description: {
				text: "Control Description",
				placement: "on_panel"
			}
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlOnPanel}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
			/>
		);
		expect(wrapper.find("label.properties-control-label").text()).to.equal(controlOnPanel.label.text);
		expect(wrapper.find("div.properties-control-description").text()).to.equal(controlOnPanel.description.text);
	});

	it("should create label and tooltip description", () => {
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				state={"enabled"}
			/>
		);
		// should not have a required indicator
		expect(wrapper.find("span.properties-required-indicator")).to.have.length(0);
		expect(wrapper.find("label.properties-control-label").text()).to.equal(control.label.text);
		const tooltip = wrapper.find("div.tooltip-container");
		expect(tooltip).to.have.length(1);
		// tooltip icon
		expect(tooltip.find("svg.info")).to.have.length(1);
		// tooltip text
		expect(tooltip.find("div.common-canvas-tooltip span").text()).to.equal(control.description.text);
	});

	it("should hide label when labelVisible=false", () => {
		const controlLabelVisible = {
			name: "test-control",
			label: {
				text: "Control Label",

			},
			labelVisible: false
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlLabelVisible}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
			/>
		);
		expect(wrapper.find("div.properties-label-container")).to.have.length(0);
	});

	it("should have required indicator", () => {
		const controlRequired = {
			name: "test-control",
			label: {
				text: "Control Label"
			},
			required: true
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlRequired}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
			/>
		);
		expect(wrapper.find("span.properties-required-indicator")).to.have.length(1);
	});

	it("should be hidden", () => {
		const propertyIdHidden = {
			name: "test-control-hidden"
		};
		controller.updateControlState(propertyIdHidden, "hidden");
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyIdHidden}
				controller={controller}
				controlObj={controlObj}
			/>
		);
		const controlItem = wrapper.find("div.properties-control-item.hide");
		expect(controlItem).to.have.length(1);
	});

	it("should be disabled", () => {
		const propertyIdDisabled = {
			name: "test-control-disabled"
		};
		controller.updateControlState(propertyIdDisabled, "disabled");
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyIdDisabled}
				controller={controller}
				controlObj={controlObj}
			/>
		);
		const controlItem = wrapper.find("div.properties-control-item");
		expect(controlItem.prop("disabled")).to.equal(true);
	});

});
