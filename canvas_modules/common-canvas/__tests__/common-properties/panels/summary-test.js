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

import propertyUtils from "./../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";
import summarypanelParamDef from "./../../test_resources/paramDefs/summarypanel_paramDef.json";
import panelConditionsParamDef from "./../../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";

describe("summary renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the initial values in the summary", () => {
		const summaries = wrapper.find("div.properties-summary-values");
		expect(summaries).to.have.length(3); // all summary tables including table in wideflyout
		const sortSummary = wrapper.find("div[data-id='properties-structuretableSortOrder-summary-panel']");
		const sortSummaryRows = sortSummary.find("tr.properties-summary-row");
		expect(sortSummaryRows).to.have.length(1);

		const sortRow1 = sortSummaryRows.at(0).find("td.properties-summary-row-data")
			.at(0);

		expect(sortRow1.find("span").at(0)
			.text()
			.trim()).to.equal("Cholesterol");
		// validate tooltip content is correct
		expect(sortRow1.find("div.properties-tooltips div")
			.at(0)
			.text()
			.trim()).to.equal("Cholesterol");
	});
	it("should open fieldpicker when type unknown", () => {
		const sortSummary = wrapper.find("div[data-id='properties-structuretableSortOrder-summary-panel']");
		const summaryButton = sortSummary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");
		const fieldPickerWrapper = tableUtils.openFieldPicker(wrapper, "properties-structuretableSortOrder");
		tableUtils.fieldPicker(fieldPickerWrapper, ["Age"], ["Age", "Sex", "BP", "Cholesterol", "Na", "K", "Drug"]);
	});
});

describe("summary panel renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed placeholder in summary panel for more then 10 fields", () => {
		const summaries = wrapper.find("div[data-id='properties-Derive-Node'] .properties-summary-values");
		const summaryRows = summaries.at(1).find("tr.properties-summary-row"); // Table Input
		expect(summaryRows).to.have.length(0);

		const summaryPlaceholder = summaries.at(1).find("div.properties-summary-table span");
		expect(summaryPlaceholder).to.have.length(1);
		expect(summaryPlaceholder.text()).to.equal("More than ten fields...");
	});
	it("should have a summary panel in a summary panel", () => {
		const wideflyout = propertyUtils.openSummaryPanel(wrapper, "structuretableSortOrder-summary-panel");
		const summaryButton = wideflyout.find("button.properties-summary-link-button");
		expect(summaryButton).to.have.length(1);
		const summaryData = wideflyout.find("tr.properties-summary-row");
		expect(summaryData).to.have.length(1);
	});
});

