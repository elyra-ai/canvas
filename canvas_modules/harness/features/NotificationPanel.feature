Feature: handleNotificationPanelClickOutside

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test NotificationPanel operations
	So I can test the notification panel appears and functions correctly in the toolbar

	Scenario: Sanity test enabling and disabling the notification bell icon in toolbar
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side api panel
		Given I have selected the "Add Notification Message" API

		Then I verify the action "notification-open-action" in the toolbar is "enabled"
		Then I click on the toggle with label "sidepanel-api-notification-disable" in the api sidepanel
		Then I verify the action "bell-action" in the toolbar is "disabled"

	Scenario: Sanity test notification populated from running flow validation
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have uploaded palette "/test_resources/palettes/sparkPalette.json"
		Given I have toggled the app side panel

		Then I pause for 1 seconds
		Then I open the palette
		Then I add node 1 a "Add Column" node from the "Transformations" category onto the canvas at 450, 200
		Then I close the palette
		Then I right click at position 200, 200 to display the context menu
		Then I click option "Validate Flow" from the context menu
		Then I verify that there are 1 nodes with a "error" indicator
		Then I verify the the notification panel has 1 messages
		Then I click on the secondary toolbar open notification button
		Then I verify the the content of the notification message at index 0 is of type "error"
		Then I verify the the content of the notification message at index 0 contains text "Add Column node has 2 errors"
		Then I click on the secondary toolbar close notification button
		Then I click on the secondary toolbar open notification button
		Then I close the notification panel by clicking on the canvas
		Then I verify the notification panel is closed

	Scenario: Sanity test adding different types of notification messages
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side api panel
		Given I have selected the "Add Notification Message" API
		Then I verify the the notification panel has 0 messages

		Then I have selected the "informational" message type in the api sidepanel
		When I enter "Test informational message in notification panel" into the message details field
		And I call the API by clicking on the Submit button
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg of type "bellDot"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot success"
		Then I verify the the notification panel has 1 messages
		Then I verify the the content of the notification message at index 0 is of type "informational"
		Then I verify the the content of the notification message at index 0 contains text "Test informational message in notification panel"

		Then I have selected the "success" message type in the api sidepanel
		When I enter "Test success message in notification panel" into the message details field
		Then I click on the toggle with label "sidepanel-api-notification-timestamp" in the api sidepanel
		And I call the API by clicking on the Submit button
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg of type "bellDot"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot success"
		Then I verify the the notification panel has 2 messages
		Then I verify the the content of the notification message at index 1 is of type "success"
		Then I verify the the content of the notification message at index 1 contains text "Test success message in notification panel"
		Then I verify the the content of the notification message at index 1 contains timestamp

		Then I have selected the "warning" message type in the api sidepanel
		When I enter "Test warning message in notification panel" into the message details field
		Then I click on the toggle with label "sidepanel-api-notification-callback" in the api sidepanel
		And I call the API by clicking on the Submit button
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg of type "bellDot"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot warning"
		Then I verify the the notification panel has 3 messages
		Then I verify the the content of the notification message at index 2 is of type "clickable.warning"
		Then I verify the the content of the notification message at index 2 contains text "Test warning message in notification panel"
		Then I verify the the content of the notification message at index 2 contains timestamp
		Then I click the notification message at index 2
		Then I verify the event log of event type "Notification Message Callback" has data "Message harness-message-2 was clicked."

		Then I have selected the "error" message type in the api sidepanel
		When I enter "Test error message in notification panel" into the message details field
		Then I click on the toggle with label "sidepanel-api-notification-link" in the api sidepanel
		And I call the API by clicking on the Submit button
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg of type "bellDot"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot error"
		Then I verify the the notification panel has 4 messages
		Then I verify the the content of the notification message at index 3 is of type "clickable.error"
		Then I verify the the content of the notification message at index 3 contains text "Test error message in notification panel"
		Then I verify the the content of the notification message at index 3 contains timestamp
		Then I click the notification message at index 3
		Then I verify the event log of event type "Notification Message Callback" has data "Message harness-message-3 was clicked."
		Then I verify the the content of the notification message at index 3 contains custom content "a"
		Then I verify the browser has 1 tabs
		Then I click the notification message link at index 3
		Then I verify the browser has 2 tabs
		Then I switch focus back to main tab
		Then I pause for 1 seconds

		# Delete messages
		Then I enter "harness-message-3" into the delete message with id field
		Then I click on the delete message submit button in the api sidepanel
		Then I verify the the notification panel has 3 messages
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot warning"

		Then I enter "harness-message-2" into the delete message with id field
		Then I click on the delete message submit button in the api sidepanel
		Then I verify the the notification panel has 2 messages
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot success"

		Then I enter "harness-message-1" into the delete message with id field
		Then I click on the delete message submit button in the api sidepanel
		Then I verify the the notification panel has 1 messages
		Then I click on the secondary toolbar open notification button
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon fill bellDot success"

		Then I enter "harness-message-0" into the delete message with id field
		Then I click on the delete message submit button in the api sidepanel
		Then I verify the the notification panel has 0 messages
		Then I verify the action "notification-open-action" in the toolbar has svg with className "canvas-icon fill bell info"
