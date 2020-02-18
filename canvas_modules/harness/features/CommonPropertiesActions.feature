Feature: CommonPropertiesActions

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test action controls
	So I can test the their special properties

	Scenario: Test of actions
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "action_paramDef.json" of type "parameterDefs"

		Then I click the "Increment" action
		Then I click the "Increment" action
		Then I click the "Increment" action
		Then I verify that readonly value is "3"
		Then I click the "Decrement" action
		Then I verify that readonly value is "2"

	Scenario: Test of text styling and word wrapping
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded common-properties file "readonly_paramDef.json" of type "parameterDefs"

		Then I verify readonly control "readonly_text" value is "The more I study, the more insatiable do I feel my genius for it to be. 'Ada Lovelace'"
		Then I verify readonly control "readonly_text" CSS style "overflow-wrap" is "break-word"

	Scenario: Test of ellipsis activation for a long readonly text
    Then I resize the window size to 1400 width and 800 height

    Given I am on the test harness
    Given I have uploaded common-properties file "structuretable_paramDef.json" of type "parameterDefs"

    Then I open the "Configure Rename fields" summary link in the "Tables" category
    Then I click the subpanel button in control "structuretableReadonlyColumnDefaultIndex" in row "0"
    Then I enter "This is a very long sentence of text to test whether or not an overflow of text occurs" in textfield "structuretableReadonlyColumnDefaultIndex_0_3" in sub-panel "Rename Subpanel"
		Then I click on the "Rename Subpanel" panel OK button
    Then I verify readonly control "structuretableReadonlyColumnDefaultIndex_0_3" has no text overflow.
		Then I click on the "Configure Rename fields" panel OK button
