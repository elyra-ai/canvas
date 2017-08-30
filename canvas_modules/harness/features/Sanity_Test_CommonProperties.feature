Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties
	So I can test the various controls in common-properties
	@watch

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
				Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
				Then I enter "v1+v2" in the Expression textarea

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

			# Sub Panel Validation
				Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
				Then I select the Tab 5
				Then I open the Table Input Sub Panel
				Then I update the value of Name textbox with "Hellopwd"
				Then I verify that the validation error is "name should not contain pw"
				Then I close the subPanel dialog
				Then I have closed the common properties dialog by clicking on close button

		Given I have toggled the app side common-properties panel
