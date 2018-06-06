/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "./../../_utils_/property-utils";
import { expect } from "chai";
import filterEnum from "../../test_resources/paramDefs/filteredEnums_paramDef.json";


describe("Filtered enumerations properly filter", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(filterEnum);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("Filters on radioset works correctly", () => {
		let radioSetWrapper = wrapper.find("div[data-id='properties-radioset_filtered']");
		expect(radioSetWrapper.find("div.radioButtonWrapper")).to.have.length(4);
		controller.updatePropertyValue({ name: "filter_radios" }, true);
		wrapper.update();
		radioSetWrapper = wrapper.find("div[data-id='properties-radioset_filtered']");
		expect(radioSetWrapper.find("div.radioButtonWrapper")).to.have.length(3);
	});
});
