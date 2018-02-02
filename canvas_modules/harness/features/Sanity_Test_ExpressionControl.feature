Feature: Sanity_Test_ExpressionControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties expression control
	So I can test the expression controls in common-properties


	Scenario: Test of expression editor control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
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
		Then I verify error "Cannot have value isFinite"
		Then I click on the "OK" button

		Given I have toggled the app side common-properties panel

	Scenario: Test of expression editor control in a structure cell
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "flyout" properties container type
		Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"

		# Select an existing row in the table and change it's value in the expression control
		Then I open the "Structure List Table" category
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I select the row 1 in the table "editor-control-expressionCellTable"
		Then I verify that the "ExpressionEditor" control is displayed
		Then I enter "first" in ExpressionEditor and press autocomplete and select "first_index"
		Then I click on the "OK" button
		Then I verify that the summary list contains the value of "first_index" for the "Configure Derive Node" summary link in the "Structure List Table" category

		# Add a new row to the table and change it's value in the expression control
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click the "Add" button on the "expressionCellTable" table
		Then I select the row 2 in the table "editor-control-expressionCellTable"
		Then I enter "is_" in ExpressionEditor and press autocomplete and select "is_date"
		Then I click on the "OK" button
		Then I verify that the summary list contains the value of "is_date" for the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I click on the "OK" button
		Then I verify that the event log has a value of "is_date" for the "expressionCellTable" parameter
