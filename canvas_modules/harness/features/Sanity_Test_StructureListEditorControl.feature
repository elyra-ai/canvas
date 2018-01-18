Feature: Sanity_Test_StructureListEditorControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test common-properties structure list editor control
	So I can test the structure list editor control in common-properties

	Scenario: Test generatedValues in structure list editor control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# generatedValues in key_definition with default of 1
		Given I have uploaded JSON for common-properties "structurelisteditor_paramDef.json"
		Then I select the "Tables" tab in "flyout"
		Then I open the "Configure Table Input" wide flyout panel
		Then I verify that "1" is a value in the "readonly_numbered_column_index" cell of row 1 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "Hello" is a value in the "name" cell of row 1 in the table "flexible-table-structurelisteditorTableInput"
		Then I click on Add Value button at index "0"
		Then I verify that "2" is a value in the "readonly_numbered_column_index" cell of row 2 in the table "flexible-table-structurelisteditorTableInput"
		Then I click on Add Value button at index "0"
		Then I click on Add Value button at index "0"
		Then I verify that "3" is a value in the "readonly_numbered_column_index" cell of row 3 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "4" is a value in the "readonly_numbered_column_index" cell of row 4 in the table "flexible-table-structurelisteditorTableInput"
		Then I click the subpanel edit button on row "4" from the "flexible-table-structurelisteditorTableInput" table
		Then I enter text "John Doe" in the "editor-control-name" textbox control
		Then I enter text "test" in the "editor-control-description" textbox control
		# close subpanel flyout
		Then I click on the "OK" button
		Then I verify that "4" is a value in the "readonly_numbered_column_index" cell of row 4 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "John Doe" is a value in the "name" cell of row 4 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "test" is a value in the "description" cell of row 4 in the table "flexible-table-structurelisteditorTableInput"
		Then I select the row 3 in the table "flexible-table-structurelisteditorTableInput"
		Then I click the "Remove" button on the "structurelisteditorTableInput" table
		Then I select the row 2 in the table "flexible-table-structurelisteditorTableInput"
		Then I click the "Remove" button on the "structurelisteditorTableInput" table
		Then I verify that "2" is a value in the "readonly_numbered_column_index" cell of row 2 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "John Doe" is a value in the "name" cell of row 2 in the table "flexible-table-structurelisteditorTableInput"
		Then I verify that "test" is a value in the "description" cell of row 2 in the table "flexible-table-structurelisteditorTableInput"
		# close wide flyout
		Then I click on the "OK" button
		# close common properties
		Then I click on the "OK" button
		Then I verify the event log for the "structurelisteditorTableInput" parameter contains "1,Hello,World,string,Readonly phrase,2,John Doe,test,,"


	Scenario: Test inline cell editing in structure list editor control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# inline editing of number field cells
		Given I have uploaded JSON for common-properties "structurelisteditor_paramDef.json"
		Then I select the "Tables" tab in "flyout"
		Then I open the "Configure Inline Editing Table" wide flyout panel
		Then I verify that the inline "number" field has "1" as a value in the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I verify that the inline "number" field has "1.234" as a value in the "doubleName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I enter the value "2" in the inline "number" field for the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I verify that the inline "number" field has "2" as a value in the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I enter the value "2.3" in the inline "number" field for the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I verify that the inline "number" field has "2" as a value in the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I enter the value "2.3" in the inline "number" field for the "doubleName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		Then I verify that the inline "number" field has "2.3" as a value in the "doubleName" cell of row 1 in the table "flexible-table-inlineEditingTable"
		# close wide flyout
		Then I click on the "OK" button
		# close common properties
		Then I click on the "OK" button
		Then I verify the event log for the "inlineEditingTable" parameter contains "2,2.3,Age >= 55"

	Scenario: Test complex error messages for inline cell editing in structure list editor control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# inline editing of number field cells generate messages
		Given I have uploaded JSON for common-properties "structurelisteditor_paramDef.json"
		Then I select the "Conditions" tab in "flyout"
		# error messages
		Then I open the "Configure AND Error Inline Editing Table" wide flyout panel
		Then I enter the value "2" in the inline "number" field for the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTableError"
		Then I enter the value "2.3" in the inline "number" field for the "doubleName" cell of row 1 in the table "flexible-table-inlineEditingTableError"
		Then I verify that the validation error is "fields are 2 and 2.3"
		# close wide flyout
		Then I click on the "OK" button
		
		Then I open the "Configure OR Error Inline Editing Table" wide flyout panel
		Then I enter the value "2.3" in the inline "number" field for the "doubleName" cell of row 1 in the table "flexible-table-inlineEditingTableError2"
		Then I verify that the validation error is "fields are 2 or 2.3"
		# close wide flyout
		Then I click on the "OK" button

		# warning messages
		Then I open the "Configure Warning Inline Editing Table" wide flyout panel
		Then I enter the value "3" in the inline "number" field for the "valueName" cell of row 1 in the table "flexible-table-inlineEditingTableWarning"
		Then I verify that the validation warning is "field1 should not equal 3"
		# close wide flyout
		Then I click on the "OK" button


		# close common properties
		Then I click on the "OK" button
		Then I verify the event log has the "error" message for the "inlineEditingTableError" parameter of "fields are 2 and 2.3"
		Then I verify the event log has the "error" message for the "inlineEditingTableError2" parameter of "fields are 2 or 2.3"
		Then I verify the event log has the "warning" message for the "inlineEditingTableWarning" parameter of "field1 should not equal 3"
