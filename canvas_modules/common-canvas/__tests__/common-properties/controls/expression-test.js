/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { Provider } from "react-redux";
import deepFreeze from "deep-freeze";

import Expression from "../../../src/common-properties/controls/expression";
import ExpressionBuilder from "../../../src/common-properties/controls/expression/expression-builder/expression-builder";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtils from "../../_utils_/property-utils";
import tableUtils from "./../../_utils_/table-utils";

import { mountWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";

import ExpressionInfo from "../../test_resources/json/expression-function-list.json";
import ExpressionParamdef from "../../test_resources/paramDefs/expressionControl_paramDef.json";

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
	var expressionInfo = getCopy(ExpressionInfo.input);
	controller.setExpressionInfo(expressionInfo);
}

const propertiesConfig = { containerType: "Custom", rightFLyout: true };
const propertiesInfo = {
	appData: {},
	additionalComponents: {},
};
describe("expression-control renders correctly", () => {
	it("props should have been defined", () => {
		const wrapper = mountWithIntl(
			<Expression
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

	it("should render a `Expression`", () => {
		const wrapper = mountWithIntl(
			<Expression
				store={controller.getStore()}
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
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const expBuilder = wrapper.find(ExpressionBuilder);
		expect(expBuilder.prop("control")).to.equal(control);
		expect(expBuilder.prop("controller")).to.equal(controller);
		expect(expBuilder.prop("propertyId")).to.equal(propertyId);
	});

	it("should render a `ExpressionBuilder`", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
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
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const opButtons = wrapper.find("div.properties-operator-container").find("button");
		opButtons.at(0).simulate("click");
		expect(controller.getPropertyValue(propertyId)).to.equal(" =");
	});

	it("expression builder select a field", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const fieldTable = wrapper.find("div.properties-field-table-container");
		tableUtils.dblClickTableRows(fieldTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" 'Age'");
	});

	it("expression builder select a field value", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const valueTable = wrapper.find("div.properties-value-table-container");
		tableUtils.dblClickTableRows(valueTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" 21");
	});

	it("expression builder select a field value of type string", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		// select a field with string values
		const fieldTable = wrapper.find("div.properties-field-table-container");
		tableUtils.clickTableRows(fieldTable, [1]);
		// select a string value from value table.
		const valueTable = wrapper.find("div.properties-value-table-container");
		tableUtils.dblClickTableRows(valueTable, [1]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" \"female\"");
	});

	it("expression builder select a function", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const functionTable = wrapper.find("div.properties-functions-table-container");
		tableUtils.dblClickTableRows(functionTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" to_integer(?)");
	});

	it("expression builder select a field from filtered table correctly", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		// Verify first row is selected by default
		let fieldTable = wrapper.find("div.properties-field-table-container");
		let rows = tableUtils.getTableRows(fieldTable);
		let firstRowClassName = rows.at(0).prop("className");
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);

		// Filter by 'l' should return 1 row that is not selected
		const searchInput = fieldTable.find("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);
		searchInput.simulate("change", { target: { value: "l" } });
		fieldTable = wrapper.find("div.properties-field-table-container");
		rows = tableUtils.getTableRows(fieldTable);
		firstRowClassName = rows.at(0).prop("className");
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.lessThan(0);

		// Clicking on the filtered row will select it
		tableUtils.clickTableRows(fieldTable, [0]);
		fieldTable = wrapper.find("div.properties-field-table-container");
		rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		firstRowClassName = rows.at(0).prop("className");
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);

		// Clearing the filter should show the correct selected row as selected
		searchInput.simulate("change", { target: { value: "" } });
		fieldTable = wrapper.find("div.properties-field-table-container");
		rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		firstRowClassName = rows.at(0).prop("className");
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.lessThan(0);
		const fourthRowClassName = rows.at(3).prop("className");
		expect(fourthRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);
	});
});

