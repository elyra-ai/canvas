/*
 * Copyright 2017-2026 Elyra Authors
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
import sinon from "sinon";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import twistypanelParamDef from "./../../test_resources/paramDefs/twistyPanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";

describe("twisty panel renders correctly", () => {
	var wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed the twisty panel with first panel closed and 2nd panel open", () => {
		const { container } = wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(0);

		const tableTwisty = container.querySelector("div[data-id='properties-TableTwisty']");
		expect(tableTwisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(tableTwisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);

		// Verify class for subtitle is not applied
		expect(twisty.classList.contains("properties-twisty-custom-title")).to.equal(false);
	});

	it("should expand content when twisty panel link clicked", () => {
		const { container } = wrapper;
		let twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(0);
		const twistyButton = twisty.querySelector("button.cds--accordion__heading");
		fireEvent.click(twistyButton);
		twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		expect(twisty.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twisty.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
	});
});

describe("twisty panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		cleanup();
	});

	it("twisty panel and controls should be disabled", async() => {
		const { container } = wrapper;
		const disableTwisty = container.querySelector("div[data-id='properties-disableTwistyPanel']");
		const disabledCheckbox = disableTwisty.querySelector("input[type='checkbox']");
		let twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");

		// check initial state of enabled
		expect(disabledCheckbox.checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the panel and confirm
		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = true;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(controller.getPropertyValue({ name: "disableTwistyPanel" })).to.equal(true);
			expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--disabled")).to.have.length(1);
		});

		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = false;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			const button = twistyPanel.querySelectorAll("button")[0];
			fireEvent.click(button);
		});

		await waitFor(() => {
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
		});

		const numberfields = twistyPanel.querySelectorAll("input[type='number']");
		expect(numberfields).to.have.length(2);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		// disable the open twisty disableTwistyPanel
		fireEvent.click(disabledCheckbox);
		await waitFor(() => {
			disabledCheckbox.checked = true;
			twistyPanel = container.querySelector("div[data-id='properties-twisty-panel1']");
			expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
			expect(twistyPanel.querySelectorAll("li.cds--accordion__item--disabled")).to.have.length(1);
		});

	});

	it("twisty panel and controls should be hidden", () => {
		const { container } = wrapper;
		const hiddenTwisty = container.querySelector("div[data-id='properties-hideTwistyPanel']");
		const hiddenCheckbox = hiddenTwisty.querySelector("input[type='checkbox']");
		let twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		// check initial state of enabled
		expect(hiddenCheckbox.checked).to.equal(false);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");

		// hide the panel and confirm
		fireEvent.click(hiddenCheckbox);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.classList.contains("hide")).to.equal(true);

		// can also hide a twisty that is opened
		// make panel visible and confirm
		fireEvent.click(hiddenCheckbox);
		const button = twistyPanel.querySelectorAll("button")[0];
		fireEvent.click(button);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(twistyPanel.querySelectorAll("li.cds--accordion__item")).to.have.length(1);
		expect(twistyPanel.querySelectorAll("li.cds--accordion__item--active")).to.have.length(1);
		const numberfield = twistyPanel.querySelectorAll("input[type='number']");
		expect(numberfield).to.have.length(1);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("visible");

		// hide the panel and confirm
		fireEvent.click(hiddenCheckbox);
		twistyPanel = container.querySelector("div[data-id='properties-twisty-panel2']");
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
		expect(twistyPanel.classList.contains("hide")).to.equal(true);
	});
});


describe("twisty panel custom title renders correctly", () => {
	let mockPanelTitleHandler;

	afterEach(() => {
		cleanup();
	});

	it("should render custom title when panelTitleHandler is provided and returns a value", () => {
		mockPanelTitleHandler = sinon.spy(({ panelId }) => {
			if (panelId === "TwistyPanel1") {
				return <span className="test-custom-title">Custom Title for Panel 1</span>;
			}
			return null;
		});

		const callbacks = {
			panelTitleHandler: mockPanelTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that the custom title is rendered in the accordion
		const customTitle = twisty.querySelector(".test-custom-title");
		expect(customTitle).to.not.be.null;
		expect(customTitle.textContent).to.equal("Custom Title for Panel 1");

		// Check that the CSS class for custom title is applied
		expect(twisty.classList.contains("properties-twisty-custom-title")).to.equal(true);

		// Verify the handler was called (it gets called for all panels in the form)
		expect(mockPanelTitleHandler.called).to.equal(true);
		// Find the call for TwistyPanel1
		const twistyPanel1Call = mockPanelTitleHandler.getCalls().find((call) => call.args[0].panelId === "TwistyPanel1");
		expect(twistyPanel1Call).to.not.be.undefined;
		expect(twistyPanel1Call.args[0].label).to.equal("Automatic Reclassify");
	});

	it("should use default label when panelTitleHandler returns null", () => {
		mockPanelTitleHandler = sinon.spy(() => null);

		const callbacks = {
			panelTitleHandler: mockPanelTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that the custom title CSS class is not applied when handler returns null
		expect(twisty.classList.contains("properties-twisty-custom-title")).to.equal(false);

		// Verify the default label is used
		const accordionButton = twisty.querySelector(".cds--accordion__heading");
		expect(accordionButton.textContent).to.include("Automatic Reclassify");
	});

	it("should use default label when panelTitleHandler is not provided", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that the custom title CSS class is not applied
		expect(twisty.classList.contains("properties-twisty-custom-title")).to.equal(false);

		// Verify the default label is used
		const accordionButton = twisty.querySelector(".cds--accordion__heading");
		expect(accordionButton.textContent).to.include("Automatic Reclassify");
	});

	it("should call panelTitleHandler with correct arguments for each panel", () => {
		mockPanelTitleHandler = sinon.spy(({ panelId, label }) => <span>Custom title for {panelId}</span>);

		const callbacks = {
			panelTitleHandler: mockPanelTitleHandler
		};

		propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);

		// Verify the handler was called 3 times (once for each panel)
		expect(mockPanelTitleHandler.callCount).to.equal(3);

		// Verify the handler was called with correct arguments
		const call1 = mockPanelTitleHandler.getCall(0).args[0];
		expect(call1.panelId).to.equal("TwistyPanel1");
		expect(call1.label).to.equal("Automatic Reclassify");

		const call2 = mockPanelTitleHandler.getCall(1).args[0];
		expect(call2.panelId).to.equal("TableTwisty");

		const call3 = mockPanelTitleHandler.getCall(2).args[0];
		expect(call3.panelId).to.equal("TwistyPanel2");
	});

	it("should render different custom titles for different panels", () => {
		mockPanelTitleHandler = sinon.spy(({ panelId }) => {
			if (panelId === "TwistyPanel1") {
				return <span className="custom-title-1">First Panel Custom Title</span>;
			} else if (panelId === "TableTwisty") {
				return <span className="custom-title-2">Table Panel Custom Title</span>;
			}
			return null;
		});

		const callbacks = {
			panelTitleHandler: mockPanelTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;

		// Check first panel custom title
		const twisty1 = container.querySelector("div[data-id='properties-TwistyPanel1']");
		const customTitle1 = twisty1.querySelector(".custom-title-1");
		expect(customTitle1).to.not.be.null;
		expect(customTitle1.textContent).to.equal("First Panel Custom Title");
		expect(twisty1.classList.contains("properties-twisty-custom-title")).to.equal(true);

		// Check table panel custom title
		const twistyTable = container.querySelector("div[data-id='properties-TableTwisty']");
		const customTitle2 = twistyTable.querySelector(".custom-title-2");
		expect(customTitle2).to.not.be.null;
		expect(customTitle2.textContent).to.equal("Table Panel Custom Title");
		expect(twistyTable.classList.contains("properties-twisty-custom-title")).to.equal(true);

		// Check third panel uses default label (no custom title)
		const twisty2 = container.querySelector("div[data-id='properties-TwistyPanel2']");
		expect(twisty2.classList.contains("properties-twisty-custom-title")).to.equal(false);
	});

	it("should allow custom title to include original label", () => {
		mockPanelTitleHandler = sinon.spy(({ panelId, label }) => {
			if (panelId === "TwistyPanel1") {
				return (
					<div>
						<span className="original-label">{label}</span>
						<span className="additional-info"> - Additional Info</span>
					</div>
				);
			}
			return null;
		});

		const callbacks = {
			panelTitleHandler: mockPanelTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that both the original label and additional info are present
		const originalLabel = twisty.querySelector(".original-label");
		expect(originalLabel).to.not.be.null;
		expect(originalLabel.textContent).to.equal("Automatic Reclassify");

		const additionalInfo = twisty.querySelector(".additional-info");
		expect(additionalInfo).to.not.be.null;
		expect(additionalInfo.textContent).to.include("Additional Info");
	});
});

describe("twisty panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("text panel should have custom classname defined", () => {
		const { container } = wrapper;
		const twistyPanelcategory = container.querySelectorAll("div.properties-category-container")[6]; // TWISTY PANEL category
		expect(twistyPanelcategory.querySelectorAll(".twisty-panel1-group-twistypanel-class")).to.have.length(1);
	});
});
