# Click Action Handler

This callback is optional. You don't need to implement anything for it and it doesn't need to return anything to common canvas. It is called whenever the user clicks or double clicks on something on the canvas. You could use this callback to implement opening a properties dialog when the user double clicks a node.

## clickActionHandler
```js
    clickActionHandler(source)
```

The callback is called with a single `source` parameter which contain information about the object that was clicked.

Note: When handling selections, it is recommended the selectionChangeHandler be used in preference to this handler when possible. selectionChangeHandler will notify you of all selection changes regardless of how they occur, such as when the user presses Ctrl+A on the keyboard to select all objects.

At the moment only click/double-click/context-menu  on nodes and the canvas background are returned. It is provided with one parameter that looks like this:

```js
    {
      clickType: "DOUBLE_CLICK"
      id: "node_1",
      objectType: "node",
      selectedObjectIds: ["node_1", "node_2"]
    }
```
The fields can be:

* clickType - This can be either "SINGLE_CLICK", "SINGLE_CLICK_CONTEXTMENU" or "DOUBLE_CLICK"
* objectType - Can be either "node", "comment", "canvas" or "region". "region" is specified when the user pulls out a selection rectangle around a set of objects that might include nodes and comments.
* id - The ID of the node or comment clicked. Only provided when objectType is "node" or "comment"
* selectedObjectIds - An array of the selected objects (after the click action was performed).

Note: "SINGLE_CLICK_CONTEXTMENU" indicates that the user performed a contextmenu gesture when doing the click such as pressing the right-side mouse button or a two finger tap on a trackpad.