describe("summary panel renders error/warning status correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(summarypanelParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show warning message in summary when removing rows", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "Derive-Node");
		tableUtils.clickTableRows(wideflyout, [0]);

		// ensure remove button is enabled and click it
		wideflyout = wrapper.find("div.properties-wf-content.show");
		const enabledRemoveColumnButton = wideflyout.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.false;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		tableUtils.clickTableRows(wideflyout, [0]);
		enabledRemoveColumnButton.at(0).simulate("click");

		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added
		const alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("Alerts (1)");
		alertButton.simulate("click");
		const alertList = alertCategory.find("div.properties-link-text-container.warning");
		expect(alertList).to.have.length(1);
		const warningMsg = alertList.at(0).find("a.properties-link-text");
		expect(warningMsg.text()).to.equal("Expression cell table cannot be empty");

		// click on the link should open up structure list table category
		warningMsg.simulate("click");
		expect(wrapper.find("div.properties-category-content.show")).to.have.length(1);

		// check that warning icon is shown in summary
		let tableCategory = wrapper.find("div[data-id='properties-Derive-Node']");
		let summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.warning")).to.have.length(1);

		// add row back in tables
		tableCategory.find("button.properties-summary-link-button").simulate("click");
		wideflyout = wrapper.find("div.properties-wf-content.show");
		wideflyout.find("button.properties-empty-table-button").simulate("click");
		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// ensure warning message and alerts tab are gone
		tableCategory = wrapper.find("div[data-id='properties-Derive-Node']");
		summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.warning")).to.have.length(0);
	});

	it("should show error icon in summary when both error and warning messages exist", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "Derive-Node");
		tableUtils.clickTableRows(wideflyout, [0]);

		wideflyout = wrapper.find("div.properties-wf-content.show");
		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wideflyout.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.false;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		tableUtils.clickTableRows(wideflyout, [0]);
		enabledRemoveColumnButton.at(0).simulate("click");

		wideflyout = wrapper.find("div.properties-wf-content.show");
		expect(tableUtils.getTableRows(wideflyout.find("div[data-id='properties-ft-structurelisteditorTableInput']"))).to.have.length(11);
		// remove all rows from Table Input table
		const tableInputBodyData = wideflyout.find("div[data-id='properties-ft-structurelisteditorTableInput']");
		summarypanelParamDef.current_parameters.structurelisteditorTableInput.forEach((value) => {
			tableUtils.selectCheckboxes(tableInputBodyData, [0]);
			const tableInputRemoveButton = wideflyout.find("button.properties-remove-fields-button");
			expect(tableInputRemoveButton).to.have.length(1);

			tableInputRemoveButton.simulate("click");
		});
		// check that all rows were removed
		wideflyout = wrapper.find("div.properties-wf-content.show");
		expect(tableUtils.getTableRows(wideflyout.find("div[data-id='properties-ft-structurelisteditorTableInput']"))).to.have.length(0);

		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added and that is shows error message before warning message
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		expect(alertCategory.find("button.properties-category-title").text()).to.equal("Alerts (2)");
		let alertList = alertCategory.find("div.properties-link-text-container");
		expect(alertList).to.have.length(2);
		const errorWrapper = alertCategory.find("div.properties-link-text-container.error");
		expect(errorWrapper).to.have.length(1);
		expect(errorWrapper.find("a.properties-link-text").text()).to.equal("Structure list editor table cannot be empty");
		let warningWrapper = alertCategory.find("div.properties-link-text-container.warning");
		expect(warningWrapper).to.have.length(1);
		expect(warningWrapper.find("a.properties-link-text").text()).to.equal("Expression cell table cannot be empty");
		// check that summary icon is an error icon
		let tableCategory = wrapper.find("div.properties-category-container").at(1); // Structure list table category
		expect(tableCategory.find("button.properties-category-title").text()).to.equal("Structure List Table (2)");
		let summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.error")).to.have.length(1);

		// add row back into Table Input table
		tableCategory.find("button.properties-summary-link-button").simulate("click");
		wideflyout = wrapper.find("div.properties-wf-content.show");

		wideflyout.find("button.properties-empty-table-button").at(1)
			.simulate("click");
		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added and that is shows error message before warning message
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		expect(alertCategory.find("button.properties-category-title").text()).to.equal("Alerts (1)");
		alertList = alertCategory.find("div.properties-link-text-container");
		expect(alertList).to.have.length(1);
		warningWrapper = alertCategory.find("div.properties-link-text-container.warning");
		expect(warningWrapper).to.have.length(1);
		expect(warningWrapper.find("a.properties-link-text").text()).to.equal("Expression cell table cannot be empty");
		// check that summary icon is an error icon
		tableCategory = wrapper.find("div.properties-category-container").at(1); // Structure list table category
		expect(tableCategory.find("button.properties-category-title").text()).to.equal("Structure List Table (1)");
		summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.warning")).to.have.length(1);
	});
});

describe("summary panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("summary panel link should be disabled and table should be gone", () => {
		let firstSummary = wrapper.find("div[data-id='properties-structuretable-summary-panel1']");
		expect(firstSummary.props().disabled).to.be.false;
		expect(firstSummary.find("div.properties-summary-values")).to.have.length(2);
		expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("enabled");

		controller.updatePropertyValue({ name: "enableSummary" }, false);
		wrapper.update();
		firstSummary = wrapper.find("div[data-id='properties-structuretable-summary-panel1']");
		expect(firstSummary.props().disabled).to.be.true;
		expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("disabled");
		expect(firstSummary.find("div.properties-summary-values")).to.have.length(0);
	});

	it("summary panel link should be hidden", () => {
		let secondSummary = wrapper.find("div[data-id='properties-structuretable-summary-panel2']");
		const link = secondSummary.find("button.properties-summary-link-button");
		expect(link).to.have.length(1);
		expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("visible");
		expect(secondSummary.find("div.properties-summary-values")).to.have.length(1);

		controller.updatePropertyValue({ name: "hideSummary" }, true);
		wrapper.update();

		expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "structuretable_summary3" })).to.equal("hidden");
		secondSummary = wrapper.find("div[data-id='properties-structuretable-summary-panel2']");
		expect(secondSummary.find("div.properties-summary-values")).to.have.length(0);
	});
});

describe("summary panel classNames applied correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("summary panel should have custom classname defined", () => {
		const summaryContainer = wrapper.find("div[data-id='properties-summary_panel_category']");
		expect(summaryContainer.find(".structuretable-summary-panel1-category-group-summarypanel-class")).to.have.length(1);
	});
});
