# Common Properties

## Introduction
Common properties displays controls to view and set property values.

You can look at the harness/src/client/App.js file of this repo to see examples of code that uses the common properties component.


## Getting started with Common Properties programming

_Note: There are two ways one can use the Common Properties tooling: Either by allowing the form to be built dynamically from a parameterDef JSON (which is comprised of the base property set, ui-hints, conditions, and resources), or by explicitly providing the dialog form for rendering (deprecated). The first approach is recommended as an easier and clearer interface_

   This takes 3 easy steps:

## Step 1 : Import
To use Common Properties in your React application you need to do the following. First import the CommonProperties React component from the common-canvas library. Elyra Canvas produces both esm and cjs outputs. By default esm will be used when webpack is used to build the consuming application.

```js
    import { CommonProperties } from "@elyra/canvas";
```
**Properties Only**

To import only common properties functionality in `cjs` format use:

```js
    import { CommonProperties } from "@elyra/canvas/dist/lib/properties";
```


## Step 2 : Set the data
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
[parameterDef schema and examples](https://github.com/elyra-ai/pipeline-schemas/tree/master/common-canvas/parameter-defs)
[3.1 Common Properties Parameter Definition](3.1-Common-Properties-Parameter-Definition.md)
[`expressionInfo` schema and examples](https://github.com/elyra-ai/pipeline-schemas/tree/master)

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
form information [wiki](https://github.com/elyra-ai/wml-canvas-service/wiki/2.-Runtimes-And-Operators)

The optional messages attribute can be used to set validation messages associated with a node.  The format of the message objects is defined in [Pipelin Flow UI schema](https://github.com/elyra-ai/pipeline-schemas/blob/master/common-pipeline/pipeline-flow/pipeline-flow-ui-v1-schema.json)

## Step 3 : Display the properties editor

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
- callbacks object - See [callbacks](#callbacks) section for more details on each callback method.
- customPanels `array`: array of custom panels.  See [3.5 Common Properties Custom Components](3.5-Common-Properties-Custom-Components.md#custom-panels) for more details.
- customControls `array`: array of custom controls. See [3.5 Common Properties Custom Components](3.5-Common-Properties-Custom-Components.md#custom-controls) for more details.
- customConditionOps `array`: array of custom condition operators.  See [3.5 Common Properties Custom Components](3.5-Common-Properties-Custom-Components.md#custom-condition-operators)
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

[Common Canvas](2.0-Common-Canvas-Documentation.md#step-3--display-the-canvas) has a right-flyout panel that can render a React object. It can be used to render Common Properties in a flyout panel.

Create a CommonProperties object with containerType set to "Custom" and rightFlyout set to true.
```html
    const rightFlyoutContent =(<CommonProperties
        propertiesInfo={this.propertiesInfo}
        propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
        callbacks={this.callbacks}
    />);
```
Pass the CommonProperties object into CommonCanvas's rightFlyoutContent props. Also set the showRightFlyout boolean to tell CommonCanvas when to show the rightFlyout.
```html
    <CommonCanvas
  config={commonCanvasConfig}
  contextMenuHandler={this.contextMenuHandler}
  contextMenuActionHandler= {this.contextMenuActionHandler}
  editActionHandler= {this.editActionHandler}
  clickActionHandler= {this.clickActionHandler}
  decorationActionHandler= {this.decorationActionHandler}
  toolbarConfig={toolbarConfig}
  toolbarMenuActionHandler={this.toolbarMenuActionHandler}
  rightFlyoutContent={rightFlyoutContent}
  showRightFlyout={showRightFlyout}
    />
```

# Callbacks

### applyPropertyChanges(propertySet, appData, additionalInfo, undoInfo, uiProperties)
Executes when the user clicks `OK` in the property dialog.  This callback allows users to save the current property values.

- propertySet: The set of current property values
- appData: (optional) application data that was passed in to `propertiesInfo`
- additionalInfo: Object with additional information returned:
     - messages: (optional) An array of messages associated with the nodes current property values.
     - title: The title of the properties editor
- undoInfo: Object with information needed to undo this apply:
     - properties: Set of property values;
     - messages: (optional) An array of messages associated with the nodes property values.
     - uiProperties: (optional) Set of UI only properties values
- uiProperties: The set of UI only property values (optional)

```js
applyPropertyChanges(propertySet, appData, additionalInfo, undoInfo, uiProperties) {
  var data = {
    propertySet: propertySet,
    appData: appData,
    additionalInfo: {
        messages: messages,
        title: title
    }
  };
}
```

### closePropertiesDialog(closeSource)
Executes when user clicks `Save` or `Cancel` in the property editor dialog.  This callback is used to control the visibility of the property editor dialog. `closeSource` identifies where this call was initiated from. It will equal "apply" if the user clicked on "Save" when no changes were made, or "cancel" if the user clicked on "Cancel"

```js
closePropertiesDialog() {
  this.setState({ showPropertiesDialog: false, propertiesInfo: {} });
}
```

### propertyListener()
Executes when a user property values are updated.

```js
propertyListener(data) {

}
```

### controllerHandler()
Executes when the property controller is created.  Returns the property controller.  See [here](3.6-Common-Properties-Controller.md) for APIs

```js
controllerHandler(propertyController) {

}
```

### actionHandler()
Called whenever an action is ran.  `id` and `data` come from uihints and appData is passed in with propertiesInfo.

```js
actionHandler(id, appData, data) {

}
```

### buttonHandler()
Called when the edit button is clicked on in a `readonlyTable` control, or if a custom table button is clicked. The callback provides the following data:

- data: an object that consists of
    - type: of button the click was invoked from.
        - `edit` is returned from the edit button click of a `readonlyTable` control.
        - `custom_button` is returned from the custom button click of a complex type control.
    - propertyId: of the control that was clicked.
    - buttonId: of the button that was clicked from a custom table button.

```js
buttonHandler(data) {

}
```

### buttonIconHandler()
Called when there is a `buttons` uihints set in the `complex_type_info` section of the parameter definition. This buttonIconHandler expects a Carbon Icon jsx object as the return value from the callback. This is used to display the Carbon icon in the custom table button. The buttonIconHandler provides the following data:

- data: an object that consists of
    - type: `customButtonIcon`
    - propertyId: of the control that was clicked.
    - buttonId: of the button that was clicked from a custom table button.
    - carbonIcon: The name of the Carbon icon specified in the uihints. The corresponding jsx object is expected to be returned in the callback.

```js
buttonIconHandler(data, callbackIcon) {
  if (data.type === "customButtonIcon" && data.carbonIcon === "Edit32") {
    callbackIcon(<Edit32 />);
  }
}
```

### helpClickHandler()
Executes when user clicks the help icon in the property editor dialog. The callback provides the following data:

- nodeTypeId: in case of parameterDef, id property of uihints; in case formData, the componentId.
- helpData: Optional helpData specified in paramDef/formData (see below).
- appData: Optional application data that was passed in to `propertiesInfo`
```js
helpClickHandler(nodeTypeId, helpData, appData) {

}
```
To control whether a node shows the help icon in the right fly-out, a help object with optional helpData needs to be provided in the paramDef or formData:
- paramDef: Provide help object in operator's uihints. If help object exists, the icon will be shown. Optionally, provide a helpData object within the help object, which will be passed in the helpClickHandler callback.
https://github.com/elyra-ai/pipeline-schemas/blob/master/common-pipeline/operators/uihints-v2-schema.json#L64
- formData: add help object to form definition. The
https://github.com/elyra-ai/pipeline-schemas/blob/master/common-canvas/form/form-v2-schema.json#L51

If no help object is found, no help link will be shown.


### titleChangeHandler()
Called on properties title change. This callback can be used to validate the new title and return warning or error message if the new title is invalid. This callback is optional.

In case of error or warning, titleChangeHandler should call callbackFunction with an object having type and message. If the new title is valid, no need to call the callbackFunction.
```js
titleChangeHandler(title, callbackFunction) {
  // If Title is valid. No need to send anything in callbackFunction
  if (title.length > 15) {
    callbackFunction({
      type: "error",
      message: "Only 15 characters are allowed in title."
    });
  }
}
```
where:

- type (string, required): This must be one of two values: "warning" or "error".
- message(string, required): Error or warning message. There is no restriction on length of the message.



### propertiesActionLabelHandler()
```js
propertiesActionLabelHandler()
```
This is an optional handler you don't need to implement anything for it unless you want to. This callback allows your code to override the default tooltip text for the `Undo` and `Redo` buttons.
The `propertiesActionLabelHandler` callback, when provided, is called for the save properties action that is performed in common-properties. This callback should return a string or null. If a string is returned it will be shown in the tooltip for the `Undo` button in the toolbar preceded by "Undo:" and the string will also appear in the tooltip for the `Redo` button (when appropriate) preceded by "Redo:". If null is returned, common-properties will display the default text `Save {node_name} node properties` for the Undo and Redo buttons.

### tooltipLinkHandler()
Optional callback used for adding a link in properties tooltips. link object must be defined under description in uiHints parameter info. Common-properties internally pass the link object to tooltipLinkHandler callback.
This callback must return an object having url and label.

```js
tooltipLinkHandler(link) {
	return { url: "https://www.google.com/", label: "More info" };
}
```

