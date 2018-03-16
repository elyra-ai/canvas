Feature: Ports

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test ports operations
	So I can build a canvas and perform ports operations

Scenario: Sanity test to check it a port to port link can be made with a new node
	Then I resize the window size to 1400 width and 800 height
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
  Given I have toggled the app side panel

	Then I open the palette
	Then I add node 7 a "Filler" node from the "Field Ops" category onto the canvas at 380, 580
	Then I close the palette

	Then I verify the number of port data links are 5

	Then I link node "Filler" output port "outPort2" to node "Define Types" input port "inPort3"
	Then I verify the number of port data links are 6
	Then I verify 1 link between source node "Filler" source port "outPort2" to target node "Define Types" target port "inPort3"

	Then I disconnect links for node 6 a "Discard Fields" on the canvas
	Then I verify the number of port data links are 4

	Then I verify 0 link between source node "Na_to_K" source port "outPort" to target node "Discard Fields" target port "inPort"
	Then I verify 0 link between source node "Discard Fields" source port "outPort2" to target node "Define Types" target port "inPort2"

	Then I delete node 3 the "C5.0" node
	Then I verify the number of port data links are 3
	Then I verify 0 link between source node "Define Types" source port "outPort1" to target node "C5.0" target port "inPort"

Scenario: Sanity test for multiple ports operations with the D3 rendering engine
	Then I resize the window size to 1400 width and 800 height
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas2.json"
	Given I have toggled the app side panel


	Then I link node "Select4" output port "outPort" to node "Merge1" input port "inPort3"
	Then I verify the number of port data links are 4
	Then I verify 1 link between source node "Select4" source port "outPort" to target node "Merge1" target port "inPort3"

	Then I link node "Var. File" output port "outPort" to node "Select1" input port "inPort"
	Then I verify the number of port data links are 5
	Then I verify 1 link between source node "Var. File" source port "outPort" to target node "Select1" target port "inPort"

	Then I link node "Select2" output port "outPort1" to node "Table" input port "inPort"
	Then I verify the number of port data links are 6
	Then I verify 1 link between source node "Select2" source port "outPort1" to target node "Table" target port "inPort"

	Then I link node "Select2" output port "outPort2" to node "Table" input port "inPort"
	Then I verify the number of port data links are 7
	Then I verify 1 link between source node "Select2" source port "outPort2" to target node "Table" target port "inPort"

	Then I link node "Select2" output port "outPort3" to node "Table" input port "inPort"
	Then I verify the number of port data links are 8
	Then I verify 1 link between source node "Select2" source port "outPort3" to target node "Table" target port "inPort"

	Then I link node "Select2" output port "outPort4" to node "Table" input port "inPort"
	Then I verify the number of port data links are 9
	Then I verify 1 link between source node "Select2" source port "outPort4" to target node "Table" target port "inPort"

	Then I link node "Select3" output port "outPort1" to node "Neural Net" input port "inPort1"
	Then I verify the number of port data links are 10
	Then I verify 1 link between source node "Select3" source port "outPort1" to target node "Neural Net" target port "inPort1"

	Then I link node "Select3" output port "outPort2" to node "Neural Net" input port "inPort1"
	Then I verify the number of port data links are 11
	Then I verify 1 link between source node "Select3" source port "outPort2" to target node "Neural Net" target port "inPort1"

	Then I link node "Select3" output port "outPort3" to node "Neural Net" input port "inPort1"
	Then I verify the number of port data links are 12
	Then I verify 1 link between source node "Select3" source port "outPort3" to target node "Neural Net" target port "inPort1"

	Then I link node "Select3" output port "outPort4" to node "Neural Net" input port "inPort1"
	Then I verify the number of port data links are 13
	Then I verify 1 link between source node "Select3" source port "outPort4" to target node "Neural Net" target port "inPort1"

	Then I link node "Select3" output port "outPort5" to node "Neural Net" input port "inPort1"
	Then I verify the number of port data links are 14
	Then I verify 1 link between source node "Select3" source port "outPort5" to target node "Neural Net" target port "inPort1"

	Then I link node "Select4" output port "outPort" to node "Sort" input port "inPort"
	Then I verify the number of port data links are 15
	Then I verify 1 link between source node "Select4" source port "outPort" to target node "Sort" target port "inPort"

	Then I link node "Select4" output port "outPort" to node "Merge1" input port "inPort1"
	Then I verify the number of port data links are 16
	Then I verify 1 link between source node "Select4" source port "outPort" to target node "Merge1" target port "inPort1"

	# Now do some negative test cases

	# The cardinality of 'inPort2' port on 'Neural Net' node is a max of 2 so this following
	# link should fail so we verify the number of ports is the same.
	Then I link node "Select3" output port "outPort8" to node "Neural Net" input port "inPort2"
	Then I verify the number of port data links are 16
	Then I verify 0 link between source node "Select3" source port "outPort8" to target node "Neural Net" target port "inPort2"

	# Node "Select4" node "outPort" has a maximum cardinality of 4.  That node already has 4 links
	# coming from it so this next connection should fail.
	Then I link node "Select4" output port "outPort" to node "Merge2" input port "inPort"
	Then I verify the number of port data links are 16
	Then I verify 0 link between source node "Select4" source port "outPort" to target node "Merge2" target port "inPort"

	# Node "Var. File" is a binding node with no input ports. Therefore, it should not be
	# possible to make a link to it from another node.
	# coming from it so this next connection should fail.
	Then I link node "Merge2" output port "outPort" to node "Var. File"
	Then I verify the number of port data links are 16

Scenario: Sanity test for dynamically adding ports by updating pipeline flow through API
	Then I resize the window size to 1400 width and 800 height
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas3.json"
	Given I have toggled the app side api panel
	Given I have selected the "Set PipelineFlow" API

	When I update the pipelineflow to add input and output ports to node "Select1"
	And I call the API by clicking on the Submit button
	Then I link node "Var. File" output port "outPort" to node "Select1" input port "inPort"
	Then I link node "Select3" output port "outPort1" to node "Select1" input port "inPort2"
	Then I link node "Select1" output port "outPort" to node "Select3" input port "inPort"
	Then I link node "Select1" output port "outPort2" to node "Select2" input port "inPort"
	Then I verify the number of port data links are 4
	Then I verify 1 link between source node "Var. File" source port "outPort" to target node "Select1" target port "inPort"
	Then I verify 1 link between source node "Select3" source port "outPort1" to target node "Select1" target port "inPort2"
	Then I verify 1 link between source node "Select1" source port "outPort" to target node "Select3" target port "inPort"
	Then I verify 1 link between source node "Select1" source port "outPort2" to target node "Select2" target port "inPort"
