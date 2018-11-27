Feature: Supernode

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a supernode

	Scenario: Test the supernode expanded structure
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have uploaded diagram "/test_resources/diagrams/supernodeCanvas.json"
		Given I have toggled the app side panel

		Then I resize the window size to 1330 width and 660 height

		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify the node image for the "Supernode" node is displayed at 5, 4

	Scenario: Sanity test supernode expanded to correct size
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have uploaded diagram "/test_resources/diagrams/supernodeCanvas.json"
		Given I have toggled the app side panel

		Then I resize the window size to 1330 width and 660 height

		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I verify the node id "7015d906-2eae-45c1-999e-fb888ed957e5" has width 200 and height 200

		Then I click the "Partition" node in the subflow to select it
		Then I Ctrl/Cmnd+click the "Distribution" node in the subflow to add it to the selections
		Then I verify that 2 objects are selected

		# Right-click the Distribution node and create supernode.
		Then I right click the "Partition" node in the subflow to display the context menu
		Then I click option "Create supernode" from the context menu
		Then I verify there are 3 pipelines

		# Delete nested supernode within supernode from primary pipeline
		Then I click the "Supernode" node in the subflow to select it
		Then I delete all selected objects via the Delete key
		Then I verify pipeline 1 have 6 nodes
		Then I verify pipeline 1 have 3 links
		Then I press Ctrl/Cmnd+Z to Undo
		Then I verify pipeline 1 have 7 nodes
		Then I verify pipeline 1 have 6 links

		Then I right click the "Supernode" node in the subflow to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 0 have 24 links
		Then I verify pipeline 1 have 7 nodes
		Then I verify pipeline 1 have 6 links
		Then I verify pipeline 2 have 5 nodes
		Then I verify pipeline 2 have 4 links

	Scenario: Sanity test create supernode within a supernode with a new node from palette
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Ports" connection type
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/supernodeCanvas.json"
		Given I have toggled the app side panel

		Then I resize the window size to 1330 width and 660 height

		Then I double click "Derive" node from the "Field Ops" category onto the canvas
		Then I verify pipeline 0 have 16 nodes
		Then I verify pipeline 1 have 8 nodes

		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I click the "Derive" node to select it
		Then I click on the secondary toolbar cut button
		Then I right click at position 440, 300 to display the context menu
		Then I click option "Paste" from the "Edit" submenu
		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 1 have 9 nodes

		# Without zooming in the browser.dragAndDrop() used by the link step does not
		# work, presumably because the screen is zoomed out too much.
		Then I click zoom in
		Then I link node "Distribution" output port "outPort" to node "Derive" input port "inPort" on the subflow
		Then I click zoom out

		Then I click the "Distribution" node in the subflow to select it
		Then I Ctrl/Cmnd+click the "Derive" node in the subflow to add it to the selections
		Then I verify that 2 objects are selected

		# Right-click the Distribution node and create supernode.
		Then I right click the "Distribution" node in the subflow to display the context menu
		Then I click option "Create supernode" from the context menu

		Then I right click the "Supernode" node in the subflow to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 0 have 24 links
		Then I verify pipeline 1 have 8 nodes
		Then I verify pipeline 1 have 7 links
		Then I verify pipeline 2 have 4 nodes
		Then I verify pipeline 2 have 3 links
		Then I verify there are 3 pipelines

		# Delete supernode should remove nested subpipelines
		Then I click the supernode label with node id "7015d906-2eae-45c1-999e-fb888ed957e5" to select it
		Then I delete all selected objects via the Delete key
		Then I verify there are 1 pipelines
		Then I verify pipeline 0 have 14 nodes

		Then I click undo
		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 0 have 24 links
		Then I verify pipeline 1 have 8 nodes
		Then I verify pipeline 1 have 7 links
		Then I verify pipeline 2 have 4 nodes
		Then I verify pipeline 2 have 3 links
		Then I verify there are 3 pipelines

	Scenario: Sanity test cut and copy supernode from first canvas to second canvas
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Ports" connection type
		Given I have uploaded diagram "/test_resources/diagrams/supernodeCanvas.json"

		Then I click on extra canvas toggle
		Then I pause for 2 seconds
		Given I have toggled the app side panel

		Then I click the "Supernode" node to select it

		Then I click on the secondary toolbar cut button
		Then I click on the extra canvas secondary toolbar paste button

		Then I verify pipeline 0 have 14 nodes
		Then I verify there are 1 pipelines
		Then I verify extra canvas has a "Supernode" node

		Then I click the "Multiplot" node to select it
		Then I Ctrl/Cmnd+click the "Execution node" node to add it to the selections
		Then I right click the "Multiplot" node to display the context menu
		Then I click option "Create supernode" from the context menu

		Then I click the "Supernode" node to select it
		Then I click on the secondary toolbar copy button
		Then I click on the extra canvas secondary toolbar paste button

		Then I verify pipeline 0 have 13 nodes
		Then I verify there are 2 pipelines

		Then I verify extra canvas has a "Supernode" node
		Then I verify the extra canvas pipeline 0 have 2 nodes
		Then I verify the extra canvas have 3 pipelines

	Scenario: Sanity test create supernode with link that does not have port info
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded predefined palette "modelerPalette.json"

		Then I resize the window size to 1330 width and 660 height

		Then I open the palette
		Then I add node 1 a "Filler" node from the "Field Ops" category onto the canvas at 400, 200
		Then I add node 2 a "Type" node from the "Field Ops" category onto the canvas at 700, 200
		Then I add node 3 a "Filter" node from the "Field Ops" category onto the canvas at 700, 400
		Then I close the palette

		Then I link node 1 the "Filler" node to node 2 the "Type" node for link 1 on the canvas
		Then I link node 1 the "Filler" node to node 3 the "Filter" node for link 2 on the canvas

		Then I verify pipeline 0 have 3 nodes
		Then I verify pipeline 0 have 2 links

		Then I right click the "Filler" node to display the context menu
		Then I click option "Create supernode" from the context menu

		Given I have selected the "Ports" connection type
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		#Includes supernode binding node.
		Then I verify pipeline 1 have 2 nodes
		Then I verify pipeline 1 have 1 links

		#Includes two output ports from its subflow.
		Then I verify the "Supernode" node has 3 "output" ports
