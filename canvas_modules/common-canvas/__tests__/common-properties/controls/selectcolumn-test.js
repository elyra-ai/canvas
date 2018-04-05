/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import SelectColumn from "../../../src/common-properties/controls/dropdown";
import { mount } from "enzyme";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";

import propertyUtils from "../../_utils_/property-utils";
import selectcolumnParamDef from "../../test_resources/paramDefs/selectcolumn_paramDef.json";
import selectcolumnMultiInputParamDef from "../../test_resources/paramDefs/selectcolumn_multiInput_paramDef.json";

const controller = new Controller();

const control = {
	"name": "targetField",
	"label": {
		"text": "Target column"
	},
	"description": {
		"text": "Select a target column"
	},
	"controlType": "selectcolumn",
	"valueDef": {
		"propType": "string",
		"isList": false,
		"isMap": false,
		"defaultValue": ""
	},
	"required": true
};

const fields = [
	{
		"name": "age",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "BP",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "Na",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	}
];
propertyUtils.setControls(controller, [control]);
const propertyId = { name: "targetField" };

const emptyfields = [
	{
		"fields": []
	}
];
function setPropertyValue() {
	controller.setPropertyValues(
		{ "targetField": "age" }
	);
}

describe("selectcolumn control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<SelectColumn
				control={control}
				fields={fields}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("fields")).to.equal(fields);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
		expect(wrapper.prop("controller")).to.equal(controller);
	});

	it("should render correctly with emptyfields and null value selectcolumn", () => {
		controller.setPropertyValues(
			{ "targetField": null }
		);
		const wrapper = mount(
			<SelectColumn
				control={control}
				fields={emptyfields}
				propertyId={propertyId}
				controller = {controller}
			/>
		);
		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1); // TODO not sure what this is validating
	});

	it("should render a empty selectcolumn and update the dropdown value", () => {
		setPropertyValue();
		const wrapper = mount(
			<SelectColumn
				control={control}
				fields={emptyfields}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1);
		const evt = { value: "Na", label: "Na" };
		input.root.node.handleChange(evt); // TODO should use click events if possible
		expect(controller.getPropertyValue(propertyId)).to.equal("Na");
	});
	it("should allow empty string to be set as valid field in selectcolumn control", () => {
		setPropertyValue();
		const wrapper = mount(
			<SelectColumn
				control={control}
				fields={emptyfields}
				propertyId={propertyId}
				controller = {controller}
			/>
		);

		const input = wrapper.find(".Dropdown-control");
		expect(input).to.have.length(1);
		const evt = { value: "...", label: "..." }; // defect with Dropdown npm module.  Value is set to label when ""
		input.root.node.handleChange(evt); // TODO should use click events if possible
		expect(controller.getPropertyValue(propertyId)).to.equal("");
	});

	it("selectcolumn control will have updated options by the controller", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnParamDef);
		const wrapper = renderedObject.wrapper;
		const selectColumnController = renderedObject.controller;

		const valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // get the values category
		const dropDowns = valuesCategory.find("Dropdown");

		expect(dropDowns.at(0).find(".Dropdown-placeholder")
			.text()).to.equal("age");
		let field1Options = dropDowns.at(0).prop("options");	// Field1 Panel
		const field1OptionsExpectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" },
			{ label: "age2", value: "age2" },
			{ label: "BP2", value: "BP2" },
			{ label: "Na2", value: "Na2" },
			{ label: "drug2", value: "drug2" },
			{ label: "age3", value: "age3" },
			{ label: "BP3", value: "BP3" },
			{ label: "Na3", value: "Na3" },
			{ label: "drug3", value: "drug3" },
			{ label: "age4", value: "age4" },
			{ label: "BP4", value: "BP4" },
			{ label: "Na4", value: "Na4" },
			{ label: "drug4", value: "drug4" }
		];

		expect(field1Options).to.eql(field1OptionsExpectedOptions);

		expect(dropDowns.at(1).find(".Dropdown-placeholder")
			.text()).to.equal("BP");
		let field2Options = dropDowns.at(1).prop("options");	// Field2 Panel
		const field2OptionsExpectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "Na", value: "Na" },
			{ label: "drug", value: "drug" },
			{ label: "age2", value: "age2" },
			{ label: "BP2", value: "BP2" },
			{ label: "Na2", value: "Na2" },
			{ label: "drug2", value: "drug2" },
			{ label: "age3", value: "age3" },
			{ label: "BP3", value: "BP3" },
			{ label: "Na3", value: "Na3" },
			{ label: "drug3", value: "drug3" },
			{ label: "age4", value: "age4" },
			{ label: "BP4", value: "BP4" },
			{ label: "Na4", value: "Na4" },
			{ label: "drug4", value: "drug4" }
		];

		expect(field2Options).to.eql(field2OptionsExpectedOptions);

		const datasetMetadata = selectColumnController.getDatasetMetadata();

		const newField1 = {
			"name": "stringAndDiscrete2",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input"
			}
		};

		const newField2 = {
			"name": "stringAndSet2",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "set",
				"modeling_role": "input"
			}
		};

		datasetMetadata[0].fields.push(newField1);
		datasetMetadata[0].fields.push(newField2);
		selectColumnController.setDatasetMetadata(datasetMetadata);
		field1Options = dropDowns.at(0).prop("options");
		field2Options = dropDowns.at(1).prop("options");

		const dropDownValue1 = {
			"label": "stringAndDiscrete2",
			"value": "stringAndDiscrete2"
		};

		const dropDownValue2 = {
			"label": "stringAndSet2",
			"value": "stringAndSet2"
		};

		field1OptionsExpectedOptions.push(dropDownValue1);
		field1OptionsExpectedOptions.push(dropDownValue2);
		field2OptionsExpectedOptions.push(dropDownValue1);
		field2OptionsExpectedOptions.push(dropDownValue2);

		expect(field1Options).to.eql(field1OptionsExpectedOptions);
		expect(field2Options).to.eql(field2OptionsExpectedOptions);

	});

});

