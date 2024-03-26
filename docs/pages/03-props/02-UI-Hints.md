# UI Hints
UI hints is a section of the property definition json and  contains specifications to assist in the presentation and flow of the property dialog.  The specifications indicate which controls to use to display and gather input on the fields.  
[uihints schema](https://github.com/elyra-ai/wdp-pipeline-schemas/blob/master/common-pipeline/operators/uihints-v1-schema.json)

The UI Hints section consists a set of simple and complex attributes.

**The simple attributes are:**

* `id` (*string*) Dialog id.
* `label` (*object*) External name of dialog.
    + See [Resource Definition](#resource-definition)
* `description` (*object*) Description of dialog.
    + See [Resource Definition](#resource-definition)
* `editor_size` (*string*) The width of the properties editor panel.  This can have a value of `"small"`, `"medium"`, `"large"` or `"max"`. The default is `"small"`. 
    - When `"small"` is specified the properties panel is displayed with a default width of 320px and with a resize button that allows the panel to be increased in size up to the `"medium"` size which is 480px.
    - When `"medium"` is specified the properties panel has a width of 480px and with a resize button that allows the panel to be increased in size up to the `"large"` size which is 640px.
    - When `"large"` is specified the properties panel has a width of 640px and with a resize button that allows the panel to be increased in size up to the `"max"` size which is 900px.
    - When `"max"` is specified the properties panel has a width of 900px and no resize button is displayed.  
* `pixel_width` (*object*) This optional property gives finer control over the minimum and maximum sizes of the properties editor panel. If this is omitted the properties editor width is controlled by the `editor_size` property. `pixel_width` is an object with two properties `min` and `max` which are both numbers.
    - If `min` is specified it overrides the default size of the shrunken panel and `max` is based on the `editor_size` value.
    - If `max` is specified it overrides the default size of the expanded panel and `min` is based on the `editor_size` value. 
    - If `editor_size` is set to `"large"` only the `max` value will be used to specify the size of the panel and no resize button will be displayed. 

  A warning will be displayed in the console if you specify an invalid value for either `min` or `max` such as making `min` greater than `max`.  

Example of the simple attributes:
```js
"uihints": {
  "id":"org.apache.spark.ml.ibm.transformers.Distinct",
  "icon": "images/transformationspark.svg",
  "label": {
    "default": "Distinct"
  },
  "editor_size": "medium",
  "pixel_width": {
    "min": 400,
    "max": 800
  },
  "description": {
    "default": "Remove rows to leave only rows with distinct combinations of rows"
}
```



**The complex attributes of the UI hints section are:**
## Group-info

Group info attributes.

* `id` (*string*) **Required** Panel id
* `type` (*string*) The group type to be displayed. see Group/Panel Controls in [3.3 Common Properties Controls](3.3-Common-Properties-Controls.md).
* `depends_on_ref` (*string*) Property name this group depends upon. Valid for panelSelector groups only.
* `label` (*object*) Group label.
    + See [Resource Definition](#resource-definition)
* `description` (*object*) Group description.  Only used with `textPanel` and `actionPanel`.
    + See [Resource Definition](#resource-definition)
    + See [Dynamic Text Expressions](3.2-Common-Properties-UI-Hints.md#dynamic-text-expressions)
    + `link` (object) Optional link in the description. [tooltipLinkHandler callback](3.0-Common-Properties-documentation.md#tooltiplinkhandler) must be defined whenever link object is added in uiHints..
        + `id` (string) Required unique link id.
        + `data` (object) Data passed to the tooltipLinkHandler callback.
* `parameter_refs` (*array[string]*) List of parameter to be displayed.
* `action_refs` (*array[string]*) List of action to be displayed.  Used with `actionPanel` only.
* `group_info` (*object*) List of additional group information. 
* `data` (*any*) Returned in custom panel constructor without any changes.
* `insert_panels` (*boolean*) Indicates whether panels, contained with a panelSelector, should be inserted between the radio buttons of a radio button set indicated by the depends_on_ref parameter.
* `nested_panel` (*boolean*) Indicate whether panel should be nested. Nested panels are indented by 16px from the left and display left border. Default is false.
* `class_name` (*string*) Optional classname for this group
* `open` (*boolean*) Optional used to determine if a panel should be open or not by default.  Used with `twistyPanel` only.  Default is `false`.


Example group info section:
```js
"group_info": [
      {
        "id": "settings",
        "label": {
          "default": "Settings"
        },
        "type": "columnSelection",
        "parameter_refs": [
          "keys"
        ]
      }
    ]
```

## UI-only Parameters
UI-only parameters require information about the parameters same as the parameter definition information used for the backend parameters.  The UI-only parameter definition information is stored in the UI-hints section in the sub-section named `ui_parameters`.  The format of the information in the `ui_parameters` sub-section is documented in the `Parameter Definition` section of [Common Properties Parameter Definition](3.1-Common-Properties-Parameter-Definition.md). 

Example
```js
"ui_parameters": [
    {
      "id":"databaseResource",
      "type":"boolean",
      "default":true
    },
    {
      "id":"toi",
      "type":"double",
      "default":0.0
    }
]
```

The UI-only parameters need to be added to other UI Hints sections (for example `Group Info` and canbe refered to by the `parameter_ref` field just like backend parameters.

## Parameter Info
The parameter info section contains the list of parameters to gather values on through the property dialogs and UI hints about each parameter.  The UI hints provide information to facilitate the UI controls used to display the parameter in the property dialogs.

Parameter info attributes.

* `parameter_ref` (*string*) **Required** Parameter name.
* `label` (*object*) External name for parameter.
   + See [Resource Definition](#resource-definition)
* `label_visible` (*boolean*) Determines whether to display the label for a control.
* `description` (*object*) Description of parameter with optional placement context.
    + See [Resource Definition](#resource-definition)
    + `placement` (*string*) Placement context for the text.  Valid values are `as_tooltip, on_panel`.
    + `link` (*object*) Optional link in the description. [tooltipLinkHandler callback](3.0-Common-Properties-documentation.md#tooltiplinkhandler) must be defined whenever link object is added in uiHints..
        + `id` (*string*) Required unique link id.
        + `data` (*object*) Data passed to the tooltipLinkHandler callback.
* `control` (*string*) Which control to use. see Parameter Controls in [3.3 Common Properties Controls](3.3-Common-Properties-Controls.md).
* `increment` (*number*) Determines the increment/decrement value for the spinner control only. The default value is `1`.
* `orientation` (*string*) Determines how the control is displayed. Valid values are `vertical, horizontal`.
* `width` (*number*) Column width for tables. The widths provided for table columns are used to calculate relative widths for each table column. So for example a 3 column table with widths of 20, 30, and 50 would use 20%, 30%, and 50% of the overall table width, respectively.
* `char_limit` (*number*) Limits the number of characters a user can enter into the control for string parameters only.
* `display_chars` (*number*) This has been deprecated and is subject to removal. Limits the number of characters displayed for a text field in a column in a table.  The text will have an ellipsis appended at this limit. Defaults to 64 characters.
* `separator` (*string*) Determines where to put a separator relative to the current control.  Valid values are ` after, before`.
* `visible` (*boolean*) Determines whether to display control in a table cell. Used in complex types only.
* `place_holder_text` (*object*) Text hint for the user displayed input controls. 
    + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
* `resource_key` (*string*) Used as a key for enum value labels in the resources section of property definition.
* `edit_style` (*string*) Editing style of elements in a table. Valid values are `subpanel, inline, on_panel`.
* `value_icons` (*array[string]*) For enumerated types, this defines the set of icons for the valid values. The ordering must be consistent with the order in the parameter enum attribute.
* `filterable` (*boolean*) Determines if this column values can be filtered so that only rows that match the filter in column values are shown in the table. Applies to complex parameters only.
* `sortable` (*boolean*) Determines if this column values can be sorted into ascending/descending order in a table. Applies to complex parameters only.
* `number_generator` (*object*) Describes a number generator button beside numeric control. The 'label' element is a standard resource item, and the 'range' element contains 'min' and 'max' attributes to constrain the range of generated numbers.
* `dm_default` (*string*) Data record metadata field to be used for default values in table cell columns. Typically this is used with parameters in complex structures in which the key field is a column name. Valid values are `type`, `description`, `measure`, and `modeling_role`.
* `dm_image` (*string*) This can be set to display an icon of the corresponding dm type in the `role`:`column` field of a table. Valid values are `measure`, `type`, `none`
* `summary` (*boolean*) Determines if parameter should be shown in the summary when using a `summaryPanel`. 
* `text_before` (*object*) Text to be displayed before the control
    + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
    + `type` (*string*) Adds a icon and additional formatting to the text.  Only `info` is support at this time.
    + See [Dynamic Text Expressions](3.2-Common-Properties-UI-Hints.md#dynamic-text-expressions)
* `text_after` (*object*) Text to be displayed after the control
    + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
    + `type` (*string*) Adds a icon and additional formatting to the text.  Only `info` is support at this time.
    + See [Dynamic Text Expressions](3.2-Common-Properties-UI-Hints.md#dynamic-text-expressions)
* `custom_control_id` (*string*) Id that is used to determine which custom control to use when `control=custom`
* `data` (*any*) Returned in custom control constructor without any changes.
* `rows` (*integer*) Number of rows to show in a table before scrolling starts. If one table in a panel is set to -1, that table will use the remaining available vertical space, down to a minimum of 2 rows.  Used in expression and code controls to determine the number of rows to show for those controls.
* `moveable_rows` (*boolean*) Determines if rows can be moved up or down in a table or array of strings.
* `action_ref` (*string*) An action to be displayed.  
* `date_format` (*string*) A format string such as YYYY-MM-DD which describes the display and entry format for a date field.
* `time_format` (*string*) A format string such as HH:mm:ss which describes the display and entry format for a time field.
* `custom_value_allowed` (*boolean*) Determines if a dropdown, outside of a table, can allow a custom value to be entered.
* `class_name` (*string*) Optional classname for this parameter
* `resizable` (*boolean*) Determines if this column can be resized in a table. When a column is resized, width of all the columns to the right of resized column is adjusted. Applies to structure parameters only. Default is `false`.

Example parameter info section:
```js
    "parameter_info": [
      {
        "parameter_ref": "keys",
        "label": {
          "resource_key": "sort.keys.label"
        },
        "description": {
          "resource_key": "sort.keys.desc",
          "placement": "on_panel"
        },
        "rows": -1
      }
    ]
```

## Complex Type Info
The complex_type_info section defines complex data types.  This section is needed if in the `parameters` section of the parameter definition, one of the parameters has a type that is not the base type (i.e. an array or map of base types).  The type of control used for this definition depends on the group info type value.

Complex Type info attributes.

* `complex_type_ref` (*string*) **Required** Name of complex type, can be referenced in other places.
* `key_definition` (*string*) A set of parameter info attributes about the key parameter.
* `label` (*object*) External name of subpanel.
     + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
* `parameters` (*object*) **Required** List of parameters that are part of this complex parameter.  This parameter can either have a set of parameter_info attributes or other nested complex_type_info attributes.
* `header` (*boolean*) If `true` then the table has a header row with column names. Defaults to `true`. 
* `add_remove_rows` (*boolean*) If `true` then the table can have rows added and removed. Defaults to `true`.
* `include_all_fields` (*boolean*) When `true` and `add_remove_rows` is `false`, ensures that all fields are included in the control at all times. 
* `row_selection` (*string enum*) How many rows in a table can be selected at a time. 
    + `single`: only one row at a time is able to be selected.
    + `multiple`: multiple rows at a time are able to be selected. 
    + `multiple-edit`: select multiple rows and allow the editing of column values of all selected rows.
* `buttons` (*array*) An array of objects that define custom buttons to be displayed in this complex structure, overriding any default buttons. Each button object contains the following properties:
    + `id` (*string*) **Required**: Unique identifier used to identify the button in the callback function.
    + `label` (*object*): Button label to display. If an icon is specified as well, the icon will be shown to the right of the label.
        + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
    + `description` (*object*): Tooltip text to display when the button is hovered.
        + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
  + `icon` (*string*): URL to .svg image to display.
  + `carbon_icon` (*string*): Host provided name of Carbon icon to display. A callback function is required for the host application to return the jsx icon object imported from @carbon/icons-react library.
  + `enabled` (*boolean*): Button will be enabled if true, disabled if false.
  + `divider` (*string enum*): Display a divider before or after this button. Defaults to `after`
    + `before` Display divider before this button
    + `after` Display divider after this button

Example complex_type_info section:
```js
 "complex_type_info": [
      {
        "complex_type_ref": "SortEntry",
        "row_selection": "multiple",
        "moveable_rows": true,
        "add_remove_rows": false,
        "include_all_fields": true,
        "key_definition": {
          "parameter_ref": "field",
          "width": 28,
          "label": {
            "resource_key": "SortEntry.field.label"
          }
        },
        "parameters": [
          {
            "parameter_ref": "sort_order",
            "width": 16,
            "resource_key": "SortEntry.sort_order",
            "label": {
              "resource_key": "SortEntry.sort_order.label"
            },
            "control": "toggletext",
            "value_icons": [
              "/images/up-triangle.svg",
              "/images/down-triangle.svg"
            ]
          }
        ]
      },
      {
        "complex_type_ref": "FieldStorageEntry",
        "key_definition": {
          "parameter_ref": "field",
          "label": {
            "default": "",
            "resource_key": "FieldStorageEntry.field"
          },
          "width": 26,
          "sortable": true,
          "filterable": true
        },
        "parameters": [
          {
            "parameter_ref": "override",
            "label": {
              "default": "",
              "resource_key": "FieldStorageEntry.override"
            },
            "width": 16,
            "edit_style": "inline",
            "sortable": true
          },
          {
            "parameter_ref": "storage",
            "label": {
              "default": "",
              "resource_key": "FieldStorageEntry.storage"
            },
            "width": 26,
            "edit_style": "inline",
            "dm_default": "type"
          }
        ],
        "buttons": [
          {
            "id": "icon_button_1",
            "carbon_icon": "Edit32",
            "label": {
              "resource_key": "table.somekey.label"
            },
            "description": {
              "default": "This renders a button that has a label and Carbon icon to the right of the label.
            },
            "enabled": true
          }
        ]
      }
    ]
```
## Action Info
The action_info section defines an action.  Actions are used to callback to the application to perform an operation.

Action info attributes.

* `id` (*string*) **Required** Id of the action.
* `label` (*object*) **Required** External name of action.
    + See [Resource Definition](3.2-Common-Properties-UI-Hints.md#resource-definition)
* `control` (*string*) **Required** The type of action.  Currently `button` and `image` are supported.
* `class_name` (*string*) Optional classname for this action
* `image` (*object*) Properties associate with an `image` action.
    * `url` (*string*) Location of the image to display.
    * `placement` (*string*) Placement of image relative to a property.  Values are `right` or `left`.
    * `size` (*object*) Pixel size of the image.
        * `height` (*number*) Image height in pixels.
        * `width` (*number*) Image width in pixels.
    * `tooltip_direction` (*string*) Set tooltip direction for action image. Values are `right`, `left`, `top`, or `bottom`. Default is `bottom`.
* `button` (*object*) Properties associated with action button.
    * `kind` (*string*) Button kind. Values are same as carbon button kind values. Default is `tertiary`.
    * `size` (*string*) Button size. Values are sm, md, lg, xl. Default is `sm`.
* `data` (*any*) Returned back in action callback.

```js
{
  "id": "increment",
  "label": {
    "default": "Increment"
  },
  "control": "button",
  "data": {
    "parameter_ref": "number"
  }
}
```

## Resource Definition
Used for user facing text.  Allows for default values if no translations are provided.

* `default` (*string*) Default value if `resource_key` not defined.
* `resource_key` (*string*) Used as a key for enum value labels in the resources section of property definition.

## Dynamic text expressions
Used to dynamically set text based on a parameter value change. If parameter id is used then then current value for that parameter will be passed into the function.

* `percent(<number or parameter id>, <integer>)`  Return the percent of the 1st parameter.  The optional 2nd parameter determines the number of decimal places.  
* `sum(<number or parameter id>, <number or parameter id>, ...)`  Returns the sum of all parameters

```js
{
  "parameter_ref": "numberfield",
  "label": {
    "default": "Number"
  },
  "text_after": {
    "default": "Sum: ${sum(numberfield, 2)} with (numberfield, 2, numberfield). Percent: ${percent(numberfield,2)}"
  }
}
```
