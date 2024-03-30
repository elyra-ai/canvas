# Custom Components Overview
Custom components allows applications to use custom code to drive different parts of the common-properties user interface.  For some panels and controls it might be necessary to listen to different types of redux state changes to cause the panel/control to rerender.  
Here is an example of a textfield listening to 3 state changes:
```js
import { connect } from "react-redux";

// ... application code

render() {
  const value = this.props.value; // value passed by redux as a property

  // ... rest of component render code

}

TextfieldControl.propTypes = {
  // ... application props
  state: PropTypes.string, // pass in by redux
  value: PropTypes.string, // pass in by redux
  messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
  value: ownProps.controller.getPropertyValue(ownProps.propertyId),
  state: ownProps.controller.getControlState(ownProps.propertyId),
  messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});
export default connect(mapStateToProps, null)(TextfieldControl);
```


## Custom Panels
Custom panels allow applications to create their own panels and controls that can live in the same dialogs as common-property panels and controls. 

### Custom panel interface
```js
// Returns the 'id' for the group defined in uihints
static id()

constructor(parameters, controller, data)

// Returns the content users want to display
renderPanel()
```

- **parameters** - String array of parameters set under the customPanel group in uihints
- **controller** - See [here](3.6-Common-Properties-Controller.md) for API information.
- **data** - Optional parameter.  Returns values stored in `data` attribute of a group `customPanel`.
- **renderPanel()** - Called on all Redux store changes:
    - property value changes ([property APIs](3.6-Common-Properties-Controller.md#property-methods))
    - state changes ([state APIs](3.6-Common-Properties-Controller.md#state-methods-disableenabled--hiddenvisible))
    - schema changes ([schema APIs](3.6-Common-Properties-Controller.md#datasetmetadata-methods))
    - row selection changes ([selection APIs](3.6-Common-Properties-Controller.md#row-selection-methods))
    - messages changes ([message APIs](3.6-Common-Properties-Controller.md#message-methods))

### Custom react components

Example
```js
renderPanel() {
 const controlId = this.parameters[0];
 return (
  <CustomCtrlToggle
   key={controlId}
   propertyId={name: controlId}
   controller={this.controller}
  />
 );
}
``` 

### Examples
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/src/client/components/custom-panels


## Custom Controls
Custom controls allow applications to create their own controls that can live in the same dialogs as common-property panels and controls. 

### Custom control interface
```js
// Returns the 'custom_control_id' for the parameter defined in uihints
static id()

constructor(propertyId, controller, data, tableInfo)

// Returns the content users want to display
renderControl()
```

- **propertyId** - See [propertyId](3.6-Common-Properties-Controller.md#common-properties-controller-api) for definition.
- **controller** - See [here](3.6-Common-Properties-Controller.md) for API information.
- **data** - Returns values stored in `data` attribute of a parameter in uihints.
- **tableInfo** - Set when custom control is a cell in a table.  
    - table (boolean) Set to true when in a table cell
    - editStyle (string) Valid values are "summary" and "inline". "summary" is set when the control will display either below the table ("on_panel") or in a "subpanel".  This allows the custom control to display a summary value in the cell and something else for the custom control.
- **renderControl()** - Called on all Redux store changes:
    - property value changes ([property APIs](3.6-Common-Properties-Controller.md#property-methods))
    - state changes ([state APIs](3.6-Common-Properties-Controller.md#state-methods-disableenabled--hiddenvisible))
    - schema changes ([schema APIs](3.6-Common-Properties-Controller.md#datasetmetadata-methods))
    - row selection changes ([selection APIs](3.6-Common-Properties-Controller.md#row-selection-methods))
    - messages changes ([message APIs](3.6-Common-Properties-Controller.md#message-methods))

### Custom react components

Example
```js
renderControl() {
 return (
  <CustomCtrlToggle
   key={controlId}
   propertyId={this.propertyId}
   controller={this.controller}
  />
 );
}
``` 

### Examples
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/src/client/components/custom-controls

## Custom Condition Operators
Custom condition operators allow users to create their own operators that can then be used for enablement, visibility, validation, and enum filtering.  The condition operators should always return a `boolean` value.

### Custom operator interface

```js
/**
* This is the key used to determine if the operator should be ran.  Maps to the `op` defined in the
* `condition` in uihints
* @return string
*/
function op()

/**
* @param see below
* @return boolean
*/
function evaluate(paramInfo, param2Info, value, controller)
```

- paramInfo (object) - `parameter_ref` set in the `condition` in uihints
    - control (object) - contains information about the control.
    - value (any) - current property value
- param2Info (object) - `parameter_2_ref` set in the `condition` in uihints.  See `paramInfo` for object info
- value - `value` set in the `condition` in uihints.  If no value specific this will be `undefined`
- **controller** - See [here](3.6-Common-Properties-Controller.md) for API information.

Example
```js
function op() {
  return "customMax";
}

function evaluate(paramInfo, param2Info, value, controller) {
  const supportedControls = ["numberfield"];
  if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
    return paramInfo.value < value;
  }
  return true;
}

module.exports.op = op;
module.exports.evaluate = evaluate;
```
```json
{
  "evaluate": {
    "condition": {
      "parameter_ref": "custom_op_num",
      "op": "customMax",
      "value": 100
    }
  }
}
```

### Examples
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/src/client/custom/condition-ops
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/common-canvas/src/common-properties/ui-conditions/condition-ops

