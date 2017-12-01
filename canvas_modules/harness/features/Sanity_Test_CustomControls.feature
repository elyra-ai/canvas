Feature: Sanity_Test_CustomControls

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test custom controls
	So I can test the their special properties

	Scenario: Test of custom panels
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Modal" properties container type
		Given I have uploaded JSON for common-properties "CustomPanel_paramDef.json"

		Then I click on toggle 0
		Then I select the Tab 2
		Then I click on slider
		Then I click on modal OK button
		Then I verify custom panel

	Scenario: Test of custom control with structure property
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Given I have uploaded JSON for common-properties "CustomMap_paramDef.json"

		Then I show the map and go to SVL
		Then I verify custom control with structure property
