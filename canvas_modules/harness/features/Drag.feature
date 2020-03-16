Feature: Drag

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas
	So I can build a graph

	Scenario: Test to see if regular selection and drag behavior works (with dragWithoutSelect set to the default: false)
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "allTypesCanvas.json"

		# Try dragging a single selected node
		Then I click the "Execution node" node to select it
		Then I verify the "Execution node" node is selected
		Then I verify the "Binding (entry) node" node is not selected
		Then I verify the "Super node" node is not selected
		Then I verify the "Binding (exit) node" node is not selected
		Then I verify the "Model Node" node is not selected
		Then I verify the "The 4 different node types" comment is not selected

		Then I move the "Execution node" node on the canvas to 300, 350
		Then I verify the "Execution node" node transform is "translate(300, 350.5)"
		Then I click the undo button on the toolbar

		# Try dragging a couple of selected nodes and a selected comment
		Then I Ctrl/Cmnd+click the "Binding (entry) node" node to add it to the selections
		Then I Ctrl/Cmnd+click the comment with text "The 4 different node types" to add it to the selections
		Then I verify the "Execution node" node is selected
		Then I verify the "Binding (entry) node" node is selected
		Then I verify the "Super node" node is not selected
		Then I verify the "Binding (exit) node" node is not selected
		Then I verify the "Model Node" node is not selected
		Then I verify the "The 4 different node types" comment is selected

		Then I move the "Binding (entry) node" node on the canvas to 300, 350
		Then I verify the "Binding (entry) node" node transform is "translate(300, 350.5)"
		Then I verify the "Execution node" node transform is "translate(508, 389.5)"

		Then I verify the "Execution node" node is selected
		Then I verify the "Binding (entry) node" node is selected
		Then I verify the "Super node" node is not selected
		Then I verify the "Binding (exit) node" node is not selected
		Then I verify the "Model Node" node is not selected
		Then I verify the "The 4 different node types" comment is selected

		Then I click the undo button on the toolbar

		# Try dragging a node that is not selected
		#  - this should select the node being dragged and deselect the three selections
		Then I move the "Super node" node on the canvas to 300, 350

		Then I verify the "Execution node" node is not selected
		Then I verify the "Binding (entry) node" node is not selected
		Then I verify the "Super node" node is selected
		Then I verify the "Binding (exit) node" node is not selected
		Then I verify the "Model Node" node is not selected
		Then I verify the "The 4 different node types" comment is not selected

		Then I verify the "Super node" node transform is "translate(300, 350)"
		Then I click the undo button on the toolbar

		# Try dragging a comment that is not selected
		#  - this should select the comment being dragged and deselect the three selections
		Then I move the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment on the canvas by 300, 350

		Then I verify the "Execution node" node is not selected
		Then I verify the "Binding (entry) node" node is not selected
		Then I verify the "Super node" node is not selected
		Then I verify the "Binding (exit) node" node is not selected
		Then I verify the "Model Node" node is not selected
		Then I verify the "The 4 different node types" comment is not selected
		Then I verify the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment is selected

		Then I verify the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment transform is "translate(300, 350)"
		Then I click the undo button on the toolbar


		Scenario: Test to see if selection works with dragWithoutSelect set to true
			Then I resize the window size to 1330 width and 660 height

			Given I am on the test harness
			Given I have set this canvas config ""{"dragWithoutSelect": true}""
			Given I have uploaded diagram "allTypesCanvas.json"

			# Try dragging a single selected node
			Then I click the "Execution node" node to select it
			Then I verify the "Execution node" node is selected
			Then I verify the "Binding (entry) node" node is not selected
			Then I verify the "Super node" node is not selected
			Then I verify the "Binding (exit) node" node is not selected
			Then I verify the "Model Node" node is not selected
			Then I verify the "The 4 different node types" comment is not selected

			Then I move the "Execution node" node on the canvas to 300, 350
			Then I verify the "Execution node" node transform is "translate(300, 350.5)"
			Then I click the undo button on the toolbar

			# Try dragging a couple of selected nodes and a selected comment
			Then I Ctrl/Cmnd+click the "Binding (entry) node" node to add it to the selections
			Then I Ctrl/Cmnd+click the comment with text "The 4 different node types" to add it to the selections
			Then I verify the "Execution node" node is selected
			Then I verify the "Binding (entry) node" node is selected
			Then I verify the "Super node" node is not selected
			Then I verify the "Binding (exit) node" node is not selected
			Then I verify the "Model Node" node is not selected
			Then I verify the "The 4 different node types" comment is selected

			Then I move the "Binding (entry) node" node on the canvas to 300, 350
			Then I verify the "Binding (entry) node" node transform is "translate(300, 350.5)"
			Then I verify the "Execution node" node transform is "translate(508, 389.5)"

			Then I verify the "Execution node" node is selected
			Then I verify the "Binding (entry) node" node is selected
			Then I verify the "Super node" node is not selected
			Then I verify the "Binding (exit) node" node is not selected
			Then I verify the "Model Node" node is not selected
			Then I verify the "The 4 different node types" comment is selected

			Then I click the undo button on the toolbar

			# Try dragging a node that is not selected
			#  - with dragWithoutSelect set to true this should not select the node
			#    being dragged and should not deselect the three selections
			Then I move the "Super node" node on the canvas to 300, 350

			Then I verify the "Execution node" node is selected
			Then I verify the "Binding (entry) node" node is selected
			Then I verify the "Super node" node is not selected
			Then I verify the "Binding (exit) node" node is not selected
			Then I verify the "Model Node" node is not selected
			Then I verify the "The 4 different node types" comment is selected

			Then I verify the "Super node" node transform is "translate(300, 350)"
			Then I click the undo button on the toolbar

			# Try dragging a comment that is not selected
			#  - with dragWithoutSelect set to true this should not select the comment
			#    being dragged and should not deselect the three selections
			Then I move the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment on the canvas by 300, 350

			Then I verify the "Execution node" node is selected
			Then I verify the "Binding (entry) node" node is selected
			Then I verify the "Super node" node is not selected
			Then I verify the "Binding (exit) node" node is not selected
			Then I verify the "Model Node" node is not selected
			Then I verify the "The 4 different node types" comment is selected
			Then I verify the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment is not selected

			Then I verify the "This canvas shows the 4 different node types and three link types: node links, association links and comments links." comment transform is "translate(300, 350)"
			Then I click the undo button on the toolbar
