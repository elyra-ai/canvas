Feature: FlowValidation

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to load a canvas
	So I can verify which nodes have parameter messages

	Scenario: Sanity test flow validation when open a flow
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedConnectionType": "Halo"}""
		Given I have uploaded diagram "commentColorCanvas.json"

		Then I verify that there are 2 nodes with a "warning" indicator
		Then I verify that there are 0 nodes with a "error" indicator

	Scenario: Sanity test flow validation when adding a node
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedConnectionType": "Halo"}""
		Given I have uploaded palette "sparkPalette.json"

		Then I open the palette
		Then I add node 1 a "Add Column" node from the "Transformations" category onto the canvas at 450, 200
		Then I close the palette
		Then I right click at position 200, 200 to display the context menu
		Then I click option "CMI: Validate Flow" from the context menu
		Then I verify that there are 1 nodes with a "error" indicator
