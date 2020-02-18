Feature: ExpressionControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties expression control
	So I can test the expression controls in common-properties

	Scenario: Test of expression editor control
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "CLEM_FilterRows_paramDef.json" of type "parameterDefs"

		# syntax highlighting and autocomplete features
		Then I verify "is_real" is a "keyword" in ExpressionEditor
		Then I verify "salbegin" is a "variable" in ExpressionEditor
		Then I verify "=" is a "operator" in ExpressionEditor
		Then I verify "120" is a "number" in ExpressionEditor
		Then I verify "F" is a "string" in ExpressionEditor
		Then I enter "is" in ExpressionEditor and press autocomplete and verify that 18 autocomplete hints are displayed
		Then I enter "is_d" in ExpressionEditor and press autocomplete and verify that 2 autocomplete hints are displayed
		Then I enter "is_" in ExpressionEditor and press autocomplete and select "is_date" a "keyword"
		Then I enter "is_t" in ExpressionEditor and press autocomplete and select "is_time" a "keyword"
		Then I enter "a" in ExpressionEditor and press autocomplete and select "age" a "variable"
		Then I enter "and" in ExpressionEditor and verify it is a "keyword"
		Then I enter "age" in ExpressionEditor and verify it is a "variable"
		Then I enter "'age'" in ExpressionEditor and verify it is a "variable"
		Then I enter "=" in ExpressionEditor and verify it is a "operator"
		Then I enter "120" in ExpressionEditor and verify it is a "number"
		Then I enter "this is a string" in ExpressionEditor and verify it is a "string"
		Then I enter "first" in ExpressionEditor and press autocomplete and select "first_index" and verify save

		# placeholder text and validation
		Given I have uploaded common-properties file "Javascript_FilterRows_paramDef.json" of type "parameterDefs"

		Then I verify that the placeholder text is "Enter JavaScript text" in ExpressionEditor
		Then I enter "i" in ExpressionEditor and press autocomplete and select "isFinite"
		Then I click on the validate link.
		Then I verify error "Cannot have value isFinite"
		Then I click on the "OK" button

	Scenario: Test of expression editor control in a structure cell
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "summaryPanel_paramDef.json" of type "parameterDefs"

		# Select an existing row in the table and change it's value in the expression control
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I select the row 1 in the table "expressionCellTable"
		Then I verify that the "ExpressionEditor" control is displayed
		Then I enter "first" in ExpressionEditor and press autocomplete and select "first_index"
		Then I click on the "Configure Derive Node" panel OK button
		Then I verify that the summary list contains the value of "first_index" for the "Configure Derive Node" summary link in the "Structure List Table" category

		# Add a new row to the table and change it's value in the expression control
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click the "Add" button on the "expressionCellTable" table
		Then I select the row 2 in the table "expressionCellTable"
		Then I enter "is_" in ExpressionEditor and press autocomplete and select "is_date"
		Then I click on the "Configure Derive Node" panel OK button
		Then I verify that the summary list contains the value of "is_date" for the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click on the "OK" button
		Then I verify that the event log has a value of "is_date" for the "expressionCellTable" parameter

		Given I have toggled the app side common-properties panel

	Scenario: Test of expression builder
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "expressionControl_paramDef.json" of type "parameterDefs"

		Then I click on the expression build button for the "defaultExpr" property

		# generate a success validate
		Then I click on the validate link on the expression builder in the sub-panel.
		Then I validate the "canvas-state-icon-success" icon on the expression builder.

		# verify the icon goes away on the next input
		Then I select "Age" from the "defaultExpr" property.
		Then I validate the "none" icon on the expression builder.

		# generate a error
		Then I select the "Functions" tab for the "defaultExpr" property.
		# TODO: need to scroll to row before it becomes visible
		Then I select "is_integer(ITEM)" from the "defaultExpr" property.
		Then I click on the validate link on the expression builder in the sub-panel.
		Then I verify error "Expression cannot contain '?'"
		Then I validate the "canvas-state-icon-error" icon on the expression builder.

		# substitute a param char '?' (dependent on the test above)
		Then I select the "Fields" tab for the "defaultExpr" property.
		Then I select "Age" from the "defaultExpr" property.
		Then I validate the "none" icon on the expression builder.

	Scenario: Test of Python and R expression controls
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "Python_ExpressionControl_paramDef.json" of type "parameterDefs"

		# test Python autocomplete and syntax highlighting
		Then I verify "foo" is a "def" in ExpressionEditor
		Then I verify "testVar" is a "variable" in ExpressionEditor
		Then I verify "property" is a "property" in ExpressionEditor
		Then I verify "# comment" is a "comment" in ExpressionEditor
		Then I verify "1" is a "number" in ExpressionEditor
		Then I verify "<" is a "operator" in ExpressionEditor
		Then I verify "if" is a "keyword" in ExpressionEditor
		Then I verify "abs" is a "builtin" in ExpressionEditor
		Then I enter "is" in ExpressionEditor and press autocomplete and verify that 3 autocomplete hints are displayed
		Then I enter "a" in ExpressionEditor and press autocomplete and select "age" a "variable"
		Then I enter "and" in ExpressionEditor and verify it is a "keyword"
		Then I enter "age" in ExpressionEditor and verify it is a "variable"
		Then I enter "=" in ExpressionEditor and verify it is a "operator"
		Then I enter "120" in ExpressionEditor and verify it is a "number"
		Then I enter "this is a string" in ExpressionEditor and verify it is a "string"

		# placeholder text and validation
		Given I have uploaded common-properties file "R_ExpressionControl_paramDef.json" of type "parameterDefs"

		# test R autocomplete and syntax highlighting
		Then I verify "# syntax testing" is a "comment" in ExpressionEditor
		Then I verify "1" is a "number" in ExpressionEditor
		Then I verify "text" is a "string" in ExpressionEditor
		Then I verify "\n" is a "string-2" in ExpressionEditor
		Then I verify "`x`" is a "variable-3" in ExpressionEditor
		Then I verify "=" is a "operator" in ExpressionEditor
		Then I verify "`x`" is a "variable-3" in ExpressionEditor
		Then I verify "function" is a "keyword" in ExpressionEditor
		Then I verify "Inf" is a "atom" in ExpressionEditor
		Then I verify "return" is a "builtin" in ExpressionEditor
		Then I verify "%var-2%" is a "variable-2" in ExpressionEditor
		Then I verify "<-" is a "arrow" in ExpressionEditor
		Then I verify "=" is a "arg-is" in ExpressionEditor
		Then I verify ";" is a "semi" in ExpressionEditor
		Then I enter "br" in ExpressionEditor and press autocomplete and verify that 5 autocomplete hints are displayed
		Then I enter "li" in ExpressionEditor and press autocomplete and verify that 6 autocomplete hints are displayed
		Then I enter "a" in ExpressionEditor and press autocomplete and select "age" a "variable"
		Then I enter "if" in ExpressionEditor and verify it is a "keyword"
		Then I enter "age" in ExpressionEditor and verify it is a "variable"
		Then I enter "=" in ExpressionEditor and verify it is a "operator"
		Then I enter "120" in ExpressionEditor and verify it is a "number"
		Then I enter "this is a string" in ExpressionEditor and verify it is a "string"
