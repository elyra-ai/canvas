/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import { validateInput } from "./../../../src/common-properties/ui-conditions/conditions-utils.js";
import propertyUtils from "./../../_utils_/property-utils";
import readOnlyParamDef from "./../../test_resources/paramDefs/readonly_paramDef.json";


describe("validateInput validates input and updates controller correctly", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(readOnlyParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
		controller.setErrorMessages({});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validateInput will update controller error messages when multiple error messages are present in a validation set", () => {
		const summaryPanelTable = propertyUtils.openSummaryPanel(wrapper, "readonly-table-summary");
		let messages = controller.getErrorMessages();
		expect(JSON.stringify(messages)).to.equal(JSON.stringify({}));
		const propId = { name: "readonly_table_cond", row: 0, col: 0 };
		const control = controller.getControl(propId);
		const rowOneCheckbox = summaryPanelTable.find("input[type='checkbox']").at(1);
		rowOneCheckbox.getDOMNode().checked = false;
		rowOneCheckbox.simulate("change");
		validateInput(propId, controller, control);
		let expected =
			{
				"0": {
					"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond" },
					"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond" }
				}
			};
		messages = controller.getErrorMessages();
		expect(messages.readonly_table_cond).to.eql(expected);
		const rowTwoCheckbox = summaryPanelTable.find("input[type='checkbox']").at(2);
		rowTwoCheckbox.getDOMNode().checked = true;
		rowTwoCheckbox.simulate("change");
		rowTwoCheckbox.getDOMNode().checked = false;
		rowTwoCheckbox.simulate("change");
		validateInput(propId, controller, control);
		expected =
				{
					"0": {
						"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond" },
						"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond" } },
					"1": {
						"1": { type: "error", text: "Readonly in a table error testing", validation_id: "readonly_table_cond" },
						"2": { type: "warning", text: "Readonly in a table warning testing", validation_id: "readonly_table_cond" } } };
		messages = controller.getErrorMessages();
		expect(messages.readonly_table_cond).to.eql(expected);
	});
});
