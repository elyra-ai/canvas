Feature: ExpressionControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties expression control
	So I can test the expression controls in common-properties


	Scenario: Test of expression editor control
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "CLEM_FilterRows_paramDef.json"

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
		Then I enter "=" in ExpressionEditor and verify it is a "operator"
		Then I enter "120" in ExpressionEditor and verify it is a "number"
		Then I enter "this is a string" in ExpressionEditor and verify it is a "string"
		Then I enter "first" in ExpressionEditor and press autocomplete and select "first_index" and verify save

		# placeholder text and validation
		Given I have toggled the app side common-properties panel
		Given I have uploaded JSON for common-properties "Javascript_FilterRows_paramDef.json"
		Then I verify that the placeholder text is "Enter JavaScript text" in ExpressionEditor
		Then I enter "i" in ExpressionEditor and press autocomplete and select "isFinite"
		Then I click on the validate link.
		Then I verify error "Cannot have value isFinite"
		Then I click on the "OK" button

		Given I have toggled the app side common-properties panel

	Scenario: Test of expression editor control in a structure cell
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "flyout" properties container type
		Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"

		# Select an existing row in the table and change it's value in the expression control
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I select the row 1 in the table "expressionCellTable"
		Then I verify that the "ExpressionEditor" control is displayed
		Then I enter "first" in ExpressionEditor and press autocomplete and select "first_index"
		Then I click on the "expressionCellTable-summary-panel" panel OK button
		Then I verify that the summary list contains the value of "first_index" for the "Configure Derive Node" summary link in the "Structure List Table" category

		# Add a new row to the table and change it's value in the expression control
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click the "Add" button on the "expressionCellTable" table
		Then I select the row 2 in the table "expressionCellTable"
		Then I enter "is_" in ExpressionEditor and press autocomplete and select "is_date"
		Then I click on the "expressionCellTable-summary-panel" panel OK button
		Then I verify that the summary list contains the value of "is_date" for the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click on the "OK" button
		Then I verify that the event log has a value of "is_date" for the "expressionCellTable" parameter

		Given I have toggled the app side common-properties panel

	Scenario: Test of expression builder
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "expressionControl_paramDef.json"

		Then I click on the expression build button for the "defaultExpr" property

		# generate a success validate
		Then I click on the validate link on the expression "builder" for the "defaultExpr" property.
		Then I validate the "success" icon on the expression "builder" for the "defaultExpr" property.

		# verify the icon goes away on the next input
		Then I select "Age" from the "field" table for the "defaultExpr" property.
		Then I validate the "none" icon on the expression "builder" for the "defaultExpr" property.

		# generate a error
		Then I select the "Functions" tab for the "defaultExpr" property.
		Then I select "to_integer(Item)" from the "functions" table for the "defaultExpr" property.
		Then I click on the validate link on the expression "builder" for the "defaultExpr" property.
		Then I verify error "Expression cannot contain '?'"
		Then I validate the "error" icon on the expression "builder" for the "defaultExpr" property.

		# substitute a param char '?' (dependent on the test above)
		Then I select the "Fields and Values" tab for the "defaultExpr" property.
		Then I select "Age" from the "field" table for the "defaultExpr" property.
		Then I validate the "none" icon on the expression "builder" for the "defaultExpr" property.
