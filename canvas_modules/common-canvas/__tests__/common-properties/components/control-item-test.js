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

import React from "react";
import ControlItem from "../../../src/common-properties/components/control-item";
import Controller from "../../../src/common-properties/properties-controller";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import { renderWithIntl } from "../../_utils_/intl-utils";
import { ControlType } from "../../../src/common-properties/constants/form-constants";
import sinon from "sinon";
import { isEqual } from "lodash";
import { fireEvent, within } from "@testing-library/react";

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
	}
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


const mockControlItem = jest.fn();
jest.mock("../../../src/common-properties/components/control-item",
	() => (props) => mockControlItem(props)
);

mockControlItem.mockImplementation((props) => {
	const ControlItemComp = jest.requireActual(
		"../../../src/common-properties/components/control-item",
	).default;
	return <ControlItemComp {...props} />;
});

describe("control-item renders correctly", () => {

	it("props should have been defined", () => {
		renderWithIntl(
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
		expectJest(mockControlItem).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
			"controlObj": controlObj,
			"state": "enabled",
			"accessibleControls": accessibleControls
		});
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
		const wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlOnPanel}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		const { container } = wrapper;
		expect(container.querySelector("label.properties-control-label").textContent).to.equal(controlOnPanel.label.text);
		expect(container.querySelector("div.properties-control-description").textContent).to.equal(controlOnPanel.description.text);
	});

	it("should create label and tooltip description", () => {
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		// should not have a required indicator
		expect(container.getElementsByClassName("properties-required-indicator")).to.have.length(0);
		expect(container.querySelector("label.properties-control-label").textContent).to.equal(control.label.text);
		const tooltips = container.querySelectorAll("div.tooltip-container");
		expect(tooltips).to.have.length(1);
		// tooltip icon
		expect(tooltips[0].querySelectorAll("svg.canvas-state-icon-information-hollow")).to.have.length(1);
		// tooltip text
		const tooltip = wrapper.getByText("Control Description");
		expect(tooltip.parentElement.className).to.equal("common-canvas-tooltip");
		expect(tooltip.textContent).to.equal(control.description.text);
	});

	it("should create a link in the tooltip", () => {
		const wrapper = renderWithIntl(
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
		const { container } = wrapper;
		expect(container.querySelector("label.properties-control-label").textContent).to.equal(control.label.text);
		const tooltipTrigger = container.querySelector("div.tooltip-trigger");
		fireEvent.click(tooltipTrigger);
		expect(tooltipLinkHandler.calledOnce).to.equal(true);
		expect(tooltipLinkHandler.calledWith(control.description.link)).to.be.true;

		const tooltip = wrapper.getByRole("tooltip");
		// verify text in tooltip
		expect(within(tooltip).getByText("Control Description").textContent).to.equal(control.description.text);
		// verify link in tooltip
		const links = wrapper.getAllByRole("link");
		const link = links[0];
		expect(links).to.have.length(1);
		expect(link.textContent).to.equal(tooltipLinkHandlerFunction(control.description.link).label);
	});

	it("should not create a link when tooltipLinkHandler returns an empty/invalid object", () => {
		tooltipLinkHandler.resetHistory();
		const dummyPropertyId = { name: "some-random-id" };
		const wrapper = renderWithIntl(
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
		const tooltipTrigger = wrapper.getByRole("button");
		fireEvent.click(tooltipTrigger);
		expect(tooltipLinkHandler.calledOnce).to.equal(true);
		expect(tooltipLinkHandler.calledWith(control.description.link)).to.be.true;

		// tooltipLinkHandler returned an empty object because we passed dummyPropertyId
		// verify link does not exist in tooltip
		expect(wrapper.queryAllByRole("link")).to.have.length(0);
	});

	it("should not call tooltipLinkHandler when description doesn't contain link object", () => {
		tooltipLinkHandler.resetHistory();
		// Remove link object from description
		control.description = {
			text: "This description doesn't have link object"
		};
		const wrapper = renderWithIntl(
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
		const tooltipTrigger = wrapper.getByRole("button");
		fireEvent.click(tooltipTrigger);
		expect(tooltipLinkHandler.calledOnce).to.equal(false);

		// verify text in tooltip
		const tooltip = wrapper.getByText("This description doesn't have link object");
		expect(tooltip.textContent).to.equal(control.description.text);
		expect(tooltip.className).to.equal("tooltipContainer");
		// verify link does not exist in tooltip
		expect(wrapper.queryAllByRole("link")).to.have.length(0);
	});

	it("should hide label when labelVisible=false", () => {
		const controlLabelVisible = {
			name: "test-control",
			label: {
				text: "Control Label",

			},
			labelVisible: false
		};
		const wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlLabelVisible}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		const { container } = wrapper;
		const controlDisabledLabeled = container.getElementsByClassName("properties-control-label-disabled")[0];

		if (controlDisabledLabeled) {
			const displayStyle = controlDisabledLabeled.style.display;
			expect(displayStyle).to.equal("none");
		}
	});

	it("should have required indicator", () => {
		const controlRequired = {
			name: "test-control",
			label: {
				text: "Control Label"
			},
			required: true
		};
		const wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlRequired}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("span.properties-indicator")).to.have.length(1);
		expect(container.querySelector("div.properties-label-container").textContent).to.equal("Control Label(required)");
	});

	it("should be hidden", () => {
		const propertyIdHidden = {
			name: "test-control-hidden"
		};
		controller.updateControlState(propertyIdHidden, "hidden");
		const wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyIdHidden}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		const { container } = wrapper;
		const controlItem = container.getElementsByClassName("properties-control-item hide");
		expect(controlItem).to.have.length(1);
	});

	it("should be disabled", () => {
		const propertyIdDisabled = {
			name: "test-control-disabled"
		};
		controller.updateControlState(propertyIdDisabled, "disabled");
		const wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={control}
				propertyId={propertyIdDisabled}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		const { container } = wrapper;
		const controlItem = container.querySelector("div.properties-control-item");
		expect(controlItem.outerHTML.includes("disabled")).to.equal(true);
	});

	it("show required indicator when showRequiredIndicator set to true", () => {
		const controlRequired = {
			name: "test-control",
			label: {
				text: "Control Label"
			},
			required: true
		};
		const propertiesConfig = { showRequiredIndicator: true };
		controller.setPropertiesConfig(propertiesConfig);
		let wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlRequired}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		let { container } = wrapper;
		// For required control, show required indicator
		expect(container.getElementsByClassName("properties-indicator")).to.have.length(1);
		expect(container.getElementsByClassName("properties-label-container")[0].textContent).to.equal("Control Label(required)");

		const controlOptional = {
			name: "test-control",
			label: {
				text: "Control Label"
			}
		};
		wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlOptional}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		({ container } = wrapper);
		// For optional control, don't show any indicator
		expect(container.getElementsByClassName("properties-indicator")).to.have.length(0);
		expect(container.getElementsByClassName("properties-label-container")[0].textContent).to.equal("Control Label");
	});

	it("show optional indicator when showRequiredIndicator set to false", () => {
		const controlOptional = {
			name: "test-control",
			label: {
				text: "Control Label"
			}
		};
		const propertiesConfig = { showRequiredIndicator: false };
		controller.setPropertiesConfig(propertiesConfig);
		let wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlOptional}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		let { container } = wrapper;
		// For optional control, show optional indicator
		expect(container.getElementsByClassName("properties-indicator")).to.have.length(1);
		expect(container.getElementsByClassName("properties-label-container")[0].textContent).to.equal("Control Label(optional)");

		const controlRequired = {
			name: "test-control",
			label: {
				text: "Control Label"
			},
			required: true
		};
		wrapper = renderWithIntl(
			<ControlItem
				store={controller.getStore()}
				control={controlRequired}
				propertyId={propertyId}
				controller={controller}
				controlObj={controlObj}
				accessibleControls={accessibleControls}
			/>
		);
		({ container } = wrapper);
		// For required control, don't show any indicator
		expect(container.getElementsByClassName("properties-indicator")).to.have.length(0);
		expect(container.getElementsByClassName("properties-label-container")[0].textContent).to.equal("Control Label");
	});

});
