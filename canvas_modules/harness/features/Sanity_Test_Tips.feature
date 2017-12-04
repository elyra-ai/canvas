Feature: Sanity_Test_Tips

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test tips for nodes, ports, links and the palette
	So I can get information when hovering over elements

Scenario: Sanity test to check if tips show up for the palette, nodes, ports and links
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have selected the "Flyout" palette layout
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
  Given I have toggled the app side panel

	Then I open the palette
	Then I hover over node type "Var. File" in category "Import"
	Then I verify the tip shows next to the node type "Var. File" in category "Import"

	Then I move the mouse to coordinates 300, 100
	Then I verify the tip doesn't show for node type "Var. File"

	Then I hover over the node "Define Types"
	Then I verify the tip shows below the node "Define Types"

	Then I move the mouse to coordinates 300, 100
	Then I verify the tip doesn't show for node "Define Types"

	Then I hover over the input port "inPort2" of node "Define Types"
	Then I verify the port name "Input Port 2" shows below the input port id "inPort2" of node "Define Types"

	Then I move the mouse to coordinates 300, 100
	Then I verify the tip doesn't show for input port id "inPort2"

	Then I hover over the link at 420, 260
	Then I verify the tip shows below 260 for link id "canvas_link_1" between node "Discard Fields", port "Output Port Two" and node "Define Types", port "Input Port 2"

	Then I move the mouse to coordinates 300, 100
	Then I verify the tip shows doesn't show for link id "canvas_link_1"


Scenario: Sanity test to check if tips don't show up for the palette, nodes, ports and links after disabling tips
	Given I am on the test harness
	Given I have toggled the app side panel
	Given I have selected the "D3" rendering engine
	Given I have selected the "Ports" connection type
	Given I have selected the "Flyout" palette layout
	Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
	Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"

	Then I have toggled the "Palette" tip type
	And I have toggled the "Nodes" tip type
	And I have toggled the "Ports" tip type
	And I have toggled the "Links" tip type

	Then I open the palette
	Then I hover over node type "Var. File" in category "Import"
	Then I verify the tip doesn't show for node type "Var. File"

	Then I hover over the node "Define Types"
	Then I verify the tip doesn't show for node "Define Types"

	Then I hover over the input port "inPort2" of node "Define Types"
	Then I verify the tip doesn't show for input port id "inPort2"

	Then I hover over the link at 420, 260
	Then I verify the tip shows doesn't show for link id "canvas_link_1"
