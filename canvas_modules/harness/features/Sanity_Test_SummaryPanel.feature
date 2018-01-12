Feature: Sanity_Test_SummaryPanel

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties summary panel
	So I can test the summary panel controls in common-properties
		Scenario: Test of summary panel and wideflyout
			Given I am on the test harness
			Given I have toggled the app side common-properties panel
			Then I have selected the "flyout" properties container type
			Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"

			# click on a summary link and ensure the subcontrol is display and that it is in a Wideflyout
			Then I open the "Column Structure Table" category
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I verify that a wideflyout dialog has opened
			Then I verify that the "structuretableSortOrder" control is displayed
			Then I click on the "OK" button

			# If control is disable then no summary list is displayed.
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I check the checkbox with id "editor-control-enableSortByTable"
			Then I click on the "OK" button
			Then I verify that the summary list for the "Configure Sort Order" summary link in the "Column Structure Table" category is empty

			# If control is enable then summary list is displayed.
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I check the checkbox with id "editor-control-enableSortByTable"
			Then I click on the "OK" button
			Then I verify that the summary list contains the value of "Cholesterol" for the "Configure Sort Order" summary link in the "Column Structure Table" category

			# add a new row in the subcontrol and the summary list should contain the new values
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I click the "Add" button on the "structuretableSortOrder" table
			Then I select the "BP" field from the "Field Picker" table
			Then I click on the "Select Fields" button to save the new columns
			Then I click on the "OK" button
			Then I verify that the summary list contains the value of "BP" for the "Configure Sort Order" summary link in the "Column Structure Table" category

			# remove a row in the subcontrol and the summary list should Not contain the removed value.
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I select the row 2 in the table "flexible-table-structuretableSortOrder"
			Then I click the "Remove" button on the "structuretableSortOrder" table
			Then I click on the "OK" button
			Then I verify that the summary list does not contains the value of "BP" for the "Configure Sort Order" summary link in the "Column Structure Table" category

			# add a new row in the subcontrol and the summary list should contain the new values
			Then I open the "Configure Sort Order" summary link in the "Column Structure Table" category
			Then I click the "Add" button on the "structuretableSortOrder" table
			Then I select the "BP" field from the "Field Picker" table
			Then I click on the "Select Fields" button to save the new columns
			Then I click on the "Cancel" button
			Then I verify that the summary list does not contains the value of "BP" for the "Configure Sort Order" summary link in the "Column Structure Table" category

		Scenario: Test long table summaries
			Given I am on the test harness
			Given I have toggled the app side common-properties panel
			Then I have selected the "flyout" properties container type
			Given I have uploaded JSON for common-properties "summaryPanel_paramDef.json"

			# generatedValues in key_definition with default of 1
			Then I open the "Structure List Table" category
			Then I verify that the summary list contains the value of "BabyBoomer" for the "Configure Derive Node" summary link in the "Structure List Table" category
			Then I open the "Configure Derive Node" wide flyout panel
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			Then I click on Add Value button at index "0"
			# close wide flyout
			Then I click on the "OK" button
			Then I verify that the summary list contains the value of "BabyBoomer Age >= 55\nValue\nValue\nValue\nValue\nValue\nValue\nValue\nValue\nValue" for the "Configure Derive Node" summary link in the "Structure List Table" category
			Then I open the "Configure Derive Node" wide flyout panel
			Then I click on Add Value button at index "0"
			# close wide flyout
			Then I click on the "OK" button
			Then I verify the "Configure Derive Node" summary in the "Structure List Table" category contains more than ten rows
