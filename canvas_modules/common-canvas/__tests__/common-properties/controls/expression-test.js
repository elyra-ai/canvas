/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import deepFreeze from "deep-freeze";
import Expression from "../../../src/common-properties/controls/expression";
import ExpressionBuilder from "../../../src/common-properties/controls/expression/expression-builder/expression-builder";
import ExpressionInfo from "../../test_resources/json/expression-function-list.json";

import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import Controller from "../../../src/common-properties/properties-controller";


const control = {
	name: "test-expression",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	},
	language: "CLEM"
};

const propertyId = { name: "test-expression" };
const dataModel = [{
	"fields": [
		{
			"name": "Age",
			"type": "integer",
			"metadata": {
				"description": "",
				"measure": "range",
				"modeling_role": "input",
				"range": {
					"min": 21,
					"max": 55
				}
			}
		},
		{
			"name": "Sex",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input",
				"values": [
					"male",
					"female",
					"not specified"
				]
			}
		},
		{
			"name": "BP",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input",
				"values": [
					"very high",
					"high",
					"normal",
					"low",
					"very low"
				]
			}
		},
		{
			"name": "Cholesterol",
			"type": "string",
			"metadata": {
				"description": "",
				"measure": "discrete",
				"modeling_role": "input",
				"values": [
					"hdl good",
					"hdl bad",
					"ldl good",
					"ldl bad"
				]
			}
		}
	]
}];
deepFreeze(dataModel);

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

var controller = new Controller();

function reset() {
	// setting of states needs to be done after property values.
	// conditions are ran on each set and update of property values
	controller = new Controller();
	controller.saveControls([control]);
	controller.updatePropertyValue(propertyId, "");
	controller.setDatasetMetadata(getCopy(dataModel));
	controller.setExpressionInfo(ExpressionInfo);
}
describe("expression-control renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<Expression
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `Expression`", () => {
		const wrapper = mountWithIntl(
			<Expression
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const input = wrapper.find(".react-codemirror2");
		expect(input).to.have.length(1);
	});

});

describe("expression-builder renders correctly", () => {

	it("expression builder props should have been defined", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		expect(wrapper.prop("control")).to.equal(control);
		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `ExpressionBuilder`", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		// ensure all the container components rendered
		expect(wrapper.find("div.properties-expression-editor-wrapper")).to.have.length(1);
		expect(wrapper.find("div.properties-expression-selection-container")).to.have.length(1);
		expect(wrapper.find("div.properties-field-table-container")).to.have.length(1);
		expect(wrapper.find("div.properties-value-table-container")).to.have.length(1);
		expect(wrapper.find("div.properties-functions-table-container")).to.have.length(1);
		expect(wrapper.find("div.properties-help-table-container")).to.have.length(1);
		expect(wrapper.find("div.properties-operator-container")).to.have.length(1);
	});

});
describe("expression-builder select from tables correctly", () => {

	it("expression builder select an operator", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const opButtons = wrapper.find("div.properties-operator-container").find("button");
		opButtons.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(" +");
	});

	it("expression builder select a field", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const fieldRows = wrapper.find("div.properties-field-table-container .reactable-data tr");
		fieldRows.at(0).simulate("dblclick");
		expect(controller.getPropertyValue(propertyId)).to.equal(" Age");
	});

	it("expression builder select a field value", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const fieldRows = wrapper.find("div.properties-value-table-container .reactable-data tr");
		fieldRows.at(0).simulate("dblclick");
		expect(controller.getPropertyValue(propertyId)).to.equal(" 21");
	});

	it("expression builder select a function", () => {
		reset();
		const wrapper = mountWithIntl(
			<ExpressionBuilder
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const fieldRows = wrapper.find("div.properties-functions-table-container .reactable-data tr");
		fieldRows.at(0).simulate("dblclick");
		expect(controller.getPropertyValue(propertyId)).to.equal(" to_integer(?)");
	});

});
