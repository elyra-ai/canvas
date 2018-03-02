/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import propertyUtils from "../_utils_/property-utils";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";
import panelConditionsParamDef from "../test_resources/paramDefs/panelConditions_paramDef.json";

describe("textPanel render correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
	const wrapper = renderedObject.wrapper;

	it("should have displayed correct number of textPanel elements", () => {
		const staticText = wrapper.find(".properties-text-panel");
		expect(staticText).to.have.length(4);
		const labels = wrapper.find(".panel-label");
		expect(labels).to.have.length(4);
		const descriptions = wrapper.find(".panel-description");
		expect(descriptions).to.have.length(4);
	});
	it("should have displayed correct text in textPanel elements", () => {
		const labels = wrapper.find(".panel-label");
		expect(labels.at(0).text()).to.equal("Oranges");
		let descriptions = wrapper.find(".panel-description");
		expect(descriptions.at(0).text()).to.equal("An orange tree can grow to reach 30 feet and live for over a hundred years.");
		expect(descriptions.at(1).text()).to.equal("Percent: 9.090909 with 6 decimals. Percent: 9.09 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 22 with (number, number). Sum: 24 with (number, 2, number)");
		expect(descriptions.at(3).text()).to.equal("Apples ripen six to 10 times faster at room temperature than if they are refrigerated.");
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: 0.52 } });
		descriptions = wrapper.find(".panel-description");
		expect(descriptions.at(1).text()).to.equal("Percent: 192.307692 with 6 decimals. Percent: 192.31 with 2 decimals");
		expect(descriptions.at(2).text()).to.equal("Sum: 1.04 with (number, number). Sum: 3.04 with (number, 2, number)");
	});
});

describe("text panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let panels;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(JSON.parse(JSON.stringify(panelConditionsParamDef)));
		wrapper = renderedObject.wrapper;
		const textPanelCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TEXT PANEL category
		panels = textPanelCategory.find(".control-panel");
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("text panel should be disabled", () => {
		expect(panels).to.have.length(3);
		const firstPanel = panels.at(1);

		const disabledCheckbox = firstPanel.find("input[type='checkbox']").at(0);
		expect(disabledCheckbox.props().checked).to.equal(false);
		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("enabled");

		disabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getPanelState({ name: "orange-panel" })).to.equal("disabled");

	});

	it("text panel should be hidden", () => {
		const firstPanel = panels.at(2);

		const hiddenCheckbox = firstPanel.find("input[type='checkbox']").at(0);
		expect(hiddenCheckbox.props().checked).to.equal(false);
		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("visible");

		hiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getPanelState({ name: "apple-panel" })).to.equal("hidden");
	});
});
