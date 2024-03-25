# Keyboard Config object

The keyboard config object configures whether certain actions are available from the keyboard.
See this section for what [key combinations are supported](2.0-Common-Canvas-Documentation.md#keyboard-support)
```js
    const keyboardConfig = {
       actions: {
          delete: false,
          undo: false,
          redo: false,
          selectAll: false,
          cutToClipboard: false,
          copyToClipboard: false,
          pasteFromClipboard: false
    };
```
All actions are `true` by default so it is only necessary to specify those actions you don't want as `false`.
