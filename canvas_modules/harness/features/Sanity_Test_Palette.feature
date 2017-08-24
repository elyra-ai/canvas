Feature: Canvas sanity test

  ** Make sure the test harness is running and listening to http://localhost:3001 ***

  As a human
  I want to create a canvas to test the flyout palette
	@watch

  Scenario: Sanity test empty canvas with D3 rendering engine
		Given I am on the test harness
    Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have selected the "D3" rendering engine
		Given I have toggled the app side panel

		Then I open the palette
    Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 300, 200
    Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 400, 200
		Then I enter "Sel" into the palette search bar
		Then I add node 3 a "Select" node from the "Record Ops" category onto the canvas at 500, 200
		Then I try adding node 4 a "Sample" node from the "Record Ops" category onto the canvas at 500, 250
