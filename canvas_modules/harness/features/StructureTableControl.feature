Feature: StructureTableControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test a common-properties structuretable control

	Scenario: Test of subpanel editing in a structuretable
		Then I resize the window size to 1400 width and 800 height

		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded common-properties file "structuretable_paramDef.json" of type "parameterDefs"

		Then I open the "Configure Rename fields" summary link in the "TABLES" category
		Then I click the subpanel button in control "structuretableReadonlyColumnDefaultIndex" in row "0"
		Then I enter "textValue" in textfield "structuretableReadonlyColumnDefaultIndex_0_3" in parent control "structuretableReadonlyColumnDefaultIndex" in row "0"
		Then I click the subpanel button "OK" button in control "structuretableReadonlyColumnDefaultIndex" in row "0"
		Then I verify readonly control "structuretableReadonlyColumnDefaultIndex_0_3" value is "textValue"
		Then I click on the "structuretableReadonlyColumnDefaultIndex-summary-panel" panel OK button
		Then I click on the "OK" button

	Scenario: Test the feature to have tables use the available vertical space
		Then I resize the window size to 1400 width and 700 height

		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type
		Given I have uploaded common-properties file "structuretable_paramDef.json" of type "parameterDefs"

		Then I open the "MSE Structure Table" summary link in the "TABLES" category
		Then I verify the table "ST_mse_table" is of height "469px"
