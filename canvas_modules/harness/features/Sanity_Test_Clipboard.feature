Feature: Sanity_Test_Clipboard.feature

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test clipboard operations
	So I can build a canvas and perform clipboard operations

	# For clipboard tests using the keyboard see the Sanity_Test_SecondaryToolbar.feature file

	Scenario: Sanity test for clipboard Cut and Paste shortcut keys with the D3 rendering engine

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
	Then I press Ctrl/Cmnd+X to Cut
	Then I press Ctrl/Cmnd+V to Paste
	Then I verify the number of nodes are 6
	Then I verify the number of comments are 3
	 # There are 7 links because a data link has disappeared during the cut and paste
	Then I validate there are 7 links on the canvas with port style

	Scenario: Sanity test for secondary toolbar Copy and Paste shortcut keys with the D3 rendering engine

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
	Then I press Ctrl/Cmnd+C to Copy
	Then I press Ctrl/Cmnd+V to Paste
	Then I verify the number of nodes are 9
	Then I verify the number of comments are 4
	 # There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
	Then I validate there are 12 links on the canvas with port style
