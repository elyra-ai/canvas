# Layout Handler

This is an optional handler you don't need to implement anything for it unless you want to. The layoutHandler callback, when provided, is called for each node on the canvas and allows the application to customize the node layout properties on a
node-by-node basis.

## layoutHandler
```js
    layoutHandler(data)
```
 The callback should return a Javascript object whose properties will override the default properties for node layout. The callback is provided with a parameter `data` which is the node object. Your code can look at the node properties and decide which properties it needs to override. This can be used to change the node shape, styling and position and size of node elements like the image, main label etc.

For more details see: [Customizing Node Layout](02-canvas/07-layout/01-Customizing-Node-Layout.md)
