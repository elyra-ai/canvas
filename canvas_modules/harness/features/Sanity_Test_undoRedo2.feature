Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test complex undo/redo operations
	So I can build a canvas and perform complex undo/redo operations with various user operations
@watch
	Scenario: Sanity test for Complex undo/redo operations with the D3 rendering engine
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

		Then I select all the nodes in the canvas
		Then I select all the comments in the canvas
		Then I delete node 1 the "Type" node by selecting more than 1 node
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3
		Then I click redo
		Then I verify the number of nodes are 0
		Then I verify the number of comments are 0
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3

		Then I select all the nodes in the canvas
		Then I select all the comments in the canvas
		Then I disconnect links for node 1 a "Var. File" on the canvas by selecting more than 1 node
		Then I click undo
		Then I verify the number of data links are 20
		Then I verify the number of comment links are 12
		Then I click redo
		Then I verify the number of data links are 0
		Then I verify the number of comment links are 0
		Then I click undo
		Then I verify the number of data links are 20
		Then I verify the number of comment links are 12

		Then I move node 8 a "Sort" node onto the canvas by 50, 50
		Then I verify the node move was done
		Then I click undo
		Then I verify the node move was not done
		Then I click redo
		Then I move comment 1 with text " comment 1" onto the canvas by 100, 100
		Then I verify the comment move was done
		Then I click undo
		Then I verify the comment move was not done
		Then I click redo
