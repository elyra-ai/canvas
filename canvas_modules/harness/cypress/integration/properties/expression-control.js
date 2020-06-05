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

describe("Test of expression editor control", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("CLEM_FilterRows_paramDef.json");
	});

	it("Test syntax highlighting and autocomplete features in expression editor control", function() {
		// syntax highlighting and autocomplete features
		cy.verifyTypeOfWordInExpressionEditor("is_real", "keyword");
		cy.verifyTypeOfWordInExpressionEditor("salbegin", "variable");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator");
		cy.verifyTypeOfWordInExpressionEditor("120", "number");
		cy.verifyTypeOfWordInExpressionEditor("F", "string");

		cy.verifyNumberOfHintsForTextInExpressionEditor("is", 18);
		cy.verifyNumberOfHintsForTextInExpressionEditor("is_d", 2);

		cy.verifyTypeOfFirstAutoCompleteForText("is_", "is_date", "keyword");
		cy.verifyTypeOfFirstAutoCompleteForText("is_t", "is_time", "keyword");
		cy.verifyTypeOfFirstAutoCompleteForText("a", "age", "variable");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", "keyword");
		cy.verifyTypeOfEnteredTextInExpressionEditor("age", "variable");
		cy.verifyTypeOfEnteredTextInExpressionEditor("'age'", "variable");
		cy.verifyTypeOfEnteredTextInExpressionEditor("=", "operator");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string");

		cy.verifyTypeOfFirstAutoCompleteForText("first", "first_index", "keyword");
		cy.saveFlyout();
		cy.verifyConditionExpressionInConsole("first_index");

		// placeholder text and validation
		cy.openPropertyDefinition("Javascript_FilterRows_paramDef.json");
		cy.verifyPlaceholderTextInExpressionEditor("Enter JavaScript text");
		cy.verifyTypeOfFirstAutoCompleteForText("i", "isFinite", "variable");
		cy.clickValidateLink();
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
		cy.verifyTypeOfFirstAutoCompleteForText("first", "first_index", "keyword");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("first_index", "Values", 1, "Structure List Table");

		// Add a new row to the table and change it's value in the expression control
		cy.openSubPanel("Configure Derive Node");
		cy.clickButtonInTable("Add", "expressionCellTable");
		cy.selectRowInTable(2, "expressionCellTable");
		cy.verifyTypeOfFirstAutoCompleteForText("is_", "is_date", "keyword");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("is_date", "Values", 2, "Structure List Table");
		cy.saveFlyout();
		cy.verifySummaryPanelValueForParameterInConsole("is_date", "expressionCellTable");
	});
});

describe("Test of expression builder", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("expressionControl_paramDef.json");
	});

	it("Test of expression builder", function() {
		cy.clickExpressionBuildButtonForProperty("defaultExpr");

		// Generate a success validate
		cy.clickValidateLinkInSubPanel("Expression Builder");
		cy.verifyIconInSubPanel("canvas-state-icon-success", "Expression Builder");

		// Verify the icon goes away on the next input
		cy.selectFieldFromPropertyInSubPanel("Age", "defaultExpr", "Expression Builder");
		cy.verifyIconInSubPanel("none", "Expression Builder");

		// Generate an error
		cy.selectTabFromPropertyInSubPanel("Functions", "defaultExpr", "Expression Builder");
		cy.selectFieldFromPropertyInSubPanel("is_integer(ITEM)", "defaultExpr", "Expression Builder");
		cy.clickValidateLinkInSubPanel("Expression Builder");
		cy.verifyValidationMessage("Expression cannot contain '?'");
		cy.verifyIconInSubPanel("canvas-state-icon-error", "Expression Builder");

		// substitute a param char '?' (dependent on the test above)
		cy.selectFieldFromPropertyInSubPanel("Age", "defaultExpr", "Expression Builder");
		cy.verifyIconInSubPanel("none", "Expression Builder");
	});
});

describe("Test of Python and R expression controls", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("Python_ExpressionControl_paramDef.json");
	});

	it("Test Python autocomplete and syntax highlighting, Test R autocomplete and syntax highlighting", function() {
		// test Python autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("foo", "def");
		cy.verifyTypeOfWordInExpressionEditor("testVar", "variable");
		cy.verifyTypeOfWordInExpressionEditor("property", "property");
		cy.verifyTypeOfWordInExpressionEditor("# comment", "comment");
		cy.verifyTypeOfWordInExpressionEditor("1", "number");
		cy.verifyTypeOfWordInExpressionEditor("<", "operator");
		cy.verifyTypeOfWordInExpressionEditor("if", "keyword");
		cy.verifyTypeOfWordInExpressionEditor("abs", "builtin");

		cy.verifyNumberOfHintsForTextInExpressionEditor("is", 3);

		cy.verifyTypeOfFirstAutoCompleteForText("a", "age", "variable");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", "keyword");
		cy.verifyTypeOfEnteredTextInExpressionEditor("age", "variable");
		cy.verifyTypeOfEnteredTextInExpressionEditor("=", "operator");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string");

		// placeholder text and validation
		cy.openPropertyDefinition("R_ExpressionControl_paramDef.json");

		// test R autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("# syntax testing", "comment");
		cy.verifyTypeOfWordInExpressionEditor("1", "number");
		cy.verifyTypeOfWordInExpressionEditor("text", "string");
		cy.verifyTypeOfWordInExpressionEditor("\n", "string-2");
		cy.verifyTypeOfWordInExpressionEditor("`x`", "variable-3");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator");
		cy.verifyTypeOfWordInExpressionEditor("function", "keyword");
		cy.verifyTypeOfWordInExpressionEditor("Inf", "atom");
		cy.verifyTypeOfWordInExpressionEditor("return", "builtin");
		cy.verifyTypeOfWordInExpressionEditor("%var-2%", "variable-2");
		cy.verifyTypeOfWordInExpressionEditor("<-", "arrow");
		cy.verifyTypeOfWordInExpressionEditor(";", "semi");

		cy.verifyNumberOfHintsForTextInExpressionEditor("br", 5);
		cy.verifyNumberOfHintsForTextInExpressionEditor("li", 6);

		cy.verifyTypeOfFirstAutoCompleteForText("a", "age", "variable");

		cy.verifyTypeOfEnteredTextInExpressionEditor("if", "keyword");
		cy.verifyTypeOfEnteredTextInExpressionEditor("age", "variable");
		cy.verifyTypeOfEnteredTextInExpressionEditor("=", "operator");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string");
	});
});
