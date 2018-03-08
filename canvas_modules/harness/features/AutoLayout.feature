Feature: AutoLayout

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to load a canvas
  So I can test autoLayout operations to the canvas

Scenario: Sanity test for autoLayout operations in Vertical Fixed Layout
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Vertical" fixed Layout
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Halo" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I pause for 1 seconds

	Then I open the palette
	Then I add node 7 a "Select" node from the "Record Ops" category onto the canvas at 100, 400
	Then I close the palette
	Then I delete node 7 the "Select" node
	Then I delete comment 1 linked to the "C5.0" node with the comment text " comment 2"
	Then I disconnect links for node 5 a "Type" on the canvas
	Then I link node 5 the "Var. File" node to node 2 the "Derive" node for link 6 on the canvas
	Then I verify the node 1 position is "translate(120, 488)"
	Then I verify the node 2 position is "translate(120, 196)"
	Then I verify the node 3 position is "translate(50, 634)"
	Then I verify the node 4 position is "translate(190, 634)"
	Then I verify the node 5 position is "translate(120, 50)"
	Then I verify the node 6 position is "translate(120, 342)"
	Then I verify the comment 1 position is "translate(132, 103)"
	Then I verify the comment 2 position is "translate(663, 248)"


Scenario: Sanity test for autoLayout operations in Horizontal Fixed Layout
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Horizontal" fixed Layout
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Halo" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I pause for 1 seconds

	Then I open the palette
	Then I add node 7 a "Select" node from the "Record Ops" category onto the canvas at 100, 400
	Then I close the palette
	Then I delete node 4 the "Neural Net" node
	Then I delete comment 1 linked to the "C5.0" node with the comment text " comment 2"
	Then I disconnect links for node 5 a "Type" on the canvas
	Then I link node 6 the "Select" node to node 5 the "Filter" node for link 4 on the canvas
	Then I verify the node 1 position is "translate(50, 50)"
	Then I verify the node 2 position is "translate(190, 196)"
	Then I verify the node 3 position is "translate(190, 50)"
	Then I verify the node 4 position is "translate(50, 196)"
	Then I verify the node 5 position is "translate(190, 342)"
	Then I verify the node 6 position is "translate(50, 342)"
	Then I verify the comment 1 position is "translate(132, 103)"
	Then I verify the comment 2 position is "translate(663, 248)"


Scenario: Sanity test for autoLayout operations in None Fixed Layout
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "None" fixed Layout
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Halo" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I pause for 1 seconds

	Then I open the palette
	Then I add node 7 a "Select" node from the "Record Ops" category onto the canvas at 350, 445
	Then I close the palette
	Then I delete node 4 the "Neural Net" node
	Then I delete comment 1 linked to the "C5.0" node with the comment text " comment 3 sample comment text"
	Then I delete comment 1 linked to the "Filter" node with the comment text " comment 2"
	Then I disconnect links for node 5 a "Type" on the canvas
	Then I link node 2 the "Derive" node to node 6 the "Select" node for link 4 on the canvas
	Then I link node 5 the "Filter" node to node 1 the "Type" node for link 5 on the canvas
	Then I verify the node 1 position is "translate(445, 219)"
	Then I verify the node 2 position is "translate(218, 219)"
	Then I verify the node 3 position is "translate(611, 151)"
	Then I verify the node 4 position is "translate(96, 219)"
	Then I verify the node 5 position is "translate(328, 219)"
	Then I verify the node 6 position is "translate(70, 315)"
	Then I verify the comment 1 position is "translate(132, 103)"
