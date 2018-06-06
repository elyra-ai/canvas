/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "./../../_utils_/property-utils";
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

		const sortRow1 = sortSummaryRows.at(0);
		const sortRow1Texts = sortRow1.find("td.properties-summary-row-data").at(0)
			.find("span");
		expect(sortRow1Texts.at(0).text()
			.trim()).to.equal("Cholesterol");

		expect(sortRow1.find("td.properties-summary-row-data").at(0)
			.find("span")
			.at(1)
			.text()
			.trim()).to.equal("Cholesterol");
	});
	it("should open fieldpicker when type unknown", () => {
		const sortSummary = wrapper.find("div[data-id='properties-structuretableSortOrder-summary-panel']");
		const summaryButton = sortSummary.find("button.properties-summary-link-button");
		summaryButton.simulate("click");
		const fieldPickerWrapper = propertyUtils.openFieldPicker(wrapper, "properties-structuretableSortOrder");
		propertyUtils.fieldPicker(fieldPickerWrapper, ["Age"], ["Age", "Sex", "BP", "Cholesterol", "Na", "K", "Drug"]);
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
		const tableData = wideflyout.find("tbody.reactable-data").at(0);
		let row = tableData.childAt(1);
		row.simulate("click");

		// ensure remove button is enabled and click it
		wideflyout = wrapper.find("div.properties-wf-content.show");
		const enabledRemoveColumnButton = wideflyout.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.false;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.at(0).simulate("click");

		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added
		const alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (1)");
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
		wideflyout.find("button.properties-add-fields-button").at(0)
			.simulate("click");
		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// ensure warning message and alerts tab are gone
		tableCategory = wrapper.find("div[data-id='properties-Derive-Node']");
		summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.warning")).to.have.length(0);
	});

	it("should show error icon in summary when both error and warning messages exist", () => {
		let wideflyout = propertyUtils.openSummaryPanel(wrapper, "Derive-Node");
		const tableData = wideflyout.find("tbody.reactable-data").at(0);
		let row = tableData.childAt(0);
		row.simulate("click");

		wideflyout = wrapper.find("div.properties-wf-content.show");
		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wideflyout.find("button.properties-remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.false;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.at(0).simulate("click");

		wideflyout = wrapper.find("div.properties-wf-content.show");
		// remove all rows from Table Input table
		const tableInputBodyData = wideflyout.find("tbody.reactable-data").at(1);
		summarypanelParamDef.current_parameters.structurelisteditorTableInput.forEach((value) => {
			const tableInputDataRow = tableInputBodyData.childAt(0);
			tableInputDataRow.simulate("click");
			const tableInputRemoveButton = wideflyout.find("button.properties-remove-fields-button");
			expect(tableInputRemoveButton).to.have.length(2);
			tableInputRemoveButton.at(1).simulate("click");
		});
		// check that all rows were removed
		wideflyout = wrapper.find("div.properties-wf-content.show");
		expect(wideflyout.find("tbody.reactable-data").at(1)
			.children()).to.have.length(0);

		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added and that is shows error message before warning message
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		expect(alertCategory.find("button.properties-category-title").text()).to.equal("ALERTS (2)");
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
		expect(tableCategory.find("button.properties-category-title").text()).to.equal("STRUCTURE LIST TABLE (2)");
		let summary = tableCategory.find("div.properties-summary-link-container");
		expect(summary.find("svg.error")).to.have.length(1);

		// add row back into Table Input table
		tableCategory.find("button.properties-summary-link-button").simulate("click");
		wideflyout = wrapper.find("div.properties-wf-content.show");

		wideflyout.find("button.properties-add-fields-button").at(1)
			.simulate("click");
		// close fly-out
		wideflyout.find("button.properties-apply-button").simulate("click");

		// check that Alerts tab is added and that is shows error message before warning message
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		expect(alertCategory.find("button.properties-category-title").text()).to.equal("ALERTS (1)");
		alertList = alertCategory.find("div.properties-link-text-container");
		expect(alertList).to.have.length(1);
		warningWrapper = alertCategory.find("div.properties-link-text-container.warning");
		expect(warningWrapper).to.have.length(1);
		expect(warningWrapper.find("a.properties-link-text").text()).to.equal("Expression cell table cannot be empty");
		// check that summary icon is an error icon
		tableCategory = wrapper.find("div.properties-category-container").at(1); // Structure list table category
		expect(tableCategory.find("button.properties-category-title").text()).to.equal("STRUCTURE LIST TABLE (1)");
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
