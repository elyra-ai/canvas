Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test complex undo/redo operations
	So I can build a canvas and perform complex undo/redo operations with various user operations
@watch
	Scenario: Sanity test for Complex Disconnect and Delete undo/redo operations with the D3 rendering engine
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have selected the "D3" rendering engine
		Given I have toggled the app side panel

		# Complex do/undo/redo tests

		Then I pause for 3 seconds
		Then I open the palette
		Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 150, 450
		Then I add node 8 a "Sort" node from the "Record Ops" category onto the canvas at 300, 450
		Then I close the palette

		Then I disconnect links for node 4 a "Neural Net" on the canvas
		Then I delete node 4 the "Neural Net" node
		Then I verify the number of nodes are 7
		Then I verify the number of data links are 4
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of data links are 4
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of data links are 5
		Then I click redo
		Then I verify the number of nodes are 8
		Then I verify the number of data links are 4
		Then I click redo
		Then I verify the number of nodes are 7
		Then I verify the number of data links are 4
