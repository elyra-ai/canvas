Feature: Main

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to create a canvas
  So I can build a graph

  Scenario: Sanity test empty canvas with D3 rendering engine
		Given I am on the test harness
    Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "D3" rendering engine
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		Then I open the palette
    Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 300, 200
    Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 400, 200
    Then I link node 1 the "Var. File" node to node 2 the "Derive" node for link 1 on the canvas
		Then I close the palette
    Then I select node 2 the "Derive" node
    Then I add comment 1 at location 300, 250 with the text "This comment box should be linked to the derive node."
		Then I open the palette
    Then I add node 3 a "Filter" node from the "Field Ops" category onto the canvas at 500, 200
    Then I link node 2 the "Derive" node to node 3 the "Filter" node for link 3 on the canvas
    Then I add node 4 a "Type" node from the "Field Ops" category onto the canvas at 600, 200
    Then I link node 3 the "Filter" node to node 4 the "Type" node for link 4 on the canvas
    Then I add node 5 a "C5.0" node from the "Modeling" category onto the canvas at 700, 100
    Then I add node 6 a "Neural Net" node from the "Modeling" category onto the canvas at 800, 300
		Then I close the palette
    Then I link node 4 the "Type" node to node 5 the "C5.0" node for link 5 on the canvas
    # this next test case fails because of issue #109
    #Then I link node 4 the "Type" node to node 6 the "Neural Net" node for link 6 on the canvas
    Then I select node 4 the "Type" node
    Then I add comment 2 at location 550, 350 with the text "this comment box should be linked to the type node"
    Then I link comment 2 with text "this comment box should be linked to the type node" to node 6 the "Neural Net" node for link 7 on the canvas
    Then I add comment 3 at location 750, 50 with the text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."

    # Now delete everything and go back to empty canvas
		Then I pause for 1 seconds

    Then I delete node 1 the "Var. File" node
    Then I delete node 1 the "Derive" node by pressing Delete
    Then I delete comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
    Then I delete node 1 the "Filter" node
    Then I delete comment 1 linked to the "Type" node with the comment text "this comment box should be linked to the type node"
    Then I delete node 1 the "Type" node
    Then I delete node 1 the "C5.0" node
    Then I delete node 1 the "Neural Net" node
    Then I delete comment 1 linked to the "Canvas" node with the comment text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."

    # Verify that the diagram.json has no content.
    Then I expect the object model to be empty
		Then I write out the event log
		Then I pause for 2 seconds

	Scenario: Sanity test selecting nodes opens properties
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "D3" rendering engine
		Given I have selected the "Halo" connection type
		Given I have toggled the app side panel

		Then I open the palette
		Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 300, 200
		Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 400, 200
		Then I close the palette

		Then I select node 2 the "Derive" node
		Then I see common properties flyout title "Derive"
		Then I select node 1 the "Var. File" node
		Then I see common properties flyout title "Var. File"
		Then I select all the nodes in the canvas
		Then I don't see the common properties flyout
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I select node 1 the "Var. File" node
		Then I see common properties flyout title "Var. File"
		Then I delete node 1 the "Var. File" node
		Then I don't see the common properties flyout

	Scenario: Sanity test changing node names reflected in canvas
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "D3" rendering engine
		Given I have selected the "Ports" connection type
		Given I have toggled the app side panel

		Then I open the palette
		Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 300, 200
		Then I close the palette

		Then I select node 1 the "Var. File" node
		Then I see common properties flyout title "Var. File"
		Then I click on title edit icon
		Then I enter new title "Var File2"
		Then I click on modal OK button
		Then I verify the new title "Var File2"

		Then I select node 1 the "Var File2" node
		Then I see common properties flyout title "Var File2"
		Then I click on title edit icon
		Then I enter new title "Var File3"
		Then I click the canvas background at 1, 1 to close the context menu or clear selections
		Then I verify the node with name "Var File3" shows in the canvas
