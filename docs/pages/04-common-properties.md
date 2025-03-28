# Getting started with Common Properties

## Introduction
[Common Properties](01.10-common-properties.md) is directed by a JavaScript object called the [Parameter Definition](04.01-parameter-definition.md). The 'paramDef' object describes the properties to be displayed as controls in the `<CommonProperties>` React object.

You can look at the [harness/src/client/App.js](https://github.com/elyra-ai/canvas/blob/49ed634e3353d8f5c58eb8409ed8e1009f19c87a/canvas_modules/harness/src/client/App.js) file to see examples of code that uses the common-properties component.

## Building a properties panel in a React application

To use Common Properties in your React application complete the following steps:

### Step 1 : Setup

Complete the setup steps documented in the [Initial Setup](02-set-up.md) page.

### Step 2 : Import Common Properties

Import the Common Properties React component from the Elyra Canvas library. Elyra Canvas produces both esm and cjs outputs. By default esm will be used when webpack is used to build the application.

```js
    import { CommonProperties } from "@elyra/canvas";
```
**Properties Only**

To import only Common Properties functionality in `cjs` format use:

```js
    import { CommonProperties } from "@elyra/canvas/dist/lib/properties";
```


### Step 2 : Create the propertiesInfo object

Next, you'll need to populate propertiesInfo, which is a required prop, with:

```js
this.propertiesInfo = {
  parameterDef: this.parameterDef,          // Required - Parameter definitions/hints/conditions
  appData: "{user-defined}",                // Optional - User data returned in applyPropertyChanges
  additionalComponents: "{components}",     // Optional - Additional component(s) to display
  messages: "[node_messages]",              // Optional - Node messages array
  expressionInfo: this.expressionInfo,      // Optional - Information for expression builde
  initialEditorSize: "{size}",              // Optional - This value will override the value of
                                            // editor_size in uiHints. This can have a value of
                                            // "small", "medium", "large", or null
  id: "{id}"                                // Optional - Unique parameter definition ID
}
```
See the Common Properties [Parameter Definition](04.01-parameter-definition.md) page for more details about 'paramDef'.

The expressionInfo object must conform to the [expressionInfo schema](https://github.com/elyra-ai/pipeline-schemas/tree/main/common-canvas/expression)

The optional messages attribute can be used to set validation messages associated with a node. The format of the message objects is defined in [Pipeline Flow UI schema](https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/pipeline-flow/pipeline-flow-ui-v3-schema.json)


### Step 3 : Display the Common Properties object

Finally, you'll need to display the Common Properties object. Inside your render code, add the following:

```html

return (
  <IntlProvider>
    <CommonProperties
      ref={(instance) => {
        this.CommonProperties = instance;
      }}
      propertiesInfo={this.propertiesInfo}                  // Required
      callbacks={this.callbacks}                            // Required
      propertiesConfig={this.propertiesConfig}              // Optional
      customPanels={[CustomSliderPanel, CustomTogglePanel]} // Optional
      customControls={[CustomSliderControl]}                // Optional
      customConditionOps={[CustomConditionOps]}             // Optional
      light                                                 // Optional
    />
  </IntlProvider>
);
```

See the [Localization](02-set-up.md/#localization) section of the Initial Setup page to see how `<IntlProvider>` can be configured.

**Props**

- propertiesInfo `object`: See above
- callbacks object - See the [Callbacks](04.02-callbacks.md) page
- propertiesConfig `object` - See the [Properties Config](04.08-properties-config.md) page
- customPanels `array`: An array of custom panels. See [Custom Panels](04.06-custom-components.md#custom-panels) section of the Common Properties Custom Components page.
- customControls `array`: An array of custom controls. See [Custom Controls](04.06-custom-components.md#custom-controls) section of the Common Properties Custom Components page.
- customActions `array`: An array of custom actions. See [Custom Actions](04.06-custom-components.md#custom-actions) section of the Common Properties Custom Components page.
- customConditionOps `array`: An array of custom condition operators.  See [Custom Condition Operators](04.06-custom-components.md#custom-condition-operators) section of the Custom Components page.
- light `boolean`: Carbon controls in Common Properties will use light mode. When the `light` option is disabled, the background color will be the same as the Carbon theme background. When the `light` option is enabled, the background color is set to $ui-01. Defaults to `true`

### Reference methods

The `<CommonProperties>` React object provides one reference method that can be called on a `ref` of the common-properties instance.
```js
/*
* @closeEditor (boolean) - determines if closePropertiesDialog is called or not
*/
applyPropertiesEditing(closeEditor)
```

### Using CommonProperties in CommonCanvas right-flyout panel

[Common Canvas](03-common-canvas.md) has a [right-flyout panel](03-common-canvas.md#right-flyout-panel-parameters) that can render a React object. It can be used to render Common Properties in the right-flyout as follows:

Create a `<CommonProperties>` object with `containerType` set to `"Custom"` and `rightFlyout` set to `true`.
```html
    const rightFlyoutContent = (
        <CommonProperties
            propertiesInfo={this.propertiesInfo}
            propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
            callbacks={this.callbacks}
        />
    );
```

Pass the `<CommonProperties>` object into the `rightFlyoutContent` prop of Common Canvas. Also, set the `showRightFlyout` boolean to tell Common Canvas the rightFlyout should be displayed (true) or hidden (false).
```html
    <CommonCanvas
        canvasController={canvasController}
        rightFlyoutContent={rightFlyoutContent}
        showRightFlyout={showRightFlyout}
    />
```


If the `CommonProperties` component is nested inside single or multiple layers of `<div>` elements, special consideration is needed for proper layout behavior.

```html
    const rightFlyoutContent = (
      <div className="parent-div">
        <CommonProperties
          propertiesInfo={this.propertiesInfo}
          propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
          callbacks={this.callbacks}
        />
      </div>
    );
```
`display: flex` should be added to `parent-div` to allow Common Properties content to occupy full width and height available in right flyout.
