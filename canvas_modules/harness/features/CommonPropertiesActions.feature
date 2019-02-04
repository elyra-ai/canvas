Feature: CommonPropertiesActions

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test action controls
	So I can test the their special properties

	Scenario: Test of actions
		Then I resize the window size to 1400 width and 800 height
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

	Scenario: Test of text styling and word wrapping
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded JSON for common-properties "readonly_paramDef.json"

		Then I verify readonly control "readonly_text" value is "The more I study, the more insatiable do I feel my genius for it to be. 'Ada Lovelace'"
		Then I verify readonly control "readonly_text" CSS style "overflow-wrap" is "break-word"

	Scenario: Test of ellipsis activation for a long readonly text
    Then I resize the window size to 1400 width and 800 height
    Given I am on the test harness
    Given I have toggled the app side common-properties panel
    Then I have selected the "Flyout" properties container type
    Given I have uploaded JSON for common-properties "structuretable_paramDef.json"
    Then I open the "Configure Rename fields" summary link in the "TABLES" category
    Then I click the subpanel button in control "structuretableReadonlyColumnDefaultIndex" in row "0"
    Then I enter "This is a very long sentence of text to test whether or not an overflow of text occurs" in textfield "structuretableReadonlyColumnDefaultIndex_0_3" in parent control "structuretableReadonlyColumnDefaultIndex" in row "0"
    Then I click the subpanel button "OK" button in control "structuretableReadonlyColumnDefaultIndex" in row "0"
    Then I verify readonly control "structuretableReadonlyColumnDefaultIndex_0_3" has no text overflow.
