Feature: Toolbar

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test secondaryToolbar operations
	So I can build a canvas and perform secondaryToolbar operations

	Scenario: Sanity test for secondary toolbar Cut and Paste buttons
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		# Test cutting some nodes and a comment and paste to canvas
		Then I validate there are 8 links on the canvas with port style
		Then I click the comment with text " comment 1" to select it
		Then I Ctrl/Cmnd+click the "DRUG1n" node to add it to the selections
		Then I Ctrl/Cmnd+click the "Na_to_K" node to add it to the selections
		Then I Ctrl/Cmnd+click the "Discard Fields" node to add it to the selections
		Then I click the cut button on the toolbar
		Then I click the paste button on the toolbar
		Then I verify the number of nodes are 6
		Then I verify the number of comments are 3
		 # There are 7 links because a data link has disappeared during the cut and paste
		Then I validate there are 7 links on the canvas with port style

	Scenario: Sanity test for secondary toolbar Copy and Paste buttons
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		# Test copying some nodes and a comment and paste to canvas
		Then I validate there are 8 links on the canvas with port style
		Then I click the comment with text " comment 2" to select it
		Then I Ctrl/Cmnd+click the "Define Types" node to add it to the selections
		Then I Ctrl/Cmnd+click the "C5.0" node to add it to the selections
		Then I Ctrl/Cmnd+click the "Neural Net" node to add it to the selections
		Then I click the copy button on the toolbar
		Then I click the paste button on the toolbar
		Then I verify the number of nodes are 9
		Then I verify the number of comments are 4
		 # There are 12 links because 2 new data link and 2 new comment links were created during the copy and paste
		Then I validate there are 12 links on the canvas with port style

	Scenario: Sanity test for secondary toolbar Create and Delete button
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		Then I resize the window size to 1330 width and 660 height
		Then I select node 3 the "C5.0" node
		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "New Comment"
		Then I double click the "Define Types" node to open its properties
		Then I click the overflow button on the toolbar
		Then I click the delete button on the toolbar
		Then I verify the number of nodes are 5
		Then I select all the comments in the canvas
		Then I click the delete button on the toolbar
		Then I verify the number of comments are 0

	Scenario: Sanity test for secondary toolbar resize
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "commentColorCanvas.json"

		Then I resize the window size to 500 width and 600 height
		Then I verify the number of items in the secondary toolbar are 10
		Then I resize the window size to 540 width and 600 height
		Then I verify the number of items in the secondary toolbar are 11
		Then I resize the window size to 580 width and 600 height
		Then I verify the number of items in the secondary toolbar are 12
		Then I resize the window size to 620 width and 600 height
		Then I verify the number of items in the secondary toolbar are 13
		Then I resize the window size to 660 width and 600 height

	Scenario: Sanity test for secondary toolbar add comment
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness

		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "Comment 1"
		Then I verify the "Comment 1" comment transform is "translate(30, 30)"
		Then I click the zoom in button on the toolbar
		Then I click the zoom in button on the toolbar
		Then I verify zoom transform value is "translate(490.825,222.29) scale(1.2100000000000002)"
		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "Comment 2"
		Then I verify the "Comment 2" comment transform is "translate(-375.64049586776855, -153.71074380165285)"
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I click the zoom out button on the toolbar
		Then I verify zoom transform value is "translate(703.5126015982514,317.7647701659722) scale(0.8264462809917354)"
		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "Comment 3"
		Then I verify the "Comment 3" comment transform is "translate(-821.2502479338843, -354.4953719008264)"
		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "Comment 4"
		Then I verify the "Comment 4" comment transform is "translate(-811.2502479338843, -344.4953719008264)"

		Given I have set this canvas config ""{"extraCanvasDisplayed": true}""
		Then I pause for 0.5 seconds

		Then I click the create comment button on the toolbar on the extra canvas
		Then I edit the comment "" with text "Comment 5" on the extra canvas
		Then I verify the "Comment 5" comment transform is "translate(30, 30)" on the extra canvas
		Then I click the zoom in button on the toolbar on the extra canvas
		Then I click the zoom in button on the toolbar on the extra canvas
		Then I verify extra canvas zoom transform value is "translate(490.825,70.28999999999999) scale(1.2100000000000002)"
		Then I click the create comment button on the toolbar on the extra canvas
		Then I edit the comment "" with text "Comment 6" on the extra canvas
		Then I verify the "Comment 6" comment transform is "translate(-375.64049586776855, -28.090909090909072)" on the extra canvas
		Then I click the zoom out button on the toolbar on the extra canvas
		Then I click the zoom out button on the toolbar on the extra canvas
		Then I click the zoom out button on the toolbar on the extra canvas
		Then I click the zoom out button on the toolbar on the extra canvas
		Then I verify extra canvas zoom transform value is "translate(703.5126015982514,113.85574755822688) scale(0.8264462809917354)"
		Then I click the create comment button on the toolbar on the extra canvas
		Then I edit the comment "" with text "Comment 7" on the extra canvas
		Then I verify the "Comment 7" comment transform is "translate(-821.2502479338843, -107.76545454545453)" on the extra canvas
		Then I click the create comment button on the toolbar on the extra canvas
		Then I edit the comment "" with text "Comment 8" on the extra canvas
		Then I verify the "Comment 8" comment transform is "translate(-811.2502479338843, -97.76545454545453)" on the extra canvas

		# Add 5th comment to first canvas
		Then I click the zoom to fit button on the toolbar
		Then I click the create comment button on the toolbar
		Then I edit the comment "" with text "Comment 5a"
		Then I verify the "Comment 5a" comment transform is "translate(-1367.8810725018782, -338.4953719008264)"
