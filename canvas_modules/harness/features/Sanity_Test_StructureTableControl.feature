Feature: Sanity_Test_StructureTableControl

	** Make sure the test harness is running and listening to http://localhost:3001 ***

	As a human
	I want to test common-properties structure table control
	So I can test the structure table control in common-properties

	Scenario: Test generatedValues in structure table control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# generatedValues in key_definition with default of 1
		Given I have uploaded JSON for common-properties "structuretable_paramDef.json"
		Then I open the "Configure Rename fields" wide flyout panel
		Then I click on Add Columns button to open field picker at index "0"
		Then I select the "Na" checkbox
		Then I select the "K" checkbox
		Then I select the "Drug" checkbox
		Then I click on the "OK" button
		Then I verify that "Age" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "1" is a value in the "structuretableRenameFields_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "BP" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "2" is a value in the "structuretableRenameFields_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "Na" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "3" is a value in the "structuretableRenameFields_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "K" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "4" is a value in the "structuretableRenameFields_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "Drug" is a value in the "field" cell of row 5 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "5" is a value in the "structuretableRenameFields_readonly_int" cell of row 5 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I select the row 1 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I click the "Remove" button on the "structuretableReadonlyColumnDefaultIndex" table
		Then I verify that "BP" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "1" is a value in the "structuretableRenameFields_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "Na" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "2" is a value in the "structuretableRenameFields_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "K" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "3" is a value in the "structuretableRenameFields_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "Drug" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		Then I verify that "4" is a value in the "structuretableRenameFields_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnDefaultIndex"
		# close wide flyout
		Then I click on the "OK" button
		# close common properties
		Then I click on the "OK" button
		Then I verify the event log for the "structuretableReadonlyColumnDefaultIndex" parameter contains "1,BP,BP-1,blood pressure,,1982-02-23,2,Na,Na,,string,,3,K,K,,string,,4,Drug,Drug,,string,"

	Scenario: Test generatedValues with startValue in structure table control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# generatedValues with startValue of 5
		Given I have uploaded JSON for common-properties "structuretable_paramDef.json"
		Then I open the "Configure Sort Order" wide flyout panel
		Then I click on Add Columns button to open field picker at index "0"
		Then I select the "Age" checkbox
		Then I select the "Drug" checkbox
		Then I click on the "OK" button
		Then I verify that "Cholesterol" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Age" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I select the row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I click the "Remove" button on the "structuretableReadonlyColumnStartValue" table
		Then I verify that "Age" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I click on Add Columns button to open field picker at index "0"
		Then I select the "Cholesterol" checkbox
		Then I click on the "OK" button
		Then I verify that "Cholesterol" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		# close wide flyout
		Then I click on the "OK" button
		# close common properties
		Then I click on the "OK" button
		Then I verify the event log for the "structuretableReadonlyColumnStartValue" parameter contains "Age,5,Ascending,Drug,6,Ascending,Cholesterol,7,Ascending"

	Scenario: Test generatedValues and moveableRows in structure table control
		Given I am on the test harness
		Given I have toggled the app side common-properties panel
		Then I have selected the "Flyout" properties container type

		# generatedValues with startValue of 5
		Given I have uploaded JSON for common-properties "structuretable_paramDef.json"
		Then I open the "Configure Sort Order" wide flyout panel
		Then I click on Add Columns button to open field picker at index "0"
		Then I select the "Age" checkbox
		Then I select the "Drug" checkbox
		Then I select the "Sex" checkbox
		Then I click on the "OK" button
		Then I verify that "Cholesterol" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Age" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Sex" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "8" is a value in the "structuretable_sort_order_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I select the row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that moveable row button "top" is "disabled"
		Then I verify that moveable row button "up" is "disabled"
		Then I verify that moveable row button "down" is "enabled"
		Then I verify that moveable row button "bottom" is "enabled"
		Then I click on the moveable row button "down" to move the row
		Then I verify that "Age" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Cholesterol" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Sex" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "8" is a value in the "structuretable_sort_order_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I click on the moveable row button "down" to move the row
		Then I verify that "Age" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Cholesterol" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Sex" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "8" is a value in the "structuretable_sort_order_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I select the row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that moveable row button "top" is "enabled"
		Then I verify that moveable row button "up" is "enabled"
		Then I verify that moveable row button "down" is "disabled"
		Then I verify that moveable row button "bottom" is "disabled"
		Then I click on the moveable row button "top" to move the row
		Then I verify that "Sex" is a value in the "field" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "5" is a value in the "structuretable_sort_order_readonly_int" cell of row 1 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Age" is a value in the "field" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "6" is a value in the "structuretable_sort_order_readonly_int" cell of row 2 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Drug" is a value in the "field" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "7" is a value in the "structuretable_sort_order_readonly_int" cell of row 3 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "Cholesterol" is a value in the "field" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		Then I verify that "8" is a value in the "structuretable_sort_order_readonly_int" cell of row 4 in the table "flexible-table-structuretableReadonlyColumnStartValue"
		# close wide flyout
		Then I click on the "OK" button
		# close common properties
		Then I click on the "OK" button
		Then I verify the event log for the "structuretableReadonlyColumnStartValue" parameter contains "Sex,5,Ascending,Age,6,Ascending,Drug,7,Ascending,Cholesterol,8,Ascending"
