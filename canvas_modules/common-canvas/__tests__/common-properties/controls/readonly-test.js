/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ReadonlyControl from "../../../src/common-properties/controls/readonly";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "./../../_utils_/property-utils";
import { ReactWrapper } from "enzyme";
import { mount } from "enzyme";
import { expect } from "chai";
import isEqual from "lodash/isEqual";

import fieldPickerParamDef from "./../../test_resources/paramDefs/fieldpicker_paramDef.json";

const controller = new Controller();
controller.setPropertyValues(
	{ "test-readonly": "Test value" }
);

const control = {
	name: "test-readonly",
};

const propertyId = { name: "test-readonly" };

describe("textfield-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `ReadonlyControl`", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const text = wrapper.find("text");
		expect(text).to.have.length(1);
	});


	it("should set correct control type in `ReadonlyControl`", () => {
		const wrapper = mount(
			<ReadonlyControl
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const text = wrapper.find("text");
		expect(text.text()).to.equal("Test value");
	});

});

describe("condition messages renders correctly for readonly control", () => {
	let wrapper;

	afterEach(() => {
		wrapper.unmount();
	});

	it("readonly control should result in warning within a table", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(fieldPickerParamDef);
		wrapper = renderedObject.wrapper;
		const renderedController = renderedObject.controller;

		const tablesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // TABLES category
		tablesCategory.find(".control-summary-link-buttons").at(0)
			.find(".button")
			.simulate("click");
		const wfhtml = document.getElementsByClassName("rightside-modal-container")[0]; // needed since modal dialogs are outside `wrapper`
		const wideflyoutWrapper = new ReactWrapper(wfhtml, true);
		const table = wideflyoutWrapper.find("#flexible-table-structuretableMultiInputSchema");

		const readOnlyControls = table.find(".readonly-control.editor_control_area");
		expect(readOnlyControls).to.have.length(6);

		let dataRows = table.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(3);
		dataRows.first().simulate("click");
		wrapper.update();

		const enabledRemoveColumnButton = table.find(".remove-fields-button");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		wrapper.update();
		dataRows = table.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);

		const structuretableMultiInputSchemaWarningMessages = {
			"structuretableMultiInputSchema": {
				"0": {
					"1": {
						"type": "warning",
						"text": "Invalid Input name, field not found in schema",
						"validation_id": "validField_structuretableMultiInputSchema[1]_893.8202755554307"
					}
				},
				"1": {
					"1": {
						"type": "warning",
						"text": "Invalid Input name, field not found in schema",
						"validation_id": "validField_structuretableMultiInputSchema[1]_893.8202755554307"
					}
				}
			}
		};

		const actual = renderedController.getErrorMessages();
		expect(isEqual(JSON.parse(JSON.stringify(structuretableMultiInputSchemaWarningMessages)),
			JSON.parse(JSON.stringify(actual)))).to.be.true;
	});

});
