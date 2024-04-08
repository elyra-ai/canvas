# Elyra Canvas Components Overview

## Common Canvas
Common canvas displays a flow of data operations as nodes and links which the user can create and edit to get the flow they want. These visual flows of data operations are translated into data processing steps performed by a back-end server. Common canvas provides functionality for the visual display of flows in the browser and leaves persistence and execution of data flows to the application.

The common-canvas user can perform operations such as:

* Create a new node by dragging a node definition from a palette onto the canvas.
* Create a new node by dragging a node from outside the canvas onto the canvas (you'll have to do some programming to get this to work).
* Delete a node by clicking a context menu option.
* Create a link by dragging a line from one node to another.
* Delete a link by clicking a context menu option.
* Add a comment to the canvas and draw a link from it to one or more nodes.
* Edit a comment.
* Move nodes and comments around in the canvas to get the desired arrangement.
* And more! ...

## Creating nodes on the canvas

Nodes can be created on the canvas by the user in two ways:

* By dragging a node from the palette onto the canvas background
* By dragging a node from outside the canvas

The first technique is provided by Common canvas. The second requires some development work which is documented here:
[Enabling node creation from external object](03.07-external-objects.md)


## Common Canvas Components

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


and it handles:

  1. the visual display of the flow of operations;
  2. any user gestures on the canvas;
  3. display of context menus;
  4. display and handling of the palette.
  5. provision of callbacks to tell your code what operations the user is performing on the canvas
  6. and much much more.






