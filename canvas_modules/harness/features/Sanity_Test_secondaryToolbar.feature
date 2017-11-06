Feature: Sanity_Test_SecondaryToolbar.feature

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test secondaryToolbar operations
	So I can build a canvas and perform secondaryToolbar operations

	Scenario: Sanity test for secondary toolbar Create and Delete button with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I select node 3 the "C5.0" node
	Then I click on the secondary toolbar create comment
	Then I edit comment 1 with the comment text "New Comment"
	Then I select node 5 the "Var. File" node
	Then I click on the secondary toolbar delete button
	Then I verify the number of nodes are 5
	Then I select all the comments in the canvas
	Then I click on the secondary toolbar delete button
	Then I verify the number of comments are 0


	Scenario: Sanity test for secondary toolbar resize with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I pause for 1 seconds
	Then I resize the window size to 500 width and 500 height
	Then I verify the number of items in the secondary toolbar are 7
	Then I resize the window size to 600 width and 600 height
	Then I verify the number of items in the secondary toolbar are 9
	Then I resize the window size to 700 width and 600 height
	Then I verify the number of items in the secondary toolbar are 10
	Then I resize the window size to 800 width and 600 height
	Then I verify the number of items in the secondary toolbar are 12
	Then I resize the window size to 1330 width and 660 height

	Scenario: Sanity test for secondary toolbar horizontal and vertical layout with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel
	Then I click on the secondary toolbar horizontal layout button
	Then I verify the node 1 position is "translate(500, 127.5)"
	Then I verify the node 2 position is "translate(200, 127.5)"
	Then I verify the node 3 position is "translate(650, 50)"
	Then I verify the node 4 position is "translate(650, 205)"
	Then I verify the node 5 position is "translate(50, 127.5)"
	Then I verify the node 6 position is "translate(350, 127.5)"
	Then I click on the secondary toolbar vertical layout button
	Then I verify the node 1 position is "translate(125, 515)"
	Then I verify the node 2 position is "translate(125, 205)"
	Then I verify the node 3 position is "translate(50, 670)"
	Then I verify the node 4 position is "translate(200, 670)"
	Then I verify the node 5 position is "translate(125, 50)"
	Then I verify the node 6 position is "translate(125, 360)"

	Given I have toggled the app side panel
	Given I have selected the "Vertical" fixed Layout
	Given I have toggled the app side panel
	Then I click on the secondary toolbar horizontal layout button
	Then I verify the node 1 position is "translate(125, 515)"
	Then I verify the node 2 position is "translate(125, 205)"
	Then I verify the node 3 position is "translate(50, 670)"
	Then I verify the node 4 position is "translate(200, 670)"
	Then I verify the node 5 position is "translate(125, 50)"
	Then I verify the node 6 position is "translate(125, 360)"

	Given I have toggled the app side panel
	Given I have selected the "None" fixed Layout
	Given I have toggled the app side panel
	Then I click on the secondary toolbar horizontal layout button
	Then I verify the node 1 position is "translate(500, 127.5)"
	Then I verify the node 2 position is "translate(200, 127.5)"
	Then I verify the node 3 position is "translate(650, 50)"
	Then I verify the node 4 position is "translate(650, 205)"
	Then I verify the node 5 position is "translate(50, 127.5)"
	Then I verify the node 6 position is "translate(350, 127.5)"

	Given I have toggled the app side panel
	Given I have selected the "Horizontal" fixed Layout
	Given I have toggled the app side panel
	Then I click on the secondary toolbar vertical layout button
	Then I verify the node 1 position is "translate(500, 127.5)"
	Then I verify the node 2 position is "translate(200, 127.5)"
	Then I verify the node 3 position is "translate(650, 50)"
	Then I verify the node 4 position is "translate(650, 205)"
	Then I verify the node 5 position is "translate(50, 127.5)"
	Then I verify the node 6 position is "translate(350, 127.5)"
