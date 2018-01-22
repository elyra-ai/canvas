Feature: Sanity_Test_OneofSelectControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties one of select control
	So I can test the one of select control in common-properties

	Scenario: Test of basic features of column select control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "oneofselect_paramDef.json"

		# test isNotEmpty condition in oneofselect control
		# add a single field
		Then I click the dropdown menu in the "oneofselect-control-container" container
		Then I verify that the validation warning is "Warning: this cannot be empty"
