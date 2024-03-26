# Action Label Handler

This is an optional handler you don't need to implement anything for it unless you want to. This callback allows your code to override the default tooltip text for the `Undo` and `Redo` buttons.


## actionLabelHandler
```js
    actionLabelHandler(action)
```

The `actionLabelHandler` callback, when provided, is called for each action that is performed in common-canvas. The `action` object parameter, passed in to the callback, contains details of the action being performed. This callback should return either a string or null. If a string is returned it will be shown in the tooltip for the `Undo` button in the toolbar preceded by "Undo:" and the string will also appear in the tooltip for the `Redo` button (when appropriate) preceded by "Redo:". If null is returned, common-canvas will display the default text for the `Undo` and `Redo` buttons.