describe("selectcolumn control filters values correctly", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnParamDef);
	const wrapper = renderedObject.wrapper;

	it("should filter values from selectcolumn control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(2); // get the filter category
		const dropDowns = filterCategory.find("Dropdown");
		let options = dropDowns.at(0).prop("options"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "age4", value: "age4" }
		];
		expect(options).to.eql(expectedOptions);
		options = dropDowns.at(1).prop("options"); // by Types
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "age", value: "age" },
			{ label: "Na", value: "Na" },
			{ label: "age2", value: "age2" },
			{ label: "Na2", value: "Na2" },
			{ label: "age3", value: "age3" },
			{ label: "Na3", value: "Na3" },
			{ label: "age4", value: "age4" },
			{ label: "Na4", value: "Na4" }
		];
		expect(options).to.eql(expectedOptions);
		options = dropDowns.at(2).prop("options"); // by Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "BP2", value: "BP2" },
			{ label: "BP3", value: "BP3" },
			{ label: "BP4", value: "BP4" }
		];
		expect(options).to.eql(expectedOptions);
		options = dropDowns.at(3).prop("options"); // by Measurements
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "BP", value: "BP" },
			{ label: "drug", value: "drug" },
			{ label: "BP2", value: "BP2" },
			{ label: "drug2", value: "drug2" },
			{ label: "BP3", value: "BP3" },
			{ label: "drug3", value: "drug3" },
			{ label: "BP4", value: "BP4" },
			{ label: "drug4", value: "drug4" }
		];
		expect(options).to.eql(expectedOptions);
		options = dropDowns.at(4).prop("options"); // by Type and Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "drug", value: "drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "drug4", value: "drug4" }
		];
		expect(options).to.eql(expectedOptions);
		options = dropDowns.at(5).prop("options"); // by Type or Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "drug", value: "drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "drug4", value: "drug4" },
			{ label: "age", value: "age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "age4", value: "age4" }
		];
		expect(options).to.eql(expectedOptions);
	});
});

describe("selectcolumn control filters values correctly with multi input", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnMultiInputParamDef);
	const wrapper = renderedObject.wrapper;

	it("should show correct values from selectcolumn control", () => {
		const valuesCategory = wrapper.find(".category-title-container-right-flyout-panel").at(0); // VALUES category
		const selectColumnControls = valuesCategory.find("Dropdown");
		expect(selectColumnControls).to.have.length(3);

		const select3 = selectColumnControls.at(2);
		expect(select3.find(".Dropdown-placeholder").text()).to.equal("0.age");

		const expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.age", value: "0.age" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "0.Na", value: "0.Na" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "age2", value: "age2" },
			{ label: "BP2", value: "BP2" },
			{ label: "Na2", value: "Na2" },
			{ label: "drug2", value: "drug2" },
			{ label: "age3", value: "age3" },
			{ label: "BP3", value: "BP3" },
			{ label: "Na3", value: "Na3" },
			{ label: "drug3", value: "drug3" },
			{ label: "1.age", value: "1.age" },
			{ label: "1.BP", value: "1.BP" },
			{ label: "1.Na", value: "1.Na" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "intAndRange", value: "intAndRange" },
			{ label: "stringAndDiscrete", value: "stringAndDiscrete" },
			{ label: "stringAndSet", value: "stringAndSet" }
		];
		const actualOptions = select3.prop("options");
		expect(actualOptions).to.eql(expectedOptions);

		select3.getNode().setValue("1.Na", "1.Na");
		expect(select3.find(".Dropdown-placeholder").text()).to.equal("1.Na");
	});
});

describe("selectcolumn control filters values correctly with multi schema input", () => {
	const renderedObject = propertyUtils.flyoutEditorForm(selectcolumnMultiInputParamDef);
	const wrapper = renderedObject.wrapper;

	it("should filter values from selectcolumn control", () => {
		const filterCategory = wrapper.find(".category-title-container-right-flyout-panel").at(1); // FILTER category
		const dropDowns = filterCategory.find("Dropdown");
		expect(dropDowns).to.have.length(5);
		let options = dropDowns.at(0).prop("options"); // by Type
		let expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.age", value: "0.age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "1.age", value: "1.age" },
			{ label: "intAndRange", value: "intAndRange" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(1).prop("options"); // by Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.BP", value: "0.BP" },
			{ label: "BP2", value: "BP2" },
			{ label: "BP3", value: "BP3" },
			{ label: "1.BP", value: "1.BP" },
			{ label: "stringAndDiscrete", value: "stringAndDiscrete" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(2).prop("options"); // by Model Role
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "1.drug", value: "1.drug" },
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(3).prop("options"); // by Type and Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "stringAndSet", value: "stringAndSet" }
		];
		expect(options).to.eql(expectedOptions);

		options = dropDowns.at(4).prop("options"); // by Type or Measurement
		expectedOptions = [
			{ label: "...", value: "" },
			{ label: "0.drug", value: "0.drug" },
			{ label: "drug2", value: "drug2" },
			{ label: "drug3", value: "drug3" },
			{ label: "0.age", value: "0.age" },
			{ label: "age2", value: "age2" },
			{ label: "age3", value: "age3" },
			{ label: "1.drug", value: "1.drug" },
			{ label: "stringAndSet", value: "stringAndSet" },
			{ label: "1.age", value: "1.age" },
			{ label: "intAndRange", value: "intAndRange" }
		];
		expect(options).to.have.deep.members(expectedOptions);
	});
});
