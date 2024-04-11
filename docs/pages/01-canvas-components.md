# Elyra Canvas Components Overview

The Elyra Canvas package delivers two decoupled React objects: Common Canvas and Common Properties.

## Common Canvas
Common canvas displays a flow of data operations as nodes and links (edges) which the user can create and edit to get the flow they want. These visual flows of data operations are translated into data processing steps performed by a back-end server. Common canvas provides functionality for the visual display of flows in the browser and leaves persistence and execution of data flows to the application.

The common-canvas user can perform operations such as:

* Create a new node by dragging a node template from a palette onto the canvas.
* Delete a node by clicking a context menu option.
* Create a link by dragging a line from one node to another.
* Delete a link by clicking a context menu option.
* Add a comment to the canvas and draw a link from it to one or more nodes.
* Edit a comment.
* Move nodes and comments around in the canvas to get the desired arrangement.
* Create a new node by dragging a node from the OS desktop (or elsewhere on the browser page) onto the canvas. This takes a little bit of [development work](03.07-external-objects.md).
* And much more! ...


### Common Canvas Components

Common canvas has several constituent parts that are visible to the user:

* [Flow editor](01.01-flow-editor.md) - the main area of the UI where the flow is displayed and edited
* [Palette](01.02-palette.md) - a set of node templates that can be dragged to the canvas to create new nodes
* [Context menu](01.03-context-menu.md) - a menu of options for nodes, comments, etc
* [Context toolbar](01.04-context-toolbar.md) - a menu of options for nodes, comments, etc presented as a small toolbar
* Toolbar - a set of tools across the top of the UI
* Notification panel - a panel for displaying runtime and other messages to your user
* Right side flyout - a panel, often used to display node properties
* Top panel - a panel which can be used to display other app related information
* Bottom panel - a panel which can be used to display other app related information
* State Tag - a small pill shaped component that appears over the canvas to indicate its state: locked or read-only.


and it handles:

  1. the visual display of the flow of operations;
  2. any user gestures on the canvas;
  3. display of context menus;
  4. display and handling of the palette.
  5. provision of callbacks to tell your code what operations the user is performing on the canvas
  6. and much much more.

## Common Properties
Common properties allows the application to display a Carbon compliant properties panel or dialog with just a Javascript (JSON) object as input. Common properties supports the most commonly used UI components and also allows custom components to be added into its visual output.







