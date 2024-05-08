# Getting started with Common Properties

## Introduction
Common properties will display a set of controls (such as radio buttons, checkboxes, etc.) to allow the user to view and set property values. Common Properties takes a JSON object (called the paramDef object) as input. The paramDef object describes the properties to be displayed as controls in the Common Properties React object.

You can look at the harness/src/client/App.js file of this repo to see examples of code that uses the common properties component.

## Note
There are two ways to call the Common Properties tooling: Either by allowing the form to be built dynamically from a parameterDef JSON (which is comprised of the base property set, ui-hints, conditions, and resources), or by explicitly providing the dialog form for rendering (deprecated). The first approach is recommended as an easier and clearer interface_

## Building a properties panel in a React app

To use Common Properties in your React application you need to do the following 3 easy steps:

### Step 1 : Import
First import the CommonProperties React component from the common-canvas library. Elyra Canvas produces both esm and cjs outputs. By default esm will be used when webpack is used to build the consuming application.

```js
    import { CommonProperties } from "@elyra/canvas";
```
**Properties Only**

To import only common properties functionality in `cjs` format use:

```js
    import { CommonProperties } from "@elyra/canvas/dist/lib/properties";
```


### Step 2 : Set the data
Next you'll need to populate propertiesInfo with:

```js
propertiesInfo: {
  parameterDef: this.parameterDef,          // Parameter definitions/hints/conditions
  appData: "{user-defined}",                // User data returned in applyPropertyChanges [optional]
  additionalComponents: "{components}",     // Additional component(s) to display [optional]
  messages: "[node_messages]",              // Node messages array [optional]
  expressionInfo: this.expressionInfo,      // Information for expression builder [optional],
  initialEditorSize: "{size}",	            // This value will override the value of editor_size in uiHints. This can have a value of "small", "medium", "large", or null [optional]
  id: "{id}"	                            // Unique parameter definition ID [Optional]
}
```
See the [Common Properties Parameter Definition](04.01-parameter-definition.md) page for more details.

