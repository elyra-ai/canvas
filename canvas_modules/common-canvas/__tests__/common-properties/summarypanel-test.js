/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import summarypanelParamDef from "../test_resources/paramDefs/summarypanel_paramDef.json";
import { expect } from "chai";

describe("summary renders correctly", () => {
	const wrapper = propertyUtils.flyoutEditorForm(summarypanelParamDef);

	it("should have displayed the initial values in the summary", () => {
		const summaries = wrapper.find(".control-summary-configured-values");
		expect(summaries).to.have.length(3);
		const sortSummaryRows = summaries.at(2).find(".control-summary-list-rows"); // sort table
		expect(sortSummaryRows).to.have.length(1);

		const sortRow1 = sortSummaryRows.at(0);
		expect(sortRow1.find(".control-summary-table-row-multi-data").at(0)
			.text()).to.equal("Cholesterol");
	});
});

describe("summary panel renders correctly with long table of more than ten rows", () => {
	const wrapper = propertyUtils.flyoutEditorForm(summarypanelParamDef);

	it("should have displayed placeholder in summary panel", () => {
		const summaries = wrapper.find(".control-summary-configured-values");
		const summaryRows = summaries.at(1).find(".control-summary-list-rows"); // Table Input
		expect(summaryRows).to.have.length(0);

		const summaryPlaceholder = summaries.at(1).find(".control-summary-table");
		expect(summaryPlaceholder).to.have.length(1);
		expect(summaryPlaceholder.text()).to.equal("More than ten fields...");
	});
});
