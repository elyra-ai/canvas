/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import structuretableParamDef from "../test_resources/paramDefs/structuretable_paramDef.json";
import { expect } from "chai";

describe("structuretable summary renders correctly", () => {
	const wrapper = propertyUtils.flyoutEditorForm(structuretableParamDef);

	it("should have displayed the initial values in the summary", () => {
		const summaries = wrapper.find(".control-summary-configured-values");
		expect(summaries).to.have.length(2);
		const sortSummaryRows = summaries.at(0).find(".control-summary-list-rows");
		expect(sortSummaryRows).to.have.length(3);

		const sortRow1 = sortSummaryRows.at(0);
		expect(sortRow1.find(".control-summary-table-row-multi-data").at(0)
			.text()).to.equal("Cholesterol");
		expect(sortRow1.find(".control-summary-table-row-multi-data").at(1)
			.text()).to.equal("1");

		const sortRow2 = sortSummaryRows.at(1);
		expect(sortRow2.find(".control-summary-table-row-multi-data").at(0)
			.text()).to.equal("Age");
		expect(sortRow2.find(".control-summary-table-row-multi-data").at(1)
			.text()).to.equal("11");

		const sortRow3 = sortSummaryRows.at(2);
		expect(sortRow3.find(".control-summary-table-row-multi-data").at(0)
			.text()).to.equal("Drug");
		expect(sortRow3.find(".control-summary-table-row-multi-data").at(1)
			.text()).to.equal("111");
	});
});
