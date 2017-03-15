Feature: edit a comment

  As a human
  I want to edit a comment
  So I can annotate a stream
@watch
  Scenario: Edit a comment
    Given I have visited canvas test harness
    Then I create a new comment
    Then I add the value "this is a new comment"
    Then I see the comment value "this is a new comment"
    Then In the internal object model I see the comment value "this is a new comment" 
