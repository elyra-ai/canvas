/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import SomeOfSelectControl from "../../../src/common-properties/controls/someofselect";
import { Provider } from "react-redux";
import { mountWithIntl, shallowWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import SomeOfSelectParamDef from "../../test_resources/paramDefs/someofselect_paramDef.json";

const controller = new Controller();

const control = {
	"name": "test-someofselect",
	"label": {
		"text": "Merge method"
	},
	"controlType": "someofselect",
	"valueDef": {
		"propType": "string",
		"isList": true,
		"isMap": false
	},
	"values": [
		"Order",
		"Keys",
		"Condition",
		"Gtt"
	],
	"valueLabels": [
		"Order",
		"Keys",
		"Condition",
		"Ranked condition"
	]
};
propertyUtils.setControls(controller, [control]);
const propertyId = { name: "test-someofselect" };

describe("SomeOfSelectControl renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = shallowWithIntl(
			<SomeOfSelectControl
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a SomeOfSelectControl", () => {
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);
	});
	it("SomeOfSelectControl updates correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": ["Order"] }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		expect(someofselectCheckbox.at(0).getDOMNode().checked).to.equal(true);
		someofselectCheckbox.at(0).getDOMNode().checked = false;
		someofselectCheckbox.at(0).simulate("change");
		expect(controller.getPropertyValue(propertyId)).to.have.length(0);
	});
	it("SomeOfSelectControl handles null correctly", () => {
		controller.setPropertyValues(
			{ "test-someofselect": null }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		someofselectCheckbox.at(1).getDOMNode().checked = true;
		someofselectCheckbox.at(1).simulate("change");
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Keys");
	});
	it("SomeOfSelectControl handles undefined correctly", () => {
		controller.setPropertyValues(
			{ }
		);
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.getDOMNode().checked).to.equal(false);
		});
		someofselectCheckbox.at(2).getDOMNode().checked = true;
		someofselectCheckbox.at(2).simulate("change");
		const controlValue = controller.getPropertyValue(propertyId);
		expect(controlValue).to.have.length(1);
		expect(controlValue[0]).to.equal("Condition");
	});
	it("SomeOfSelectControl renders when disabled", () => {
		controller.updateControlState(propertyId, "disabled");
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(4);

		someofselectCheckbox.forEach(function(checkbox) {
			expect(checkbox.prop("disabled")).to.equal(true);
		});
	});
	it("SomeOfSelectControlrenders when hidden", () => {
		controller.updateControlState(propertyId, "hidden");
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		expect(someofselectWrapper.hasClass("hide")).to.equal(true);
	});
	it("checkbox renders messages correctly", () => {
		controller.updateErrorMessage(propertyId, {
			validation_id: propertyId.name,
			type: "warning",
			text: "bad someofselect value"
		});
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<SomeOfSelectControl
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const someofselectWrapper = wrapper.find("div[data-id='properties-test-someofselect']");
		const messageWrapper = someofselectWrapper.find("div.properties-validation-message");
		expect(messageWrapper).to.have.length(1);
	});
});

describe("someofselect works correctly in common-properties", () => {
	let wrapper;
	beforeEach(() => {
		const form = propertyUtils.flyoutEditorForm(SomeOfSelectParamDef);
		wrapper = form.wrapper;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate someofselect_disabled should have options filtered by enum_filter", () => {
		// verify the original number of entries
		let someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_disabled']");
		let someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(6);

		// deselect the disable checkbox which will filter the list to a smaller number
		const checkboxWrapper = wrapper.find("div[data-id='properties-disable']");
		const checkbox = checkboxWrapper.find("input");
		expect(checkbox.getDOMNode().checked).to.equal(true);
		checkbox.getDOMNode().checked = false;
		checkbox.simulate("change");

		// the number of entries should be filtered
		someofselectWrapper = wrapper.find("div[data-id='properties-someofselect_disabled']");
		someofselectCheckbox = someofselectWrapper.find("input");
		expect(someofselectCheckbox).to.have.length(3);
	});
});
