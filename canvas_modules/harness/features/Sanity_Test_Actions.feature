Feature: Sanity_Test_Actions

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test action controls
	So I can test the their special properties

	Scenario: Test of actions
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "action_paramDef.json"

		Then I click the "Increment" action
		Then I click the "Increment" action
		Then I click the "Increment" action
		Then I verify that readonly value is "3"
		Then I click the "Decrement" action
		Then I verify that readonly value is "2"
