Feature: Sanity_Test_CustomControls

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test custom controls
	So I can test the their special properties

	Scenario: Test of custom panels
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "CustomPanel_paramDef.json"

		Then I click the "TOGGLE" category from flyout
		Then I click on toggle 0
		Then I click the "MAP AND SLIDER" category from flyout
		Then I open the "Configure Map" summary link in the "MAP AND SLIDER" category
		Then I verify that a wideflyout dialog has opened
		Then I show the map and go to Armonk
		Then I click on modal OK button
		Then I open the "Configure Slider" summary link in the "MAP AND SLIDER" category
		Then I validate the dropdown has 7 options
		Then I click on slider
		Then I validate the dropdown has 4 options
		Then I click on modal OK button
		Then I pause for 1 seconds
		Then I verify custom summary panel
		Then I click on modal OK button
		Then I verify custom panel
