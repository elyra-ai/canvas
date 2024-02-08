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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test of expression editor control", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("CLEM_FilterRows_paramDef.json");
	});

	it("Test syntax highlighting and autocomplete features in expression editor control", function() {
		// syntax highlighting and autocomplete features
		cy.verifyTypeOfWordInExpressionEditor("is_real", ".ͼb", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("salbegin", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("=", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("120", ".ͼd", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("F", ".ͼe", "conditionExpr");

		cy.enterTextInExpressionEditor("is", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(26);
		cy.enterTextInExpressionEditor("is_d", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(7);

		cy.selectFirstAutoCompleteForText("is_", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("is_date", ".ͼb");
		cy.selectFirstAutoCompleteForText("is_t", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("is_time", ".ͼb");
		cy.selectFirstAutoCompleteForText("a", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("abs", ".ͼb");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", ".ͼb", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("age", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("=", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", ".ͼd", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", ".ͼe", "conditionExpr");

		cy.selectFirstAutoCompleteForText("first", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("first_index", ".ͼb");
		cy.saveFlyout();
		verifyConditionExpressionInConsole("first_index");

		// placeholder text and validation
		cy.toggleCommonPropertiesSidePanel(); // Close sidepanel before reopening
		cy.openPropertyDefinition("Javascript_FilterRows_paramDef.json");
		cy.verifyPlaceholderTextInExpressionEditor("Enter JavaScript text");
		cy.selectFirstAutoCompleteForText("i", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("if", ".ͼb");
		cy.enterTextInExpressionEditor("isFinite", "conditionExpr");
		cy.clickValidateLink("conditionExpr");
		cy.verifyValidationMessage("Cannot have value isFinite");
		cy.saveFlyout();
	});
});

describe("Test of expression editor control in a structure cell", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("summaryPanel_paramDef.json");
	});

	it("Select an existing row in the table and change it's value in the expression control, " +
	"Add a new row to the table and change it's value in the expression control", function() {
		// Select an existing row in the table and change it's value in the expression control
		cy.openSubPanel("Configure Derive Node");
		cy.selectRowInTable(1, "expressionCellTable");
		cy.verifyControlIsDisplayed("condition");
		cy.selectFirstAutoCompleteForText("first", "condition");
		cy.verifyTypeOfSelectedAutoComplete("first_index", ".ͼb");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("first_index", "Values", 1, "Structure List Table");

		// Add a new row to the table and change it's value in the expression control
		cy.openSubPanel("Configure Derive Node");
		cy.clickButtonInTable("Add", "expressionCellTable");
		cy.selectRowInTable(2, "expressionCellTable");
		cy.selectFirstAutoCompleteForText("is_", "condition");
		cy.verifyTypeOfSelectedAutoComplete("is_date", ".ͼb");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("is_date", "Values", 2, "Structure List Table");
		cy.saveFlyout();
		verifyValueForParameterInConsole("is_date", "expressionCellTable");
	});
});

describe("Test of expression builder", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("expressionControl_paramDef.json");
	});

	it("Test of expression builder", function() {
		cy.clickExpressionBuilderButton("defaultExpr");

		// Clicking validate returns error -> success -> error ...
		cy.clickValidateLinkInSubPanel();
		cy.verifyIconInSubPanel("canvas-state-icon-error");

		// Verify the icon goes away on the next input
		cy.selectFieldFromPropertyInSubPanel("Age", "field");
		cy.verifyIconInSubPanel("none");

		// Generate an error
		cy.selectTabFromPropertyInSubPanel("Functions", "function");
		cy.selectFieldFromPropertyInSubPanel("is_integer(ITEM)", "functions");
		cy.triggerBlurInExpressionBuilder(); // trigger blur
		cy.verifyValidationMessage("Expression cannot contain '?'");

		// substitute a param char '?' (dependent on the test above)
		cy.selectTabFromPropertyInSubPanel("Fields", "fields");

		cy.selectFieldFromPropertyInSubPanel("Age", "field");
		cy.verifyIconInSubPanel("none");

		// Clicking validate returns error -> success -> error ...
		cy.clickValidateLinkInSubPanel();
		cy.verifyIconInSubPanel("canvas-state-icon-success");
	});
});

describe("Test of Python and R expression controls", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("Python_ExpressionControl_paramDef.json");
	});

	it("Test Python autocomplete and syntax highlighting, Test R autocomplete and syntax highlighting", function() {
		// test Python autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("foo", ".ͼj", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("testVar", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("property", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("# comment", ".ͼm", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("1", ".ͼd", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("<", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("if", ".ͼb", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("abs", "conditionExpr");

		cy.enterTextInExpressionEditor("is", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(10);

		cy.selectFirstAutoCompleteForText("ag", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("age", "conditionExpr");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", ".ͼb", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("age", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("=", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", ".ͼd", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", ".ͼe", "conditionExpr");

		// placeholder text and validation
		cy.toggleCommonPropertiesSidePanel(); // Close sidepanel before reopening
		cy.openPropertyDefinition("R_ExpressionControl_paramDef.json");

		// test R autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("# syntax testing", ".ͼm", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("1", ".ͼd", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("text", ".ͼe", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("\n", ".ͼe", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("`x`", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("=", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("function", ".ͼb", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("Inf", ".ͼd", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("return", ".ͼb", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("%var-2%", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("<-", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor(";", "conditionExpr");

		cy.enterTextInExpressionEditor("br", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(9);
		cy.enterTextInExpressionEditor("li", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(41);

		cy.selectFirstAutoCompleteForText("ag", "conditionExpr");
		cy.verifyVariablesAndOperatorsInExpressionEditor("age", "conditionExpr");

		cy.verifyTypeOfEnteredTextInExpressionEditor("if", ".ͼb", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("age", "conditionExpr");
		cy.verifyEnteringVariablesAndOperatorsInExpressionEditor("=", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", ".ͼd", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", ".ͼe", "conditionExpr");
	});
});

function verifyConditionExpressionInConsole(selectedText) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.data.form.conditionExpr).to.include(selectedText);
	});
}

function verifyValueForParameterInConsole(testValue, parameterName) {
	// Verify that the event log has a value of "is_date" for the "expressionCellTable" parameter
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		const parameterValues = lastEventLog.data.form[parameterName];
		let found = false;
		for (var idx = 0; idx < parameterValues.length; idx++) {
			const parameter = parameterValues[idx];
			for (var indx = 0; indx < parameter.length; indx++) {
				if (parameter[indx] === testValue) {
					found = true;
					break;
				}
			}
		}
		expect(found).to.equal(true);
	});
}
