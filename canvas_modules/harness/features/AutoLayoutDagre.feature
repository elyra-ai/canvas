Feature: AutoLayoutDagre using Dagre auto-layout algorithm - Vertical and Horizontal

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to load a canvas
	So I can test autoLayout operations to the canvas

	Scenario: Test for toolbar horizontal and vertical layout
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeLayoutCanvas.json"

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

	Scenario: Test for layout of a multiport node with many descendants with curve and elbow connections
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded diagram "layoutMultiPortsCanvas.json"

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Root" node transform is "translate(50, 902.5)"
		Then I verify the "Child1" node transform is "translate(200, 592.5)"
		Then I verify the "Child2" node transform is "translate(200, 1290)"
		Then I verify the "Big" node transform is "translate(350, 550)"
		Then I verify the "Small" node transform is "translate(350, 1290)"
		Then I verify the "Select1" node transform is "translate(500, 50)"
		Then I verify the "Select2" node transform is "translate(500, 205)"
		Then I verify the "Select3" node transform is "translate(500, 360)"
		Then I verify the "Select4" node transform is "translate(500, 515)"
		Then I verify the "Select5" node transform is "translate(500, 670)"
		Then I verify the "Select6" node transform is "translate(500, 825)"
		Then I verify the "Select7" node transform is "translate(500, 980)"
		Then I verify the "Select8" node transform is "translate(500, 1135)"
		Then I verify the "Select9" node transform is "translate(500, 1290)"
		Then I verify the "Sample" node transform is "translate(650, 205)"

		Given I have set this canvas config ""{"selectedNodeFormat": "Horizontal"}""

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Root" node transform is "translate(50, 710)"
		Then I verify the "Child1" node transform is "translate(290, 470)"
		Then I verify the "Child2" node transform is "translate(290, 1010)"
		Then I verify the "Big" node transform is "translate(530, 428.5)"
		Then I verify the "Small" node transform is "translate(530, 1010)"
		Then I verify the "Select1" node transform is "translate(770, 50)"
		Then I verify the "Select2" node transform is "translate(770, 170)"
		Then I verify the "Select3" node transform is "translate(770, 290)"
		Then I verify the "Select4" node transform is "translate(770, 410)"
		Then I verify the "Select5" node transform is "translate(770, 530)"
		Then I verify the "Select6" node transform is "translate(770, 650)"
		Then I verify the "Select7" node transform is "translate(770, 770)"
		Then I verify the "Select8" node transform is "translate(770, 890)"
		Then I verify the "Select9" node transform is "translate(770, 1010)"
		Then I verify the "Sample" node transform is "translate(1010, 170)"

		Given I have set this canvas config ""{"selectedNodeLayout": "Streams"}""
		Then I pause for 0.2 seconds

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Root" node transform is "translate(50, 545)"
		Then I verify the "Child1" node transform is "translate(323, 365)"
		Then I verify the "Child2" node transform is "translate(323, 770)"
		Then I verify the "Big" node transform is "translate(596, 281.5)"
		Then I verify the "Small" node transform is "translate(624, 770)"
		Then I verify the "Select1" node transform is "translate(929, 50)"
		Then I verify the "Select2" node transform is "translate(925, 140)"
		Then I verify the "Select3" node transform is "translate(929, 230)"
		Then I verify the "Select4" node transform is "translate(929, 320)"
		Then I verify the "Select5" node transform is "translate(929, 410)"
		Then I verify the "Select6" node transform is "translate(929, 500)"
		Then I verify the "Select7" node transform is "translate(929, 590)"
		Then I verify the "Select8" node transform is "translate(929, 680)"
		Then I verify the "Select9" node transform is "translate(929, 770)"
		Then I verify the "Sample" node transform is "translate(1198, 140)"

	Scenario: Test the horizontal layout of a flow and a sub-flow using curve and elbow connections
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have uploaded diagram "layoutSubFlowCanvas.json"

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Select1" node transform is "translate(50, 210)"
		Then I verify the "Select2" node transform is "translate(50, 365)"
		Then I verify the "Select3" node transform is "translate(591.5, 50)"
		Then I verify the "Table" node transform is "translate(591.5, 210)"
		Then I verify the "Neural Net" node transform is "translate(591.5, 365)"
		Then I verify the "Sort" node transform is "translate(591.5, 520)"
		Then I verify the "Supernode" node transform is "translate(200, 221.5)"
		Then I verify the "Merge1" node in the subflow transform is "translate(-749.5091705322266, 22.57819366455078)"
		Then I verify the "Merge2" node in the subflow transform is "translate(-518.0227603912354, 238.09954977035522)"
		Then I verify the "Merge3" node in the subflow transform is "translate(-295.0563049316406, 118.3043441772461)"
		Then I verify the "Select" node in the subflow transform is "translate(-389.2391815185547, -105.74821090698242)"
		Then I verify the "Select2" node in the subflow transform is "translate(101.01441240310669, -37.72170448303223)"

		Given I have set this canvas config ""{"selectedNodeFormat": "Horizontal", "selectedLinkType": "Elbow"}""

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Select1" node transform is "translate(50, 193)"
		Then I verify the "Select2" node transform is "translate(50, 313)"
		Then I verify the "Select3" node transform is "translate(701.5, 50)"
		Then I verify the "Table" node transform is "translate(701.5, 193)"
		Then I verify the "Neural Net" node transform is "translate(701.5, 313)"
		Then I verify the "Sort" node transform is "translate(701.5, 433)"
		Then I verify the "Supernode" node transform is "translate(290, 169.5)"
		Then I verify the "Merge1" node in the subflow transform is "translate(-749.5091705322266, 22.57819366455078)"
		Then I verify the "Merge2" node in the subflow transform is "translate(-518.0227603912354, 238.09954977035522)"
		Then I verify the "Merge3" node in the subflow transform is "translate(-295.0563049316406, 118.3043441772461)"
		Then I verify the "Select" node in the subflow transform is "translate(-389.2391815185547, -105.74821090698242)"
		Then I verify the "Select2" node in the subflow transform is "translate(101.01441240310669, -37.72170448303223)"

		Given I have set this canvas config ""{"selectedNodeLayout": "Streams"}""

		Then I click the horizontal layout button on the toolbar
		Then I click the zoom to fit button on the toolbar

		Then I verify the "Select1" node transform is "translate(50, 200.25)"
		Then I verify the "Select2" node transform is "translate(50, 290.25)"
		Then I verify the "Select3" node transform is "translate(779.5, 50)"
		Then I verify the "Table" node transform is "translate(779.5, 199)"
		Then I verify the "Neural Net" node transform is "translate(779.5, 289)"
		Then I verify the "Sort" node transform is "translate(779.5, 384)"
		Then I verify the "Supernode" node transform is "translate(323, 161.75)"
		Then I verify the "Merge1" node in the subflow transform is "translate(-749.5091705322266, 22.57819366455078)"
		Then I verify the "Merge2" node in the subflow transform is "translate(-518.0227603912354, 238.09954977035522)"
		Then I verify the "Merge3" node in the subflow transform is "translate(-295.0563049316406, 118.3043441772461)"
		Then I verify the "Select" node in the subflow transform is "translate(-389.2391815185547, -105.74821090698242)"
		Then I verify the "Select2" node in the subflow transform is "translate(101.01441240310669, -37.72170448303223)"
