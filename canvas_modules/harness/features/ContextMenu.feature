Feature: ContextMenu

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas
	So I can build a graph

	Scenario: Sanity test context menu options
		Then I resize the window size to 1400 width and 650 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		# Test the context menu appears OK in the middle of the canvas
		Then I right click at position 800, 25 to display the context menu
		Then I verify the context menu is at 800, 25

		# Test the context menu has some of the expected entries
		Then I verify the context menu has a "New comment" item
		Then I verify the context menu has a "Undo" item

		# Test the node context menu has an enabled Edit menu
		Then I right click the "DRUG1n" node to display the context menu
		Then I click option "Copy" from the "Edit" submenu

		# Test the context menu is pushed to the left when user clicks near right side of the page
		Then I right click at position 1300, 100 to display the context menu
		Then I verify the context menu is at 1140, 100

		# Test the context menu is pushed upwards when user clicks near bottom of the page
		Then I right click at position 1000, 500 to display the context menu
		Then I verify the context menu is at 1000, 335

		# Test the context menu is pushed to the left correctly even when the palette is open
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I open the palette
		Then I right click at position 940, 300 to display the context menu
		Then I verify the context menu is at 940, 300

		# Test the context menu is pushed to the left correctly even when the palette is open AND the right flyout is open
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I double click the "Na_to_K" node to open its properties
		Then I right click at position 640, 300 to display the context menu
		Then I verify the context menu is at 640, 300

		# Test the context menu's 'Highlight' submenu is pushed up in a situation where it would appear off the bottom of the screen
		# To do this, use zoom to fit to get a node near the bottom of the screen
		Then I click the zoom to fit button on the toolbar
		Then I right click the "Neural Net" node to display the context menu
		Then I click option "Highlight" from the context menu
		Then I verify the submenu is pushed up by 91 pixels

		# Test that, when a set of objects are selected, a click opening the context menu will not clear the selections
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I click the "C5.0" node to select it
		Then I Ctrl/Cmnd+click the "Neural Net" node to add it to the selections
		Then I Ctrl/Cmnd+click the "Define Types" node to add it to the selections
		Then I verify that 3 objects are selected
		Then I right click at position 1000, 300 to display the context menu
		Then I verify that 3 objects are selected
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I verify that 3 objects are selected
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I verify that 0 objects are selected
