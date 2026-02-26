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
		expect(twisty.classList.contains("properties-twisty-sub-title")).to.equal(false);
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


describe("twisty panel subtitle renders correctly", () => {
	let mockTwistyTitleHandler;

	afterEach(() => {
		cleanup();
	});

	it("should render subtitle when twistyTitleHandler is provided and returns a value", () => {
		mockTwistyTitleHandler = sinon.spy((panelId) => {
			if (panelId === "TwistyPanel1") {
				return <span className="test-subtitle">Subtitle for Panel 1</span>;
			}
			return null;
		});

		const callbacks = {
			twistyTitleHandler: mockTwistyTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that the title wrapper div exists
		const titleDiv = twisty.querySelector(".properties-twisty-panel-title");
		expect(titleDiv).to.not.be.null;

		// Check that the subtitle is rendered
		const subtitle = titleDiv.querySelector(".test-subtitle");
		expect(subtitle).to.not.be.null;
		expect(subtitle.textContent).to.equal("Subtitle for Panel 1");

		// Check that the CSS class for subtitle is applied
		expect(twisty.classList.contains("properties-twisty-sub-title")).to.equal(true);

		// Verify the handler was called with the correct panel ID
		expect(mockTwistyTitleHandler.calledWith("TwistyPanel1")).to.equal(true);
	});

	it("should not apply subtitle CSS class when twistyTitleHandler returns null", () => {
	// Mock the twistyTitleHandler to return null
		mockTwistyTitleHandler = sinon.spy(() => null);

		const callbacks = {
			twistyTitleHandler: mockTwistyTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Check that the subtitle CSS class is not applied when subtitle is null
		expect(twisty.classList.contains("properties-twisty-sub-title")).to.equal(false);
	});

	it("should not render subtitle wrapper when twistyTitleHandler is not provided", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");

		// Without a handler, the title should be plain text, not wrapped in a div
		const titleDiv = twisty.querySelector(".properties-twisty-panel-title");
		expect(titleDiv).to.be.null;

		// Check that the subtitle CSS class is not applied
		expect(twisty.classList.contains("properties-twisty-sub-title")).to.equal(false);
	});

	it("should call twistyTitleHandler with correct panel ids", () => {
		mockTwistyTitleHandler = sinon.spy((panelId) => <span>Subtitle for {panelId}</span>);

		const callbacks = {
			twistyTitleHandler: mockTwistyTitleHandler
		};

		propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);

		// Verify the handler was called with the correct panel IDs
		expect(mockTwistyTitleHandler.calledWith("TwistyPanel1")).to.equal(true);
		expect(mockTwistyTitleHandler.calledWith("TableTwisty")).to.equal(true);
		expect(mockTwistyTitleHandler.calledWith("TwistyPanel2")).to.equal(true);
	});

	it("should render different subtitles for different panels", () => {
		mockTwistyTitleHandler = sinon.spy((panelId) => {
			if (panelId === "TwistyPanel1") {
				return <span className="subtitle-1">First Panel Subtitle</span>;
			} else if (panelId === "TableTwisty") {
				return <span className="subtitle-2">Table Panel Subtitle</span>;
			}
			return null;
		});

		const callbacks = {
			twistyTitleHandler: mockTwistyTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;

		// Check first panel subtitle
		const twisty1 = container.querySelector("div[data-id='properties-TwistyPanel1']");
		const subtitle1 = twisty1.querySelector(".subtitle-1");
		expect(subtitle1).to.not.be.null;
		expect(subtitle1.textContent).to.equal("First Panel Subtitle");
		expect(twisty1.classList.contains("properties-twisty-sub-title")).to.equal(true);

		// Check table panel subtitle
		const twistyTable = container.querySelector("div[data-id='properties-TableTwisty']");
		const subtitle2 = twistyTable.querySelector(".subtitle-2");
		expect(subtitle2).to.not.be.null;
		expect(subtitle2.textContent).to.equal("Table Panel Subtitle");
		expect(twistyTable.classList.contains("properties-twisty-sub-title")).to.equal(true);

		// Check third panel has no subtitle
		const twisty2 = container.querySelector("div[data-id='properties-TwistyPanel2']");
		expect(twisty2.classList.contains("properties-twisty-sub-title")).to.equal(false);
	});

	it("should render panel label along with subtitle", () => {
		mockTwistyTitleHandler = sinon.spy((panelId) => {
			if (panelId === "TwistyPanel1") {
				return <span className="test-subtitle">Additional Info</span>;
			}
			return null;
		});

		const callbacks = {
			twistyTitleHandler: mockTwistyTitleHandler
		};

		const renderedObject = propertyUtilsRTL.flyoutEditorForm(twistypanelParamDef, null, callbacks);
		const { container } = renderedObject.wrapper;
		const twisty = container.querySelector("div[data-id='properties-TwistyPanel1']");
		const titleDiv = twisty.querySelector(".properties-twisty-panel-title");

		// Check that both the label and subtitle are present
		expect(titleDiv.textContent).to.include("Automatic Reclassify");
		expect(titleDiv.textContent).to.include("Additional Info");
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
