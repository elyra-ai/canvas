Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test zoom operations
	So I can build a canvas and perform zoom operations
@watch

	Scenario: Sanity test for zoom operations with the D3 rendering engine
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have selected the "D3" rendering engine
		Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		Then I verify zoom transform value is "translate(0,0) scale(1)"

		Then I click zoom in
		Then I verify zoom transform value is "translate(0,0) scale(1.2)"

		Then I click zoom out
		Then I verify zoom transform value is "translate(0,0) scale(1)"

		Then I click zoom in
		Then I click zoom in
		Then I click zoom out
		Then I verify zoom transform value is "translate(0,0) scale(1.2)"

		Then I click zoom out
		Then I click zoom out
		Then I click zoom in
		Then I click zoom out
		Then I verify zoom transform value is "translate(0,0) scale(0.8)"

		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I verify zoom transform value is "translate(0,0) scale(2)"

		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I click zoom out
		Then I verify zoom transform value is "translate(0,0) scale(0.2)"
