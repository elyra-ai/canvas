/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import propertyUtils from "../../_utils_/property-utils";

import checkboxsetParamDef from "../../test_resources/json/checkboxset_paramDef.json";

describe("checkboxset control renders correctly", () => {

	const renderedObject = propertyUtils.flyoutEditorForm(checkboxsetParamDef);
	const wrapper = renderedObject.wrapper;
	const controller = renderedObject.controller;

	it("checkboxset control should render when the controlValue is null", () => {

		const valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the values category
		const checkboxSet = valuesCategory.find("#editor-control-checkboxSetNull");
		expect(checkboxSet).to.have.length(1);
		expect(checkboxSet.find("input[type='checkbox']")).to.have.length(3);
		propertyUtils.selectCheckbox(valuesCategory, 0, "integer"); // integer checkbox
		propertyUtils.selectCheckbox(valuesCategory, 1, "string"); // string checkbox
		propertyUtils.selectCheckbox(valuesCategory, 2, "boolean"); // boolean checkbox
		const checkboxsetPropertyValue = controller.getPropertyValue({ name: "checkboxSetNull" });
		expect(checkboxsetPropertyValue).to.eql(["integer", "string", "boolean"]);

	});

	it("checkboxset control should render when the controlValue is undefined", () => {
		const valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the values category
		const checkboxSet = valuesCategory.find("#editor-control-checkboxSetUndefined");
		expect(checkboxSet).to.have.length(1);
		expect(checkboxSet.find("input[type='checkbox']")).to.have.length(2);
		propertyUtils.selectCheckbox(valuesCategory, 3, "na"); // na checkbox
		propertyUtils.selectCheckbox(valuesCategory, 4, "drug"); // drug checkbox
		const checkboxsetPropertyValue = controller.getPropertyValue({ name: "checkboxSetUndefined" });
		expect(checkboxsetPropertyValue).to.eql(["na", "drug"]);

	});
});
