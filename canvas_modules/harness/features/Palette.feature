Feature: Palette

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas to test the flyout palette

	Scenario: Sanity test adding nodes into empty canvas
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout"}""
		Given I have uploaded palette "modelerPalette.json"

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
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout"}""
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
		Given I have set this canvas config ""{"selectedPaletteLayout": "Modal"}""
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
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout"}""
		Given I have uploaded palette "modelerPalette.json"
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "output" into the Category id field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "Outputs"

	Scenario: Sanity test adding node type to existing category to palette Flyout Panel
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedPaletteLayout": "Modal"}""
		Given I have uploaded palette "modelerPalette.json"
		Given I open the palette
		Given I have toggled the app side api panel
		Given I have selected the "Add PaletteItem" API

		When I enter "output" into the Category id field
		And I call the API by clicking on the Submit button
		Then I verify that "Custom Node Type" was added in palette category "Outputs"

	Scenario: Test saving 3 nodes of different types to palette
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout", "selectedSaveToPalette": "true"}""
		Given I have uploaded palette "sparkPalette.json"
		Given I have uploaded diagram "allTypesCanvas.json"

		Then I open the palette
		Then I verify the number of nodes are 5

		Then I click the "Binding (entry) node" node to select it
		Then I Ctrl/Cmnd+click the "Execution node" node to add it to the selections
		Then I Ctrl/Cmnd+click the "Model Node" node to add it to the selections
		Then I right click the "Execution node" node to display the context menu
		Then I click option "Save to palette" from the context menu

		Then I open the "Saved Nodes" palette category
		Then I add a node of type "Binding (entry) node" from the "Saved Nodes" category onto the canvas at 1200, 200
		Then I add a node of type "Execution node" from the "Saved Nodes" category onto the canvas at 1200, 280
		Then I add a node of type "Model Node" from the "Saved Nodes" category onto the canvas at 1200, 360
		Then I verify the number of nodes are 8

	Scenario: Test saving a supernode to palette
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout", "selectedSaveToPalette": "true"}""
		Given I have uploaded palette "sparkPalette.json"
		Given I have uploaded diagram "supernodeCanvas.json"

		Then I open the palette
		Then I verify pipeline 0 have 15 nodes

		Then I click the "Supernode" node to select it
		Then I right click the "Supernode" node to display the context menu
		Then I click option "Save to palette" from the context menu

		Then I open the "Saved Nodes" palette category
		Then I add a node of type "Supernode" from the "Saved Nodes" category onto the canvas at 1200, 200
		Then I verify pipeline 0 have 16 nodes
		Then I verify there are 3 pipelines

	Scenario: Test aspect ratio of images is preserved
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have set this canvas config ""{"selectedPaletteLayout": "Flyout"}""
		Given I have uploaded palette "animationsPalette.json"

		Then I open the palette
		Then I open the "Animations" palette category

		# The aspect ratio is preserved when height and width are different.
		Then I verify the "Triangle" node image has a "width" of 28 pixels
		Then I verify the "Triangle" node image has a "height" of 25.5312 pixels
