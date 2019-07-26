	Feature: Error Marker feature

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want test extra canvas operations
	So I can build a canvas and perform node operations

	Scenario: Sanity test to check if error markers are being displayed OK
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedNodeFormat": "Vertical"}""
		Given I have uploaded diagram "errorMarkerCanvas.json"

		Then I verify the "Error" node has an error marker
		Then I verify the "Warning" node has a warning marker
		Then I verify the "Supernode1" node has a warning marker

		Then I verify the "Filter" node in the subflow in the "Supernode3" supernode has an error marker
		Then I verify the "Select" node in the subflow in the "Supernode1" supernode has no error or warning marker

		# Now check to ensure that no error markers are shown when the messages are cleared.
		Then I clear the messages from nodes on the canvas

		Then I verify the "Error" node has no error or warning marker
		Then I verify the "Warning" node has no error or warning marker
		Then I verify the "Supernode1" node has no error or warning marker

		Then I verify the "Filter" node in the subflow in the "Supernode3" supernode has no error or warning marker
		Then I verify the "Select" node in the subflow in the "Supernode1" supernode has no error or warning marker
