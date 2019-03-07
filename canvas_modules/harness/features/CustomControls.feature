Feature: CustomControls

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test custom controls
	So I can test the their special properties

	Scenario: Test of custom panels
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "CustomPanel_paramDef.json"

		Then I click on toggle 0
		Then I click the "MAP AND SLIDER" category from flyout
		Then I open the "Configure Map" summary link in the "MAP AND SLIDER" category
		Then I verify that the "map-summary-panel" panel wideflyout dialog has opened
		Then I show the map
		Then I pause for 1 seconds
		Then I click on "zoom_out" button
		Then I pause for 1 seconds
		Then I validate map has error
		Then I click on "go_to_armonk" button
		Then I click on the "map-summary-panel" panel OK button
		Then I pause for 1 seconds
		Then I open the "Configure Slider" summary link in the "MAP AND SLIDER" category
		Then I verify that the "slider-summary-panel" panel wideflyout dialog has opened
		Then I validate the dropdown has 6 options
		Then I click on slider
		Then I validate the dropdown has 3 options
		Then I click on the "slider-summary-panel" panel OK button
		Then I pause for 1 seconds
		Then I verify custom summary panel
		Then I click on the "OK" button
		Then I verify custom panel