The parameterDef object must conform to  the [parameterDef schema](https://github.com/elyra-ai/pipeline-schemas/tree/master/common-canvas/parameter-defs)

The expressionInfo object must conform to the [expressionInfo schema](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-canvas/expression)

or...

(Deprecated)
```js
propertiesInfo: {
  formData: this.formData,
  appData: "{user data returned back in applyPropertyChanges}", //optional
  additionalComponents: "{additional control(s) to display}",   //optional
  messages: "[node_messages]",                                  // Node messages array [optional]
  expressionInfo: this.expressionInfo,                          // Information for expression builder [optional]
  initialEditorSize: "{size}",	                                // This value will override the value of editor_size in uiHints. This can have a value of "small", "medium", "large", or null [optional]
  id: "{id}"	                                                // Unique parameter definition ID [Optional]
}
```
formData [schema](https://github.com/elyra-ai/pipeline-schemas/tree/master/common-canvas/form)

The optional messages attribute can be used to set validation messages associated with a node.  The format of the message objects is defined in [Pipeline Flow UI schema](https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/pipeline-flow/pipeline-flow-ui-v3-schema.json)

### Step 3 : Display the properties editor

Finally you'll need to display the editor. Inside your render code, add the following:
```html
import { IntlProvider } from "react-intl";
var i18nData = require("../intl/en.js");

var locale = "en";
var messages = i18nData.messages;
  <IntlProvider key="IntlProvider2" locale={ locale } messages={ messages }>
    <CommonProperties
      ref={(instance) => {
        this.CommonProperties = instance;
      }}
      propertiesInfo={this.propertiesInfo} // required
      propertiesConfig={this.propertiesConfig} // optional
      callbacks={this.callbacks} // required
      customPanels={[CustomSliderPanel, CustomTogglePanel]} //optional
      customControls={[CustomSliderControl]} // optional
      light // optional
    />
  </IntlProvider>
```
**Properties**

- propertiesInfo `object`: See above
- propertiesConfig `object`:
    - containerType `string`: type of container to display the properties, can be "Modal", "Tearsheet", or "Custom".  default: `"Custom"`
    - rightFlyout `boolean`: If set to true, groups will be displayed as an accordion. If false, groups are displayed as tabs. default: `false`
    - applyOnBlur `boolean`: calls applyPropertyChanges when focus leave common-properties.  default: `false`
    - disableSaveOnRequiredErrors `boolean`: Disable the properties editor "save" button if there are required errors
    - enableResize `boolean`: adds a button that allows the right-side fly-out editor to expand/collapse between small and medium sizes. default: `true`
    - conditionReturnValueHandling `string`: used to determine how hidden or disabled control values are returned in applyPropertyChanges callback.  Current options are "value" or "null".  default: `"value"`
    - buttonLabels `object`:
        - primary `string`: Label to use for the primary button of the properties dialog
        - secondary `string`: Label to use for the secondary button of the properties dialog
    - heading `boolean`: show heading and heading icon in right-side fly-out panels. default: `false`
    - schemaValidation `boolean`: If set to true, schema validation will be enabled when a parameter definition has been set in CommonProperties. Any errors found will be reported on the browser dev console. It is recommended you run with schema validation switched on while in development mode.
    - applyPropertiesWithoutEdit `boolean`: When true, will always call `applyPropertyChanges` even if no changes were made.  default: `false`
    - maxLengthForMultiLineControls `number` - maximum characters allowed for multi-line string controls like textarea. default: 1024
    - maxLengthForSingleLineControls `number` - maximum characters allowed for single-line string controls like textfield. default: 128
    - convertValueDataTypes `boolean` - Default false. If set to true, currentParameter values whose data type does not match what is defined in the parameter definitions will be converted to the specified data type.
    - trimSpaces `boolean` - Default true. If set to false, condition ops(`isEmpty`, `isNotEmpty`) and `required` fields are allowed to only contain spaces without triggering condition errors.
    - showRequiredIndicator `boolean` - Default true to show `(required)` indicator. If set to false, show `(optional)` indicator next to properties label.
    - showAlertsTab `boolean` - Default true to show "Alerts" tab whenever there are error or warning messages. If set to false, Alerts tab won't be displayed.
    - returnValueFiltering `array` - Default []. When set this will filter out any values in the array in the parameters returned when `applyPropertyChanges` is call.  Only primitive data types are currently supported.
    - categoryView `string` - View categories in right-flyout. Can be `"accordions"` or `"tabs"`. default: `"accordions"`.
- callbacks object - See the [Callbacks](04.02-callbacks.md) page for more details on each callback method.
- customPanels `array`: array of custom panels.  See [Custom Panels](04.06-custom-components.md#custom-panels) section of the Common Properties Custom Components page.
- customControls `array`: array of custom controls. See [Custom Controls](04.06-custom-components.md#custom-controls) section of the Common Properties Custom Components page..
- customConditionOps `array`: array of custom condition operators.  See [Custom Condition Operators](04.06-custom-components.md#custom-condition-operators) section of the Custom Components page.
- light `boolean`: Carbon controls in common-properties will use light mode. When the `light` option is disabled, the background color will be the same as the Carbon theme background. When the `light` option is enabled, the background color is set to $ui-01. Defaults to `true`

**Internationalization and override of labels in CommonProperties**
The CommonProperties dialogs have a set of labels that can have customized and internationalized values.  CommonProperties uses the react-intl package to provide internationalization of these labels.  This requires the `IntlProvider` element to wrap the `CommonProperties` element.
You can look at the **harness/src/intl/en.js** file of this repo to see the list of labels and the default values.

**Reference methods**
```js
/*
* @closeEditor (boolean) - determines if closePropertiesDialog is called or not
*/
applyPropertiesEditing(closeEditor)
```


### Using CommonProperties in CommonCanvas right-flyout panel

[Common Canvas](03-common-canvas.md) has a [right-flyout panel](03-common-canvas.md#right-flyout-panel-parameters) that can render a React object. It can be used to render Common Properties in a flyout panel.

Create a CommonProperties object with containerType set to "Custom" and rightFlyout set to true.
```html
    const rightFlyoutContent =(<CommonProperties
        propertiesInfo={this.propertiesInfo}
        propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
        callbacks={this.callbacks}
    />);
```

Pass the CommonProperties object into CommonCanvas's `rightFlyoutContent` props. Also set the `showRightFlyout` boolean to tell CommonCanvas when the rightFlyout should be displayed (true) or hidden (false).
```html
    <CommonCanvas
        canvasController={canvasController}
        rightFlyoutContent={rightFlyoutContent}
        showRightFlyout={showRightFlyout}
    />
```

