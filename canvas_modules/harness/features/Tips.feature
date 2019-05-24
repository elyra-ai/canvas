Feature: Tips

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test tips for nodes, ports, links and the palette
	So I can get information when hovering over elements

	Scenario: Sanity test to check if tips show up for the palette, nodes, ports and links
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
		Given I have toggled the app side panel

		Then I open the palette

		Then I hover over category "Import"
		Then I verify the tip shows next to category "Import"

		Then I hover over node type "Var. File" in category "Import"
		Then I verify the tip shows next to the node type "Var. File" in category "Import"

		Then I move the mouse to coordinates 300, 100
		Then I verify the tip doesn't show for node type "Var. File"

		Then I hover over the node "Define Types"
		Then I verify the tip shows "below" the node "Define Types"

		Then I move the mouse to coordinates 300, 100
		Then I verify the tip doesn't show for node "Define Types"

		Then I hover over the input port "inPort2" of node "Define Types"
		Then I verify the port name "Input Port 2" shows below the input port id "inPort2" of node "Define Types"

		Then I move the mouse to coordinates 300, 100
		Then I verify the tip doesn't show for input port id "inPort2"

		Then I hover over the link at 420, 260
		Then I verify the tip shows below 260 for link between node "Discard Fields", port "Output Port Two" and node "Define Types", port "Input Port 2"

		Then I move the mouse to coordinates 300, 100
		Then I verify the tip shows doesn't show for link

	Scenario: Sanity test to check if tips don't show up for the palette, nodes, ports and links after disabling tips
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
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
		Then I verify the tip shows doesn't show for link

	Scenario: Sanity test changing node name to update node tip
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
		Given I have toggled the app side api panel
		Given I have selected the "Set Node Label" API

		When I select node "Na_to_K" in the node label drop-down list
		And I enter "New Node Label" into the new label field
		And I call the API by clicking on the Submit button
		Then I hover over the node "New Node Label"
		And I verify the tip shows "below" the node "New Node Label"

Scenario: Sanity test changing input port name to update port tip
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
		Given I have toggled the app side api panel
		Given I have selected the "Set Input Port Label" API

		When I select node "Na_to_K" in the node label drop-down list
		When I select port "Input Port2" in the port drop-down list
		And I enter "New Port Label" into the new label field
		And I call the API by clicking on the Submit button
		Then I hover over the input port "inPort2" of node "Na_to_K"
		And I verify the port name "New Port Label" shows below the input port id "inPort2" of node "Na_to_K"

	Scenario: Sanity test changing output port name to update port tip
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
		Given I have toggled the app side api panel
		Given I have selected the "Set Output Port Label" API

		When I select node "Discard Fields" in the node label drop-down list
		When I select port "Output Port Two" in the port drop-down list
		And I enter "New Port Label" into the new label field
		And I call the API by clicking on the Submit button
		Then I hover over the output port "outPort2" of node "Discard Fields"
		And I verify the port name "New Port Label" shows below the output port id "outPort2" of node "Discard Fields"

	Scenario: Sanity test tip location adjusted based on boundaries of canvas
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded diagram "/test_resources/diagrams/allNodes.json"
		Given I have toggled the app side panel

		Then I click the zoom to fit button on the toolbar
		When I hover over the node "Random Forest Classifier"
		Then I verify the tip shows "above" the node "Random Forest Classifier"

	Scenario: Sanity test tip location adjusted based on boundaries of browser
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Given I have uploaded JSON for common-properties "CLEM_FilterRows_paramDef.json"

		Then I move the mouse to coordinates 55, 70 in common-properties
		And I verify the tip for label "Mode" is visible on the "top"

		Then I move the mouse to coordinates 260, 120 in common-properties
		And I verify the tip for label "Modeler CLEM Condition Expression" is visible on the "top"

	Scenario: Test if tips show up for the summary table values
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "flyout" properties container type
		Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"
		Then I hover over the text "people in generation X" in summary "Values"
		Then I pause for 1 seconds
		Then I verify the tip below the text "people in generation X" in summary "Values" is "visible"
		Then I move the mouse to coordinates 300, 100
		Then I pause for 1 seconds
		Then I verify the tip below the text "people in generation X" in summary "Values" is "hidden"

	Scenario: Test if tips show up for summary validation icon when there is an error or warning
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "flyout" properties container type
		Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"

		# Select an existing row in the table and delete it's value.
		Then I open the "Configure Derive Node" summary link in the "Structure List Table" category
		Then I select the row 1 in the table "expressionCellTable"
		Then I click the "Delete" button on the "expressionCellTable" table
		Then I select the row 1 in the table "expressionCellTable"
		Then I click the "Delete" button on the "expressionCellTable" table

		# Select an existing row in the table below and delete it's value.
		Then I select all the rows in the table "structurelisteditorTableInput"
		Then I click the "Delete" button on the "structurelisteditorTableInput" table
		Then I click on the "expressionCellTable-summary-panel" panel OK button
		Then I hover over the validation icon in the "Derive-Node" summary panel
		Then I pause for 3 seconds
		Then I verify the tip for the validation icon in the "Derive-Node" summary panel is visible

	Scenario: Sanity test to check if tips show up for a supernode and nodes inside the subflow
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Ports" connection type
		Given I have selected the "Flyout" palette layout
		Given I have uploaded palette "/test_resources/palettes/modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/multiPortsCanvas.json"
		Given I have toggled the app side panel

		# Create a supernode
		Then I click the "Discard Fields" node to select it
		Then I Ctrl/Cmnd+click the "Define Types" node to add it to the selections
		Then I right click the "Define Types" node to display the context menu
		Then I click option "Create supernode" from the context menu

		# Check the collapsed supernode shows a tip
		Then I hover over the node "Supernode"
		And I verify the tip shows "below" the node "Supernode"

		# Expand the supernode
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		# Check the expanded supernode shows a tip
		Then I hover over the node "Supernode"
		And I verify the tip shows "below" the node "Supernode"

		# Check one of the nodes in the subflow shows a tip
		Then I hover over the node "Discard Fields" in the subflow
		And I verify the tip shows "below" the node "Discard Fields" in the subflow

		# Check the other node in the subflow shows a tip
		Then I hover over the node "Define Types" in the subflow
		And I verify the tip shows "below" the node "Define Types" in the subflow
