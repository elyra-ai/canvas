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

		Then I click the zoom in button on the toolbar
		Then I verify zoom transform value is "translate(143.5,4.849999999999994) scale(1.1)"

		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(188,30) scale(1)"

		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(143.5,4.849999999999994) scale(1.1)"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(228.4545454545455,52.863636363636374) scale(0.9090909090909091)"

		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I verify zoom transform value is "translate(-155.34464500000047,-164.04759150000027) scale(1.771561000000001)"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(329.0590123625436,109.72211597568476) scale(0.6830134553650705)"

	Scenario: Test to see if zoom is NOT preserved with 'Save Zoom' set to 'None'
		Then I resize the window size to 1330 width and 660 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "None" save zoom parameter
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Then I pause for 1 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(178.6649135987979,92.54432757325321) scale(0.7513148009015777)"

		# Now I load the blank canvas so I can return to the original canvas to make
		# sure the zoom amount has returned to the default
		Given I have uploaded diagram "/test_resources/diagrams/blankCanvas.json"

		# Now I reload the original canvas and the zoom should return to the default
		# zoom because we are using None for the 'Save Zoom' parameter.
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Then I pause for 1 seconds
		Then I verify zoom transform value is "null"

	Scenario: Test to see if zoom IS preserved with 'Save Zoom' set to 'LocalStorage'
		Then I resize the window size to 1330 width and 660 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "LocalStorage" save zoom parameter
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Then I pause for 1 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(178.6649135987979,92.54432757325321) scale(0.7513148009015777)"

		# Now I load the blank canvas so I can return to the original canvas to make
		# sure the zoom amount has returned to the default
		Given I have uploaded diagram "/test_resources/diagrams/blankCanvas.json"

		# Now I reload the original canvas and the zoom should return to the default
		# zoom because we are using None for the 'Save Zoom' parameter.
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel
		Then I pause for 1 seconds
		Then I verify zoom transform value is "translate(178.6649135987979,92.54432757325321) scale(0.7513148009015777)"

	Scenario: Test to see if zoom IS saved in the pipeline flow with 'Save Zoom' set to 'Pipelineflow'
		Then I resize the window size to 1330 width and 660 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Pipelineflow" save zoom parameter
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Then I pause for 1 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(178.6649135987979,92.54432757325321) scale(0.7513148009015777)"

		# Check to see if the zoom amount in the canvas info for this pipeline
		# is correct.
		Then I verify primary pipeline zoom in canvas info: x = 178.6649135987979 y = 92.54432757325321 k = 0.7513148009015777
