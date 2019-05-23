Feature: Comments

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a comment in different situations

	Scenario: Test creating a comment in main flow with toolbar and and context menu
		Then I resize the window size to 1400 width and 660 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have toggled the app side panel

		# Create a new comment and add text to it
		Then I right click at position 500, 100 to display the context menu
		Then I click option "New comment" from the context menu
		Then I edit the comment "" with text "Hello Canvas!"
		Then I verify the number of comments are 1

		# Test manually linking the comment to a node
		Then I verify the number of comment links are 0
		Then I open the palette
		Then I open the "Record Ops" palette category
		Then I add a node of type "Sample" from the "Record Ops" category onto the canvas at 800, 450
		Then I link the "Hello Canvas!" comment to the "Sample" node
		Then I verify the number of comment links are 1

		# Test sizing the comment, using the sizing area, to the right and downwards.
		Then I size the "Hello Canvas!" comment using the "south-west" corner to width 120 and height 80
		Then I verify the "Hello Canvas!" comment has width 120 and height 80

		# Test sizing the comment, using the sizing area, to the left and downwards.
		Then I size the "Hello Canvas!" comment using the "south-east" corner to width 130 and height 90
		Then I verify the "Hello Canvas!" comment has width 130 and height 90

		# Test sizing the comment, using the sizing area, to the left and downwards.
		Then I size the "Hello Canvas!" comment using the "north-east" corner to width 140 and height 100
		Then I verify the "Hello Canvas!" comment has width 140 and height 100

		# Test sizing the comment, using the sizing area, to the left and downwards.
		Then I size the "Hello Canvas!" comment using the "north-west" corner to width 150 and height 110
		Then I verify the "Hello Canvas!" comment has width 150 and height 110

		# Size the comment to the left
		Then I size the "Hello Canvas!" comment on the "left" side to width 170
		Then I verify the "Hello Canvas!" comment has width 170 and height 110

		# Size the comment to the right
		Then I size the "Hello Canvas!" comment on the "right" side to width 200
		Then I verify the "Hello Canvas!" comment has width 200 and height 110

		# Size the comment downwards!
		Then I size the "Hello Canvas!" comment on the "top" side to height 100
		Then I verify the "Hello Canvas!" comment has width 200 and height 100

		# Size the comment downwards
		Then I size the "Hello Canvas!" comment on the "bottom" side to height 150
		Then I verify the "Hello Canvas!" comment has width 200 and height 150

	Scenario: Test creating comment from toolbar and editing them within supernodes
		Then I resize the window size to 1400 width and 660 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have toggled the app side panel

		# Create a node so we can add a comment which is linked to it
		Then I open the palette
		Then I open the "Import" palette category
		Then I add a node of type "Var. File" from the "Import" category onto the canvas at 400, 300

		# Add a comment using the toolbar (which should link the node to the comment)
		Then I click the "Var. File" node to select it
		Then I click on the secondary toolbar create comment button
		Then I verify the number of comment links are 1
		Then I edit the comment "" with text "Inner node"

		# Add the node and comment to a super node
		Then I click the comment with text "Inner node" to select it
		Then I Ctrl/Cmnd+click the "Var. File" node to add it to the selections
		Then I right click the "Var. File" node to display the context menu
		Then I click option "Create supernode" from the context menu

		# Add a comment to the supernode
		Then I click the "Supernode" node to select it
		Then I click on the secondary toolbar create comment button
		Then I edit the comment "" with text "Inner Supernode"

		# Create a supernode to contain the supernode and its comment
		Then I click the comment with text "Inner Supernode" to select it
		Then I Ctrl/Cmnd+click the "Supernode" node to add it to the selections
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Create supernode" from the context menu

		# Open the supernode
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		# Open the inner supernode
		Then I click the "Supernode" node in the subflow to select it
		Then I right click the "Supernode" node in the subflow to display the context menu
		Then I click option "Expand supernode" from the context menu

		# Test editing the inner comment and the inner inner comment
		Then I edit the comment "Inner Supernode" in the subflow with text "New Inner Supernode text"
		Then I edit the comment "Inner node" in the subflow in the subflow with text "New Inner node text"
