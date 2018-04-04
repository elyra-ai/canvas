/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import panelConditionsParamDef from "../test_resources/paramDefs/panelConditions_paramDef.json";

import { expect } from "chai";

describe("nested panels visible and enabled conditions work correctly", () => {
	let wrapper;
	let category;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		category = wrapper.find(".category-title-container-right-flyout-panel").at(5); // PANESL WITHIN PANELS category
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("top level panel should disable all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);

		const textfields = category.find("input[type='text']");
		expect(textfields).to.have.length(3);

		const textLabels = category.find(".properties-text-panel");
		expect(textLabels).to.have.length(3);

		// ensure all are enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;

		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("enabled");

		const disabledCheckbox = checkboxes.at(0);
		expect(disabledCheckbox.props().checked).to.equal(false);

		// disable level1
		disabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("top level panel should hide all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const hiddenCheckbox = checkboxes.at(1);
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level1
		hiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("mid level panel should disable all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const disabledCheckbox = checkboxes.at(2);
		expect(disabledCheckbox.props().checked).to.equal(false);

		// disable level2
		disabledCheckbox.simulate("change", { target: { checked: true } });

		// ensure level 1 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		// level1 text panel should not be set and level2 text panel should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("mid level panel should hide all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const hiddenCheckbox = checkboxes.at(3);
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level2
		hiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		// level1 text panel should not be set and level2 text panel should not be "hidden"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("lower level panel should disable all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const disabledCheckbox = checkboxes.at(4);
		expect(disabledCheckbox.props().checked).to.equal(false);

		// disable level3
		disabledCheckbox.simulate("change", { target: { checked: true } });

		// ensure level1 and lavel2 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		// all text panels should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("lower level panel should hide all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const hiddenCheckbox = checkboxes.at(5);
		expect(hiddenCheckbox.props().checked).to.equal(false);

		// hide level3
		hiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		// all text panels should not be "disabled"
		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("lower, mid, and top level panel should disable all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const lvl1DisabledCheckbox = checkboxes.at(0);
		expect(lvl1DisabledCheckbox.props().checked).to.equal(false);
		const lvl2DisabledCheckbox = checkboxes.at(2);
		expect(lvl2DisabledCheckbox.props().checked).to.equal(false);
		const lvl3DisabledCheckbox = checkboxes.at(4);
		expect(lvl3DisabledCheckbox.props().checked).to.equal(false);

		// disable level3
		lvl3DisabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// disable level2
		lvl2DisabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// disable level1
		lvl1DisabledCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		expect(lvl2DisabledCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		lvl1DisabledCheckbox.simulate("change", { target: { checked: false } });
		lvl2DisabledCheckbox.simulate("change", { target: { checked: false } });

		// ensure low level still disabled after enabling level2
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");
	});

	it("lower, mid, and top level panel should hide all child panels and controls", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const lvl1HiddenCheckbox = checkboxes.at(1);
		expect(lvl1HiddenCheckbox.props().checked).to.equal(false);
		const lvl2HiddenCheckbox = checkboxes.at(3);
		expect(lvl2HiddenCheckbox.props().checked).to.equal(false);
		const lvl3HiddenCheckbox = checkboxes.at(5);
		expect(lvl3HiddenCheckbox.props().checked).to.equal(false);

		// hide level3
		lvl3HiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level2
		lvl2HiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level1
		lvl1HiddenCheckbox.simulate("change", { target: { checked: true } });

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3HiddenCheckbox.props().checked).to.be.true;

		lvl1HiddenCheckbox.simulate("change", { target: { checked: false } });
		lvl2HiddenCheckbox.simulate("change", { target: { checked: false } });

		// ensure lower level still hidden after enabling mid level

		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");
	});

	it("disable hide and disable different levels of panels", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		checkboxes.forEach((checkbox) => {
			expect(checkbox.props().checked).to.equal(false);
		});
		const lvl1DisabledCheckbox = checkboxes.at(0);
		const lvl2HiddenCheckbox = checkboxes.at(3);
		const lvl3DisabledCheckbox = checkboxes.at(4);

		// disable level3
		lvl3DisabledCheckbox.simulate("change", { target: { checked: true } });

		// ensure level1 and lavel2 controls are still enabled
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		// hide level2
		lvl2HiddenCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden"); // should be hidden

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden"); // should be hidden

		// disable level1
		lvl1DisabledCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("disabled");

		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("enabled");
	});

	it("hide disable and hide different levels of panels", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);
		const lvl1HiddenCheckbox = checkboxes.at(1);
		const lvl2DisabledCheckbox = checkboxes.at(2);
		const lvl3HiddenCheckbox = checkboxes.at(5);

		// hide level3
		lvl3HiddenCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// disable level2
		lvl2DisabledCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// hide level1
		lvl1HiddenCheckbox.simulate("change", { target: { checked: true } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level1" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure mid level still disabled even when top level is visible
		lvl1HiddenCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure mid level is enabled after enabling mid level
		lvl2DisabledCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("hidden");

		// ensure all are visible after enabling lower level
		lvl3HiddenCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disablePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disablePanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hidePanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfield1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "textfield3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "Level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "Level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "level1" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "level2buttons" })).to.equal("visible");
		expect(controller.getPanelState({ name: "level3control" })).to.equal("visible");
	});
});
describe("complex nested panels visible and enabled conditions work correctly", () => {
	let wrapper;
	let category;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(panelConditionsParamDef);
		wrapper = renderedObject.wrapper;
		category = wrapper.find(".category-title-container-right-flyout-panel").at(6); // PANElS WITHIN PANELS (2) category
		controller = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Init properties at disable hide and disable different levels of panels", () => {
		const checkboxes = category.find("input[type='checkbox']");
		expect(checkboxes).to.have.length(6);

		const lvl1DisabledCheckbox = checkboxes.at(0);
		const lvl2HiddenCheckbox = checkboxes.at(3);
		const lvl3DisabledCheckbox = checkboxes.at(4);

		// the initial state at load is disable, hide disable.
		// verify that all conditions are at that state.
		expect(lvl1DisabledCheckbox.props().checked).to.equal(true);
		expect(lvl2HiddenCheckbox.props().checked).to.equal(true);
		expect(lvl3DisabledCheckbox.props().checked).to.equal(true);

		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("disabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("hidden");

		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure mid level still hidden even when top level is enabled
		lvl1DisabledCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("disabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("hidden");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("hidden");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("hidden");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("hidden");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("hidden");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("hidden");

		expect(lvl2HiddenCheckbox.props().checked).to.be.true;
		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure mid level is visible after enabling mid level
		lvl2HiddenCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("disabled");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("disabled");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("disabled");

		expect(lvl3DisabledCheckbox.props().checked).to.be.true;

		// ensure all are enabled after enabling lower level
		lvl3DisabledCheckbox.simulate("change", { target: { checked: false } });
		expect(controller.getControlState({ name: "disableInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel1" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel2" })).to.equal("enabled");
		expect(controller.getControlState({ name: "disableInit1PanelLevel3" })).to.equal("enabled");
		expect(controller.getControlState({ name: "hideInit1PanelLevel3" })).to.equal("enabled");

		expect(controller.getControlState({ name: "textfieldInit11" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit12" })).to.equal("visible");
		expect(controller.getControlState({ name: "textfieldInit13" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "init1Level1" })).to.be.null;
		expect(controller.getPanelState({ name: "init1Level2" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1Level3" })).to.equal("visible");

		expect(controller.getPanelState({ name: "init1level1" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level2" })).to.equal("visible");
		expect(controller.getPanelState({ name: "init1level3" })).to.equal("enabled");

		expect(controller.getPanelState({ name: "init1level2buttons" })).to.equal("enabled");
		expect(controller.getPanelState({ name: "init1level3control" })).to.equal("enabled");
	});
});
