Feature: CommonPropertiesFlyout

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties
	So I can test the various controls in common-properties in flyout

	Scenario: Sanity test of common-properties using flyout
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# Titles Test Case
			Given I have uploaded JSON for common-properties "spark.DecisionTreeClassifier.json"
			Then I see common properties flyout title "Decision Tree Classifier"
			Then I click on title edit icon
			Then I enter new title "Decision Tree Classification"
			Then I click on modal OK button
			Then I verify the new title "Decision Tree Classification"

		# Readonly Title Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "readonly_paramDef.json"
			Then I see common properties flyout title "Readonly Fields"
			Then I verify there is no title edit icon

		# Help Icon Test Case for param_def with help object that has help data
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.DecisionTreeClassifier.json"
			Then I click on the help icon in the fly-out panel
			Then I verify the help icon for id "org.apache.spark.ml.classification.DecisionTreeClassifier" with help data was clicked

		# Help Icon Test Case for form with help object that has help data
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "aggregate.json"
			Then I click on the help icon in the fly-out panel
			Then I verify the help icon for id "aggregate" with help data was clicked

		# Help Icon Test Case for param_def with no help object specified
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.Filter.json"
			Then I verify there is no help icon in the fly-out panel

		# Help Icon Test Case for form with no help object specified
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "cart.json"
			Then I verify there is no help icon in the fly-out panel

		# Help Icon Test Case for param_def with help object that has no help data
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "costs_paramDef.json"
			Then I click on the help icon in the fly-out panel
			Then I verify the help icon for id "cart" with no help data was clicked

		# Help Icon Test Case for form with help object that has no help data
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "derive.json"
			Then I click on the help icon in the fly-out panel
			Then I verify the help icon for id "derive" with no help data was clicked

		# Help Icon Test Case for form with help object, help data and app_data
			Given I have toggled the app side panel
			Given I have selected the "D3" rendering engine
			Given I have uploaded diagram "/test_resources/diagrams/allNodes.json"
			Given I have toggled the app side panel
			Then I click the "Aggregate" node to select it
			Then I click on the help icon in the fly-out panel
			Then I verify the help icon for id "aggregate" with help data was clicked
			Then I verify the help data contains app data

		# TextBox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.AddColumn.json"
			Then I see common properties flyout title "Add Column"
			Then I enter text "testValue" in the "editor-control-colName" textbox control
			Then I click on the "OK" button
			Then I verify the event log for the "colName" parameter contains "testValue"

		# Dropdown Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.AddColumn.json"
			Then I select "Continuous" dropdown option

		# Radio Button, Number Textbox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.DecisionTreeClassifier.json"
			Then I click the "Advanced Parameters" category from flyout
			Then I select "gini" radio button for Impurity from flyout

		# Checkbox, Generate TextBox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.Sample.json"
			Then I select Repeatable partition assignment checkbox and click Generate from flyout

		# ToggleText, Table Reorder Rows
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.Sort.json"
			Then I change Order for Drug field and reorder

		# Validation Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.DecisionTreeClassifier.json"
			Then I click the "Advanced Parameters" category from flyout
			Then I check for validation error on Checkpoint Interval from flyout

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.RenameColumn.json"
			Then I check for table cell level validation from flyout

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "spark.RenameColumn.json"
			Then I check for table validation

		# Auto expand panel if theres only one
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Spark_SelectStorage_paramDef.json"
			Then I check table cell enablement in flyout
			Then I click the "Settings" category from flyout
			Then I click the "Settings" category from flyout
			Then I open the "Configure field types" wide flyout panel
			Then I close the wideFlyout dialog
			Then I have closed the common properties dialog by clicking on close button

		# Sub Panel Validation
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I click the "Tables" category from flyout
			Then I open the "Configure Table Input" wide flyout panel
			Then I check the checkbox with id "editor-control-enableTableLists"
			Then I click the subpanel edit button on row "1" from the "flexible-table-structurelisteditorTableInput" table
			Then I enter text "Hellopwd" in the "editor-control-name_0" textbox control
			Then I verify that the validation error is "name should not contain pw"
			Then I enter text "Age" in the "editor-control-name_0" textbox control
			Then I verify that the validation warning is "name cannot be an existing column name"
			Then I close the subPanel dialog
			Then I close the wideFlyout dialog
			Then I have closed the common properties dialog by clicking on close button

		# Complex Field Picker
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I click the "Columns" category from flyout
			Then I click on Add Columns button to open field picker at index "0"
			Then I select the "Drug" checkbox
			Then I click on the "OK" button
			Then I verify that the "columnSelectSharedWithInput" parameter has 2 values
			Then I click on Add Columns button to open field picker at index "1"
			Then I verify "Drug" is not present second input control
			Then I select the "Na" checkbox
			Then I click on the "OK" button
			Then I verify that the "columnSelectInputFieldList" parameter has 3 values
			Then I click on Add Columns button to open field picker at index "0"
			Then I verify "Na" is not present first input control
			Then I click on the "OK" button
			Then I click the "Tables" category from flyout
			Then I open the "Configure Sort Order" wide flyout panel
			Then I click on Add Columns button to open field picker at index "2"
			Then I select the "Age" checkbox
			Then I click on the "OK" button
			Then I verify the "flexible-table-structuretableSortOrder" table has 2 rows
			Then I verify that "Cholesterol" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableSortOrder"
			Then I verify that "Age" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableSortOrder"
			Then I have closed the common properties dialog by clicking on close button

		# Number Textbox Box with Decimal Number Test
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I update the value of Seed textbox with "10213"
			Then I verify the value of Seed textbox with "10213"
			Then I have closed the common properties dialog by clicking on close button
