Feature: AutoLayoutDagre using Dagre auto-layout algorithm - Vertical and Horizontal

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to load a canvas
	So I can test autoLayout operations to the canvas

	Scenario: Test for toolbar horizontal and vertical layout
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded diagram "/test_resources/diagrams/supernodeLayoutCanvas.json"
		Given I have toggled the app side panel

		# Check the original transforms of the nodes are correct before auto layout
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(50, 712)"
		Then I verify the "Select1" node transform is "translate(1508, 50)"
		Then I verify the "Select2" node transform is "translate(1508, 712)"
		Then I verify the "Select3" node transform is "translate(1508, 1375)"
		Then I verify the "Merge" node transform is "translate(2966, 1375)"
		Then I verify the "Sample" node transform is "translate(4425, 712)"
		Then I verify the "Supernode1" node transform is "translate(2966, 50)"
		Then I verify the "Supernode2" node transform is "translate(4425, 50)"
		Then I verify the "Supernode3" node transform is "translate(2966, 712)"
		Then I verify the "Supernode4" node transform is "translate(4425, 1375)"

		# Test the node transforms after horizontal layout
		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(50, 583.5)"
		Then I verify the "Select1" node transform is "translate(200, 112.5)"
		Then I verify the "Select2" node transform is "translate(200, 583.5)"
		Then I verify the "Select3" node transform is "translate(200, 992)"
		Then I verify the "Merge" node transform is "translate(564.5, 992)"
		Then I verify the "Sample" node transform is "translate(1583, 583.5)"
		Then I verify the "Supernode1" node transform is "translate(366, 50)"
		Then I verify the "Supernode2" node transform is "translate(1468, 50)"
		Then I verify the "Supernode3" node transform is "translate(350, 330)"
		Then I verify the "Supernode4" node transform is "translate(929, 929.5)"

		# Test the node transforms after vertical layout
		Then I click the vertical layout button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(811.5, 50)"
		Then I verify the "Select1" node transform is "translate(248.5, 205)"
		Then I verify the "Select2" node transform is "translate(811.5, 205)"
		Then I verify the "Select3" node transform is "translate(1615.5, 205)"
		Then I verify the "Merge" node transform is "translate(1615.5, 613.5)"
		Then I verify the "Sample" node transform is "translate(811.5, 1084.5)"
		Then I verify the "Supernode1" node transform is "translate(50, 551)"
		Then I verify the "Supernode2" node transform is "translate(133.5, 1022)"
		Then I verify the "Supernode3" node transform is "translate(597, 360)"
		Then I verify the "Supernode4" node transform is "translate(961.5, 1022)"

		# Test the nodes return to their horizontal transforms on undo
		Then I click the undo button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(50, 583.5)"
		Then I verify the "Select1" node transform is "translate(200, 112.5)"
		Then I verify the "Select2" node transform is "translate(200, 583.5)"
		Then I verify the "Select3" node transform is "translate(200, 992)"
		Then I verify the "Merge" node transform is "translate(564.5, 992)"
		Then I verify the "Sample" node transform is "translate(1583, 583.5)"
		Then I verify the "Supernode1" node transform is "translate(366, 50)"
		Then I verify the "Supernode2" node transform is "translate(1468, 50)"
		Then I verify the "Supernode3" node transform is "translate(350, 330)"
		Then I verify the "Supernode4" node transform is "translate(929, 929.5)"

		# Test the nodes return to their original transforms on undo
		Then I click the undo button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(50, 712)"
		Then I verify the "Select1" node transform is "translate(1508, 50)"
		Then I verify the "Select2" node transform is "translate(1508, 712)"
		Then I verify the "Select3" node transform is "translate(1508, 1375)"
		Then I verify the "Merge" node transform is "translate(2966, 1375)"
		Then I verify the "Sample" node transform is "translate(4425, 712)"
		Then I verify the "Supernode1" node transform is "translate(2966, 50)"
		Then I verify the "Supernode2" node transform is "translate(4425, 50)"
		Then I verify the "Supernode3" node transform is "translate(2966, 712)"
		Then I verify the "Supernode4" node transform is "translate(4425, 1375)"

		# Test the nodes return to their horizontal layout transforms on redo
		Then I click the redo button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(50, 583.5)"
		Then I verify the "Select1" node transform is "translate(200, 112.5)"
		Then I verify the "Select2" node transform is "translate(200, 583.5)"
		Then I verify the "Select3" node transform is "translate(200, 992)"
		Then I verify the "Merge" node transform is "translate(564.5, 992)"
		Then I verify the "Sample" node transform is "translate(1583, 583.5)"
		Then I verify the "Supernode1" node transform is "translate(366, 50)"
		Then I verify the "Supernode2" node transform is "translate(1468, 50)"
		Then I verify the "Supernode3" node transform is "translate(350, 330)"
		Then I verify the "Supernode4" node transform is "translate(929, 929.5)"

		# Test the nodes return to their vertical layout transforms on redo
		Then I click the redo button on the toolbar
		Then I click the zoom to fit button on the toolbar
		Then I verify the "User Input" node transform is "translate(811.5, 50)"
		Then I verify the "Select1" node transform is "translate(248.5, 205)"
		Then I verify the "Select2" node transform is "translate(811.5, 205)"
		Then I verify the "Select3" node transform is "translate(1615.5, 205)"
		Then I verify the "Merge" node transform is "translate(1615.5, 613.5)"
		Then I verify the "Sample" node transform is "translate(811.5, 1084.5)"
		Then I verify the "Supernode1" node transform is "translate(50, 551)"
		Then I verify the "Supernode2" node transform is "translate(133.5, 1022)"
		Then I verify the "Supernode3" node transform is "translate(597, 360)"
		Then I verify the "Supernode4" node transform is "translate(961.5, 1022)"
