Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test multiple undo/redo operations
	So I can build a canvas and perform multiple undo/redo operations with user various operations
@watch
	Scenario: Sanity test for Multiple undo/redo operations with the D3 rendering engine
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/radialCanvas.json"
		Given I have selected the "D3" rendering engine
		Given I have toggled the app side panel

		# Multiple commands

		Then I open the palette
		Then I add node 22 a "Neural Net" node from the "Modeling" category onto the canvas at 150, 150
		Then I close the palette
		Then I verify the number of nodes are 22
		Then I click undo
		Then I verify the number of nodes are 21
		Then I click redo
		Then I verify the number of nodes are 22

		Then I select node 19 the "Filter" node
		Then I add comment 1 at location 150, 300 with the text "Some text comment."
		Then I click undo
		Then I click undo
		Then I verify the number of comments are 0
		Then I disconnect links for node 2 a "Var. File" on the canvas
		Then I verify the number of data links are 0
		Then I click undo
		Then I verify the number of data links are 20

		Then I link node 19 the "Filter" node to node 22 the "Neural Net" node for link 21 on the canvas
		Then I open the palette
		Then I add node 23 a "Select" node from the "Record Ops" category onto the canvas at 150, 250
		Then I close the palette
		Then I link node 23 the "Field Reorder" node to node 19 the "Filter" node for link 22 on the canvas
		Then I click undo
		Then I click redo
		Then I click undo
		Then I click undo
		Then I verify the number of nodes are 22
		Then I verify the number of data links are 21

		Then I pause for 3 seconds
