Feature: Links

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test link operations
	So I can build a canvas and perform link operations

	Scenario: Test node link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of data links are 5
		Then I right click the "Discard Fields" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of data links are 3

		# Test undo/redo on node links
		Then I click undo
		Then I verify the number of data links are 5
		Then I click redo
		Then I verify the number of data links are 3

	Scenario: Test comment link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of comments are 3
		Then I verify the number of comment links are 3
		Then I right click the comment with text " comment 2" to open the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of comment links are 1

		# Test undo/redo on comment links
		Then I click undo
		Then I verify the number of comment links are 3
		Then I click redo
		Then I verify the number of comment links are 1

	Scenario: Test node and comment combination link disconnection
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "vertical" fixed Layout
		Given I have selected the "Flyout" palette layout
		Given I have selected the "Halo" connection type
		Given I have uploaded diagram "/test_resources/diagrams/commentColorCanvas.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds

		# Test disconnect context menu option functionality
		Then I verify the number of comment links are 3
		Then I verify the number of data links are 5
		Then I click the comment with text " comment 2" to select it
		Then I Ctrl/Cmnd+click the "Discard Fields" node to add it to the selections
		Then I right click the "Discard Fields" node to display the context menu
		Then I click option "Disconnect" from the context menu
		Then I verify the number of comment links are 1
		Then I verify the number of data links are 3

		# Test undo/redo on node and comment links
		Then I click undo
		Then I verify the number of comment links are 3
		Then I verify the number of data links are 5
		Then I click redo
		Then I verify the number of comment links are 1
		Then I verify the number of data links are 3
