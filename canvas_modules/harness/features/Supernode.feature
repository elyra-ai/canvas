Feature: Supernode

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a supernode

	Scenario: Test the supernode expanded structure
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I verify the "image" for the "Supernode" node is displayed at 5, 4
		Then I verify the "label" for the "Supernode" node is displayed at 30, 18
		Then I verify the "label" for the "Supernode" node has width 65.015625

		Given I have toggled the app side api panel
		Given I have selected the "Set Node Label" API

		# Add a very long label to the supernode
		When I select node "Supernode" in the node label drop-down list
		And I enter "New Very Long Supernode Label To Test The Label Abbreviation" into the new label field
		And I call the API by clicking on the Submit button

		Then I verify the "label" for the "New Very Long Supernode Label To Test The Label Abbreviation" node is displayed at 30, 18
		Then I verify the "label" for the "New Very Long Supernode Label To Test The Label Abbreviation" node has width 125.28125

	Scenario: Sanity test supernode expanded to correct size
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeCanvas.json"

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
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded palette "modelerPalette.json"
		Given I have uploaded diagram "supernodeCanvas.json"

		Then I double click "Derive" node from the "Field Ops" category onto the canvas
		Then I verify pipeline 0 have 16 nodes
		Then I verify pipeline 1 have 8 nodes

		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		Then I click the "Derive" node to select it
		Then I click the cut button on the toolbar
		Then I right click at position 440, 300 to display the context menu
		Then I click option "Paste" from the "Edit" submenu
		Then I verify pipeline 0 have 15 nodes
		Then I verify pipeline 1 have 9 nodes

		# Without zooming in the browser.dragAndDrop() used by the link step does not
		# work, presumably because the screen is zoomed out too much.
		Then I click the zoom in button on the toolbar
		Then I link node "Distribution" output port "outPort" to node "Derive" input port "inPort" on the subflow
		Then I click the zoom out button on the toolbar

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

		Then I click the undo button on the toolbar
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
		Given I have set this canvas config ""{"extraCanvasDisplayed": true}""
		Given I have uploaded diagram "supernodeCanvas.json"

		Then I click the "Supernode" node to select it

		Then I click the cut button on the toolbar
		Then I click the paste button on the toolbar on the extra canvas

		Then I verify pipeline 0 have 14 nodes
		Then I verify there are 1 pipelines
		Then I verify extra canvas has a "Supernode" node

		Then I click the "Multiplot" node to select it
		Then I Ctrl/Cmnd+click the "Execution node" node to add it to the selections
		Then I right click the "Multiplot" node to display the context menu
		Then I click option "Create supernode" from the context menu

		Then I click the "Supernode" node to select it
		Then I click the copy button on the toolbar
		Then I click the paste button on the toolbar on the extra canvas

		Then I verify pipeline 0 have 13 nodes
		Then I verify there are 2 pipelines

		Then I verify extra canvas has a "Supernode" node
		Then I verify the extra canvas pipeline 0 have 2 nodes
		Then I verify the extra canvas have 3 pipelines

	Scenario: Sanity test create supernode with link that does not have port info
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedConnectionType": "Halo"}""
		Given I have uploaded palette "modelerPalette.json"

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

		Given I have set this canvas config ""{"selectedConnectionType": "Ports"}""
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu

		#Includes supernode binding node.
		Then I verify pipeline 1 have 2 nodes
		Then I verify pipeline 1 have 1 links

		#Includes two output ports from its subflow.
		Then I verify the "Supernode" node has 3 "output" ports

	Scenario: Sanity test selecting the canvas background of expanded supernodes
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeNestedCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		Then I click the expanded supernode canvas background with node label "Supernode1" to select it
		Then I Ctrl/Cmnd+click the expanded supernode canvas background with node label "Supernode3" to add it to the selections
		Then I verify that 2 objects are selected

		Then I click the canvas background at 100, 100 to close the context menu or clear selections
		Then I verify that 0 objects are selected

		Then I click the "Database" node to select it
		Then I Ctrl/Cmnd+click the expanded supernode canvas background with node label "Supernode1" to add it to the selections
		Then I verify that 2 objects are selected

		Then I click the expanded supernode canvas background with node label "Supernode3" to select it
		Then I verify that 1 objects are selected

	Scenario: Test context menu for sub-flow canvas background doesn't deselect nodes or comments
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeCanvas.json"

		# Travis needs this extra time
		Then I pause for 0.3 seconds

		# Select a node and check right click on sub-flow background doesn't deselect it
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I click the "Partition" node in the subflow to select it
		Then I right click the canvas background for supernode "Supernode" to display the context menu
		Then I verify that 1 objects are selected

		# Create a comment in the sub-flow and check right on sub-flow background doesn't deselect it
		Then I click option "New comment" from the context menu
		Then I edit the comment "" in the subflow with text "Hello Canvas in a sub-flow!"
		Then I click the "Partition" node in the subflow to select it
		Then I Ctrl/Cmnd+click the comment with text "Hello Canvas in a sub-flow!" in the subflow to add it to the selections
		Then I right click the canvas background for supernode "Supernode" to display the context menu
		Then I verify that 2 objects are selected

	Scenario: Test Select All in context menu for sub-flow canvas only selects non-binding nodes
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodeCanvas.json"

		# Select a node and check right click on sub-flow background doesn't deselect it
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I right click the canvas background for supernode "Supernode" to display the context menu
		Then I click option "Select All" from the context menu
		Then I verify that 5 objects are selected

	Scenario: Test Select All in context menu for sub-flow canvas only selects non-binding nodes
		Then I resize the window size to 1330 width and 660 height

		Given I am on the test harness
		Given I have uploaded diagram "supernodePortPosCanvas.json"

		# Check the first supernode (with 5 single-port binding nodes) is correctly positioned
		Then I right click the "Supernode-5-binding" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I verify the "Supernode-5-binding" node transform is "translate(76.90125274658203, 335.5875015258789)"

		# Check the two nodes in the first supernode's sub-flow are correctly positioned
		Then I verify the "SN1-Filler" node in the subflow transform is "translate(235, 496.5)"
		Then I verify the "SN1-Sample" node in the subflow transform is "translate(234, 594.5)"

		# Check the five single-port binding nodes in the first supernode are correctly positioned
		Then I verify the "SN1-BN-INPUT0" node in the subflow transform is "translate(5.5325910785737875, 541.2282679742564)"
		Then I verify the "SN1-BN-INPUT1" node in the subflow transform is "translate(5.5325910785737875, 577.7189309049523)"
		Then I verify the "SN1-BN-OUTPUT0" node in the subflow transform is "translate(463.4674089214262, 522.9829365089084)"
		Then I verify the "SN1-BN-OUTPUT1" node in the subflow transform is "translate(463.4674089214262, 559.4735994396044)"
		Then I verify the "SN1-BN-OUTPUT2" node in the subflow transform is "translate(463.4674089214262, 595.9642623703003)"

		# Check the second supernode (with 2 multi-port binding nodes) is correctly positioned
		Then I right click the "Supernode-2-binding" node to display the context menu
		Then I click option "Expand supernode" from the context menu
		Then I verify the "Supernode-2-binding" node transform is "translate(582.5964628569782, 329.97940826416016)"

		# Check the three nodes in the second supernode's sub-flow are correctly positioned
		Then I verify the "SN2-Filler" node in the subflow transform is "translate(752, -351.49998474121094)"
		Then I verify the "SN2-Select" node in the subflow transform is "translate(889.5, -344.99998474121094)"
		Then I verify the "SN2-Sample" node in the subflow transform is "translate(1039.5, -351.99998474121094)"

		# Check the five single-port binding nodes in the first supernode are correctly positioned
		Then I verify the "SN2-BN-INPUT" node in the subflow transform is "translate(598, -351.31031669823415)"
		Then I verify the "SN2-BN-OUTPUT" node in the subflow transform is "translate(1193.5, -354.72815902589485)"
