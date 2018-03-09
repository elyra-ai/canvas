/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import summarypanelParamDef from "../test_resources/paramDefs/summarypanel_paramDef.json";
import panelConditionsParamDef from "../test_resources/paramDefs/panelConditions_paramDef.json";
import { expect } from "chai";
import { ReactWrapper } from "enzyme";

describe("summary renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(summarypanelParamDef)));
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the initial values in the summary", () => {
		const summaries = wrapper.find(".control-summary-configured-values");
		expect(summaries).to.have.length(3);
		const sortSummaryRows = summaries.at(2).find(".control-summary-list-rows"); // sort table
		expect(sortSummaryRows).to.have.length(1);

		const sortRow1 = sortSummaryRows.at(0);
		const sortRow1Texts = sortRow1.find(".control-summary-table-row-multi-data").at(0)
			.find("span");
		expect(sortRow1Texts.at(0).text()
			.trim()).to.equal("Cholesterol");

		expect(sortRow1.find(".control-summary-table-row-multi-data").at(0)
			.find("span")
			.at(1)
			.text()
			.trim()).to.equal("Cholesterol");
	});
});

describe("summary panel renders correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(summarypanelParamDef)));
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed placeholder in summary panel for more then 10 fields", () => {
		const summaries = wrapper.find(".control-summary-configured-values");
		const summaryRows = summaries.at(1).find(".control-summary-list-rows"); // Table Input
		expect(summaryRows).to.have.length(0);

		const summaryPlaceholder = summaries.at(1).find(".control-summary-table");
		expect(summaryPlaceholder).to.have.length(1);
		expect(summaryPlaceholder.text()).to.equal("More than ten fields...");
	});
	it("should have a summary panel in a summary panel", () => {
		const category = wrapper.find(".category-title-container-right-flyout-panel").at(1); // COLUMN STRUCTURE TABLE Category
		category.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");

		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const summaryButton = wideflyoutWrapper.find(".control-summary-link-buttons");
		expect(summaryButton).to.have.length(1);
		const summaryData = wideflyoutWrapper.find(".control-summary-list-rows");
		expect(summaryData).to.have.length(1);
	});
});

describe("summary panel renders error/warning status correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(summarypanelParamDef)));
		wrapper = renderedObject.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should show warning message in summary when removing rows", () => {
		let tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // Structure list table category
		tableCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");

		// select first row in derive node table
		let wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		let wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const tableBody = wideflyoutWrapper.find("#flexible-table-container").at(0);
		const tableData = tableBody.find(".reactable-data");
		let row = tableData.childAt(1);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wideflyoutWrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.undefined;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.at(0).simulate("click");

		// close fly-out
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");

		// check that Alerts tab is added
		const alertCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // alert category
		expect(alertCategory.find(".category-title-right-flyout-panel").text()).to.equal("ALERTS (1)");
		const alertList = alertCategory.find(".link-text-container");
		expect(alertList).to.have.length(1);
		const warningMsg = alertList.find(".link-text.warning");
		expect(warningMsg.text()).to.equal("Expression cell table cannot be empty");

		// click on the link should open up structure list table category
		warningMsg.simulate("click");
		tableCategory = wrapper.find(".panel-container-open-right-flyout-panel").at(0); // Structure list table category

		// check that warning icon is shown in summary
		tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // Structure list table category
		let summary = tableCategory.find(".control-summary.control-panel").at(0);
		expect(summary.find(".validation-warning-message-icon-general")).to.have.length(1);

		// add row back in tables
		tableCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		wideflyoutWrapper.find("#add-fields-button").at(0)
			.simulate("click");
		// close fly-out
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");

		// ensure warning message and alerts tab are gone
		tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // Structure list table category
		summary = tableCategory.find(".control-summary.control-panel").at(0);
		expect(summary.find(".validation-warning-message-icon-general")).to.have.length(0);
	});

	it("should show error icon in summary when both error and warning messages exist", () => {
		let tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // Structure list table category
		tableCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");

		// select first row in derive node table
		let wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		let wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const tableBody = wideflyoutWrapper.find("#flexible-table-container").at(0);
		const tableData = tableBody.find(".reactable-data");
		let row = tableData.childAt(0);
		row.simulate("click");

		// ensure remove button is enabled and click it
		const enabledRemoveColumnButton = wideflyoutWrapper.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(2);
		expect(enabledRemoveColumnButton.at(0).prop("disabled")).to.be.undefined;
		expect(enabledRemoveColumnButton.at(1).prop("disabled")).to.equal(true);
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove second row
		row = tableData.childAt(0);
		row.simulate("click");
		enabledRemoveColumnButton.at(0).simulate("click");

		// remove all rows from Table Input table
		const tableInputBody = wideflyoutWrapper.find("#flexible-table-container").at(1);
		const tableInputBodyData = tableInputBody.find(".reactable-data");
		summarypanelParamDef.current_parameters.structurelisteditorTableInput.forEach((value) => {
			const tableInputDataRow = tableInputBodyData.childAt(0);
			tableInputDataRow.simulate("click");
			const tableInputRemoveButton = wideflyoutWrapper.find(".remove-fields-button");
			expect(tableInputRemoveButton).to.have.length(2);
			tableInputRemoveButton.at(1).simulate("click");
		});
		// check that all rows were removed
		expect(tableInputBody.find(".reactable-data").children()).to.have.length(0);

		// close fly-out
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");

		// check that Alerts tab is added and that is shows error message before warning message
		let alertCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // alert category
		expect(alertCategory.find(".category-title-right-flyout-panel").text()).to.equal("ALERTS (2)");
		let alertList = alertCategory.find(".link-text-container");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("Structure list editor table cannot be empty");
		expect(alertList.at(0).find(".link-text.error")).to.have.length(1);
		expect(alertList.at(1).text()).to.equal("Expression cell table cannot be empty");
		expect(alertList.at(1).find(".link-text.warning")).to.have.length(1);

		// check that summary icon is an error icon
		tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // Structure list table category
		expect(tableCategory.find(".category-title-right-flyout-panel").text()).to.equal("STRUCTURE LIST TABLE (2)");
		let summary = tableCategory.find(".control-summary.control-panel").at(0);
		expect(summary.find(".validation-error-message-icon-general")).to.have.length(1);

		// add row back into Table Input table
		tableCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		wideflyoutWrapper.find("#add-fields-button").at(1)
			.simulate("click");
		// close fly-out
		wideflyoutWrapper.find("#properties-apply-button").simulate("click");

		// ensure only warning message is shown
		alertCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // alert category
		expect(alertCategory.find(".category-title-right-flyout-panel").text()).to.equal("ALERTS (1)");
		alertList = alertCategory.find(".link-text-container");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("Expression cell table cannot be empty");
		expect(alertList.at(0).find(".link-text.warning")).to.have.length(1);
		tableCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // Structure list table category
		expect(tableCategory.find(".category-title-right-flyout-panel").text()).to.equal("STRUCTURE LIST TABLE (1)");
		summary = tableCategory.find(".control-summary.control-panel").at(0);
		expect(summary.find(".validation-warning-message-icon-general")).to.have.length(1);
	});
});

