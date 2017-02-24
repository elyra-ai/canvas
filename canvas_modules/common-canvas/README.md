#common-canvas
- - -

## Common Canvas API
_[TBD]_

The `Common Canvas` exists for use in building canvas-like applications. The canvas is driven by an application-agnostic _Diagram JSON_ (https://ibm.ent.box.com/folder/17889516178), and fires UI events to the consuming application for document management.

### Configuration
Consumers configure the canvas to turn on functionality and control behavior.

The configuration object is defined as:
```
{
  // When true, full palette functionality is enabled
  // and consumers need to provide Palette JSON for it
  "includePalette": true|false,

  // Governs auto layout functionality. When set to horizontal or
  // vertical, nodes are automatically laid out when added or moved
  "enableAutoLayout": "horizontal|vertical|none",

  // When true, the internal canvas object model is enabled,
  // removing the need to track all canvas events externally
  "useObjectModel": true|false
}
```

### Functions
_[TBD]_
```
• renderDiagram() - Renders a valid Diagram JSON document in the canvas.
  See the canvas diagram JSON schema.
• setEventCallback() - Sets the callback function to be used for event notifications.
• setPaletteItems() - Uses Palette JSON (https://ibm.ent.box.com/folder/17889547923)
  to set the array of operations available in the canvas palette.
```

### Events
_[TBD]_
```
a) Node editing initiated
b) Node added/deleted
c) Link added/deleted
d) Node moved
e) Selection/deselection of canvas elements
f) Node context menu event
g) Zoom change
h) Scroll change
```
