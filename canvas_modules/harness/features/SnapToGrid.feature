Feature: Snap To Grid

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas to test the snap to grid feature

	Scenario: Test dragged node snaps to grid with "During" setting
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have uploaded diagram "allTypesCanvas.json"

		# First move a node by an odd amount with no snap-to-grid to make sure
		# it moves appropriately.
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(321, 281.5)"

		# Now undo the move and make the same change with Snap To Grid set to "During"
		# and verify the node is at a different position.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(315, 285)"

		# Now undo the move and make the same change with Snap To Grid set to "After"
		# and verify the node is at a different position.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I move the "Binding (entry) node" node on the canvas to 321, 281
		Then I verify the "Binding (entry) node" node transform is "translate(315, 285)"

		# Now do the same with a comment.
		# First move a node by an odd amount with no snap-to-grid to make sure
		# it moves appropriately.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""
		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment position is "translate(301, 261)"

		# Now undo the move and make the same change with Snap To Grid set to "During"
		# and verify the comment is at a different position.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment position is "translate(297.5, 255)"

		# Now undo the move and make the same change with Snap To Grid set to "After"
		# and verify the comment is at a different position.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I move the "The 4 different node types" comment on the canvas by 321, 281
		Then I verify the "The 4 different node types" comment position is "translate(297.5, 255)"

		# Before testing comment sizing, make sure the comment is in a snap-to-grid position
		# because, if not, the sizing test may be adversely affected because sizing
		# during snap to grid may also move the position of the comment.
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I move the "The 4 different node types" comment on the canvas by 300, 80

		# Now size a comment with Snap to Grid set to "None"
		Given I have set this canvas config ""{"selectedSnapToGridType": "None"}""
		Then I size the "The 4 different node types" comment using the "south-west" corner to width 303 and height 54
		Then I verify the "The 4 different node types" comment has width 303 and height 54

		# Now size a comment with Snap to Grid set to "During"
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "During"}""
		Then I size the "The 4 different node types" comment using the "south-west" corner to width 303 and height 54
		Then I verify the "The 4 different node types" comment has width 297.5 and height 60

		# Now size a comment with Snap to Grid set to "After"
		Then I click the undo button on the toolbar
		Given I have set this canvas config ""{"selectedSnapToGridType": "After"}""
		Then I size the "The 4 different node types" comment using the "south-west" corner to width 303 and height 54
		Then I verify the "The 4 different node types" comment has width 297.5 and height 60
