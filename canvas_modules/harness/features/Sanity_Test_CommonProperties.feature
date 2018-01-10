Feature: Sanity_Test_CommonProperties

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties
	So I can test the various controls in common-properties


	Scenario: Sanity test of common-properties
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type

		# Titles Test Case
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I see common properties title "Add Column"
			Then I have closed the common properties dialog by clicking on close button

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Distinct.json"
			Then I see common properties title "Distinct"
			Then I have closed the common properties dialog by clicking on close button

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Filter.json"
			Then I see common properties title "Filter Rows"
			Then I have closed the common properties dialog by clicking on close button

		# TextBox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I enter text "testValue" in the "editor-control-colName" textbox control
			Then I click on the "OK" button
			Then I verify the event log for the "colName" parameter contains "testValue"

		# Dropdown Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I select "Continuous" dropdown option

		# Radio Button, Number Textbox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I select "gini" radio button for Impurity

		# Checkbox, Generate TextBox Test Case
			Given I have toggled the app side common-properties panel
		 	Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Sample.json"
		 	Then I select Repeatable partition assignment checkbox and click Generate

		# ToggleText, Table Reorder Rows
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Sort.json"
			Then I change Order for Drug field and reorder

		# Validation Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I check for validation error on Checkpoint Interval
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.RenameColumn.json"
			Then I check for table cell level validation
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.RenameColumn.json"
			Then I check for table validation
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Spark_SelectStorage_paramDef.json"
			Then I check table cell enablement

		# Sub Panel Validation
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I select the Tab 6
			Then I check the checkbox with id "editor-control-enableTableLists"
			Then I click the subpanel edit button on row "1" from the "flexible-table-structurelisteditorTableInput" table
			Then I enter text "Hellopwd" in the "editor-control-name" textbox control
			Then I verify that the validation error is "name should not contain pw"
			Then I enter text "Age" in the "editor-control-name" textbox control
			Then I verify that the validation warning is "name cannot be an existing column name"
			Then I close the subPanel dialog
			Then I have closed the common properties dialog by clicking on close button

		# Complex Field Picker
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I select the Tab 2
			Then I click on Add Columns button to open field picker at index "0"
			Then I add "Drug" to first input control
			Then I click on Add Columns button to open field picker at index "1"
			Then I verify "Drug" is not present second input control
			Then I add "Na" to second input control
			Then I click on Add Columns button to open field picker at index "0"
			Then I verify "Na" is not present first input control
			Then I have closed the common properties dialog by clicking on close button
			Given I have toggled the app side common-properties panel
