Feature: Migrate

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to create a canvas
	So I can build a graph

	Scenario: Sanity test migration of v0 test files to current version
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/x-allNodes.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-bigCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-commentColorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-customAttrsCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-decoratorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-linkColorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-manyLinks.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-modelerCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-multiPortsCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/x-radialCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

	Scenario: Sanity test migration of v1 test files to current version
		Then I resize the window size to 1400 width and 800 height
		Given I am on the test harness
		Given I have toggled the app side panel
		Given I have selected the "Flyout" palette layout
		Given I have uploaded predefined palette "modelerPalette.json"
		Given I have uploaded diagram "/test_resources/diagrams/v1-allNodes.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-bigCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-commentColorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-customAttrsCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-decoratorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-linkColorCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-manyLinks.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-modelerCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-multiPortsCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors

		Given I have uploaded diagram "/test_resources/diagrams/v1-radialCanvas.json"
		Then I click the download button
		Then I verify there were no schema validation errors
