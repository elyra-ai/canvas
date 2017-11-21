Feature: Sanity_Test_CommonProperties_Flyout

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties
	So I can test the various controls in common-properties in flyout

	Scenario: Sanity test of common-properties using flyout
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# Titles Test Case
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I see common properties flyout title "Add Column"
			Then I have closed the common properties dialog by clicking on close button

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I see common properties flyout title "Decision Tree Classifier"
			Then I click on title edit icon
			Then I enter new title "Decision Tree Classification"
			Then I click on modal OK button
			Then I verify the new title "Decision Tree Classification"

		# TextBox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I open the "Settings" category from flyout
			Then I enter "testValue" in the Column name textbox

		# Dropdown Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.AddColumn.json"
			Then I open the "Settings" category from flyout
			Then I select "Continuous" dropdown option

		# Select Textbox, Field Picker Test, Table Checkbox Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I open the "Fields" category from flyout
			Then I select "Age" option from Input columns select textbox

		# Radio Button, Number Textbox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I open the "Advanced Parameters" category from flyout
			Then I select "gini" radio button for Impurity from flyout

		# Checkbox, Generate TextBox Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Sample.json"
			Then I open the "Settings" category from flyout
			Then I select Repeatable partition assignment checkbox and click Generate from flyout

		# ToggleText, Table Reorder Rows
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.Sort.json"
			Then I open the "Settings" category from flyout
			Then I change Order for Drug field and reorder

		# Validation Test Case
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.classification.DecisionTreeClassifier.json"
			Then I open the "Advanced Parameters" category from flyout
			Then I check for validation error on Checkpoint Interval from flyout

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.RenameColumn.json"
			Then I open the "Settings" category from flyout
			Then I check for table cell level validation from flyout

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "org.apache.spark.ml.ibm.transformers.RenameColumn.json"
			Then I open the "Settings" category from flyout
			Then I check for table validation

			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Spark_SelectStorage_paramDef.json"
			Then I open the "Settings" category from flyout
			Then I check table cell enablement

		# Sub Panel Validation
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I open the "Tables" category from flyout
			Then I check the checkbox with id "editor-control-enableTableLists"
			Then I open the Table Input Sub Panel from flyout
			Then I update the value of Name textbox with "Hellopwd"
			Then I verify that the validation error is "name should not contain pw"
			Then I update the value of Name textbox with "Age"
			Then I verify that the validation warning is "name cannot be an existing column name"
			Then I close the subPanel dialog
			Then I have closed the common properties dialog by clicking on close button

		# Complex Field Picker
			Given I have toggled the app side common-properties panel
			Given I have uploaded JSON for common-properties "Conditions_paramDef.json"
			Then I open the "Columns" category from flyout
			Then I add "Drug" to first input control
			Then I verify "Drug" is not present second input control
			Then I add "Na" to second input control
			Then I verify "Na" is not present first input control
			Then I have closed the common properties dialog by clicking on close button
			Given I have toggled the app side common-properties panel
