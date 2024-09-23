/*
 * Copyright 2017-2023 Elyra Authors
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
import sinon from "sinon";

import Expression from "../../../src/common-properties/controls/expression";
import ExpressionBuilder from "../../../src/common-properties/controls/expression/expression-builder/expression-builder";
import ExpressionToggle from "../../../src/common-properties/controls/expression/expression-toggle/expression-toggle";
import ExpressionSelectFieldFunctions from "../../../src/common-properties/controls/expression/expression-builder/expression-select-field-function";
import Controller from "../../../src/common-properties/properties-controller";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import { MESSAGE_KEYS } from "../../../src/common-properties/constants/constants";
import * as messages from "./../../../locales/common-properties/locales/en.json";
import * as harnessMessages from "./../,,/../../../../harness/src/intl/locales/en.json";

import { renderWithIntl } from "../../_utils_/intl-utils";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";

import ExpressionInfo from "../../test_resources/json/expression-function-list.json";
import ExpressionParamdef from "../../test_resources/paramDefs/expressionControl_paramDef.json";
import Sinon from "sinon";
import { fireEvent } from "@testing-library/react";

const control = {
	name: "test-expression",
	charLimit: 256,
	additionalText: "Add expression",
	valueDef: {
		isList: false
	},
	language: "CLEM",
	data: {
		tearsheet_ref: "tearsheetX"
	},
	enableMaximize: true
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


const validationHandler = sinon.spy();

const callbacks = {
	validationHandler: validationHandler
};

function getCopy(value) {
	return JSON.parse(JSON.stringify(value));
}

function getAddButtonsList(rows) {
	const res = [];
	for (const row of rows) {
		const button = row.querySelector("button.expression-add-field-button");
		if (button) {
			res.push(button);
		}
	}
	return res;
}

var controller = new Controller();
const buttonHandler = sinon.spy();
function reset() {
	// setting of states needs to be done after property values.
	// conditions are ran on each set and update of property values
	controller = new Controller();
	controller.saveControls([control]);
	controller.updatePropertyValue(propertyId, "");
	controller.setDatasetMetadata(getCopy(dataModel));
	var expressionInfo = getCopy(ExpressionInfo.input);
	controller.setExpressionInfo(expressionInfo);
	controller.setHandlers({
		buttonHandler: buttonHandler
	});
}

const propertiesConfig = { containerType: "Custom", rightFLyout: true };
const propertiesInfo = {
	appData: {},
	additionalComponents: {},
};

const mockExpression = jest.fn();
jest.mock("../../../src/common-properties/controls/expression",
	() => (props) => mockExpression(props)
);

mockExpression.mockImplementation((props) => {
	const ExpressionComp = jest.requireActual(
		"../../../src/common-properties/controls/expression",
	).default;
	return <ExpressionComp {...props} />;
});

const mockExpressionBuilder = jest.fn();
jest.mock("../../../src/common-properties/controls/expression/expression-builder/expression-builder",
	() => (props) => mockExpressionBuilder(props)
);

mockExpressionBuilder.mockImplementation((props) => {
	const ExpressionBuilderComp = jest.requireActual(
		"../../../src/common-properties/controls/expression/expression-builder/expression-builder",
	).default;
	return <ExpressionBuilderComp {...props} />;
});

describe("expression-control renders correctly", () => {
	it("props should have been defined", () => {
		renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);

		expectJest(mockExpression).toHaveBeenCalledWith({
			"store": controller.getStore(),
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("should render a `Expression`", () => {
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
			/>
		);
		const { container } = wrapper;
		const input = container.querySelectorAll(".elyra-CodeMirror");
		expect(input).to.have.length(1);
	});

	it("should render `launch expression builder` icon", () => {
		reset();
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const expressionBuilderIcon = container.querySelectorAll("button.properties-expression-button");
		expect(expressionBuilderIcon).to.have.length(1);
		const expressionBuilderIconAriaLabelledBy = expressionBuilderIcon[0].getAttribute("aria-labelledby");
		const expressionBuilderIconTooltip = container.querySelector(`span[id='${expressionBuilderIconAriaLabelledBy}']`);
		expect(expressionBuilderIconTooltip.textContent).to.equal("launch expression builder");
	});
	it("should render maximize button", () => {
		reset();
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("button.maximize")).to.have.length(1);
	});
});

describe("expression-builder renders correctly", () => {
	beforeEach(() => {
		reset();
	});

	it("expression builder props should have been defined", () => {
		renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		expectJest(mockExpressionBuilder).toHaveBeenCalledWith({
			"controller": controller,
			"control": control,
			"propertyId": propertyId,
		});
	});

	it("should render a `ExpressionBuilder`", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// ensure all the active container components rendered
		expect(container.querySelectorAll("div.properties-expression-editor-wrapper")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-expression-selection-container")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-field-table-container")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-value-table-container")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-functions-table-container")).to.have.length(0);
		expect(container.querySelectorAll("div.properties-help-table-container")).to.have.length(0);
		expect(container.querySelectorAll("div.properties-operator-container")).to.have.length(1);
	});

	it("Fields and Values tables should have aria-label", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// ensure fields table has aria-label
		const fieldsTable = container.querySelector("div.properties-field-table-container").querySelectorAll(".ReactVirtualized__Table");
		expect(fieldsTable).to.have.length(1);
		expect(fieldsTable[0].getAttribute("aria-label")).to.equal("Fields table");

		// ensure values table has aria-label
		const valuesTable = container.querySelector("div.properties-value-table-container").querySelectorAll(".ReactVirtualized__Table");
		expect(valuesTable).to.have.length(1);
		expect(valuesTable[0].getAttribute("aria-label")).to.equal("Values table");
	});

	it("Functions table should have aria-label", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));

		// ensure functions table has aria-label
		const functionsTable = container.querySelector("div.properties-functions-table-container").querySelectorAll(".ReactVirtualized__Table");
		expect(functionsTable).to.have.length(1);
		expect(functionsTable[0].getAttribute("aria-label")).to.equal("Functions table");
	});

	it("Fields and Values tables should display default empty label if no values", () => {
		// Remove datasetmetadata
		controller.setDatasetMetadata([]);
		const expressionInfo = getCopy(ExpressionInfo.input);
		delete expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_FIELDS_EMPTY_TABLE_LABEL];
		delete expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_VALUES_EMPTY_TABLE_LABEL];
		controller.setExpressionInfo(expressionInfo);

		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const fieldsTable = container.querySelectorAll("div.properties-field-table-container");
		expect(fieldsTable).to.have.length(1);
		expect(fieldsTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(messages[MESSAGE_KEYS.EXPRESSION_FIELDS_EMPTY_TABLE_LABEL]);

		const valuesTable = container.querySelectorAll("div.properties-value-table-container");
		expect(valuesTable).to.have.length(1);
		expect(valuesTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(messages[MESSAGE_KEYS.EXPRESSION_VALUES_EMPTY_TABLE_LABEL]);
	});

	it("Fields and Values tables should display custom empty label if no values", () => {
		// Remove datasetmetadata
		controller.setDatasetMetadata([]);
		const expressionInfo = getCopy(ExpressionInfo.input);
		controller.setExpressionInfo(expressionInfo);

		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const fieldsTable = container.querySelectorAll("div.properties-field-table-container");
		expect(fieldsTable).to.have.length(1);
		expect(fieldsTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_FIELDS_EMPTY_TABLE_LABEL]);

		const valuesTable = container.querySelectorAll("div.properties-value-table-container");
		expect(valuesTable).to.have.length(1);
		expect(valuesTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_VALUES_EMPTY_TABLE_LABEL]);
	});

	it("Functions table should display default empty label if no values", () => {
		// Remove function_refs
		const expressionInfo = getCopy(ExpressionInfo.input);
		expressionInfo.functions.function_categories[0].function_refs = [];
		delete expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS];
		controller.setExpressionInfo(expressionInfo);

		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// Switch to functions
		const contentSwitcher = container.querySelectorAll(".properties-expression-selection-content-switcher");
		expect(contentSwitcher).to.have.length(1);
		const buttons = contentSwitcher[0].querySelectorAll("button");
		expect(buttons).to.have.length(2);
		fireEvent.click(buttons[1]);

		const functionsTable = container.querySelectorAll("div.properties-functions-table-container");
		expect(functionsTable).to.have.length(1);
		expect(functionsTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(messages[MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS]);
	});

	it("Functions table should display custom empty label if no values", () => {
		// Remove function_refs
		const expressionInfo = getCopy(ExpressionInfo.input);
		expressionInfo.functions.function_categories[0].function_refs = [];
		controller.setExpressionInfo(expressionInfo);

		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// Switch to functions
		const contentSwitcher = container.querySelectorAll(".properties-expression-selection-content-switcher");
		expect(contentSwitcher).to.have.length(1);
		const buttons = contentSwitcher[0].querySelectorAll("button");
		expect(buttons).to.have.length(2);
		fireEvent.click(buttons[1]);

		const functionsTable = container.querySelectorAll("div.properties-functions-table-container");
		expect(functionsTable).to.have.length(1);
		expect(functionsTable[0].querySelector(".properties-ft-empty-table").textContent).to.equal(expressionInfo.resources[MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS]);
	});

	it("Functions table should display 'Return' column from return_type_label, default to return_type if undefined", () => {
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));

		// Verify Return column in "General Functions" table
		let functionsTable = container.querySelector("div.properties-functions-table").querySelectorAll(".ReactVirtualized__Table");
		expect(functionsTable).to.have.length(1);
		let rows = tableUtilsRTL.getTableRows(functionsTable[0]);
		expect(rows).to.have.length(4);
		rows.forEach((row, idx) => {
			const functionInfo = ExpressionInfo.actual.functionCategories["General Functions"].functionList[idx];
			// Verify values in "Return" column match with "return_type_label". Default to "return_type".
			const expectedReturnType = functionInfo.locReturnType ? functionInfo.locReturnType : functionInfo.return_type;
			const actualReturnType = row.querySelectorAll(".ReactVirtualized__Table__rowColumn")[2].textContent; // consider Add column
			expect(expectedReturnType).to.eql(actualReturnType);
		});

		// Navigate to Information table
		var dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		var dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[2]);
		expect(container.querySelector("div.properties-expression-function-select span").textContent).to.equal("Information");

		// Verify Return column in "Information" table
		functionsTable = container.querySelector("div.properties-functions-table").querySelector(".ReactVirtualized__Table");
		rows = tableUtilsRTL.getTableRows(functionsTable);
		expect(rows).to.have.length(3);
		rows.forEach((row, idx) => {
			const functionInfo = ExpressionInfo.actual.functionCategories.Information.functionList[idx];
			// Verify values in "Return" column match with "return_type_label". Default to "return_type".
			const expectedReturnType = functionInfo.locReturnType ? functionInfo.locReturnType : functionInfo.return_type;
			const actualReturnType = row.querySelectorAll(".ReactVirtualized__Table__rowColumn")[2].textContent;
			expect(expectedReturnType).to.eql(actualReturnType);
		});
	});
	// TODO cannot find valuesTable
	it.skip("expression builder displays table header descriptions in info icon", async() => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, callbacks, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		const expression = container.querySelector("div[data-id='properties-ctrl-expression']");
		const expressionEditorBtn = expression.querySelector("button.properties-expression-button");
		fireEvent.click(expressionEditorBtn);

		const valuesTable = container.querySelectorAll("div.properties-value-table-container");
		expect(valuesTable).to.have.length(1);

		// Verify custom header label
		const header = valuesTable.querySelector("div[data-role='properties-header-row']");
		const headerLabel = header.querySelectorAll(".properties-vt-label-tip-icon");
		expect(headerLabel).to.have.length(2); // include Add column
		expect(header.textContent).to.equal("Add" +	harnessMessages[MESSAGE_KEYS.EXPRESSION_VALUE_COLUMN]);

		// Verify info icon
		const headerInfoIcon = header.querySelectorAll(".properties-vt-info-icon-tip");
		expect(headerInfoIcon).to.have.length(1);
		const tooltipTrigger = headerInfoIcon[0].querySelector(".tooltip-trigger");
		const tooltipId = tooltipTrigger.getAttribute("aria-labelledby");
		let infoTip = container.querySelector(`div[data-id='${tooltipId}']`);
		expect(infoTip.getAttribute("aria-hidden")).to.equal(true);
		fireEvent.click(tooltipTrigger);
		infoTip = container.querySelector(`div[data-id='${tooltipId}']`);
		expect(infoTip.getAttribute("aria-hidden")).to.equal(false);
	});
});

describe("expression-builder select from tables correctly", () => {

	it("expression builder select an operator", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const opButtons = container.querySelector("div.properties-operator-container").querySelector("button");
		fireEvent.click(opButtons);
		expect(controller.getPropertyValue(propertyId)).to.equal(" =");
	});

	it("expression builder select a field", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const fieldTable = container.querySelector("div.properties-field-table-container");
		const addButtons = getAddButtonsList(tableUtilsRTL.getTableRows(fieldTable));
		fireEvent.click(addButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" Age");
	});

	it("expression builder select a field on double clicking row", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const fieldTable = wrapper.container.querySelector("div.properties-field-table-container");
		tableUtilsRTL.dblClickTableRows(fieldTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" Age");
	});

	it("expression builder select a field value", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const valueTable = container.querySelector("div.properties-value-table-container");
		const addButtons = getAddButtonsList(tableUtilsRTL.getTableRows(valueTable));
		fireEvent.click(addButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" 21");
	});

	it("expression builder select a Value on double clicking row", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const valueTable = wrapper.container.querySelector("div.properties-value-table-container");
		tableUtilsRTL.dblClickTableRows(valueTable, [0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" 21");
	});

	it("expression builder select a field value of type string", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// select a field with string values
		const fieldTable = container.querySelector("div.properties-field-table-container");
		tableUtilsRTL.clickTableRows(fieldTable, [1]);
		// select a string value from value table.
		const valueTable = container.querySelector("div.properties-value-table-container");
		const addButtons = getAddButtonsList(tableUtilsRTL.getTableRows(valueTable));
		fireEvent.click(addButtons[1]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" \"female\"");
	});

	it("expression builder select a function", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));
		const functionTable = container.querySelector("div.properties-functions-table-container");
		const addButtons = getAddButtonsList(tableUtilsRTL.getTableRows(functionTable));
		fireEvent.click(addButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" to_integer(?)");
	});

	it("expression builder select a field from filtered table correctly", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		// Verify first row is selected by default
		let fieldTable = container.querySelector("div.properties-field-table-container");
		let rows = tableUtilsRTL.getTableRows(fieldTable);
		let firstRowClassName = rows[0].className;
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);

		// Filter by 'l' should return 1 row that is not selected
		const searchInput = fieldTable.querySelectorAll("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);
		fireEvent.change(searchInput[0], { target: { value: "l" } });
		fieldTable = container.querySelector("div.properties-field-table-container");
		rows = tableUtilsRTL.getTableRows(fieldTable);
		firstRowClassName = rows[0].className;
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.lessThan(0);

		// Clicking on the filtered row will select it
		tableUtilsRTL.clickTableRows(fieldTable, [0]);
		fieldTable = container.querySelector("div.properties-field-table-container");
		rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		firstRowClassName = rows[0].className;
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);

		// Clearing the filter should show the correct selected row as selected
		fireEvent.change(searchInput[0], { target: { value: "" } });
		fieldTable = container.querySelector("div.properties-field-table-container");
		rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		firstRowClassName = rows[0].className;
		expect(firstRowClassName.indexOf("properties-vt-row-selected")).to.be.lessThan(0);
		const fourthRowClassName = rows[3].className;
		expect(fourthRowClassName.indexOf("properties-vt-row-selected")).to.be.greaterThan(-1);
	});
});

describe("expression handles no expression builder resources correctly", () => {

	it("expression with no function list json provided does not render an expression builder", () => {
		controller = new Controller();
		controller.saveControls([control]);
		controller.updatePropertyValue(propertyId, "");
		controller.setDatasetMetadata(getCopy(dataModel));

		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const input = container.querySelectorAll("div.properties-expression-button");
		expect(input).to.have.length(0);
	});

	it("expression builder with a function list json provided renders an expression builder", () => {
		reset();
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const input = container.querySelectorAll("button.properties-expression-button");
		expect(input).to.have.length(1);
	});

	it("expression builder with a function list json provided with builder=false doesn't render an expression builder", () => {
		reset();
		const wrapper = renderWithIntl(
			<Expression
				store={controller.getStore()}
				control={control}
				controller={controller}
				propertyId={propertyId}
				builder={false}
				rightFlyout
			/>
		);
		const { container } = wrapper;
		const input = container.querySelectorAll("button.properties-expression-button");
		expect(input).to.have.length(0);
	});

	it("CommonProperties renders with no expressionInfo values ", () => {
		propertiesInfo.expressionInfo = { functions: {}, resources: {} };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		// common properties is rendered within div.properties-right-flyout
		expect(container.querySelectorAll("div.properties-right-flyout ").length).to.be.equal(1);
	});

	it("CommonProperties renders with no expressionInfo resources ", () => {
		propertiesInfo.expressionInfo = { functions: {} };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("div.properties-right-flyout ").length).to.be.equal(1);
	});

	it("CommonProperties renders with no expressionInfo functions ", () => {
		propertiesInfo.expressionInfo = {};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("div.properties-right-flyout ").length).to.be.equal(1);
	});

	it("CommonProperties renders with no validateLink set ", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, null, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll(".validateLink")).to.have.length(0);
	});

	it("CommonProperties renders with validateLink set true", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, callbacks, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("button.validateLink")).to.have.length(8); // there are 9 (including one readonly) expressions in this paramdef, 1 is hidden
	});

	it("CommonProperties renders with validateLink and callback is called on click", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, callbacks, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		fireEvent.click(container.querySelector("div[data-id='properties-ctrl-expression'] button.validateLink"));
		expect(renderedObject.callbacks.validationHandler).to.have.property("callCount", 1);
	});

	it("CommonProperties renders with readonly expression", () => {
		propertiesInfo.expressionInfo = getCopy(ExpressionInfo.input);
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef, propertiesConfig, callbacks, propertiesInfo);
		const wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const readOnlyWrapper = container.querySelector(".expression-control-class-readonly");
		const validateButton = readOnlyWrapper.querySelector(".validateLink");
		const expButton = readOnlyWrapper.querySelector("button.properties-expression-button");
		expect(validateButton.disabled).to.equal(true);
		expect(expButton.disabled).to.equal(true);
	});


});

describe("expression builder generates and accesses field dropdown correctly", () => {
	it("expression builder selects dropdown correctly", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Fields");
		const dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		var dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		// check that all dropdown options are loaded
		expect(dropDownList).to.have.length(5);
		// selecting the dropdown list has the correct entries
		expect(dropDownList[0].textContent).to.be.equal("Fields");
		expect(dropDownList[1].textContent).to.be.equal("Recently Used");
		expect(dropDownList[2].textContent).to.be.equal("Globals");
		expect(dropDownList[3].textContent).to.be.equal("Multi Response Set");
		expect(dropDownList[4].textContent).to.be.equal("Parameters");
		// select an option
		fireEvent.click(dropDownList[2]);
		// properly close the dropdown once selected
		expect(container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item")).to.have.length(0);
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Globals");
	});

	it("expression builder adds dropdown menu fields and values correctly", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		var dropDown = container.querySelector("div.properties-expression-field-select button");
		fireEvent.click(dropDown);
		var dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		// test globals
		fireEvent.click(dropDownList[2]);
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Globals");
		const fieldTable = container.querySelector("div.properties-field-table-container");
		const valueTable = container.querySelector("div.properties-value-table-container");
		const addFieldButtons = getAddButtonsList(tableUtilsRTL.getTableRows(fieldTable));
		fireEvent.click(addFieldButtons[0]);
		// expect selecting a field enters the correct value
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE')");
		tableUtilsRTL.clickTableRows(fieldTable, [1]);
		const addValueButtons = getAddButtonsList(tableUtilsRTL.getTableRows(valueTable));
		fireEvent.click(addValueButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863");
		// test mrs
		dropDown = container.querySelector("div.properties-expression-field-select button");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[3]);
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Multi Response Set");
		fireEvent.click(addFieldButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863 numberSet");
		tableUtilsRTL.clickTableRows(fieldTable, [1]);
		fireEvent.click(addValueButtons[0]);
		expect(controller.getPropertyValue(propertyId)).to.equal(" @GLOBAL_MEAN('AGE') 8863 numberSet 1");
	});
});

describe("ExpressionBuilder filters and sorts correctly", () => {
	it("expression builder filters fields table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		let fieldTable = container.querySelector("div.properties-field-table-container");
		let rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		expect(rows[1].textContent).to.equal("Sexstring");
		const searchInput = fieldTable.querySelectorAll("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);
		fireEvent.change(searchInput[0], { target: { value: "Age" } });
		fieldTable = container.querySelector("div.properties-field-table-container");
		rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		expect(rows[0].textContent).to.equal("Ageinteger");
	});
	it("expression builder filters values table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		let fieldTable = container.querySelector("div.properties-value-table-container");
		let rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(2);
		expect(rows[0].textContent).to.equal("Min: 21");
		const searchInput = fieldTable.querySelectorAll("div.properties-ft-search-container input");
		expect(searchInput).to.have.length(1);
		fireEvent.change(searchInput[0], { target: { value: "Max" } });
		fieldTable = container.querySelector("div.properties-value-table-container");
		rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(1);
		expect(rows[0].textContent).to.equal("Max: 55");
	});
	it("expression builder filters function table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));
		let functionTable = container.querySelector("div.properties-functions-table");
		let rows = tableUtilsRTL.getTableRows(functionTable);
		expect(rows).to.have.length(4);
		let searchInput = functionTable.querySelectorAll("div.properties-ft-search-container input");

		expect(searchInput).to.have.length(1);
		fireEvent.change(searchInput[0], { target: { value: "if" } });
		functionTable = container.querySelector("div.properties-functions-table");
		rows = tableUtilsRTL.getTableRows(functionTable);
		expect(rows).to.have.length(2);
		expect(rows[0].textContent).to.equal("if  COND1  then  EXPR1  else  EXPR2  endifAny");
		searchInput = functionTable.querySelectorAll("div.properties-ft-search-container input");
		fireEvent.change(searchInput[0], { target: { value: "to_int" } });
		functionTable = container.querySelector("div.properties-functions-table");
		rows = tableUtilsRTL.getTableRows(functionTable);
		expect(rows).to.have.length(1);
		expect(rows[0].textContent).to.equal("to_integer(Item)[Esperanto~Integer~~eo]");
	});
	it("expression builder sorts fields table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const fieldTable = container.querySelector("div.properties-field-table-container");
		const rows = tableUtilsRTL.getTableRows(fieldTable);
		expect(rows).to.have.length(4);
		expect(rows[1].textContent).to.equal("Sexstring");

		const sortHeaders = fieldTable.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(sortHeaders).to.have.length(2);

		tableUtilsRTL.clickHeaderColumnSort(fieldTable, 0);
		expect(rows[1].textContent).to.equal("BPstring");

		tableUtilsRTL.clickHeaderColumnSort(fieldTable, 0);
		expect(rows[1].textContent).to.equal("Cholesterolstring");
	});
	it("expression builder sorts value table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		const valueTable = container.querySelector("div.properties-value-table-container");
		const rows = tableUtilsRTL.getTableRows(valueTable);
		const sortHeaders = valueTable.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(rows).to.have.length(2);
		expect(rows[0].textContent).to.equal("Min: 21");
		expect(sortHeaders).to.have.length(1);

		tableUtilsRTL.clickHeaderColumnSort(valueTable, 0);
		expect(rows[0].textContent).to.equal("Max: 55");

		tableUtilsRTL.clickHeaderColumnSort(valueTable, 0);
		expect(rows[0].textContent).to.equal("Min: 21");
	});
	it("expression builder sorts function table", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));
		const functionTable = container.querySelector("div.properties-functions-table");
		const rows = tableUtilsRTL.getTableRows(functionTable);
		const sortHeaders = functionTable.querySelectorAll(".ReactVirtualized__Table__sortableHeaderColumn");
		expect(rows).to.have.length(4);
		expect(rows[0].textContent).to.equal("to_integer(Item)[Esperanto~Integer~~eo]");
		expect(sortHeaders).to.have.length(2);

		tableUtilsRTL.clickHeaderColumnSort(functionTable, 0);
		expect(rows[0].textContent).to.equal("count_equal(Item, List)Integer");

		tableUtilsRTL.clickHeaderColumnSort(functionTable, 1);
		expect(rows[0].textContent).to.equal("if  COND1  then  EXPR1  else  EXPR2  endifAny");
	});
});

describe("expression builder correctly runs Recently Used dropdown options", () => {
	it("expression builder correctly adds and reorders fields to Recently Used", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Fields");
		let fieldRows = fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));

		expect(fieldRows).to.have.length(4);
		// navigate to Recently Used fields and check that it is empty
		var dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		var dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		expect(container.querySelector("div.properties-expression-field-select span").textContent).to.equal("Recently Used");
		expect(container.querySelectorAll("div.properties-field-table-container .properties-vt-column")[0]
			.textContent).to.equal("Add");
		expect(container.querySelectorAll("div.properties-field-table-container .properties-vt-column")[1]
			.textContent).to.equal("Item");
		fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(0);
		// back to Fields
		dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[0]);
		fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));
		// add two rows to Recently Used
		const addButtons = getAddButtonsList(fieldRows);
		fireEvent.click(addButtons[0]);
		fireEvent.click(addButtons[1]);
		// back to Recently used
		dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		// check that the fields were correctly added
		fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(2);
		expect(fieldRows[0].textContent).to.equal("Sex");
		expect(fieldRows[1].textContent).to.equal("Age");
		// check that recently used field has the correct values stored with it
		let valueRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-value-table-container"));
		expect(valueRows).to.have.length(3);
		expect(valueRows[2].textContent).to.equal("not specified");
		// check that reusing a field will move it to the top of Recently Used
		dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[0]);
		fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));
		// add Age again, moving it to the top of Recently Used
		fireEvent.click(addButtons[0]);
		// back to Recently Used
		dropDown = container.querySelector("div.properties-expression-field-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		// order of rows should be reversed
		fieldRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-field-table-container"));
		expect(fieldRows).to.have.length(2);
		expect(fieldRows[0].textContent).to.equal("Age");
		expect(fieldRows[1].textContent).to.equal("Sex");
		valueRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-value-table-container"));
		expect(valueRows).to.have.length(2);
		expect(valueRows[0].textContent).to.equal("Min: 21");
	});
	it("expression builder correctly adds and reorders functions to Recently Used", () => {
		reset();
		const wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionBuilder
					control={control}
					controller={controller}
					propertyId={propertyId}
				/>
			</Provider>
		);
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.expresson-builder-function-tab"));
		expect(container.querySelector("div.properties-expression-function-select span").textContent).to.equal("General Functions");
		let funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(4);
		// navigate to Recently Used fields and check that it is empty
		var dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		var dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		expect(container.querySelector("div.properties-expression-function-select span").textContent).to.equal("Recently Used");
		expect(container.querySelectorAll("div.properties-functions-table-container .properties-vt-column")[0]
			.textContent).to.equal("Add");
		expect(container.querySelectorAll("div.properties-functions-table-container .properties-vt-column")[1]
			.textContent).to.equal("Function");
		funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(0);
		// back to General Functions
		dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[0]);
		funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		// add two rows to Recently Used
		const addFuncButtons = getAddButtonsList(funcRows);
		fireEvent.click(addFuncButtons[0]);
		fireEvent.click(addFuncButtons[1]);
		// back to Recently used
		dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		// check that the functions were correctly added
		funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(2);
		expect(funcRows[0].textContent).to.equal("count_equal(Item, List)Integer");
		expect(funcRows[1].textContent).to.equal("to_integer(Item)[Esperanto~Integer~~eo]");
		// check that reusing a function will move it to the top of Recently Used
		dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[0]);
		funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		// add to_integer again, moving it to the top of Recently Used
		const addButtons = getAddButtonsList(funcRows);
		fireEvent.click(addButtons[0]);
		// back to Recently Used
		dropDown = container.querySelector("div.properties-expression-function-select .cds--list-box__field");
		fireEvent.click(dropDown);
		dropDownList = container.querySelectorAll("ul.cds--list-box__menu .cds--list-box__menu-item");
		fireEvent.click(dropDownList[1]);
		// order of rows should be reversed
		funcRows = tableUtilsRTL.getTableRows(container.querySelector("div.properties-functions-table-container"));
		expect(funcRows).to.have.length(2);
		expect(funcRows[0].textContent).to.equal("to_integer(Item)[Esperanto~Integer~~eo]");
		expect(funcRows[1].textContent).to.equal("count_equal(Item, List)Integer");
	});
});

describe("expression builder classnames appear correctly", () => {
	let wrapper;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(ExpressionParamdef);
		wrapper = renderedObject.wrapper;
	});

	it("expression should have custom classname defined", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll(".expression-control-class")).to.have.length(1);
	});

	it("expression should have custom classname defined in table cells", () => {
		const { container } = wrapper;
		propertyUtilsRTL.openSummaryPanel(wrapper, "expressionCellTable-summary-panel");
		expect(container.querySelectorAll(".expression-control-class")).to.have.length(1);
		expect(container.querySelectorAll(".table-on-panel-expression-control-class")).to.have.length(1);
		expect(container.querySelectorAll(".table-subpanel-expression-control-class")).to.have.length(1);
	});
});
describe("expression toggle", () => {
	let wrapper;
	beforeEach(() => {
		reset();
		wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionToggle
					control={control}
					controller={controller}
					enableMaximize
				/>
			</Provider>
		);
	});
	it("should render maximize", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll("button.maximize")).to.have.length(1);
		expect(container.querySelectorAll("button.minimize")).to.have.length(0);
	});
	it("should call button handler on maximize", () => {
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.maximize"));
		expect(buttonHandler.calledOnce).to.equal(true);
	});
	it("should set active tearsheet", () => {
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.maximize"));
		expect(controller.getActiveTearsheet()).to.equal("tearsheetX");
	});
});
describe("expression toggle in tearsheet", () => {
	let wrapper;
	beforeEach(() => {
		reset();
		wrapper = renderWithIntl(
			<Provider store={controller.getStore()}>
				<ExpressionToggle
					control={control}
					controller={controller}
					enableMaximize={false}
				/>
			</Provider>
		);
	});
	it("should render minimize", () => {
		const { container } = wrapper;
		expect(container.querySelectorAll("button.maximize")).to.have.length(0);
		expect(container.querySelectorAll("button.minimize")).to.have.length(1);
	});
	it("should not call button handler on minimize", () => {
		const { container } = wrapper;
		fireEvent.click(container.querySelector("button.minimize"));
		expect(buttonHandler.calledOnce).to.equal(false);
	});
	it("should set active tearsheet to null", () => {
		const { container } = wrapper;
		controller.setActiveTearsheet("tearsheetX");
		fireEvent.click(container.querySelector("button.minimize"));
		expect(controller.getActiveTearsheet()).to.equal(null);
	});
});

describe("expression select field function tests", () => {
	let wrapper;
	beforeEach(() => {
		reset();
		wrapper = renderWithIntl(
			<ExpressionSelectFieldFunctions
				controller={controller}
				language={control.language}
				onChange={Sinon.spy()}
				functionList={ExpressionInfo.actual.functionCategories}
			/>
		);
	});
	// React Testing Library doesn't support instance.
	it.skip("should return true if field name includes special characters", () => {
		const instance = wrapper.find("ExpressionSelectFieldOrFunction").instance();
		expect(instance.shouldQuoteField("field")).to.equal(false);
		expect(instance.shouldQuoteField("FieldName")).to.equal(false);

		expect(instance.shouldQuoteField("field space")).to.equal(true);
		expect(instance.shouldQuoteField("field0")).to.equal(true);
		expect(instance.shouldQuoteField("9field")).to.equal(true);
		expect(instance.shouldQuoteField("field5number")).to.equal(true);
		expect(instance.shouldQuoteField("field-dash")).to.equal(true);
		expect(instance.shouldQuoteField("$field$")).to.equal(true);
		expect(instance.shouldQuoteField("field_underscore")).to.equal(true);
	});
});