describe("expression handles no expression builder resources correctly", () => {

	it("expression with no function list json provided does not render an expression builder", () => {
		controller = new Controller();
		controller.saveControls([control]);
		controller.updatePropertyValue(propertyId, "");
		controller.setDatasetMetadata(getCopy(dataModel));

		const wrapper = mountWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const input = wrapper.find("div.properties-expression-button");
		expect(input).to.have.length(0);
	});

	it("expression builder with a function list json provided renders an expression builder", () => {
		reset();
		const wrapper = mountWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const input = wrapper.find("button.properties-expression-button");
		expect(input).to.have.length(1);
	});

	it("expression builder with a function list json provided with builder=false doesn't render an expression builder", () => {
		reset();
		const wrapper = mountWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				builder={false}
				rightFlyout
			/>
		);
		const input = wrapper.find("button.properties-expression-button");
		expect(input).to.have.length(0);
	});

	it("CommonProperties renders with no expressionInfo values ", () => {
		propertiesInfo.expressionInfo = { functions: {}, resources: {} };
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find("CommonProperties")).to.have.length(1);
	});

	it("CommonProperties renders with no expressionInfo resources ", () => {
		propertiesInfo.expressionInfo = { functions: {} };
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find("CommonProperties")).to.have.length(1);
	});

	it("CommonProperties renders with no expressionInfo functions ", () => {
		propertiesInfo.expressionInfo = {};
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find("CommonProperties")).to.have.length(1);
	});

	it("CommonProperties renders with no validateLink set ", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find(".validateLink")).to.have.length(0);
	});

	it("CommonProperties renders with validateLink set false", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		propertiesInfo.expressionInfo.validateLink = false;
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find(".validateLink")).to.have.length(0);
	});

	it("CommonProperties renders with validateLink set true", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		propertiesInfo.expressionInfo.validateLink = true;
		const renderedObject = propertyUtils.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		expect(renderedObject.wrapper.find("button.validateLink")).to.have.length(8); // there are 8 expressions in this paramdef
	});


});

