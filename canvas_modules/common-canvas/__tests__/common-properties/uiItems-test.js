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
import uiItemParamDef from "../test_resources/paramDefs/uiItems_paramDef.json";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";
import panelParamDefWide from "../test_resources/paramDefs/widePanel_paramDef.json";

describe("editor-form renders correctly with correct uiItems", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(uiItemParamDef);
	const wrapper = renderedObject.wrapper;
	it("should have displayed correct number of staticText elements", () => {
		const staticText = wrapper.find(".static-text");
		expect(staticText).to.have.length(4);
		const staticTextIcons = wrapper.find(".static-text-icon");
		expect(staticTextIcons).to.have.length(1);
		const staticTextWithIcon = wrapper.find(".static-text.info");
		expect(staticTextWithIcon).to.have.length(1);
	});
	it("should have displayed correct text in staticText elements", () => {
		let staticText = wrapper.find(".static-text");
		expect(staticText.at(0).text()).to.equal("Some helpful text before the control");
		const staticTextWithIcon = wrapper.find(".static-text.info");
		expect(staticTextWithIcon.at(0).text()).to.equal("Hint: should have a separator after and icon");
		expect(staticText.at(3).text()).to.equal("Sum: 2 with (numberfield, 2, numberfield). Percent: 0");
		const input = wrapper.find("[type='number']");
		input.simulate("change", { target: { value: "44" } });
		staticText = wrapper.find(".static-text");
		expect(staticText.at(3).text()).to.equal("Sum: 90 with (numberfield, 2, numberfield). Percent: 2.27");
	});
	it("should have displayed correct number of separator elements", () => {
		const separators = wrapper.find(".h-separator");
		expect(separators).to.have.length(2);
	});
});

describe("uiItemParamDef render correctly when the control label is hidden", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(uiItemParamDef);
	const wrapper = renderedObject.wrapper;

	it("should have not displayed control label when labelVisible:false", () => {
		const controllabels = wrapper.find(".control-label");
		expect(controllabels).to.have.length(2);
	});
});

describe("Flyout editor has the correct width", () => {
	it("should display a fly out editor at normal width", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDef);
		const wrapper = renderedObject.wrapper;
		const flyout = wrapper.find("#common-properties-right-flyout-panel");
		expect(flyout).to.have.length(1);
		const flyoutStyle = flyout.prop("style");
		expect(flyoutStyle).to.eql({ width: "318px" });
	});
	it("should display a wide fly out editor at wider width", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelParamDefWide);
		const wrapper = renderedObject.wrapper;
		const flyout = wrapper.find("#common-properties-right-flyout-panel");
		expect(flyout).to.have.length(1);
		const flyoutStyle = flyout.prop("style");
		expect(flyoutStyle).to.eql({ width: "625px" });
	});
});
