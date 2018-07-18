Feature: FlowValidation

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to load a canvas
	So I can verify which nodes have parameter messages

	Scenario: Sanity test flow validation when open a flow
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		Then I verify that there are 1 nodes with a "warning" indicator
		Then I verify that there are 1 nodes with a "error" indicator

		Then I pause for 1 seconds

	Scenario: Sanity test flow validation when adding a node
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded palette "/test_resources/palettes/sparkPalette.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds
		Then I open the palette
		Then I add node 1 a "Add Column" node from the "Transformations" category onto the canvas at 450, 200
		Then I close the palette
		Then I right click at position 200, 200 to display the context menu
		Then I click option "Validate Flow" from the context menu
		Then I verify that there are 1 nodes with a "error" indicator
