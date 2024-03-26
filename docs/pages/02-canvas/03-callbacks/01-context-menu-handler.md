# Context Menu Handler

## contextMenuHandler
```js
    contextMenuHandler(source, defaultMenu)
```
This callback is used for both 'context menus' and, if the [`enableContextToolbar`](2.1-Config-Objects.md#enablecontexttoolbar) canvas config option is set to `true`, for 'context toolbars'.

If this callback is not provided common canvas will handle context menu/toolbars, and their actions, internally. You only need to implement this callback if you want to add or remove options to/from the context menu/toolbar.

The job of this callback is to tell common canvas what items to display in the context menu/toolbar.

### For Context Menu

For context menus this will be dependent on what object or set of objects the context menu was requested for by the user.

This callback will be called if the user performs a context menu gesture (such as mouse 'right click') on a:

* node
* link
* comment
* port
* on the canvas background or
* if a number of objects are selected, the combination of objects.

This callback must return an array that defines the menu to be displayed. If the callback is *not* provided, a default context menu (the defaultMenu passed into the handler) will be displayed by the common canvas.

The source object passed in looks like this:
```js
    {
      type: "node",
      targetObject: {<object_info>},
      selectedObjectIds: ["node_1", "node_2"],
      mousePos: {x: "10", y:"20"}
    }
```
**type** - Indicates type of object for which the context menu was selected. Can be "node", "port", "link", "canvas" or "comment"

**targetObject** - The object for which the context menu was requested. Only provided when type is "node" or "comment"

**selectedObjectIds** -  An array containing the IDs of all currently selected nodes and/or comments

**mousePos** - An object containing the coords of the mouse when the context menu was requested

The callback would need to return an array, that describes the context menu to be displayed, that looks something like this:
```js
    [
     {action: "deleteSelectedObjects", label: "Delete"},
     {divider: true},
     {action: "myAction", label: "My Action"}
     {action: "myUnavailableAction", label: "A test disabled item", enable: false}
    ]
```
There is one element in the array for each entry in the context menu. An entry can be either a context menu item, which consists of a label and an action, or a divider, whose field would need to be set to true.

Actions can be either internal (implemented inside the common canvas, like "deleteSelectedObjects" above) or external (like "myAction").

Existing internal actions are:

* selectAll
* cut
* copy
* paste
* undo
* redo
* createSupernode
* expandSupernode
* collapseSupernode
* deleteSelectedObjects
* createComment
* deleteLink
* disconnectNode
* highlightBranch
* highlightDownstream
* highlightUpstream
* unhighlight

External actions are custom actions you want common canvas to display for your application. To get common canvas to display your action you would need to return an array from the callback that includes a menu item for the action.

When the user clicks the option in the context menu matching your action common canvas will call the [editActionHandler](#editactionhandler) callback so you'll need to implement some code in that callback to execute the intended action. If you want to simply add your action to the default context menu provided by common canvas you can take the defaultMenu parameter provided to the callback and add your menu item to it. Alternatively, you can provide a complete new context menu of your own.

Here is a sample implementation of contextMenuHandler, which takes a source object (described above) and the defaultMenu as parameters, and adds a custom action to the default menu when the user 'right clicks' the canvas background.

```js
    contextMenuHandler(source, defaultMenu) {
      let customMenu = defaultMenu;
      if (source.type === "canvas") {
	customMenu = customMenu.concat({ action: "myAction", label: "My Action" });
      }
      return customMenu;
    }
```
In addition to adding the context menu item, you would also need to implement the editActionHandler callback to execute the action, like this:
```js
    editActionHandler(data) {
      if (data.editType === "myAction") {
        // Execute my action code here.
      }
    }
```
Tip: To avoid any future name clashes with internal actions you should make sure you action names are unique. For example, you could add a prefix to your action names eg. `$MyApp_action` where `$MayApp_` is the prefix for all your actions.

### For Context Toolbar

For context toolbars, this will be dependent on which object the mouse cursor is currently hovering over (which may be different to any of the currently selected objects).
