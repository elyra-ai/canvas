Feature: NotificationPanel

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test NotificationPanel operations
	So I can test the notification panel appears and functions correctly in the toolbar

#	Scenario: Sanity test notification populated from running flow validation
#		Then I resize the window size to 1400 width and 800 height
#
#		Given I am on the test harness
#		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout"}""
#		Given I have uploaded palette "sparkPalette.json"
#
#		Then I verify the action "notification-action" in the toolbar is "disabled"
#		Then I open the palette
#		Then I open the "Transformations" palette category
#		Then I add a node of type "Add Column" from the "Transformations" category onto the canvas at 450, 200
#		Then I close the palette
#		Then I verify the number of nodes are 1
#		Then I right click at position 200, 200 to display the context menu
#		Then I click option "CMI: Validate Flow" from the context menu
#		Then I verify the "Add Column" node has an error marker
#		Then I verify the the notification panel has 1 messages
#		Then I click the open notification button on the toolbar
#		Then I verify the the content of the notification message at index 0 is of type "error"
#		Then I verify the the content of the notification message at index 0 contains text "Add Column node has 2 errors"
#		Then I click the close notification button on the toolbar
#		Then I click the open notification button on the toolbar
#		Then I close the notification panel by clicking on the canvas
#		Then I verify the notification panel is closed

	Scenario: Sanity test notification message callback and custom content
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have toggled the app side api panel
		Given I have selected the "Add Notification Message" API
		Then I verify the the notification panel has 0 messages

		Then I have selected the "warning" message type in the api sidepanel
		When I enter "Test warning message in notification panel" into the message details field
		Then I click on the toggle with label "harness-sidepanel-api-notification-timestamp" in the api sidepanel
		Then I click on the toggle with label "harness-sidepanel-api-notification-callback" in the api sidepanel
		And I call the API by clicking on the Submit button
		Then I click the open notification button on the toolbar
		Then I verify the action "notification-close-action" in the toolbar has svg of type "notificationCounterIcon"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon properties-icon fill notificationCounterIcon warning"
		Then I verify the the notification panel has 1 messages
		Then I verify the the content of the notification message at index 0 is of type "clickable.warning"
		Then I verify the the content of the notification message at index 0 contains text "Test warning message in notification panel"
		Then I verify the the content of the notification message at index 0 contains timestamp
		Then I click the notification message at index 0
		Then I verify the event log of event type "Notification Message Callback" has data "Message harness-message-0 was clicked."

		Then I have selected the "error" message type in the api sidepanel
		When I enter "Test error message in notification panel" into the message details field
		Then I click on the toggle with label "harness-sidepanel-api-notification-link" in the api sidepanel
		And I call the API by clicking on the Submit button
		Then I click the open notification button on the toolbar
		Then I verify the action "notification-close-action" in the toolbar has svg of type "notificationCounterIcon"
		Then I verify the action "notification-close-action" in the toolbar has svg with className "canvas-icon properties-icon fill notificationCounterIcon error"
		Then I verify the the notification panel has 2 messages
		Then I verify the the content of the notification message at index 1 is of type "clickable.error"
		Then I verify the the content of the notification message at index 1 contains text "Test error message in notification panel"
		Then I verify the the content of the notification message at index 1 contains timestamp
		Then I click the notification message at index 1
		Then I switch focus back to main tab
		Then I verify the event log of event type "Notification Message Callback" has data "Message harness-message-1 was clicked."
		Then I verify the the content of the notification message at index 1 contains custom content "a"
		Then I verify the browser has 2 tabs
		Then I click the notification message link at index 1
		Then I switch focus back to main tab
		Then I verify the browser has 3 tabs
		Then I switch focus back to main tab