describe("summary panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(panelConditionsParamDef)));
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("summary panel link should be disabled and table should be gone", () => {
		const summaryPanelCategory = wrapper.find(".category-title-container-right-flyout-panel").at(3); // SUMMARY PANEL category
		const summaries = summaryPanelCategory.find(".control-summary.control-panel");
		expect(summaries).to.have.length(2);
		const firstSummary = summaries.at(0);
		let link = firstSummary.find(".control-summary-link-buttons").find(".button.button--hyperlink");
		expect(link.props().disabled).to.be.undefined;
		expect(firstSummary.find(".control-summary-configured-values")).to.have.length(2);
		expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("enabled");

		const disabledCheckbox = summaryPanelCategory.find("input[type='checkbox']").at(0);
		expect(disabledCheckbox.props().checked).to.equal(true);
		disabledCheckbox.simulate("change", { target: { checked: false } });

		link = firstSummary.find(".control-summary-link-buttons").find(".button.button--hyperlink");
		expect(link.props().disabled).to.be.true;
		expect(controller.getPanelState({ name: "structuretable-summary-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "structuretable_summary1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "structuretable_summary2" })).to.equal("disabled");
		expect(firstSummary.find(".control-summary-configured-values")).to.have.length(0);
	});

	it("summary panel link should be hidden", () => {
		const summaryPanelCategory = wrapper.find(".category-title-container-right-flyout-panel").at(3); // SUMMARY PANEL category
		const summaries = summaryPanelCategory.find(".control-summary.control-panel");
		expect(summaries).to.have.length(2);
		const secondSummary = summaries.at(1);
		const link = secondSummary.find(".control-summary-link-buttons").find(".button.button--hyperlink");
		expect(link).to.have.length(1);
		expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("visible");
		expect(secondSummary.find(".control-summary-configured-values")).to.have.length(1);

		const hiddenCheckbox = summaryPanelCategory.find("input[type='checkbox']").at(1);
		expect(hiddenCheckbox.props().checked).to.equal(false);
		hiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getPanelState({ name: "structuretable-summary-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "structuretable_summary3" })).to.equal("hidden");
		expect(secondSummary.find(".control-summary-configured-values")).to.have.length(0);
	});
});
