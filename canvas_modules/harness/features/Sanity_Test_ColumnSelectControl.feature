Feature: Sanity_Test_ColumnSelectControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties column select control
	So I can test the column select controls in common-properties

	Scenario: Test of basic features of column select control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"

		#### add fields features in modal
		# add a single field
		Then I select the "Values" tab in "modal"
		Then I select the "add-fields-button" button on the "fields1_panel" parameter
		Then I select the "Na" checkbox
		Then I select the field picker "back" button to save my changes
		Then I verify that the "fields1_panel" parameter contains the "Na" value
		Then I verify that the "fields1_panel" parameter has 2 values
		Then I select the "apply" button in "modal"
		Then I verify the event log for the "fields1_panel" parameter contains "age,Na"

		# add all fields in modal
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "Values" tab in "modal"
		Then I select the "add-fields-button" button on the "fields2_panel" parameter
		Then I select the "all" checkbox
		Then I select the field picker "back" button to save my changes
		Then I verify that the "fields2_panel" parameter has 15 values
		Then I select the "apply" button in "modal"

		#### add fields features in flyout
		# add a single field
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "add-fields-button" button on the "fields1_panel" parameter
		Then I select the "Na" checkbox
		Then I click on the "OK" button
		Then I verify that the "fields1_panel" parameter contains the "Na" value
		Then I verify that the "fields1_panel" parameter has 2 values
		Then I select the "apply" button in "flyout"


		# add all fields in flyout
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "add-fields-button" button on the "fields2_panel" parameter
		Then I select the "all" checkbox
		Then I click on the "OK" button
		Then I verify that the "fields2_panel" parameter has 15 values
		Then I select the "apply" button in "flyout"
		Given I have toggled the app side common-properties panel

		# add a field in summary panel in flyout
		# remove one field
		# remove all fields

	Scenario: Test of conditions of column select control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"

		#### warning, error, disable, enable, visible conditions in modal
		# error message
		Then I select the "Conditions" tab in "modal"
		Then I select the "BP" row in the "fields_error" panel
		Then I select the "remove-fields-button-enabled" button on the "fields_error" parameter
		Then I validate the "error" message for the "fields_error" parameter of "Required parameter 'Field Error' has no value"
		Then I select the "apply" button in "modal"
		Then I verify the event log has the "error" message for the "fields_error" parameter of "Required parameter 'Field Error' has no value"

		# warning message
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "Conditions" tab in "modal"
		Then I select the "Na" row in the "fields_warning" panel
		Then I select the "remove-fields-button-enabled" button on the "fields_warning" parameter
		Then I select the "add-fields-button" button on the "fields_warning" parameter
		Then I select the "age" checkbox
		Then I select the field picker "back" button to save my changes
		Then I validate the "warning" message for the "fields_warning" parameter of "Shouldn't select 'age'"
		Then I select the "apply" button in "modal"
		Then I verify the event log has the "warning" message for the "fields_warning" parameter of "Shouldn't select 'age'"

		# visible
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "Conditions" tab in "modal"
		Then I verify that "fields_hidden" is hidden
		Then I select the "hide" enable button
		Then I verify that "fields_hidden" is not hidden

		# enable
		Then I select the "Conditions" tab in "modal"
		Then I verify that "fields_disabled" is disabled
		Then I select the "disable" enable button
		Then I verify that "fields_disabled" is enabled
		Then I select the "apply" button in "modal"

		# warning, error, disable, enable, visible conditions in flyout
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"

		# error message
		Then I select the "Conditions" tab in "flyout"
		Then I select the "BP" row in the "fields_error" panel
		Then I select the "remove-fields-button-enabled" button on the "fields_error" parameter
		Then I validate the "error" message for the "fields_error" parameter of "Required parameter 'Field Error' has no value"
		Then I select the "apply" button in "flyout"
		Then I verify the event log has the "error" message for the "fields_error" parameter of "Required parameter 'Field Error' has no value"

		# warning message
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "Conditions" tab in "flyout"
		Then I select the "Na" row in the "fields_warning" panel
		Then I select the "remove-fields-button-enabled" button on the "fields_warning" parameter
		Then I select the "add-fields-button" button on the "fields_warning" parameter
		Then I select the "age" checkbox
		Then I click on the "OK" button
		Then I validate the "warning" message for the "fields_warning" parameter of "Shouldn't select 'age'"
		Then I select the "apply" button in "flyout"
		Then I verify the event log has the "warning" message for the "fields_warning" parameter of "Shouldn't select 'age'"

		# visible
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "selectcolumns_paramDef.json"
		Then I select the "Conditions" tab in "flyout"
		Then I verify that "fields_hidden" is hidden
		Then I select the "hide" enable button
		Then I verify that "fields_hidden" is not hidden

		# enable
		Then I verify that "fields_disabled" is disabled
		Then I select the "disable" enable button
		Then I verify that "fields_disabled" is enabled
		Then I select the "apply" button in "flyout"
