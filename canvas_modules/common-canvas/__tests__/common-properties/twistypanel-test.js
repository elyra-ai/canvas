/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import twistypanelParamDef from "../test_resources/paramDefs/twistyPanel_paramDef.json";
import panelConditionsParamDef from "../test_resources/paramDefs/panelConditions_paramDef.json";
import isEqual from "lodash/isEqual";

import { expect } from "chai";

describe("twisty panel renders correctly", () => {
	var wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(twistypanelParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the twisty panel with the initial control hidden", () => {
		const twisties = wrapper.find(".twisty-control-panel");
		expect(twisties).to.have.length(2);
		const twistyPanelIcon = twisties.at(0).find(".twistypanel_icon");
		expect(twistyPanelIcon).to.have.length(1);
		const hiddenTwistyContent = twisties.at(0).find(".twistypanel-panel");
		expect(hiddenTwistyContent).to.have.length(1);
		const twistyStyle = hiddenTwistyContent.at(0).prop("style");
		expect(isEqual(JSON.parse(JSON.stringify(twistyStyle)),
			JSON.parse(JSON.stringify({ height: "0px" })))).to.be.true;


	});

	it("should expand content when twisty panel link clicked", () => {
		// The way twisty panel expands content is to dynamically set the height of the twisty content to the rendered
		// clientHeight of the content wrapper child component.  The clientHeight is zero when enzyme renders it.
		// therefore the content element style height attribute is not changed.
		// TODO figure out why enzyme doesn't set client height.
		const twisties = wrapper.find(".twisty-control-panel");
		expect(twisties).to.have.length(2);
		const twistyPanelIcon = twisties.at(0).find(".twistypanel_icon");
		expect(twistyPanelIcon).to.have.length(1);
		twistyPanelIcon.at(0).simulate("click");
		wrapper.update();
		const hiddenTwistyContent = twisties.at(0).find(".twistypanel-panel");
		expect(hiddenTwistyContent).to.have.length(1);
		const twistyStyle = hiddenTwistyContent.at(0).prop("style");
		// TODO the height should have a value
		expect(isEqual(JSON.parse(JSON.stringify(twistyStyle)),
			JSON.parse(JSON.stringify({ height: "0px" })))).to.be.true;
	});
});

describe("twisty panel visible and enabled conditions work correctly", () => {
	let wrapper;
	let panels;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		const twistyCategory = wrapper.find(".category-title-container-right-flyout-panel").at(4); // TWISTY PANELS category
		panels = twistyCategory.find(".control-panel");
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("twisty panel and controls should be disabled", () => {
		expect(panels).to.have.length(5); // include nested panels
		const firstPanel = panels.at(1);

		const disabledCheckbox = firstPanel.find("input[type='checkbox']");
		expect(disabledCheckbox.props().checked).to.equal(false);
		const twisty = firstPanel.find(".control-twisty.twisty-control-panel");
		expect(twisty).to.have.length(1);

		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		disabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");

		expect(twisty.find(".twistypanel_icon.rotate")).to.have.length(0);

		// can also disable a twisty that is opened
		disabledCheckbox.simulate("change", { target: { checked: false } });
		twisty.find(".twistypanel_text").simulate("click");
		wrapper.update();

		expect(twisty.find(".twistypanel_icon.rotate")).to.have.length(1);
		// expect(twisty.find(".twistypanel-panel").props().style.height).to.equal("154px"); // not working

		const numberfields = firstPanel.find("input[type='number']");
		expect(numberfields).to.have.length(2);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("enabled");

		disabledCheckbox.simulate("change", { target: { checked: true } });
		expect(numberfields).to.have.length(2);
		expect(controller.getPanelState({ name: "twisty-panel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "numberfield2" })).to.equal("disabled");
	});

	it("twisty panel and controls should be hidden", () => {
		const secondPanel = panels.at(3);

		const hiddenCheckbox = secondPanel.find("input[type='checkbox']");
		expect(hiddenCheckbox.props().checked).to.equal(false);

		const twisty = secondPanel.find(".control-twisty.twisty-control-panel");
		expect(twisty).to.have.length(1);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");

		hiddenCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");

		expect(twisty.find(".twistypanel_icon.rotate")).to.have.length(0);

		// can also hide a twisty that is opened
		hiddenCheckbox.simulate("change", { target: { checked: false } });
		twisty.find(".twistypanel_text").simulate("click");
		wrapper.update();

		expect(twisty.find(".twistypanel_icon.rotate")).to.have.length(1);
		// expect(twisty.find(".twistypanel-panel").props().style.height).to.equal("85px"); // not working

		const numberfield = secondPanel.find("input[type='number']");
		expect(numberfield).to.have.length(1);
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("visible");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("visible");

		hiddenCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getPanelState({ name: "twisty-panel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "numberfield3" })).to.equal("hidden");
	});
});
