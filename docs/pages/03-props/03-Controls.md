# Controls

## Common Properties Element Types
The editor determines the most appropriate control and panel type for each parameter based on the context (parameter type, role, group type, etc.). Although an author can specify a desired control for a given parameter via its `uihints`, this should be used sparingly and carefully - specifying an inappropriate control for a parameter will lead to undefined behavior.

A visual documentation containing examples of the following group/panels and control types are available at https://wdp-common-canvas-dev.stage1.mybluemix.net/#/properties.

## Group/Panel Controls
Controls are grouped and arranged on panels and sub-panels within the "group_info" section of operator uihints. Some panels appear as tab controls, others are for managing shared dataset metadata, while still others contain nested sub-panels.

### Group Types
* `controls` A general panel type containing parameter controls.
* `tabs` A tabbed control, each tab containing sub-panels and controls.
* `subTabs` A horizontal sub-tabbed control, each tab containing sub-panels and controls. If displayed within a Tearsheet container, subtabs will be displayed vertically.
* `panels` A panel type that contains sub-panels.
* `panelSelector` A panel containing sub-panels that are shown or hidden based upon a controlling radio selection.
* `columnSelection` A panel type containing field-selection controls that share a common set of fields.
* `customPanel` A custom panel for displaying user defined control. See [3.5 Common Properties Custom Components](3.5-Common-Properties-Custom-Components.md#custom-panels) for more details.
* `summaryPanel` A panel used in the flyout editor that will provide a link to open a wide flyout that can contain panels and parameter.
* `actionPanel` A panel used for containing action controls.
* `textPanel` A panel used to display static label and/or description.
* `twistyPanel` A panel used to display a panel title that expands to the panel content when clicked.
* `columnPanel` A panel used to display children side by side.
* `tearsheetPanel` A tearsheet panel.  The panel can be opened/closed using the propertyController methods `setActiveTearsheet(groupId)` and `clearActiveTearsheet()`

## Parameter Controls
The following controls are supported in the Common Properties editor. Control types are intended for use with particular parameter types:

### Control Types
* `readonly` A read only text field. Used for fields users shouldn't edit.
* `hidden` A control that has no UI to display.
* `textfield` A single line editable text field.
* `passwordfield` A masked single line text field with tooltip. The tooltip text can be customized by setting `[parameter_id].passwordHide.tooltip` and `[parameter_id].passwordShow.tooltip` in resources section.
* `textarea` A multi-line text area.
* `list` A single column table for editing a list of values.
* `expression` An expression editing field  that provides language specific syntax highlighting and text auto complete.  An expression builder addon is available with the expression control.  You must provide the `expressionInfo` field for the `propertiesInfo` config. See [3.0 Common Properties Documentation](3.0-Common-Properties-documentation.md) for more details. To maximize in a tearsheet add this attribute and define a `tearsheetPanel` in `group_info`.
    ```
    "data": {
      "tearsheet_ref": "<tearsheet groupId>"
    }
    ```
* `code` An code editing field  that provides language specific syntax highlighting and text auto complete.  To maximize in a tearsheet add this attribute and define a `tearsheetPanel` in `group_info`.
    ```
    "data": {
      "tearsheet_ref": "<tearsheet groupId>"
    }
    ```
* `numberfield` A numeric text field. Number fields can also optionally display a random number generator button beside the control. See the uihints schema for details.
* `datefield` A date input control whose date format tokens follow [date-fns](https://date-fns.org/v2.29.3/docs/format). Defaults to `yyyy-mm-dd`
* `timefield` A time input control whose time format tokens follow [date-fns](https://date-fns.org/v2.29.3/docs/format). Defautls to `H:m:s`
* `datepicker` A date input control with calendar picker whose date format tokens follow [Flatpickr](https://flatpickr.js.org/formatting/#date-formatting-tokens). Defaults to `Y-m-d`. Helper text can be included by adding `[parameter_id].helper` in the resources section.
* `datepickerRange` A date input control with calendar picker for a range of dates. This follow the same rules as the `datepicker` control. Start and end labels defaults to `Start` and `End` respectively. Start, end, and helper labels can be customized by adding the following in the resources section:
    ```
    "resources": {
      [parameter_id].range.start.label: "Custom start label",
      [parameter_id].range.start.desc: "Custom start description that will appear as tooltip next to the label",
      [parameter_id].range.start.helper: "Custom start helper that will appear as text below the input",
      [parameter_id].range.end.label: "Custom end label",
      [parameter_id].range.end.desc: "Custom end description that will appear as tooltip next to the label",
      [parameter_id].range.end.helper: "Custom end helper that will appear as text below the input"`
    }
    ```
* `spinner` A standard spinner control to increment/decrement the number value.
* `checkbox` A standard checkbox control.
* `radioset` A radio set where a parameter value is selected from a small range of options. See the Conditions wiki page for special radio button disabling options.
* `checkboxset` A checkbox set for list type parameters with enumerated options where the count is less than 5.
* `oneofselect` A standard dropdown list control.
* `multiselect` A standard dropdown list control that allows for multiple selection.
* `someofselect` A multi-selection control for enumerated list parameters where the count is greater than 4.
* `selectcolumn` A dropdown list control that selects from available column names. When dropdown list is empty, `selectcolumn` control will display default placeholder text `"..."`. This placeholder text can be customized by setting `[parameter_id].emptyList.placeholder` in resources section. When custom empty list placeholder text is provided, common-properties will disable the empty list control.
* `selectcolumns` A multi-select control for column selections.
* `selectschema` A dropdown control that contains the available schemas in `dataset_metadata`. The `name` of the schema will be displayed if provided. If `name` is not provided, the index (zero-based) of the schema will be used instead. When dropdown list is empty, `selectschema` control will display default placeholder text `"..."`. This placeholder text can be customized by setting `[parameter_id].emptyList.placeholder` in resources section. When custom empty list placeholder text is provided, common-properties will disable the empty list control.
* `toggle`  A standard toggle control with default On/Off states. This text can be customized by setting `[parameter_id].toggle.on.label` and `[parameter_id].toggle.off.label` in resources section.
* `toggletext` A two-state control with optional icons that can exist on its own or within table cells.
* `structuretable` Table control for editing lists or maps of complex types that have field names in the first column.
* `structurelisteditor` For lists or maps of complex types that are *not* field-oriented parameters.
* `structureeditor` Allows one to define a structure and use it directly on a panel. Each structure member is surfaced as an individual control. Supports a `layout` setting that allows one to position structureeditor controls in a grid (see below).
* `readonlyTable` A read only table. Used for tables to display fields that users shouldn't edit.
* `custom` A custom control for displaying a user defined control. See [3.5 Common Properties Custom Components](3.5-Common-Properties-Custom-Components.md#custom-controls) for more details.
* `slider` A standard slider which allows to enter a numeric value within the slider range and also allows to drag and adjust the slider track to a specific value within the range. The slider labels for minimum and maximum values can be customized by setting them as `[parameter_id].min.label`   for minimum value label and `[parameter_id].max.label` for maximum value label in resources section.


### A Note on Field Name Storage
When a given node can accept more than a single datarecord-metadata object as input, it becomes necessary to store the schema name (a.k.a. 'link_name') along with each field name that is stored in parameter sets. In those cases, instead of using strings to store field names, they are represented in parameter sets as compound objects containing both 'link_ref' and 'field_name' elements:

    "current_parameters": {
      "field": { "link_ref": "Schema-1", "field_name": "Age" },
      ...

In order to indicate that a given node can potentially accept multiple input data links and would thus require compound field name storage, all parameter definitions within the node that contain `"role": "column"`, whether located at the top level or within complex types, should declare their data types as "object" instead of "string":

    "parameters": [
      {
        "id": "fields",
        "type": "array[object]",
        "role": "column",
        "required": true
      },
      ...

### edit_style
When editing complex type values in tables one can either edit cell values inline or in a sub panel:

* `subpanel` A small sub-dialog is launched to edit cell values.
* `inline` Controls appear inline within table cells for editing values.
* `on_panel` Control appears below the table when the row is selected.

### Miscellaneous
* `moveable_rows` *boolean* A value that appears in "complex_type_definition" sections. If set to `true` allows rows in the table to be moved  up and down for reordering.
* `row_selection` *enum ["single", "multiple"]* Determines how many rows can be selected in a table at one time. Defaults to *multiple*.
* `sortable` *boolean* Both sortable and filterable apply to table columns. When set within the "key_definition" or the "parameters" sections of a structure definition, those columns are sortable and/or can be filtered upon.
* `filterable` *boolean* _(see sortable above)_
* `language` *enum ["CLEM", "text/x-hive"]* The language for the expression control syntax highlight and text auto complete feature.  If not specified, the expression control does not have syntax highlighting or text auto complete.
* `layout` A two-dimensional string array value that appears in "complex_type_definition" sections and allows one to layout structureeditor controls in a two dimensional grid.
