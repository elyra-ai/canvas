Feature: Canvas sanity test

  As a human
  I want to create a canvas
  So I can build a graph
@watch
  Scenario: Sanity test empty canvas
    Given I am on the test harness
    Given I have opened the app side panel
    Given I have uploaded palette "test_resources/palettes/modelerPalette.json"

    Then I add a var file import node
    Then I add a derive field node
    Then I link import node to derive field node
    Then I select derive field node
    Then I add comment to derive node with the text "This comment box should be linked to the derive node."
    Then I add filter node
    Then I link derive field node to filternode
    Then I add type node
    Then I link filter node to type node.
    Then I add C5.0 model node
    Then I add Neural net model node
    Then I link type node to C5.0 node
    Then I link type node to Neural Net Node
    Then I select type node
    Then I add comment box to the type node with the text "this comment box should be linked to the type node"
    Then I link comment node to Neural net node.
    Then I add comment box to the canvas with the text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."

    # At this point verify that the diagram.json is correct.
    # Now delete everything and go back to empty canvas

    Then I delete import node
    Then I delete link between derive field node and filter node
    Then I delete link between derive field comment and derive field node.
    Then I delete derive field node
    Then I delete comment box.
    Then I delete filter node.
    Then I delete type node comment box.
    Then I delete type node
    Then I delete C5.0 node
    Then I delete Neural net node
    Then I delete canvas comment box

    # Verify that the diagram.json has no content.
