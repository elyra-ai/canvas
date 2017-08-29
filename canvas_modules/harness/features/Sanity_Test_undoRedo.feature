Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test simple undo/redo operations
	So I can build a canvas and perform simple undo/redo operations with various user operations
@watch
	Scenario: Sanity test for Base undo/redo operations with the D3 rendering engine
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "D3" rendering engine
		Given I have toggled the app side panel

		# Base do/undo/redo tests

		Then I open the palette
		Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 100, 200
		Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 200, 200
		Then I close the palette
		Then I click undo
		Then I verify the number of nodes are 1
		Then I click redo
		Then I verify the number of nodes are 2

		Then I link node 1 the "Var. File" node to node 2 the "Derive" node for link 1 on the canvas
		Then I click undo
		Then I verify the number of data links are 0
		Then I click redo
		Then I verify the number of data links are 1

		Then I select node 2 the "Derive" node

		Then I add comment 1 at location 100, 250 with the text "This comment box should be linked to the derive node."
		Then I click undo
		Then I click undo
		Then I verify the number of comments are 0
		Then I click redo
		Then I click redo
		Then I verify the number of comments are 1

		Then I disconnect links for node 1 a "Var. File" on the canvas
		Then I click undo
		Then I verify the number of data links are 1
		Then I click redo
		Then I verify the number of data links are 0

		Then I move node 1 a "Var. File" node onto the canvas by 50, 50
		Then I click undo
		Then I verify the node move was not done
		Then I click redo
		Then I verify the node move was done

		Then I move comment 1 with text " This comment box should be linked to the derive node." onto the canvas by 100, 100
		Then I click undo
		Then I verify the comment move was not done
		Then I click redo
		Then I verify the comment move was done

		Then I edit comment 1 with the comment text "This comment box should be edited."
		Then I click undo
		Then I verify comment 1 with the comment text "This comment box should be linked to the derive node."
		Then I click redo
		Then I verify comment 1 with the comment text "This comment box should be edited."

		Then I delete node 1 the "Var. File" node
		Then I click undo
		Then I verify the number of nodes are 2
		Then I click redo
		Then I verify the number of nodes are 1

		Then I delete comment 1 linked to the "Derive" node with the comment text "This comment box should be edited."
		Then I click undo
		Then I verify the number of comments are 1
		Then I click redo
		Then I verify the number of comments are 0

		Given I have toggled the app side common-properties panel

		Given I have uploaded JSON for common-properties "Spark_AddColumn_paramDef.json"
		Then I enter "testValue" in the textbox Column name
		Then I click undo
		Then I verify testValue is not present
		Then I click redo
		Then I verify testValue is present

		Given I have toggled the app side panel
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I link comment 3 with text " comment 3 sample comment text" to node 4 the "Neutral Net" node for link 9 on the canvas
		Then I verify the number of comment links are 4
		Then I click undo
		Then I verify the number of comment links are 3
		Then I click redo
		Then I verify the number of comment links are 4

		Then I delete d3 link at 205, 248
		Then I verify the number of data links are 4
		Then I click undo
		Then I verify the number of data links are 5
		Then I click redo
		Then I verify the number of data links are 4

		Then I delete d3 link at 225, 188
		Then I verify the number of comment links are 3
		Then I click undo
		Then I verify the number of comment links are 4
		Then I click redo
		Then I verify the number of comment links are 3
