Feature: Zoom

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test zoom operations
	So I can build a canvas and perform zoom operations

	Scenario: Sanity test for zoom operations
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		Then I click the zoom in button on the toolbar
		Then I verify zoom transform value is "translate(139.5,7.349999999999994) scale(1.1)"

		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(184,32.5) scale(1)"

		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(139.5,7.349999999999994) scale(1.1)"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(224.4545454545455,55.363636363636374) scale(0.9090909090909091)"

		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I verify zoom transform value is "translate(-159.34464500000047,-161.54759150000027) scale(1.771561000000001)"

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
		Then I verify zoom transform value is "translate(325.0590123625436,112.22211597568476) scale(0.6830134553650705)"

	Scenario: Test to see if zoom is NOT preserved with 'Save Zoom' set to 'None'
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedSaveZoom": "None"}""
		Given I have uploaded diagram "commentColorCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)"

		# Now I load the blank canvas so I can return to the original canvas to make
		# sure the zoom amount has returned to the default
		Given I have uploaded diagram "blankCanvas.json"

		# Now I reload the original canvas and the zoom should return to the default
		# zoom because we are using None for the 'Save Zoom' parameter.
		Given I have uploaded diagram "commentColorCanvas.json"
		Then I verify zoom transform value is "null"

	Scenario: Test to see if zoom IS preserved with 'Save Zoom' set to 'LocalStorage'
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedSaveZoom": "LocalStorage"}""
		Given I have uploaded diagram "commentColorCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)"

		# Now I load the blank canvas so I can return to the original canvas to make
		# sure the zoom amount has returned to the default
		Given I have uploaded diagram "blankCanvas.json"

		# Now I reload the original canvas and the zoom should return to the default
		# zoom because we are using 'LocalStorage' for the 'Save Zoom' parameter.
		Given I have uploaded diagram "commentColorCanvas.json"
		Then I verify zoom transform value is "translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)"

	Scenario: Test to see if zoom IS saved in the pipeline flow with 'Save Zoom' set to 'Pipelineflow'
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedSaveZoom": "Pipelineflow"}""
		Given I have uploaded diagram "commentColorCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		# The zoom will be the default which is null
		Then I verify zoom transform value is "null"

		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(294.6649135987979,95.04432757325321) scale(0.7513148009015777)"

		# Check to see if the zoom amount in the canvas info for this pipeline
		# is correct.
		Then I verify primary pipeline zoom in canvas info: x = 294.6649135987979 y = 95.04432757325321 k = 0.7513148009015777
