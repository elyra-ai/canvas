
# Common Canvas Components

Common canvas has several constituent parts that are visible to the user:

* [Canvas editor](02-canvas/01-components/01-editor/index.md) - the main area of the UI where the flow is displayed and edited
* [Palette](02-canvas/01-components/02-Palette.md) - a set of node templates that can be dragged to the canvas to create new nodes
* [Context menu](02-canvas/01-components/03-Context-Menu.md) - a menu of options for nodes, comments, etc
* [Context toolbar](02-canvas/01-components/04-Context-Toolbar.md) - a menu of options for nodes, comments, etc presented as a small toolbar
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