describe("expression builder generates and accesses field dropdown correctly", () => {
	it("expression builder selects dropdown correctly", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Fields");
		const dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		var dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		// check that all dropdown options are loaded
		expect(dropDownList).to.have.length(5);
		// selecting the dropdown list has the correct entries
		expect(dropDownList.at(0).text()).to.be.equal("Fields");
		expect(dropDownList.at(1).text()).to.be.equal("Recently Used");
		expect(dropDownList.at(2).text()).to.be.equal("Globals");
		expect(dropDownList.at(3).text()).to.be.equal("Multi Response Set");
		expect(dropDownList.at(4).text()).to.be.equal("Parameters");
		// select an option
		dropDownList.at(2).simulate("click");
		// properly close the dropdown once selected
		expect(wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item")).to.have.length(0);
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Globals");
	});

	it("expression builder adds dropdown menu fields and values correctly", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		var dropDown = wrapper.find("div.properties-expression-field-select button");
		dropDown.simulate("click");
		var dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		// test globals
		dropDownList.at(2).simulate("click");
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Globals");
		const fieldTable = wrapper.find("div.properties-field-table-container");
		const valueTable = wrapper.find("div.properties-value-table-container");
		tableUtils.dblClickTableRows(fieldTable, [0]);
		// expect selecting a field enters the correct value
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE')");
		tableUtils.clickTableRows(fieldTable, [1]);
		tableUtils.dblClickTableRows(valueTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863");
		// test mrs
		dropDown = wrapper.find("div.properties-expression-field-select button");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(3).simulate("click");
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Multi Response Set");
		tableUtils.dblClickTableRows(fieldTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863 'numberSet'");
		tableUtils.clickTableRows(fieldTable, [1]);
		tableUtils.dblClickTableRows(valueTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863 'numberSet' 1");
	});
});

describe("ExpressionBuilder filters and sorts correctly", () => {
	it("expression builder filters fields table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		let fieldTable = wrapper.find("div.properties-field-table-container");
		let rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		expect(rows.at(1).text()).to.equal("Sexstring");
		const searchInput = fieldTable.find("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);

		searchInput.simulate("change", { target: { value: "Age" } });
		wrapper.update();
		fieldTable = wrapper.find("div.properties-field-table-container");
		rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		expect(rows.at(0).text()).to.equal("Ageinteger");
	});
	it("expression builder filters values table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		let fieldTable = wrapper.find("div.properties-value-table-container");
		let rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(2);
		expect(rows.at(0).text()).to.equal("Min: 21");
		const searchInput = fieldTable.find("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);

		searchInput.simulate("change", { target: { value: "Max" } });
		fieldTable = wrapper.find("div.properties-value-table-container");
		rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		expect(rows.at(0).text()).to.equal("Max: 55");
	});
	it("expression builder filters function table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		let functionTable = wrapper.find("div.properties-functions-table");
		let rows = tableUtils.getTableRows(functionTable);
		expect(rows).to.have.length(4);
		let searchInput = functionTable.find("div.properties-ft-search-container input");

		expect(searchInput).to.have.length(1);
		searchInput.simulate("change", { target: { value: "if" } });
		functionTable = wrapper.find("div.properties-functions-table");
		rows = tableUtils.getTableRows(functionTable);
		expect(rows).to.have.length(2);
		expect(rows.at(0).text()).to.equal("if  COND1  then  EXPR1  else  EXPR2  endifAny");
		searchInput = functionTable.find("div.properties-ft-search-container input");

		searchInput.simulate("change", { target: { value: "to_int" } });
		functionTable = wrapper.find("div.properties-functions-table");
		rows = tableUtils.getTableRows(functionTable);
		expect(rows).to.have.length(1);
		expect(rows.at(0).text()).to.equal("to_integer(Item)Integer");
	});
	it("expression builder sorts fields table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const fieldTable = wrapper.find("div.properties-field-table-container");
		const rows = tableUtils.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		expect(rows.at(1).text()).to.equal("Sexstring");

		const sortHeaders = fieldTable.find(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortHeaders).to.have.length(2);

		tableUtils.clickHeaderColumnSort(fieldTable, 0);
		expect(rows.at(1).text()).to.equal("BPstring");

		tableUtils.clickHeaderColumnSort(fieldTable, 0);
		expect(rows.at(1).text()).to.equal("Cholesterolstring");
	});
	it("expression builder sorts value table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const valueTable = wrapper.find("div.properties-value-table-container");
		const rows = tableUtils.getTableRows(valueTable);
		const sortHeaders = valueTable.find(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(rows).to.have.length(2);
		expect(rows.at(0).text()).to.equal("Min: 21");
		expect(sortHeaders).to.have.length(1);

		tableUtils.clickHeaderColumnSort(valueTable, 0);
		expect(rows.at(0).text()).to.equal("Max: 55");

		tableUtils.clickHeaderColumnSort(valueTable, 0);
		expect(rows.at(0).text()).to.equal("Min: 21");
	});
	it("expression builder sorts function table", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const functionTable = wrapper.find("div.properties-functions-table");
		const rows = tableUtils.getTableRows(functionTable);
		const sortHeaders = functionTable.find(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(rows).to.have.length(4);
		expect(rows.at(0).text()).to.equal("to_integer(Item)Integer");
		expect(sortHeaders).to.have.length(2);

		tableUtils.clickHeaderColumnSort(functionTable, 0);
		expect(rows.at(0).text()).to.equal("count_equal(Item, List)Integer");

		tableUtils.clickHeaderColumnSort(functionTable, 1);
		expect(rows.at(0).text()).to.equal("if  COND1  then  EXPR1  else  EXPR2  endifAny");
	});
});
describe("expression builder correctly runs Recently Used dropdown options", () => {
	it("expression builder correctly adds and reorders fields to Recently Used", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Fields");
		let fieldRows = fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));

		expect(fieldRows).to.have.length(4);
		// navigate to Recently Used fields and check that it is empty
		var dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		var dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		expect(wrapper.find("div.properties-expression-field-select span").text()).to.equal("Recently Used");
		expect(wrapper.find("div.properties-field-table-container .properties-vt-column").text()).to.equal("Item");
		fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(0);
		// back to Fields
		dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(0).simulate("click");
		fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));
		// add two rows to Recently Used
		fieldRows.at(0).simulate("dblclick");
		fieldRows.at(1).simulate("dblclick");
		// back to Recently used
		dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		// check that the fields were correctly added
		fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(2);
		expect(fieldRows.at(0).text()).to.equal("Sex");
		expect(fieldRows.at(1).text()).to.equal("Age");
		// check that recently used field has the correct values stored with it
		let valueRows = tableUtils.getTableRows(wrapper.find("div.properties-value-table-container"));
		expect(valueRows).to.have.length(3);
		expect(valueRows.at(2).text()).to.equal("not specified");
		// check that reusing a field will move it to the top of Recently Used
		dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(0).simulate("click");
		fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));
		// add Age again, moving it to the top of Recently Used
		fieldRows.at(0).simulate("dblclick");
		// back to Recently Used
		dropDown = wrapper.find("div.properties-expression-field-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		// order of rows should be reversed
		fieldRows = tableUtils.getTableRows(wrapper.find("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(2);
		expect(fieldRows.at(0).text()).to.equal("Age");
		expect(fieldRows.at(1).text()).to.equal("Sex");
		valueRows = tableUtils.getTableRows(wrapper.find("div.properties-value-table-container"));
		expect(valueRows).to.have.length(2);
		expect(valueRows.at(0).text()).to.equal("Min: 21");
	});
	it("expression builder correctly adds and reorders functions to Recently Used", () => {
		reset();
		const wrapper = mountWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		expect(wrapper.find("div.properties-expression-function-select span").text()).to.equal("General Functions");
		let funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(4);
		// navigate to Recently Used fields and check that it is empty
		var dropDown = wrapper.find("div.properties-expression-function-select .bx--list-box__field");
		dropDown.simulate("click");
		var dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		expect(wrapper.find("div.properties-expression-function-select span").text()).to.equal("Recently Used");
		expect(wrapper.find("div.properties-functions-table-container .properties-vt-column").at(0)
			.text()).to.equal("Function");
		funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(0);
		// back to General Functions
		dropDown = wrapper.find("div.properties-expression-function-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(0).simulate("click");
		funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		// add two rows to Recently Used
		funcRows.at(0).simulate("dblclick");
		funcRows.at(1).simulate("dblclick");
		// back to Recently used
		dropDown = wrapper.find("div.properties-expression-function-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		// check that the functions were correctly added
		funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(2);
		expect(funcRows.at(0).text()).to.equal("count_equal(Item, List)Integer");
		expect(funcRows.at(1).text()).to.equal("to_integer(Item)Integer");
		// check that reusing a function will move it to the top of Recently Used
		dropDown = wrapper.find("div.properties-expression-function-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(0).simulate("click");
		funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		// add to_integer again, moving it to the top of Recently Used
		funcRows.at(0).simulate("dblclick");
		// back to Recently Used
		dropDown = wrapper.find("div.properties-expression-function-select .bx--list-box__field");
		dropDown.simulate("click");
		dropDownList = wrapper.find("div.bx--list-box__menu .bx--list-box__menu-item");
		dropDownList.at(1).simulate("click");
		// order of rows should be reversed
		funcRows = tableUtils.getTableRows(wrapper.find("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(2);
		expect(funcRows.at(0).text()).to.equal("to_integer(Item)Integer");
		expect(funcRows.at(1).text()).to.equal("count_equal(Item, List)Integer");
	});
});
