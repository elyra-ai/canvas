Feature: Toolbar

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test secondaryToolbar operations
	So I can build a canvas and perform secondaryToolbar operations

	Scenario: Sanity test for secondary toolbar Cut and Paste buttons with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	# Test cutting some nodes and a comment and paste to canvas
	Then I validate there are 8 links on the canvas with port style
	Then I click the comment with text " comment 1" to select it
	Then I Cmd+click the "DRUG1n" node to add it to the selections
	Then I Cmd+click the "Na_to_K" node to add it to the selections
	Then I Cmd+click the "Discard Fields" node to add it to the selections
	Then I click on the secondary toolbar cut button
	Then I click on the secondary toolbar paste button
	Then I verify the number of nodes are 6
	Then I verify the number of comments are 3
	 # There are 7 links because a data link has disappeared during the cut and paste
	Then I validate there are 7 links on the canvas with port style

	Scenario: Sanity test for secondary toolbar Copy and Paste buttons with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	# Test copying some nodes and a comment and paste to canvas
	Then I validate there are 8 links on the canvas with port style
	Then I click the comment with text " comment 2" to select it
	Then I Cmd+click the "Define Types" node to add it to the selections
	Then I Cmd+click the "C5.0" node to add it to the selections
	Then I Cmd+click the "Neural Net" node to add it to the selections
	Then I click on the secondary toolbar copy button
	Then I click on the secondary toolbar paste button
	Then I verify the number of nodes are 9
	Then I verify the number of comments are 4
	 # There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
	Then I validate there are 12 links on the canvas with port style

	Scenario: Sanity test for secondary toolbar Create and Delete button with the D3 rendering engine

	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
	Given I have toggled the app side panel

	Then I resize the window size to 1330 width and 660 height
	Then I select node 3 the "C5.0" node
	Then I click on the secondary toolbar create comment button
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
	Then I verify the number of items in the secondary toolbar are 6
	Then I resize the window size to 600 width and 600 height
	Then I verify the number of items in the secondary toolbar are 8
	Then I resize the window size to 700 width and 600 height
	Then I verify the number of items in the secondary toolbar are 9
	Then I resize the window size to 800 width and 600 height
	Then I verify the number of items in the secondary toolbar are 11
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
