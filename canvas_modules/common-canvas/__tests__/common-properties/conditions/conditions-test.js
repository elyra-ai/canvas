/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../../_utils_/property-utils";
import { expect } from "chai";
import numberfieldParamDef from "../../test_resources/paramDefs/numberfield_paramDef.json";

describe("condition messages should add alerts tab", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldParamDef);
		wrapper = renderedObject.wrapper;
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("control should have error message from null input and generator should trigger validation", () => {
		let integerInput = wrapper.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "", validity: { badInput: false } } });

		const randomInput = wrapper.find("div[data-id='properties-number_random'] input");
		expect(randomInput).to.have.length(1);
		randomInput.simulate("change", { target: { value: "", validity: { badInput: false } } });
		// get alerts tabs
		let alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		let alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (2)");
		alertButton.simulate("click");

		// ensure that alert tab is open
		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		const alertDiv = alertCategory.find("div.properties-category-content.show"); // ALERTS div
		expect(alertDiv).to.have.length(1);
		let alertList = alertDiv.find("a.properties-link-text");
		expect(alertList).to.have.length(2);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		expect(alertList.at(1).text()).to.equal("Required parameter 'Random' has no value");

		// go to VALUES tab by clicking on error message
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");
		let valuesCategory = wrapper.find("div.properties-category-container").at(1); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES (2)");

		// regenerate random number should decrease alert list
		let valuesDiv = valuesCategory.find("div.properties-category-content.show"); // VALUES div
		expect(valuesDiv).to.have.length(1);
		const generator = valuesDiv.find("button.properties-number-generator");
		expect(generator).to.have.length(1);
		generator.simulate("click");

		alertCategory = wrapper.find("div.properties-category-container").at(0); // alert category
		alertButton = alertCategory.find("button.properties-category-title");
		expect(alertButton.text()).to.equal("ALERTS (1)");
		alertButton.simulate("click");

		alertList = alertCategory.find("a.properties-link-text");
		expect(alertList).to.have.length(1);
		expect(alertList.at(0).text()).to.equal("Required parameter 'Integer' has no value");
		alertList.at(0).find("a.properties-link-text")
			.simulate("click");

		// enter new integer value to remove all Alerts
		valuesCategory = wrapper.find("div.properties-category-container").at(1); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES (1)");

		valuesDiv = valuesCategory.find("div.properties-category-content.show"); // VALUES category
		expect(valuesDiv).to.have.length(1);
		integerInput = valuesDiv.find("div[data-id='properties-number_int'] input");
		expect(integerInput).to.have.length(1);
		integerInput.simulate("change", { target: { value: "1" } });

		valuesCategory = wrapper.find("div.properties-category-container").at(0); // VALUES category
		expect(valuesCategory.find("button.properties-category-title").text()).to.equal("VALUES");
	});
});
