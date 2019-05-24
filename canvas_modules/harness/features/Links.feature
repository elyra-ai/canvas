Feature: Links

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test link operations
	So I can build a canvas and perform link operations

	Scenario: Test node link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of data links are 5
		Then I right click the "Discard Fields" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of data links are 3

		# Test undo/redo on node links
		Then I click the undo button on the toolbar
		Then I verify the number of data links are 5
		Then I click the redo button on the toolbar
		Then I verify the number of data links are 3

	Scenario: Test comment link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of comments are 3
		Then I verify the number of comment links are 3
		Then I right click the comment with text " comment 2" to open the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of comment links are 1

		# Test undo/redo on comment links
		Then I click the undo button on the toolbar
		Then I verify the number of comment links are 3
		Then I click the redo button on the toolbar
		Then I verify the number of comment links are 1

	Scenario: Test node and comment combination link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of comment links are 3
		Then I verify the number of data links are 5
		Then I click the comment with text " comment 2" to select it
		Then I Ctrl/Cmnd+click the "Discard Fields" node to add it to the selections
		Then I right click the "Discard Fields" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of comment links are 1
		Then I verify the number of data links are 3

		# Test undo/redo on node and comment links
		Then I click the undo button on the toolbar
		Then I verify the number of comment links are 3
		Then I verify the number of data links are 5
		Then I click the redo button on the toolbar
		Then I verify the number of comment links are 1
		Then I verify the number of data links are 3

	Scenario: Test elbow connections from multi-port source node do not overlap
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Elbow" link type
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas2.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds
		Then I link node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1"
		Then I verify the number of data links are 4
		Then I verify the link from node "Select3" output port "outPort6" to node "Neural Net" input port "inPort2" has path "M 108 443.5L 144 443.5Q 154 443.5 154 433.5L 154 407Q 154 397 164 397L 319 397"
		Then I verify the link from node "Select3" output port "outPort7" to node "Neural Net" input port "inPort2" has path "M 108 463.5L 136 463.5Q 146 463.5 146 453.5L 146 407Q 146 397 156 397L 319 397"
		Then I verify the link from node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1" has path "M 108 483.5L 128 483.5Q 138 483.5 138 473.5L 138 387Q 138 377 148 377L 319 377"

		Then I move the "Neural Net" node on the canvas to 50, 530
		Then I verify the number of data links are 4
		Then I verify the link from node "Select3" output port "outPort6" to node "Neural Net" input port "inPort2" has path "M 108 443.5L 128 443.5Q 138 443.5 138 453.5L 138 500.75Q 138 510.75 128 510.75L 30 510.75Q 20 510.75 20 520.75L 20 568Q 20 578 30 578L 50 578"
		Then I verify the link from node "Select3" output port "outPort7" to node "Neural Net" input port "inPort2" has path "M 108 463.5L 136 463.5Q 146 463.5 146 473.5L 146 510.75Q 146 520.75 136 520.75L 30 520.75Q 20 520.75 20 530.75L 20 568Q 20 578 30 578L 50 578"
		Then I verify the link from node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1" has path "M 108 483.5L 144 483.5Q 154 483.5 154 493.5L 154 510.75Q 154 520.75 144 520.75L 30 520.75Q 20 520.75 20 530.75L 20 548Q 20 558 30 558L 50 558"
