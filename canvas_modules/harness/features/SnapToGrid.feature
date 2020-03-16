Feature: Snap To Grid

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas to test the snap to grid feature

	Scenario: Test dragged node snaps to grid
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have uploaded diagram "allTypesCanvas.json"

		# First move a node by an odd amount with no snap-to-grid to make sure
		# it moves appropriately.
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""

		# Travis needs this extra time
		Then I pause for 0.3 seconds
		Then I verify the "Binding (entry) node" node transform is "translate(89, 99.5)"

		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(321, 281.5)"

		# Return the node to its original position
		Then I click the undo button on the toolbar
		Then I verify the "Binding (entry) node" node transform is "translate(89, 99.5)"

		# Make the same change with Snap To Grid set to "During"
		# and verify the node is at a different position.
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I pause for 0.3 seconds

		Then I verify the "Binding (entry) node" node transform is "translate(87.5, 105)"
		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(315, 285)"

		# Now undo the move and make the same change with Snap To Grid set to "After"
		# and verify the node is at a different position.
		Then I click the undo button on the toolbar
		Then I verify the "Binding (entry) node" node transform is "translate(87.5, 105)"

		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I pause for 0.3 seconds
		Then I verify the "Binding (entry) node" node transform is "translate(87.5, 105)"

		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(315, 285)"

	Scenario: Test dragged comment snaps to grid
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have uploaded diagram "allTypesCanvas.json"

		# First move a comment by an odd amount with no snap-to-grid to make sure
		# it moves appropriately.
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""

		# Travis needs this extra time
		Then I pause for 0.3 seconds
		Then I verify the "The 4 different node types" comment transform is "translate(400, 50)"

		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment transform is "translate(321, 281)"

		# Return the comment to its original position
		Then I click the undo button on the toolbar
		Then I verify the "The 4 different node types" comment transform is "translate(400, 50)"

		# Make the same change with Snap To Grid set to "During"
		# and verify the comment is at a different position.
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I pause for 0.3 seconds

		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment transform is "translate(315, 285)"

		# Now undo the move and make the same change with Snap To Grid set to "After"
		# and verify the comment is at a different position.
		Then I click the undo button on the toolbar
		Then I verify the "The 4 different node types" comment transform is "translate(402.5, 45)"

		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I pause for 0.3 seconds
		Then I verify the "The 4 different node types" comment transform is "translate(402.5, 45)"

		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment transform is "translate(315, 285)"

	Scenario: Test resized comment snaps to grid
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have uploaded diagram "allTypesCanvas.json"

		# Before testing comment sizing, make sure the comment is in a snap-to-grid position
		# because, if not, the sizing test may be adversely affected because sizing
		# during snap to grid may also move the position of the comment.
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I pause for 0.3 seconds

		Then I move the "The 4 different node types" comment on the canvas by 100, 300

		# Now size a comment with Snap to Grid set to "None"
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""
		Then I pause for 0.3 seconds

		Then I size the "The 4 different node types" comment using the "south-east" corner to width 350 and height 80
		Then I verify the "The 4 different node types" comment has width 350 and height 80

		# Now size a comment with Snap to Grid set to "During"
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I pause for 0.3 seconds

		Then I size the "The 4 different node types" comment using the "south-east" corner to width 303 and height 54
		Then I verify the "The 4 different node types" comment has width 297.5 and height 60

		# Now size a comment with Snap to Grid set to "After"
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I pause for 0.3 seconds

		Then I size the "The 4 different node types" comment using the "south-east" corner to width 303 and height 54
		Then I verify the "The 4 different node types" comment has width 297.5 and height 60
