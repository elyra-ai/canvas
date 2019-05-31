Feature: AutoNodePlacement

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas
	So I can build a graph

	Scenario: Sanity test auto layout variations
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"

		Then I open the palette

		Then I double click "Export Object Store" node from the "Export" category onto the canvas
		Then I verify the node 1 position is "translate(50, 50)"
		Then I verify the number of nodes are 1
		Then I verify the number of port data links are 0

		Then I double click "Export Object Store" node from the "Export" category onto the canvas
		Then I verify the node 2 position is "translate(200, 50)"
		Then I verify the number of nodes are 2
		Then I verify the number of port data links are 0

		Then I click the undo button on the toolbar
		Then I verify the number of nodes are 1
		Then I verify the number of port data links are 0

		Then I click the undo button on the toolbar
		Then I verify the number of nodes are 0
		Then I verify the number of port data links are 0

		Then I double click "Var. File" node from the "Import" category onto the canvas
		Then I verify the node 1 position is "translate(50, 50)"
		Then I verify the number of nodes are 1
		Then I verify the number of port data links are 0

		Then I double click "Select" node from the "Record Ops" category onto the canvas
		Then I verify the node 2 position is "translate(200, 50)"
		Then I verify the number of nodes are 2
		Then I verify the number of port data links are 1

		Then I double click "Sample" node from the "Record Ops" category onto the canvas
		Then I verify the node 3 position is "translate(350, 50)"
		Then I verify the number of nodes are 3
		Then I verify the number of port data links are 2

		Then I double click "Sample" node from the "Record Ops" category onto the canvas
		Then I verify the node 4 position is "translate(500, 50)"
		Then I verify the number of nodes are 4
		Then I verify the number of port data links are 3

		Then I select node 1 the "Var. File" node

		Then I double click "Select" node from the "Record Ops" category onto the canvas
		Then I verify the node 5 position is "translate(200, 205)"
		Then I verify the number of nodes are 5
		Then I verify the number of port data links are 4

		Then I double click "Sample" node from the "Record Ops" category onto the canvas
		Then I verify the node 6 position is "translate(350, 205)"
		Then I verify the number of nodes are 6
		Then I verify the number of port data links are 5

		Then I select node 6 the "Sample" node

		Then I double click "Select" node from the "Record Ops" category onto the canvas
		Then I verify the node 7 position is "translate(500, 205)"
		Then I verify the number of nodes are 7
		Then I verify the number of port data links are 6

		Then I double click "Var. File" node from the "Import" category onto the canvas
		Then I verify the node 8 position is "translate(50, 360)"
		Then I verify the number of nodes are 8
		Then I verify the number of port data links are 6

		Then I select node 8 the "Var. File" node

		Then I double click "Select" node from the "Record Ops" category onto the canvas
		Then I verify the node 9 position is "translate(200, 360)"
		Then I verify the number of nodes are 9
		Then I verify the number of port data links are 7

		Then I select node 9 the "Select" node

		Then I double click "Export Object Store" node from the "Export" category onto the canvas
		Then I verify the node 10 position is "translate(350, 360)"
		Then I verify the number of nodes are 10
		Then I verify the number of port data links are 8

		Then I select node 10 the "Export Object Store" node

		Then I double click "Export Object Store" node from the "Export" category onto the canvas
		Then I verify the node 11 position is "translate(500, 360)"
		Then I verify the number of nodes are 11
		Then I verify the number of port data links are 8

		Then I click the undo button on the toolbar
		Then I verify the number of nodes are 10
		Then I verify the number of port data links are 8

		Then I click the undo button on the toolbar
		Then I verify the number of nodes are 9
		Then I verify the number of port data links are 7

		Then I click the undo button on the toolbar
		Then I verify the number of nodes are 8
		Then I verify the number of port data links are 6

		Then I click the redo button on the toolbar
		Then I verify the number of nodes are 9
		Then I verify the number of port data links are 7

		Then I click the redo button on the toolbar
		Then I verify the number of nodes are 10
		Then I verify the number of port data links are 8

		Then I click the redo button on the toolbar
		Then I verify the number of nodes are 11
		Then I verify the number of port data links are 8

Scenario: Test that auto-nodes are added to a in-place expanded supernode
		Then I resize the window size to 1330 width and 660 height
		Given I am on the test harness
		Given I have uploaded diagram "supernodeCanvas.json"
		Given I have uploaded palette "modelerPalette.json"

		Then I verify pipeline 1 have 8 nodes
		Then I verify pipeline 1 have 7 links

		# Test that a auto node is added to the sub-flow
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I click the "Type" node in the subflow to select it
		Then I double click "Filter" node from the "Field Ops" category onto the canvas
		Then I verify pipeline 1 have 9 nodes
		Then I verify pipeline 1 have 8 links

		# Test that a second auto node is added to the sub-flow
		Then I double click "Derive" node from the "Field Ops" category onto the canvas
		Then I verify pipeline 1 have 10 nodes
		Then I verify pipeline 1 have 9 links
