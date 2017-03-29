Feature: edit a comment

  As a human
  I want to edit a comment
  So I can annotate a stream

  Scenario: Edit a comment
    Given I am on the test harness
    Then I add comment 1 at location 150, 150 with the text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."
