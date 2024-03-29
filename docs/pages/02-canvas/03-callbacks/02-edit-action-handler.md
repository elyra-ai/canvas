# Edit Action Handler

## editActionHandler
```js
    editActionHandler(data, command)
```
This callback is optional. You don't *need* to implement anything for it and it doesn't return anything. It is called whenever the user does the following types of action on the canvas:

* Clicks a tool in the toolbar.
* Clicks an option in the context menu.
* Presses a [key combination](2.0-Common-Canvas-Documentation.md#keyboard-support) on the keyboard to cause the canvas to change.
* Performs some direct manipulation on the canvas such as:
    * Creates a node (createNode)
    * Moves one or a set of nodes/comments (moveObjects)
    * Edits a comment (editComment)
    * Links two nodes together (linkNodes)
    * Links a comment to a node (linkComment)
    * Resizes a supernode (resizeObjects)
    * Resizes a comment (editComment)
    * Expands a supernode in place (expandSuperNodeInPlace)
    * Navigates into a sub-flow in a supernode (displaySubPipeline)
    * Navigates out of a sub-flow in a supernode (displayPreviousPipeline)


This callback is called *after* the common-canvas internal object model has been updated.  This callback is provided with two parameters: `data` and `command`.

1. **data parameter** - that looks like this. The data provided can vary depending on the action the user performed.
```js
    {
      editType: "createComment",
      editSource: "contextmenu",
      selectedObjects: [],
      selectedObjectIds: [],
      offsetX: 100,
      offsetY: 42
    }
```

   + ***editType*** - This is the action that originates from either the toolbar, context menu, keyboard action or direct manipulation on the canvas. If you specified your own action in the context menu or in the toolbar this field will be your action's name.

   + ***editSource*** - This is the source of the action. It can be set to "toolbar", "contextmenu", "keyboard" or "canvas" (for an action caused by direct manipulation on the canvas).

   + ***selectedObjects*** - An array of the currently selected objects.

   + ***selectedObjectIds*** - An array of the IDs of currently selected objects. Included for backward compatibility.

   + ***Other fields*** - Numerous other fields which vary based on the action and the source of the action.

2. **command parameter** - This is a Javascript class which is the command object that was added to the command stack and executed to run the action 'requested' by the user. If the user performed an `undo` action this will be the command that has been undone. If the user performed a `redo` action this will be the command that was redone. The command object may contain fields which are connected with the execution of the command.

