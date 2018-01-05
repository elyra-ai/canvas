/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import propertyUtils from "../_utils_/property-utils";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";

describe("textPanel render correctly", () => {
	const wrapper = propertyUtils.flyoutEditorForm(panelParamDef);
	it("should have displayed correct number of textPanel elements", () => {
		const staticText = wrapper.find(".properties-text-panel");
		expect(staticText).to.have.length(2);
		const labels = wrapper.find(".panel-label");
		expect(labels).to.have.length(2);
		const descriptions = wrapper.find(".panel-description");
		expect(descriptions).to.have.length(2);
	});
	it("should have displayed correct text in textPanel elements", () => {
		const labels = wrapper.find(".panel-label");
		expect(labels.at(0).text()).to.equal("Oranges");
		const descriptions = wrapper.find(".panel-description");
		expect(descriptions.at(0).text()).to.equal("An orange tree can grow to reach 30 feet and live for over a hundred years.");
		expect(descriptions.at(1).text()).to.equal("Apples ripen six to 10 times faster at room temperature than if they are refrigerated.");
	});
});
