Feature: Canvas sanity test

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test ports operations
	So I can build a canvas and perform ports operations
@watch

Scenario: Sanity test for multiple ports operations with the D3 rendering engine
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/portsMultiple.json"
	Given I have toggled the app side panel

	Then I link node output port 1 to node input port 3
	Then I verify the number of port data links are 5
	Then I verify 1 link between source node "Var. File" source port "outPort" to target node "Select1" target port "inPort"

	Then I link node output port 2 to node input port 4
	Then I verify the number of port data links are 6
	Then I verify 1 link between source node "Select2" source port "outPort1" to target node "Table" target port "inPort"
	Then I link node output port 3 to node input port 4
	Then I verify the number of port data links are 7
	Then I verify 1 link between source node "Select2" source port "outPort2" to target node "Table" target port "inPort"
	Then I link node output port 4 to node input port 4
	Then I verify the number of port data links are 8
	Then I verify 1 link between source node "Select2" source port "outPort3" to target node "Table" target port "inPort"
	Then I link node output port 5 to node input port 4
	Then I verify the number of port data links are 9
	Then I verify 1 link between source node "Select2" source port "outPort4" to target node "Table" target port "inPort"

	Then I link node output port 6 to node input port 5
	Then I verify the number of port data links are 10
	Then I verify 1 link between source node "Select3" source port "outPort1" to target node "Neural Net" target port "inPort1"
	Then I link node output port 7 to node input port 5
	Then I verify the number of port data links are 11
	Then I verify 1 link between source node "Select3" source port "outPort2" to target node "Neural Net" target port "inPort1"
	Then I link node output port 8 to node input port 5
	Then I verify the number of port data links are 12
	Then I verify 1 link between source node "Select3" source port "outPort3" to target node "Neural Net" target port "inPort1"
	Then I link node output port 9 to node input port 5
	Then I verify the number of port data links are 13
	Then I verify 1 link between source node "Select3" source port "outPort4" to target node "Neural Net" target port "inPort1"
	Then I link node output port 10 to node input port 5
	Then I verify the number of port data links are 14
	Then I verify 1 link between source node "Select3" source port "outPort5" to target node "Neural Net" target port "inPort1"

	# Failure Test so the data links still remain 12
	Then I link node output port 13 to node input port 6
	Then I verify the number of port data links are 14
	Then I verify 0 link between source node "Select3" source port "outPort8" to target node "Neural Net" target port "inPort2"


	Then I link node output port 16 to node input port 12
	Then I verify the number of port data links are 15
	Then I verify 1 link between source node "Select4" source port "outPort" to target node "Sort" target port "inPort"

	Then I link node output port 16 to node input port 10
	Then I verify the number of port data links are 16
	Then I verify 1 link between source node "Select4" source port "outPort" to target node "Merge1" target port "inPort1"


	# Failure Test so the data links still remain
	Then I link node output port 16 to node input port 11
	Then I verify the number of port data links are 16
	Then I verify 0 link between source node "Select4" source port "outPort" to target node "Merge2" target port "inPort"

Scenario: Sanity test for simple ports operations with the D3 rendering engine
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "Flyout" palette layout
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/portsSimple.json"

	Then I open the palette
	Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 150, 450
	Then I close the palette

	Then I verify the number of port data links are 5
	Then I link node output port 5 to node input port 2
	Then I verify the number of port data links are 6
	Then I verify 1 link between source node "Field Reorder" source port "outPort" to target node "Na_to_K" target port "inPort"

	Then I disconnect links for node 6 a "Filter" on the canvas
	Then I verify the number of port data links are 4
	Then I verify 0 link between source node "Na_to_K" source port "outPort" to target node "Discard Fields" target port "inPort"
	Then I verify 0 link between source node "Discard Fields" source port "outPort" to target node "Define Types" target port "inPort"

	Then I delete node 3 the "C5.0" node
	Then I verify the number of port data links are 3
	Then I verify 0 link between source node "Define Types" source port "outPort" to target node "C5.0" target port "inPort"

	Given I have toggled the app side panel
