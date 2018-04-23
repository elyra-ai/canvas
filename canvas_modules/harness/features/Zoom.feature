Feature: Zoom

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test zoom operations
	So I can build a canvas and perform zoom operations

	Scenario: Sanity test for zoom operations
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		Then I resize the window size to 1330 width and 660 height

		Then I verify zoom transform value is "translate(0,0) scale(1)"

		Then I click zoom in
		Then I verify zoom transform value is "translate(143.5,4.849999999999994) scale(1.1)"

		Then I click zoom out
		Then I verify zoom transform value is "translate(188,30) scale(1)"

		Then I click zoom in
		Then I click zoom in
		Then I click zoom out
		Then I verify zoom transform value is "translate(143.5,4.849999999999994) scale(1.1)"

		Then I click zoom out
		Then I click zoom out
		Then I click zoom in
		Then I click zoom out
		Then I verify zoom transform value is "translate(228.4545454545455,52.863636363636374) scale(0.9090909090909091)"

		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I click zoom in
		Then I verify zoom transform value is "translate(-155.34464500000047,-164.04759150000027) scale(1.771561000000001)"

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
		Then I verify zoom transform value is "translate(329.0590123625436,109.72211597568476) scale(0.6830134553650705)"
