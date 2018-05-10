Feature: UndoRedo

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test undo/redo operations
	So I can build a canvas and perform undo/redo operations with various user operations

	Scenario: Sanity test for Base undo/redo operations
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		# Base do/undo/redo tests

		Then I open the palette
		Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 350, 200
		Then I add node 2 a "Select" node from the "Record Ops" category onto the canvas at 450, 200
		Then I close the palette
		Then I click undo
		Then I verify the number of nodes are 1
		Then I click redo
		Then I verify the number of nodes are 2

		Then I link node 1 the "Var. File" node to node 2 the "Select" node for link 1 on the canvas
		Then I press Ctrl/Cmnd+Z to Undo
		Then I verify the number of data links are 0
		Then I click redo
		Then I verify the number of data links are 1

		Then I select node 2 the "Select" node

		Then I add comment 1 at location 350, 250 with the text "This comment box should be linked to the Select node."
		Then I click undo
		Then I click undo
		Then I verify the number of comments are 0
		Then I press Ctrl/Cmnd+Shift+Z to Redo
		Then I click redo
		Then I verify the number of comments are 1

		Then I disconnect links for node 1 a "Var. File" on the canvas
		Then I click undo
		Then I verify the number of data links are 1
		Then I press Ctrl/Cmnd+Y to Redo
		Then I verify the number of data links are 0

		Then I move node 1 a "Var. File" node onto the canvas by 50, 50
		Then I click undo
		Then I verify the node move was not done
		Then I click redo
		Then I verify the node move was done

		Then I move comment 1 with text " This comment box should be linked to the Select node." onto the canvas by 100, 100
		Then I click undo
		Then I verify the comment move was not done
		Then I click redo
		Then I verify the comment move was done

		Then I edit comment 1 with the comment text "This comment box should be edited."
		Then I click undo
		Then I verify comment 1 with the comment text "This comment box should be linked to the Select node."
		Then I click redo
		Then I verify comment 1 with the comment text "This comment box should be edited."

		Then I delete node 1 the "Var. File" node
		Then I click undo
		Then I verify the number of nodes are 2
		Then I click redo
		Then I verify the number of nodes are 1

		Then I delete comment 1 linked to the "Select" node with the comment text "This comment box should be edited."
		Then I click undo
		Then I verify the number of comments are 1
		Then I click redo
		Then I verify the number of comments are 0

		Given I have toggled the app side common-properties panel
		Given I have uploaded JSON for common-properties "spark.AddColumn.json"
		Then I pause for 1 seconds
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

		Then I delete link at 205, 248
		Then I verify the number of data links are 4
		Then I click undo
		Then I verify the number of data links are 5
		Then I click redo
		Then I verify the number of data links are 4

		Then I delete link at 225, 188
		Then I verify the number of comment links are 3
		Then I click undo
		Then I verify the number of comment links are 4
		Then I click redo
		Then I verify the number of comment links are 3

	Scenario: Sanity test for Complex undo/redo operations
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		# Complex do/undo/redo tests

		Then I pause for 1 seconds
		Then I open the palette
		Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 300, 450
		Then I add node 8 a "Sort" node from the "Record Ops" category onto the canvas at 500, 450
		Then I close the palette

		Then I select all the nodes in the canvas
		Then I select all the comments in the canvas
		Then I delete node 1 the "Type" node by selecting more than 1 node
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3
		Then I verify the number of data links are 5
		Then I verify the number of comment links are 3
		Then I click redo
		Then I verify the number of nodes are 0
		Then I verify the number of comments are 0
		Then I verify the number of data links are 0
		Then I verify the number of comment links are 0
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3
		Then I verify the number of data links are 5
		Then I verify the number of comment links are 3

		Then I select all the nodes in the canvas
		Then I select all the comments in the canvas
		Then I disconnect links for node 1 a "Var. File" on the canvas by selecting more than 1 node
		Then I click undo
		Then I verify the number of data links are 5
		Then I verify the number of comment links are 3
		Then I click redo
		Then I verify the number of data links are 0
		Then I verify the number of comment links are 0
		Then I click undo
		Then I verify the number of data links are 5
		Then I verify the number of comment links are 3

		Then I right click at position 300, 10 to display the context menu
		Then I click option "Select all" from the context menu
		Then I delete node 1 the "Type" node by selecting more than 1 node
		Then I expect the canvas to be empty
		Then I expect the object model to be empty
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3

		Then I select all objects in the canvas via Ctrl+A
		Then I delete all selected objects via the Delete key
		Then I expect the canvas to be empty
		Then I expect the object model to be empty
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3

		Then I select all objects in the canvas via Cmd+A
		Then I delete node 1 the "Type" node by selecting more than 1 node
		Then I expect the canvas to be empty
		Then I expect the object model to be empty
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3

		Then I right click at position 300, 10 to display the context menu
		Then I click option "Select all" from the context menu
		Then I delete all selected objects via the Delete key
		Then I expect the canvas to be empty
		Then I expect the object model to be empty
		Then I click undo
		Then I verify the number of nodes are 8
		Then I verify the number of comments are 3

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

	Scenario: Sanity test for Complex Disconnect and Delete undo/redo operations
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		# Complex do/undo/redo tests

		Then I pause for 1 seconds
		Then I open the palette
		Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 300, 450
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

	Scenario: Sanity test for Multiple undo/redo operations
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/radialCanvas.json"
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		# Multiple commands

		Then I open the palette
		Then I add node 22 a "Neural Net" node from the "Modeling" category onto the canvas at 350, 150
		Then I close the palette
		Then I verify the number of nodes are 22
		Then I click undo
		Then I verify the number of nodes are 21
		Then I click redo
		Then I verify the number of nodes are 22

		Then I select node 19 the "Filter" node
		Then I add comment 1 at location 30, 300 with the text "Some text comment."
		Then I click undo
		Then I click undo
		Then I verify the number of comments are 0
		Then I disconnect links for node 2 a "Var. File" on the canvas
		Then I verify the number of data links are 0
		Then I click undo
		Then I verify the number of data links are 20

		Then I link node 19 the "Filter" node to node 22 the "Neural Net" node for link 21 on the canvas
		Then I open the palette
		Then I add node 23 a "Select" node from the "Record Ops" category onto the canvas at 350, 250
		Then I add node 24 a "Sort" node from the "Record Ops" category onto the canvas at 250, 250
		Then I close the palette
		Then I link node 23 the "Select" node to node 24 the "Sort" node for link 22 on the canvas
		Then I click undo
		Then I click redo
		Then I click undo
		Then I click undo
		Then I verify the number of nodes are 23
		Then I verify the number of data links are 21

	Scenario: Sanity test for undo/redo of layout actions
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel
		Then I resize the window size to 1330 width and 660 height
		Then I click on the secondary toolbar horizontal layout button
		Then I verify the node 1 position is "translate(470, 123)"
		Then I verify the node 2 position is "translate(190, 123)"
		Then I verify the node 3 position is "translate(610, 50)"
		Then I verify the node 4 position is "translate(610, 196)"
		Then I verify the node 5 position is "translate(50, 123)"
		Then I verify the node 6 position is "translate(330, 123)"
		Then I click on the secondary toolbar vertical layout button
		Then I verify the node 1 position is "translate(120, 488)"
		Then I verify the node 2 position is "translate(120, 196)"
		Then I verify the node 3 position is "translate(50, 634)"
		Then I verify the node 4 position is "translate(190, 634)"
		Then I verify the node 5 position is "translate(120, 50)"
		Then I verify the node 6 position is "translate(120, 342)"
		Then I click undo
		Then I verify the node 1 position is "translate(470, 123)"
		Then I verify the node 2 position is "translate(190, 123)"
		Then I verify the node 3 position is "translate(610, 50)"
		Then I verify the node 4 position is "translate(610, 196)"
		Then I verify the node 5 position is "translate(50, 123)"
		Then I verify the node 6 position is "translate(330, 123)"
		Then I click undo
		Then I verify the node 1 position is "translate(445, 219)"
		Then I verify the node 2 position is "translate(218, 219)"
		Then I verify the node 3 position is "translate(611, 151)"
		Then I verify the node 4 position is "translate(606, 310)"
		Then I verify the node 5 position is "translate(96, 219)"
		Then I verify the node 6 position is "translate(328, 219)"
		Then I click redo
		Then I verify the node 1 position is "translate(470, 123)"
		Then I verify the node 2 position is "translate(190, 123)"
		Then I verify the node 3 position is "translate(610, 50)"
		Then I verify the node 4 position is "translate(610, 196)"
		Then I verify the node 5 position is "translate(50, 123)"
		Then I verify the node 6 position is "translate(330, 123)"
		Then I click redo
		Then I verify the node 1 position is "translate(120, 488)"
		Then I verify the node 2 position is "translate(120, 196)"
		Then I verify the node 3 position is "translate(50, 634)"
		Then I verify the node 4 position is "translate(190, 634)"
		Then I verify the node 5 position is "translate(120, 50)"
		Then I verify the node 6 position is "translate(120, 342)"

	Scenario: Test undo/redo property values and title in common-properties
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have toggled the app side panel
		Then I open the palette
		Then I add node 1 a "C5.0" node from the "Modeling" category onto the canvas at 350, 200
		Then I double click the "C5.0" node to open its properties
		Then I click on title edit icon
		Then I enter new title "My C5.0 model"
		Then I send "Backspace" to the "editor-control-samplingRatio" textbox control
		Then I click on the "Save" button
		Then I verify the event log for the "samplingRatio" parameter contains "null"
		Then I verify the event log has the "error" message for the "samplingRatio" parameter of "Select a sampling ratio"
		Then I verify the event log title is "My C5.0 model"
		Then I pause for 1 seconds
		Then I double click the "My C5.0 model" node to open its properties
		Then I click undo
		Then I click on the "Save" button
		Then I verify the event log for the "samplingRatio" parameter contains "1"
		Then I verify the event log has no error messages
		Then I verify the event log title is "C5.0"
