# Before Edit Action Handler


## beforeEditActionHandler
```js
    beforeEditActionHandler(data, command)
```
This callback is optional. You don't *need* to implement anything for it but if you do implement it you **must** return either a data object or null. This callback is called in all the same instances where `editActionHandler` is called. The difference is that this callback is called *before* the internal object model is updated. This gives your application the opportunity to examine the action that is about to be performed and either: let it continue; modify it and let it continue; or cancel it.

 This callback is provided with two parameters: `data` and `command`.

1. **data parameter** - this is the same as the data object described for `editActionHandler` (see above)
2. **command parameter** - typically this will be null but for `undo` operations (that is where data.editType === "undo") this will be the command that is about to be undone. For `redo` operations (that is where data.editType === "redo") this will be the command that is about to be redone.

This callback *must* return either the data object that was passed in or null. `beforeEditActionHandler` will behave as follows based on what is returned:

* If the data object is returned unmodified: the action will be performed as normal.
* If the data object is returned modified: the action will be performed based on the modified data object. This means your application can alter the behavior of the action that will be performed. For example, you could intercept a `createNode` command and change the label for the new node in the nodeTemplate to something different. Then when the node is created the new label will be used. It is recommended you be **very** **very** careful when updating this object since there is no error checking in common-canvas to ensure you modified the object correctly.
* If `null` is returned: the action will be cancelled and not performed on the internal object model nor will `editActionHandler` be called.

If you need to do any asynchronous activity in the beforeEditActionHandler callback you can:

* Return null from the callback - which will cancel the current action
* Do your asynchronous activity. While this is happening, the user ought to be prevented from modifying the canvas so you should display some sort of progress indicator or modal dialog to inform the user that some activity is occurring.
* Then call `CanvasController.editActionHandler(data)` passing in the `data` object as a parameter with the modified properties. This will then execute the action as before. Note: This means the `beforeEditActionHandler` will be called a second time so be sure you put in a check to make sure you don't get into a loop.
