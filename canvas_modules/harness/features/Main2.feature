Feature: Main2

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to load a canvas
  So I can add more flow to the canvas

	Scenario: Sanity test adding nodes and comments
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Modal" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		Then I open the palette
		Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 150, 450
		Then I close the palette
		Then I select node 7 the "Field Reorder" node
		Then I pause for 1 seconds
		Then I add comment 4 at location 350, 450 with the text "Some text comment."
		Then I open the palette
		Then I add node 8 a "Sort" node from the "Record Ops" category onto the canvas at 300, 450
		Then I close the palette
		Then I link node 7 the "Field Reorder" node to node 8 the "Sort" node for link 10 on the canvas
		Then I link comment 4 with text "Some text comment." to node 8 the "Sort" node for link 11 on the canvas
		Then I right click the "Discard Fields" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I link node 2 the "Na_to_K" node to node 6 the "Discard Fields" node for link 10 on the canvas
		Then I link node 6 the "Discard Fields" node to node 7 the "Field Reorder" node for link 11 on the canvas
		Then I link node 8 the "Sort" node to node 1 the "Type" node for link 12 on the canvas
		Then I select node 2 the "Na_to_K" node
		Then I right click the "C5.0" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I move node 4 a "Neural Net" node onto the canvas by 50, 50
		Then I move comment 3 with text " comment 3 sample comment text" onto the canvas by 100, 100
		Then I pause for 1 seconds

	Scenario: Sanity test from loaded file
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have uploaded diagram "/test_resources/diagrams/modelerCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds
		Then I validate there are 9 links on the canvas with port style
		Then I verify the number of port data links are 7
		Then I verify the number of comment links are 0

	Scenario: Sanity test from loaded file in legacy format
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have uploaded diagram "/test_resources/diagrams/x-modelerCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds
		Then I validate there are 9 links on the canvas with port style
		Then I verify the number of port data links are 7
		Then I verify the number of comment links are 0
