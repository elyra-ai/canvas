Feature: Canvas Sanity test from loaded file

  As a human
  I want to load a canvas
  So I can add more flow to the canvas
@watch
  Scenario: Sanity test from loaded file
    Given I am on the test harness
    Given I have toggled the app side panel
    Given I have uploaded palette "test_resources/palettes/modelerPalette.json"
    Given I have uploaded diagram "test_resources/diagrams/modelerCanvasComments.json"
    Given I have toggled the app side panel

		Then I pause for 3 seconds
    Then I add node 7 a "Field Reorder" node from the "Field Ops" category onto the canvas at 150, 500
    Then I select node 7 the "Field Reorder" node
    Then I add comment 4 at location 200, 500 with the text "Some text comment."
    Then I add node 8 a "Sort" node from the "Record Ops" category onto the canvas at 300, 450
    Then I link node 7 the "Field Reorder" node to node 8 the "Sort" node for link 10 on the canvas
    Then I link comment 4 to node 8 the "Sort" node for link 11 on the canvas
    Then I delete node link at 380, 240 between node 3 the "Filter" node and node 4 the "Type" node
    Then I link node 6 the "Filter" node to node 7 the "Field Reorder" node for link 11 on the canvas
    Then I link node 8 the "Sort" node to node 1 the "Type" node for link 12 on the canvas
		Then I pause for 3 seconds
