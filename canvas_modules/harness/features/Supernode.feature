Feature: Supernode

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to create a supernode

  Scenario: Sanity test supernode expanded to correct size
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
    Given I have toggled the app side panel
		Given I have uploaded diagram "/test_resources/diagrams/supernodeCanvas.json"
		Given I have toggled the app side panel

		Then I resize the window size to 1330 width and 660 height

		Then I right click at position 300, 240 to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I verify the node id "7015d906-2eae-45c1-999e-fb888ed957e5" has width 200 and height 200

		Then I click the "Partition" node to select it
		Then I Cmd+click the "Distribution" node to add it to the selections
		Then I verify that 2 objects are selected

		# Right-click the Distribution node and create supernode.
		Then I right click at position 440, 330 to display the context menu
		Then I click option "Create supernode" from the context menu
		Then I verify there are 3 pipelines

		Then I right click at position 400, 330 to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify pipeline 0 have 14 nodes
		Then I verify pipeline 0 have 21 links
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
		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 1 have 8 nodes

		Then I right click at position 300, 240 to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I click the "Derive" node to select it
		Then I click on the secondary toolbar cut button
		Then I right click at position 440, 300 to display the context menu
		Then I click option "Paste" from the context menu
		Then I verify pipeline 0 have 14 nodes
		Then I verify pipeline 1 have 9 nodes

		Then I link node "Distribution" output port "outPort" to node "Derive" input port "inPort"

		Then I click the "Distribution" node to select it
		Then I Cmd+click the "Derive" node to add it to the selections
		Then I verify that 2 objects are selected

		# Right-click the Distribution node and create supernode.
		Then I right click at position 450, 290 to display the context menu
		Then I click option "Create supernode" from the context menu

		Then I right click at position 440, 330 to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify pipeline 0 have 14 nodes
		Then I verify pipeline 0 have 21 links
		Then I verify pipeline 1 have 8 nodes
		Then I verify pipeline 1 have 7 links
		Then I verify pipeline 2 have 4 nodes
		Then I verify pipeline 2 have 3 links
