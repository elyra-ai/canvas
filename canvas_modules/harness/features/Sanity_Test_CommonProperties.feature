Feature: Sanity_Test_CommonProperties

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties
	So I can test the various controls in common-properties


	Scenario: Sanity test of common-properties
		Given I am on the test harness
		Given I have toggled the app side common-properties panel

		# Titles Test Case
			Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
			Then I see common properties title "Add Column"
			Then I have closed the common properties dialog by clicking on close button

			Given I have uploaded JSON for common-properties "Spark_DecisionTree_paramDef.json"
			Then I see common properties title "Decision Tree Classifier"
			Then I have closed the common properties dialog by clicking on close button

			Given I have uploaded JSON for common-properties "Spark_Distinct_paramDef.json"
			Then I see common properties title "Distinct"
			Then I have closed the common properties dialog by clicking on close button

			Given I have uploaded JSON for common-properties "Spark_FilterRows_paramDef.json"
			Then I see common properties title "Filter Rows"
			Then I have closed the common properties dialog by clicking on close button

		# TextBox Test Case
			Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
			Then I enter "testValue" in the Column name textbox

		# Dropdown Test Case
			Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
			Then I select "Continuous" dropdown option

		# TextArea Test Case
		# Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
		# Then I enter "v1+v2" in the Expression textarea

		# Select Textbox, Field Picker Test, Table Checkbox Case
			Given I have uploaded JSON for common-properties "Spark_DecisionTree_paramDef.json"
		 	Then I select "Age" option from Input columns select textbox

		# Radio Button, Number Textbox Test Case
			Given I have uploaded JSON for common-properties "Spark_DecisionTree_paramDef.json"
			Then I select "gini" radio button for Impurity

		# Checkbox, Generate TextBox Test Case
		 	Given I have uploaded JSON for common-properties "Spark_Sample_paramDef.json"
		 	Then I select Repeatable partition assignment checkbox and click Generate

		# ToggleText, Table Reorder Rows
			Given I have uploaded JSON for common-properties "Spark_Sort_paramDef.json"
			Then I change Order for Drug field and reorder

		# Validation Test Case
			Given I have uploaded JSON for common-properties "Spark_DecisionTree_paramDef.json"
			Then I check for validation error on Checkpoint Interval
			Given I have uploaded JSON for common-properties "Spark_RenameColumns_paramDef.json"
			Then I check for table cell level validation
			Given I have uploaded JSON for common-properties "Spark_RenameColumns_paramDef.json"
			Then I check for table validation
			Given I have uploaded JSON for common-properties "Spark_SelectStorage_paramDef.json"
			Then I check table cell enablement

		# Sub Panel Validation
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I select the Tab 6
			Then I open the Table Input Sub Panel
			Then I update the value of Name textbox with "Hellopwd"
			Then I verify that the validation error is "name should not contain pw"
			Then I update the value of Name textbox with "Age"
			Then I verify that the validation warning is "name cannot be an existing column name"
			Then I close the subPanel dialog
			Then I have closed the common properties dialog by clicking on close button

		# Complex Field Picker
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I select the Tab 2
			Then I add "Drug" to first input control
			Then I verify "Drug" is not present second input control
			Then I add "Na" to second input control
			Then I verify "Na" is not present first input control
			Then I have closed the common properties dialog by clicking on close button
			Given I have toggled the app side common-properties panel

@watch
	Scenario: Test of expression editor control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Given I have uploaded JSON for common-properties "CLEM_FilterRows_paramDef.json"

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

		Given I have uploaded JSON for common-properties "Javascript_FilterRows_paramDef.json"
		Then I verify that the placeholder text is "Enter JavaScript text" in ExpressionEditor
		Then I enter "" in ExpressionEditor and press autocomplete and verify error "The condition expression cannot be empty" and save

		Given I have toggled the app side common-properties panel
