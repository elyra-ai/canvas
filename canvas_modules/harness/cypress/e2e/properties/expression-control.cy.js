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
		cy.verifyTypeOfWordInExpressionEditor("is_real", "keyword", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("salbegin", "variable", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("120", "number", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("F", "string", "conditionExpr");

		cy.enterTextInExpressionEditor("is", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(26);
		cy.enterTextInExpressionEditor("is_d", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(7);

		cy.selectFirstAutoCompleteForText("is_", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("is_date", "keyword");
		cy.selectFirstAutoCompleteForText("is_t", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("is_time", "keyword");
		cy.selectFirstAutoCompleteForText("ag", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("age", "variable");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", "keyword", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("age", "variable", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("'age'", "variable", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("=", "operator", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string", "conditionExpr");

		cy.selectFirstAutoCompleteForText("first", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("first_index", "keyword");
		cy.saveFlyout();
		verifyConditionExpressionInConsole("first_index");

		// placeholder text and validation
		cy.toggleCommonPropertiesSidePanel(); // Close sidepanel before reopening
		cy.openPropertyDefinition("Javascript_FilterRows_paramDef.json");
		cy.verifyPlaceholderTextInExpressionEditor("Enter JavaScript text");
		cy.selectFirstAutoCompleteForText("i", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("if", "keyword");
		cy.enterTextInExpressionEditor("isFinite", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("isFinite", "variable");
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
		cy.verifyTypeOfSelectedAutoComplete("first_index", "keyword");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("first_index", "Values", 1, "Structure List Table");

		// Add a new row to the table and change it's value in the expression control
		cy.openSubPanel("Configure Derive Node");
		cy.clickButtonInTable("Add", "expressionCellTable");
		cy.selectRowInTable(2, "expressionCellTable");
		cy.selectFirstAutoCompleteForText("is_", "condition");
		cy.verifyTypeOfSelectedAutoComplete("is_date", "keyword");
		cy.saveWideFlyout("Configure Derive Node");
		cy.verifyValueInSummaryPanelForCategory("is_date", "Values", 2, "Structure List Table");
		cy.saveFlyout();
		verifyValueForParameterInConsole("is_date", "expressionCellTable");
	});
});

describe("Test of expression builder", function() {
	beforeEach(() => {
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
	it("expression builder should displays table header labels", function() {
		// Click to open expression builder
		cy.clickExpressionBuilderButton("defaultExpr");

		// Check the value table container is visible
		cy.get("div.properties-value-table-container").should("have.length", 1);

		// Check custom header label
		cy.get(".properties-vt-label-tip-icon").should("have.length", 5);
		cy.contains("Add").should("exist");
		cy.contains("Custom Value").should("exist"); // Check for Custom Value header label
	});
});

describe("Test of Python and R expression controls", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("Python_ExpressionControl_paramDef.json");
	});

	it("Test Python autocomplete and syntax highlighting, Test R autocomplete and syntax highlighting", function() {
		// test Python autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("foo", "def", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("testVar", "variable", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("property", "property", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("# comment", "comment", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("1", "number", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("<", "operator", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("if", "keyword", "conditionExpr");

		cy.enterTextInExpressionEditor("is", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(10);

		cy.selectFirstAutoCompleteForText("ag", "conditionExpr");
		cy.verifyTypeOfSelectedAutoComplete("age", "variable");

		cy.verifyTypeOfEnteredTextInExpressionEditor("and", "keyword", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("age", "variable", "conditionExpr");
		cy.enterTextInExpressionEditor("a = b", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string", "conditionExpr");

		// placeholder text and validation
		cy.toggleCommonPropertiesSidePanel(); // Close sidepanel before reopening
		cy.openPropertyDefinition("R_ExpressionControl_paramDef.json");

		// test R autocomplete and syntax highlighting
		cy.verifyTypeOfWordInExpressionEditor("# syntax testing", "comment", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("1", "number", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("text\"", "string", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("\n", "string", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("function", "keyword", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("Inf", "keyword", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("return", "variable", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("<-", "operator", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor(";", "punctuation", "conditionExpr");

		cy.enterTextInExpressionEditor("br", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(9);
		cy.enterTextInExpressionEditor("li", "conditionExpr");
		cy.verifyNumberOfHintsInExpressionEditor(41);

		cy.selectFirstAutoCompleteForText("ag", "conditionExpr");

		cy.verifyTypeOfEnteredTextInExpressionEditor("if", "keyword", "conditionExpr");
		cy.enterTextInExpressionEditor("age = 30", "conditionExpr");
		cy.verifyTypeOfWordInExpressionEditor("=", "operator", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("120", "number", "conditionExpr");
		cy.verifyTypeOfEnteredTextInExpressionEditor("this is a string", "string", "conditionExpr");
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
