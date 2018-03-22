Feature: ContextMenu

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to create a canvas
  So I can build a graph

  Scenario: Sanity test empty canvas with D3 rendering engine
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
    Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have selected the "D3" rendering engine
		Given I have selected the "Ports" connection type
		Given I have toggled the app side panel

		Then I resize the window size to 1330 width and 660 height

		# Test the context menu appears OK in the middle of the canvas
		Then I right click at position 800, 200 to display the context menu
		Then I verify the context menu is at 800, 200

		# Test the context menu has some of the expected entries
		Then I verify the context menu has a "New comment" item
		Then I verify the context menu has a "Select all" item

		# Test the context menu is pushed to the left when user clicks near right side of the page
		Then I right click at position 1230, 400 to display the context menu
		Then I verify the context menu is at 1070, 285

		# Test the context menu is pushed upwards when user clicks near bottom of the page
		Then I right click at position 1000, 500 to display the context menu
		Then I verify the context menu is at 1000, 285

		# Test the context menu is pushed to the left correctly even when the palette is open
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I open the palette
		Then I right click at position 940, 300 to display the context menu
		Then I verify the context menu is at 780, 285

		# Test the context menu is pushed to the left correctly even when the palette is open AND the right flyout is open
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I double click the "Define Types" node to open its properties
		Then I right click at position 640, 300 to display the context menu
		Then I verify the context menu is at 480, 285

		# Test that, when a set of objects are selected, a click opening the context menu will not clear the selections
		Then I have closed the common properties dialog by clicking on close button
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I click the "C5.0" node to select it
		Then I Cmd+click the "Neural Net" node to add it to the selections
		Then I Cmd+click the "Define Types" node to add it to the selections
		Then I verify that 3 objects are selected
		Then I right click at position 1000, 300 to display the context menu
		Then I verify that 3 objects are selected
