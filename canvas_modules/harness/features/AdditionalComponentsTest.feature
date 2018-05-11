Feature: AdditionalComponentsTest

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a additionalComponents
	So I can test the various controls in additionalComponents

Scenario: Sanity test of additionalComponents using flyout
	Then I resize the window size to 1400 width and 800 height
	Given I am on the test harness
	Given I have toggled the app side common-properties panel
	Then I have selected the "Flyout" properties container type

	#Test the radio buttons
		Then I click on the toggle with label displayAdditionalComponents
		Given I have uploaded JSON for common-properties "CustomPanel_paramDef.json"
		Then I see common properties flyout title "Custom Panels"
		Then I click on "option1" radio button

Scenario: Sanity test of additionalComponents using modal
	Then I resize the window size to 1400 width and 800 height
	Given I am on the test harness
	Then I have toggled the app side common-properties panel
	Then I have selected the "Modal" properties container type

	#Test the radio buttons
		Then I click on the toggle with label displayAdditionalComponents
		Given I have uploaded JSON for common-properties "CustomPanel_paramDef.json"
		Then I see common properties title "Custom Panels"
		Then I click on "option1" radio button
