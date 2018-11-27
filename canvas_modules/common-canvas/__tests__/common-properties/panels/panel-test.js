/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Test suite for generic panel testing

import { expect } from "chai";
import propertyUtils from "./../../_utils_/property-utils";
import panelParamDef from "./../../test_resources/paramDefs/panel_paramDef.json";

// possibly move these under each panel
describe("empty panels render correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
	const wrapper = renderedObject.wrapper;

	it("should render each panel", () => {
		const panelContainer = wrapper.find("div[data-id='properties-empty-panels-container']");
		expect(panelContainer).to.have.length(1);
		expect(panelContainer.children()).to.have.length(10);
	});
});
