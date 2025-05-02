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
import Toggle from "../../../src/common-properties/controls/toggle";
import { render } from "../../_utils_/mount-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import toggleParamDef from "../../test_resources/paramDefs/toggle_paramDef.json";
import { fireEvent } from "@testing-library/react";

const controller = new Controller();

const control = {
	"name": "toggle",
	"values": [
		true,
		false
	]
};

propertyUtilsRTL.setControls(controller, [control]);

const propertyId = { name: "toggle" };

const mockToggle = jest.fn();
jest.mock("../../../src/common-properties/controls/toggle",
	() => (props) => mockToggle(props)
);

mockToggle.mockImplementation((props) => {
	const ToggleComp = jest.requireActual(
		"../../../src/common-properties/controls/toggle",
	).default;
	return <ToggleComp {...props} />;
});

describe("toggle renders correctly", () => {

	beforeEach(() => {
		controller.setErrorMessages({});
		controller.setControlStates({});
		controller.setPropertyValues(
			{ toggle: true }
		);
	});

	// "toggled" attribute not showing up
	it("toggle should set correct value", () => {
		const wrapper = render(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const toggleWrapper = container.querySelector("div[data-id='properties-toggle']");
		const toggleButton = toggleWrapper.querySelector("button");
		// Replacing toggled prop with aria-checked since cannot retrieve props in RTL
		expect(toggleButton.getAttribute("aria-checked")).to.equal("true");
		fireEvent.click(toggleButton);
		expect(controller.getPropertyValue(propertyId)).to.equal(false);
	});

	it("toggle props should have been defined", () => {
		render(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expectJest(mockToggle).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("toggle does not render when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = render(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const toggleWrapper = container.querySelector("div[data-id='properties-toggle']");
		expect(toggleWrapper).to.be.null;
	});

	it("toggle renders when readonly", () => {
		control.readOnly = true;
		const wrapper = render(
			<Toggle
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				readOnly
			/>
		);
		const { container } = wrapper;
		const toggleWrapper = container.querySelector("div[data-id='properties-toggle']");
		expect(toggleWrapper.querySelector(".cds--toggle").className.includes("readonly")).to.equal(control.readOnly);
	});

});

describe("toggle classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(toggleParamDef);
		wrapper = renderedObject.wrapper;
	});

	it("toggle should have custom classname defined in table cells", () => {
		propertyUtilsRTL.openSummaryPanel(wrapper, "toggle-table-summary");
		expect(wrapper.container.querySelectorAll(".table-toggle-control-class")).to.have.length(2);
		expect(wrapper.container.querySelectorAll(".table-on-panel-toggle-control-class")).to.have.length(2);
		expect(wrapper.container.querySelectorAll(".table-subpanel-toggle-control-class")).to.have.length(2);
	});
});
