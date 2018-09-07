Feature: Palette

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas to test the flyout palette

	Scenario: Sanity test adding nodes into empty canvas
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have toggled the app side panel

		Then I open the palette
		Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 300, 200
		Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 400, 200
		Then I click the Search icon to open the full palette
		Then I enter "sel" into the palette search bar
		Then I add node 3 a "Select" node from the "Record Ops" category onto the canvas at 500, 200
		Then I try adding node 4 a "Sample" node from the "Record Ops" category onto the canvas at 500, 250

	Scenario: Sanity test adding node type to palette Flyout Panel
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "newCategory" into the Category id field
		And I enter "New Category" into the Category name field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "New Category"

	Scenario: Sanity test adding node type to palette Modal Panel
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Modal" palette layout
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "newCategory" into the Category id field
		And I enter "New Category" into the Category name field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "New Category"

	Scenario: Sanity test adding node type to existing category to palette Flyout Panel
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "output" into the Category id field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "Outputs"

	Scenario: Sanity test adding node type to existing category to palette Flyout Panel
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Modal" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "output" into the Category id field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "Outputs"
