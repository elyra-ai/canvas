/*
 * Copyright 2017-2025 Elyra Authors
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

import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "../../_utils_/table-utilsRTL";
import summarypanelParamDef from "./../../test_resources/paramDefs/summarypanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";
import { cleanup, waitFor, fireEvent } from "@testing-library/react";

beforeAll(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Element.prototype.getBoundingClientRect = jest.fn()
		.mockReturnValue({
			height: 1000, // This is used to measure the panel height
			width: 1000
		});
});

describe("summary renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed the initial values in the summary", () => {
		const { container } = wrapper;
		const summaries = container.querySelectorAll("div.properties-summary-values");
		expect(summaries).to.have.length(3); // all summary tables including table in wideflyout
		const sortSummary = container.querySelector("div[data-id='properties-structuretableSortOrder-summary-panel']");
		const sortSummaryRows = sortSummary.querySelectorAll("tr.properties-summary-row");
		expect(sortSummaryRows).to.have.length(1);

		const sortRow1 = sortSummaryRows[0].querySelector("td.properties-summary-row-data");
		const sortRow1Span = sortRow1.querySelector("span");
		expect(sortRow1Span.textContent.trim()).to.equal("Cholesterol");
		// validate tooltip content is correct
		const tooltip = sortRow1.querySelector("div.properties-truncated-tooltip");
		expect(tooltip.textContent.trim()).to.equal("Cholesterol");

	});
	it("should open fieldpicker when type unknown", () => {
		const { container } = wrapper;
		const sortSummary = container.querySelector("div[data-id='properties-structuretableSortOrder-summary-panel']");
		const summaryButton = sortSummary.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryButton);
		const fieldPickerWrapper = tableUtilsRTL.openFieldPicker(container, "properties-structuretableSortOrder");
		tableUtilsRTL.fieldPicker(fieldPickerWrapper, ["Age"], ["Age", "Sex", "BP", "Cholesterol", "Na", "K", "Drug"]);
	});
});

describe("summary panel renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should have displayed placeholder in summary panel for more then 10 fields", () => {
		const { container } = wrapper;
		const summaries = container.querySelectorAll("div[data-id='properties-Derive-Node'] .properties-summary-values");
		const summaryRows = summaries[1].querySelectorAll("tr.properties-summary-row"); // Table Input
		expect(summaryRows).to.have.length(0);

		const summaryPlaceholder = summaries[1].querySelector("div.properties-summary-table span");
		expect(summaryPlaceholder).to.exist;
		expect(summaryPlaceholder.textContent).to.equal("More than ten fields...");
	});
	it("should have a summary panel in a summary panel", () => {
		const wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "structuretableSortOrder-summary-panel");
		const summaryButton = wideflyout.querySelectorAll("button.properties-summary-link-button");
		expect(summaryButton).to.have.lengthOf(1);
		const summaryData = wideflyout.querySelectorAll("tr.properties-summary-row");
		expect(summaryData).to.have.length(1);
	});
});

describe("summary panel renders error/warning status correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("should show warning message in summary when removing rows", () => {
		let wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "Derive-Node");
		tableUtilsRTL.clickTableRows(wideflyout, [0]);

		// ensure table toolbar has Delete button and click it
		const { container } = wrapper;
		wideflyout = container.querySelector("div.properties-wf-content.show");
		let tableWrapper = wideflyout.querySelector("div[data-id='properties-expressionCellTable']");
		let deleteButtons = tableWrapper.querySelectorAll("button.delete-button");
		expect(deleteButtons).to.have.length(2);
		fireEvent.click(deleteButtons[0]);

		// remove second row
		tableUtilsRTL.clickTableRows(wideflyout, [0]);
		wideflyout = container.querySelector("div.properties-wf-content.show");
		tableWrapper = wideflyout.querySelector("div[data-id='properties-expressionCellTable']");
		deleteButtons = tableWrapper.querySelectorAll("button.delete-button");
		expect(deleteButtons).to.have.length(1);
		fireEvent.click(deleteButtons[0]);

		// close fly-out
		const propertyButton = wideflyout.querySelector("button.properties-apply-button");
		fireEvent.click(propertyButton);

		// check that Alerts tab is added
		const alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		const alertButton = alertCategory.querySelector("button.cds--accordion__heading");
		expect(alertButton.textContent).to.equal("Alerts (1)");
		fireEvent.click(alertButton);
		const alertList = alertCategory.querySelectorAll("div.properties-link-text-container.warning");
		expect(alertList).to.have.length(1);
		const warningMsg = alertList[0].querySelector("a.properties-link-text");
		expect(warningMsg.textContent).to.equal("Expression cell table cannot be empty");

		// click on the link should open up structure list table category
		fireEvent.click(warningMsg);
		expect(container.querySelectorAll("li.properties-category-content.show")).to.have.length(1);

		// check that warning icon is shown in summary
		let tableCategory = container.querySelector("div[data-id='properties-Derive-Node']");
		let summary = tableCategory.querySelector("div.properties-summary-link-container");
		expect(summary.querySelectorAll("svg.warning")).to.have.length(1);

		// add row back in tables
		const summaryLinkButton = tableCategory.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryLinkButton);
		wideflyout = container.querySelector("div.properties-wf-content.show");
		const emptyTableButton = wideflyout.querySelector("button.properties-empty-table-button");
		fireEvent.click(emptyTableButton);
		// close fly-out
		const applyButton = wideflyout.querySelector("button.properties-apply-button");
		fireEvent.click(applyButton);
		// ensure warning message and alerts tab are gone
		tableCategory = container.querySelector("div[data-id='properties-Derive-Node']");
		summary = tableCategory.querySelector("div.properties-summary-link-container");
		expect(summary.querySelectorAll("svg.warning")).to.have.length(0);
	});

	it("should show error icon in summary when both error and warning messages exist", async() => {
		let wideflyout = propertyUtilsRTL.openSummaryPanel(wrapper, "Derive-Node");
		tableUtilsRTL.clickTableRows(wideflyout, [0]);

		const { container } = wrapper;
		wideflyout = container.querySelector("div.properties-wf-content.show");
		// ensure table toolbar has Delete button and click it
		let tableWrapper = wideflyout.querySelector("div[data-id='properties-expressionCellTable']");
		let deleteButtons = tableWrapper.querySelectorAll("button.delete-button");
		fireEvent.click(deleteButtons[0]);

		// remove second row
		tableUtilsRTL.clickTableRows(wideflyout, [0]);
		wideflyout = container.querySelector("div.properties-wf-content.show");
		tableWrapper = wideflyout.querySelector("div[data-id='properties-expressionCellTable']");
		deleteButtons = tableWrapper.querySelectorAll("button.delete-button");
		fireEvent.click(deleteButtons[0]);

		// check that all rows were removed
		wideflyout = container.querySelector("div.properties-wf-content.show");
		expect(tableUtilsRTL.getTableRows(wideflyout.querySelector("div[data-id='properties-expressionCellTable']"))).to.have.length(0);

		wideflyout = container.querySelector("div.properties-wf-content.show");
		expect(tableUtilsRTL.getTableRows(wideflyout.querySelector("div[data-id='properties-ft-structurelisteditorTableInput']"))).to.have.length(11);

		// remove all rows from Table Input table
		const tableInputBodyData = wideflyout.querySelector("div[data-id='properties-ft-structurelisteditorTableInput']");
		summarypanelParamDef.current_parameters.structurelisteditorTableInput.forEach((value) => {
			tableUtilsRTL.selectCheckboxes(tableInputBodyData, [0]);
			const tableToolbar = wideflyout.querySelector("div.properties-table-toolbar");
			const tableInputRemoveButton = tableToolbar.querySelectorAll("button.properties-action-delete");
			expect(tableInputRemoveButton).to.have.length(1);
			fireEvent.click(tableInputRemoveButton[0]);
		});
		// check that all rows were removed
		wideflyout = container.querySelector("div.properties-wf-content.show");
		expect(tableUtilsRTL.getTableRows(wideflyout.querySelector("div[data-id='properties-ft-structurelisteditorTableInput']"))).to.have.length(0);

		// close fly-out
		const PropApplyButton = wideflyout.querySelector("button.properties-apply-button");
		fireEvent.click(PropApplyButton);

		// check that Alerts tab is added and that is shows error message before warning message
		let alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		expect(alertCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Alerts (2)");
		let alertList = alertCategory.querySelectorAll("div.properties-link-text-container");
		expect(alertList).to.have.length(2);
		const errorWrapper = alertCategory.querySelector("div.properties-link-text-container.error");
		expect(errorWrapper).to.not.be.null;
		expect(errorWrapper.querySelector("a.properties-link-text").textContent).to.equal("Structure list editor table cannot be empty");
		let warningWrapper = alertCategory.querySelector("div.properties-link-text-container.warning");
		expect(warningWrapper).to.not.be.null;
		expect(warningWrapper.querySelector("a.properties-link-text").textContent).to.equal("Expression cell table cannot be empty");
		// check that summary icon is an error icon
		let tableCategory = container.querySelectorAll("div.properties-category-container")[1]; // Structure list table category
		expect(tableCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Structure List Table (2)");
		let summary = tableCategory.querySelector("div.properties-summary-link-container");
		expect(summary.querySelectorAll("svg.error")).to.have.length(1);

		// add row back into Table Input table
		const summaryLinkButton = tableCategory.querySelector("button.properties-summary-link-button");
		fireEvent.click(summaryLinkButton);
		wideflyout = container.querySelector("div.properties-wf-content.show");

		const emptyTabButton = wideflyout.querySelectorAll("button.properties-empty-table-button")[1];
		fireEvent.click(emptyTabButton);

		// close fly-out
		const propApplyButton = wideflyout.querySelector("button.properties-apply-button");
		fireEvent.click(propApplyButton);

		// check that Alerts tab is added and that is shows error message before warning message
		alertCategory = container.querySelectorAll("div.properties-category-container")[0]; // alert category
		expect(alertCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Alerts (1)");
		alertList = alertCategory.querySelectorAll("div.properties-link-text-container");
		expect(alertList).to.have.length(1);
		warningWrapper = alertCategory.querySelector("div.properties-link-text-container.warning");
		expect(warningWrapper).to.not.be.null;
		expect(warningWrapper.querySelector("a.properties-link-text").textContent).to.equal("Expression cell table cannot be empty");

		// check that summary icon is an error icon
		tableCategory = container.querySelectorAll("div.properties-category-container")[1]; // Structure list table category
		expect(tableCategory.querySelector("button.cds--accordion__heading").textContent).to.equal("Structure List Table (1)");
		summary = tableCategory.querySelector("div.properties-summary-link-container");
		expect(summary.querySelectorAll("svg.warning")).to.have.length(1);

	});
});

describe("summary panel visible and enabled conditions work correctly", () => {
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

	it("summary panel link should be disabled and table should be gone", async() => {
		const { container } = wrapper;
		let firstSummary = container.querySelector("div[data-id='properties-structuretable-summary-panel1']");
		expect(firstSummary.hasAttribute("disabled")).to.equal(false);
		const summaryValue = firstSummary.querySelectorAll("div.properties-summary-values");
		expect(summaryValue.length).to.equal(2);
		expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("enabled");

		controller.updatePropertyValue({ name: "enableSummary" }, false);
		await waitFor(() => {
			firstSummary = container.querySelector("div[data-id='properties-structuretable-summary-panel1']");
			expect(firstSummary.hasAttribute("disabled")).to.be.true;
			expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("disabled");
			expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("disabled");
			const propSummaryValue = firstSummary.querySelectorAll("div.properties-summary-values");
			expect(propSummaryValue.length).to.equal(0);
		});
	});

	it("summary panel link should be hidden", async() => {
		const { container } = wrapper;
		let secondSummary = container.querySelector("div[data-id='properties-structuretable-summary-panel2']");
		const link = secondSummary.querySelectorAll("button.properties-summary-link-button");
		expect(link).to.have.length(1);
		expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("visible");
		expect(secondSummary.querySelectorAll("div.properties-summary-values")).to.have.length(1);

		controller.updatePropertyValue({ name: "hideSummary" }, true);

		await waitFor(() => {
			expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("hidden");
			expect(controller.getControlState({ name: "structuretable_summary3" })).to.equal("hidden");
			secondSummary = container.querySelector("div[data-id='properties-structuretable-summary-panel2']");
			expect(secondSummary.querySelectorAll("div.properties-summary-values")).to.have.length(0);
		});
	});
});

describe("summary panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		cleanup();
	});

	it("summary panel should have custom classname defined", () => {
		const { container } = wrapper;
		const summaryContainer = container.querySelector("div[data-id='properties-summary_panel_category']");
		expect(summaryContainer.querySelectorAll(".structuretable-summary-panel1-category-group-summarypanel-class")).to.have.lengthOf(1);
	});
});

