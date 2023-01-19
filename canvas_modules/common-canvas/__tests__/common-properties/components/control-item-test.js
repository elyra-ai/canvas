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
import ControlItem from "../../../src/common-properties/components/control-item";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import { mountWithIntl } from "../../_utils_/intl-utils";
import { ControlType } from "../../../src/common-properties/constants/form-constants";
import sinon from "sinon";
import { isEqual } from "lodash";

const controller = new Controller();
const controlObj = <div className="dummy_control">"Dummy control"</div>;

const control = {
	name: "test-control",
	label: {
		text: "Control Label"
	},
	description: {
		text: "Control Description",
		link: {
			id: "link-id",
			data: {
				something: "sampleData"
			}
		}
	},
	showRequiredLabel: false
};

const propertyId = {
	name: "test-control"
};

const accessibleControls = [ControlType.CHECKBOXSET, ControlType.HIDDEN];

const tooltipLinkHandlerFunction = function(link) {
	if (link.id && isEqual(link.propertyId, propertyId)) {
		return { url: "https://www.google.com/", label: "More info" };
	}
	return {};
};
const tooltipLinkHandler = sinon.spy(tooltipLinkHandlerFunction);
controller.setHandlers({
	tooltipLinkHandler: tooltipLinkHandler
});

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
				accessibleControls={accessibleControls}
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
			},
			showRequiredLabel: false
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlOnPanel}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		expect(wrapper.find("label.properties-control-label").text()).to.equal(controlOnPanel.label.text);
		expect(wrapper.find("div.properties-control-description").text()).to.equal(controlOnPanel.description.text);
		expect(wrapper.find("div.properties-label-container").text()).to.equal("Control Label(optional)");
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
				accessibleControls={accessibleControls}
			/>
		);
		// should have optional indicator because "showRequiredLabel: false"
		expect(wrapper.find("span.properties-indicator")).to.have.length(1);
		expect(wrapper.find("label.properties-control-label").text()).to.equal(control.label.text);
		expect(wrapper.find("div.properties-label-container").text()).to.equal("Control Label(optional)");
		const tooltip = wrapper.find("div.tooltip-container");
		expect(tooltip).to.have.length(1);
		// tooltip icon
		expect(tooltip.find("svg.canvas-state-icon-information-hollow")).to.have.length(1);
		// tooltip text
		expect(tooltip.find("div.common-canvas-tooltip span").text()).to.equal(control.description.text);
	});

	it("should create a link in the tooltip", () => {
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				state={"enabled"}
				accessibleControls={accessibleControls}
			/>
		);
		expect(wrapper.find("label.properties-control-label").text()).to.equal(control.label.text);
		const tooltipTrigger = wrapper.find("div.tooltip-trigger");
		tooltipTrigger.simulate("click");
		expect(tooltipLinkHandler.calledOnce).to.equal(true);
		expect(tooltipLinkHandler.calledWith(control.description.link)).to.be.true;

		const tooltip = wrapper.find("div.common-canvas-tooltip");
		// verify text in tooltip
		expect(tooltip.find("span#tooltipContainer").text()).to.equal(control.description.text);
		// verify link in tooltip
		expect(tooltip.find("Link")).to.have.length(1);
		expect(tooltip.find("a").text()).to.equal(tooltipLinkHandlerFunction(control.description.link).label);
	});

	it("should not create a link when tooltipLinkHandler returns an empty/invalid object", () => {
		tooltipLinkHandler.resetHistory();
		const dummyPropertyId = { name: "some-random-id" };
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={dummyPropertyId}
				controller={controller}
				controlObj={controlObj}
				state={"enabled"}
				accessibleControls={accessibleControls}
			/>
		);

		const tooltipTrigger = wrapper.find("div.tooltip-trigger");
		tooltipTrigger.simulate("click");
		expect(tooltipLinkHandler.calledOnce).to.equal(true);
		expect(tooltipLinkHandler.calledWith(control.description.link)).to.be.true;

		// tooltipLinkHandler returned an empty object because we passed dummyPropertyId
		// verify link does not exist in tooltip
		const tooltip = wrapper.find("div.common-canvas-tooltip");
		expect(tooltip.find("Link")).to.have.length(0);
	});

	it("should not call tooltipLinkHandler when description doesn't contain link object", () => {
		tooltipLinkHandler.resetHistory();
		// Remove link object from description
		control.description = {
			text: "This description doesn't have link object"
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				state={"enabled"}
				accessibleControls={accessibleControls}
			/>
		);

		const tooltipTrigger = wrapper.find("div.tooltip-trigger");
		tooltipTrigger.simulate("click");
		expect(tooltipLinkHandler.calledOnce).to.equal(false);

		const tooltip = wrapper.find("div.common-canvas-tooltip");
		// verify text in tooltip
		expect(tooltip.find("span#tooltipContainer").text()).to.equal(control.description.text);
		// verify link does not exist in tooltip
		expect(tooltip.find("Link")).to.have.length(0);
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
				accessibleControls={accessibleControls}
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
			required: true,
			showRequiredLabel: true
		};
		const wrapper = mountWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlRequired}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		expect(wrapper.find("span.properties-indicator")).to.have.length(1);
		expect(wrapper.find("div.properties-label-container").text()).to.equal("Control Label(required)");
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
				accessibleControls={accessibleControls}
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
				accessibleControls={accessibleControls}
			/>
		);
		const controlItem = wrapper.find("div.properties-control-item");
		expect(controlItem.prop("disabled")).to.equal(true);
	});

});
