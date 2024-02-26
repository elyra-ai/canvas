## Node layout properties
Node layout properties define how all the elements of a node are displayed such as: the position and size of the icon image; the position of the main label; even the shape of the node itself! You can change just about anything to do with the way the nodes appear in your canvas. So you can get a very different looking canvas to suit your needs. 

There are two possible sets of node layout properties provided by common-canvas, these are controlled by the `enableNodeFormatType` canvas configuration property which can be set to either "Horizontal" or "Vertical". "Horizontal" will display a node with an image and the label to the right of the image. "Vertical" will display the node with the label underneath the image.

## Default values for node layout properties
The possible node layout properties are shown below with the values they have when `enableNodeFormatType = "Horizontal"`. You can see the values for both sets of properties by looking at the [layout-dimensions.js program](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/common-canvas/src/object-model/layout-dimensions.js) 

```
// Default node sizes. The height might be overridden for nodes with more ports
// than will fit in the default size.
defaultNodeWidth: 160,
defaultNodeHeight: 40,

// A space separated list of classes that will be added to the group <g>
// DOM element for the node.
className: "",

// Displays the node outline shape underneath the image and label.
nodeShapeDisplay: true,

// Default node shape. Can be "rectangle" or "port-arcs". Used when nodeOutlineDisplay is true.
nodeShape: "port-arcs",

// SVG path strings to define the shape of your node and its
// selection highlighting. If set to null the paths will be set by default
// based on the nodeShape setting.
bodyPath: null,
selectionPath: null,

// Displays the external object specified, as the body of the node
nodeExternalObject: false,

// Display image
imageDisplay: true,

// Image dimensions
imageWidth: 26,
imageHeight: 26,

// Image position
imagePosition: "topLeft",
imagePosX: 6,
imagePosY: 7,

// Display label
labelDisplay: true,

// Label dimensions
labelWidth: 112,
labelHeight: 19,

// Label position
labelPosition: "topLeft",
labelPosX: 36,
labelPosY: 12,

// Label appearance
labelEditable: false,
labelAlign: "left", // can be "left" or "center"
labelSingleLine: true, // false allow multi-line labels
labelOutline: false,
labelMaxCharacters: null, // null allows unlimited characters
labelAllowReturnKey: false, // true allows line feed to be inserted into label, "save" to make the return key save the label.

// An array of decorations to be applied to the node. For details see:
// https://github.com/elyra-ai/canvas/wiki/2.4.2-Decoration-Specification
// These are added to the node at run time and will not be saved into
// the pipeline flow.
decorations: [],

// Positions and dimensions for 9 enumerated default decorator positions.
// decoratorWidth and decoratorHeight are the dimensions of the outline
// rectangle and decoratorPadding is the padding for the image within the
// outline rectangle.
decoratorTopY: 2,
decoratorMiddleY: -8,
decoratorBottomY: -18,

decoratorLeftX: 2,
decoratorCenterX: -8,
decoratorRightX: -30,

// Width, height and padding for image decorators
decoratorWidth: 16,
decoratorHeight: 16,
decoratorPadding: 2,

// Width and height for label decorators
decoratorLabelWidth: 80,
decoratorLabelHeight: 30,

// Display drop shadow under and round the nodes
dropShadow: true,

// The gap between a node and its selection highlight rectangle
nodeHighlightGap: 1,

// The size of the node sizing area that extends around the node, over
// which the mouse pointer will change to the sizing arrows.
nodeSizingArea: 10,

// Error indicator dimensions
errorPosition: "topLeft",
errorXPos: 24,
errorYPos: 5,
errorWidth: 10.5,
errorHeight: 10.5,

// When sizing a supernode this decides the size of the corner area for
// diagonal sizing.
nodeCornerResizeArea: 10,

// What point to draw the data links from and to when enableLinkType is set
// to "Straight". Possible values are "image_center" or "node_center".
drawNodeLinkLineFromTo: "node_center",

// What point to draw the comment to node link line to. Possible values
// are "image_center" or "node_center".
drawCommentLinkLineTo: "node_center",

// This is the size of the horizontal line protruding from the
// port on the source node when drawing an elbow or straight connection line.
minInitialLine: 30,

// For the elbow connection type with nodes with multiple output ports,
// this is used to increment the minInitialLine so that connection lines
// do not overlap each other when they turn up or down after the elbow.
minInitialLineIncrement: 8,

// This is the minimum size of the horizontal line entering the
// target port on the target node when drawing an Elbow connection line.
minFinalLine: 30,

// Display input ports.
inputPortDisplay: true,

// Object for input port can be "circle" or "image".
inputPortObject: "circle",

// If input port object is "image" use this image.
inputPortImage: "",

// If input port dimensions for "image".
inputPortWidth: 12,
inputPortHeight: 12,

// Position of left single input port. Multiple input ports will be
// automatically positioned with the Y coordinate being overriden. These
// values are an offset from the top left corner of the node outline.
// Used when linkDirection is "LeftRight".
inputPortLeftPosX: 0,
inputPortLeftPosY: 20,

// Position of top single input port. Multiple input ports will be
// automatically positioned with the X coordinate being overriden. These
// values are an offset from the top left corner of the node outline.
// Used when linkDirection is "TopBottom".
inputPortTopPosX: 80,
inputPortTopPosY: 0,

// Position of bottom single input port. Multiple input ports will be
// automatically positioned with the X coordinate being overriden. These
// values are an offset from the bottom left corner of the node outline.
// Used when linkDirection is "BottomTop".
inputPortBottomPosX: 80,
inputPortBottomPosY: 0,

// The 'guide' is the object drawn at the mouse position as a new line
// is being dragged outwards.
// Object for input port guide can be "circle" or "image".
inputPortGuideObject: "circle",

// If input port guide object is "image" use this image.
inputPortGuideImage: "",

// Display output ports.
outputPortDisplay: true,

// Object for output port can be "circle" or "image".
outputPortObject: "circle",

// If output port object is "image" use this image.
outputPortImage: "",

// Output port dimensions for "image".
outputPortWidth: 12,
outputPortHeight: 12,

// Position of right single output port. Multiple input ports will be
// automatically positioned with the Y coordinate being overriden. These
// values are an offset from the top right corner of the node outline.
// Used when linkDirection is "LeftRight".
outputPortRightPosition: "topRight",
outputPortRightPosX: 0,
outputPortRightPosY: 20,

// Position of top single output port. Multiple input ports will be
// automatically positioned with the X coordinate being overriden. These
// values are an offset from the top left corner of the node outline.
// Used when linkDirection is "BottomTop".
outputPortTopPosX: 80,
outputPortTopPosY: 0,

// Position of bottom single output port. Multiple input ports will be
// automatically positioned with the X coordinate being overriden. These
// values are an offset from the bottom left corner of the node outline.
// Used when linkDirection is "TopBottom".
outputPortBottomPosX: 80,
outputPortBottomPosY: 0,

// The 'guide' is the object drawn at the mouse position as a new line
// is being dragged outwards.
// Object for output port guide can be "circle" or "image".
outputPortGuideObject: "circle",

// If output port guide object is "image" use this image.
outputPortGuideImage: "",

// Automatically increases the node size to accommodate its ports so both
// input and output ports can be shown within the dimensions of
// the node.
autoSizeNode: true,

// Radius of the either the input or output ports when they are set to "circle"
portRadius: 3,

// Size of an offset above and below the set of port arcs.
portArcOffset: 3,

// Radius of an imaginary circle around the port. This controls the
// spacing of ports and the size of port arcs when nodeShape is set to
// port-arcs.
portArcRadius: 6,

// Spacing between the port arcs around the ports.
portArcSpacing: 3,

// Position of the context toolbar realtive to the node. Some adjustment
// will be made to account for the width of the toolbar.
contextToolbarPosition: "topRight",

// Display of vertical ellipsis to show context menu
ellipsisDisplay: true,
ellipsisPosition: "topLeft",
ellipsisWidth: 10,
ellipsisHeight: 22,
ellipsisPosX: 145,
ellipsisPosY: 9,
ellipsisHoverAreaPadding: 2

```
### Positioning objects
If you have nodes of varying sizes or if you have enabled re-sizeable nodes, by setting the canvas config property `enableResizableNodes` to true, it is important to note the following.

All coordinate positions for elements are based on one of nine anchor positions around the node:
```
       "topLeft", "topCenter", "topRight",  
       "middleLeft", "middleCenter", "middleRight",   
       "bottomLeft", "bottomCenter", "bottomRight".   
```

The PosX and PosY properties for each element is an offset from the associated anchor position where PosX is the number of pixels **to the right** of the anchor position and PosY is a number of pixels **down from** the anchor position. Negative values can be provided to specify an offset **to the left** and **up from** the anchor position. The default anchor position for all elements is `topLeft`. By the way, the top left corner of the node is also the point that the node will be positioned at based on its `x_pos` and `y_pos` fields in the pipelineFlow document.

For example, these settings:
```
    {
        imagePosition: "middleCenter",
        imagePosX: -10,
        imagePosY: -10,
        imageWidth: 20,
        imageHeight: 20
    }
};
```
would position the image 10 pixels left and 10 pixels above the very center of the node. Since the image is 20 x 20 pixels this would position the center of the image at the center of the node. If you have enabled re-sizeable nodes, this would keep the image centrally positioned while the node is being resized by the user.

Elements like the node image and vertical ellipsis are positioned based on the top left corner of that element. Text is positioned based on the top left corner of its containing `<div>`.

The values for `bodyPath` and `selectionPath` must be [SVG path strings](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) which describe how to draw the node body shape and its selection highlight shape. For example, the following would draw a triangular node body and a triangular selection outline 5 pixels away from it:

```js
    bodyPath: "     M  0 0 L  70 35  0 70 Z",
    selectionPath: "M -5 -5 L 75 35 -5 75 Z",
```

## Overriding the default node layout properties
There are a couple of ways to do this depending on your needs. First, if you just want to change the appearance of **all** nodes on your canvas you can specify the `enableNodeLayout` configuration parameter in the [main canvas configuration object](2.1-Config-Objects.md#config-object). The properties from this object will replace any properties in the default set, which was chosen based on the settings of `enableNodeFormatType`. So you don't need to provide all of the properties; just the ones you want to replace. 

Let's say you want your nodes to be displayed as ellipses. You could provide the following settings in `enableNodeLayout` in the canvas config:
```js
const canvasConfig = { 
    enableNodeLayout: {
        bodyPath: "     M  0 30 Q  0  0 60  0 Q 120  0 120 30 Q 120 60 60 60 Q  0 60  0 30 Z",
        selectionPath: "M -5 30 Q -5 -5 60 -5 Q 125 -5 125 30 Q 125 65 60 65 Q -5 65 -5 30 Z",
        defaultNodeWidth: 120,
        defaultNodeHeight: 60,
        imageWidth: 30,
        imageHeight: 30,
        imagePosX: 20,
        imagePosY: 10,
        labelEditable: true,
        labelPosX: 60,
        labelPosY: 37,
        labelWidth: 90,
        labelHeight: 17, // Should match the font size specified in css + padding
        ellipsisDisplay: true,
        ellipsisPosX: 100,
        ellipsisPosY: 20,
        portPosY: 30
    }
};
```

## Customizing individual nodes or categories of nodes
If you want each node, or category of nodes, to have a different layout based on some criteria you can use the second method for overriding the node layout properties. This uses the [layoutHandler callback method](2.2-Common-Canvas-callbacks.md#layouthandler). When you specify this callback method to common canvas, it will be called for each node on the canvas, during initialization and, occasionally, at other times. 

The method should return a simple JavaScript object that contains any node layout properties you want to override from the defaults and the ones specified in the `enableNodeLayout` field in the canvas config. This is an important point: there are three levels of properties provided where each overrides the previous set:

1. First we take the full default set of node layout properties based on the value for `enableNodeFormatType`.
2. Then we override these with the properties from the `enableNodeLayout` field in the canvas config object, if any are provided.
3. Finally we override the combined set with any properties from the object returned from the `layoutHandler` method if one is specified.

The callback is provided with a `data` parameter which is the node object from the pipelineFlow so your code can examine the node object and return node layout properties as appropriate.

Note: The `layoutHandler` callback is called while the canvas is being displayed, therefore it must return very quickly each time it is called otherwise your canvas display speed will be slowed down.

Here is a simple example of a `layoutHandler` callback method which will override the width of the node based on the width of the main label for any node where the node's `op` field is set to `Sort`:
```js
layoutHandler(data) {
	let customNodeLayout = {};
	if (data.op === "Sort") {
		const labLen = data.label ? data.label.length : 0;
		const width = (labLen * 9) + 30; // Allow 9 pixels for each character and a bit extra for padding
		customNodeLayout = {
			defaultNodeWidth: width // Override default width with calculated width
		};
	}
	return customNodeLayout;
```  
OK, it's not a very complicated example but hopefully you get the message :)

In the test harness, you can see an example application that use the [layoutHandler callback method](2.2-Common-Canvas-callbacks.md#layouthandler). In the test harness:

1. Open the Common Canvas side panel (click the hamburger icon)
2. Select the `Explain` sample application

You will see the nodes have different shapes and colors based on their type.
You can examine the [Explain sample app code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/components/custom-canvases/explain/explain-canvas.jsx) to see how it works. This involves these parts:

1. [This line](https://github.com/elyra-ai/canvas/blob/64af90b1f8a1179478f3ea32749681b851d897a4/canvas_modules/harness/src/client/components/custom-canvases/explain/explain-canvas.jsx#L36) sets the `enableNodeFormatType` in the canvas config to "Vertical". This will set all of the node layout properties to their defaults for "Vertical" nodes.
2. [This line](https://github.com/elyra-ai/canvas/blob/64af90b1f8a1179478f3ea32749681b851d897a4/canvas_modules/harness/src/client/components/custom-canvases/explain/explain-canvas.jsx#L37) will override the default node layout properties with a few different values which apply to all nodes.
3. [The layout handler](https://github.com/elyra-ai/canvas/blob/64af90b1f8a1179478f3ea32749681b851d897a4/canvas_modules/harness/src/client/components/custom-canvases/explain/explain-canvas.jsx#L145) will override layout properties on a node by node basis. It calls some utility functions to translate data retrieved from the node to the appropriate layout properties. The returned node layout properties contains an array of decorations that are used to display data values from the node.
4. [This line](https://github.com/elyra-ai/canvas/blob/64af90b1f8a1179478f3ea32749681b851d897a4/canvas_modules/harness/src/client/components/custom-canvases/explain/explain-canvas.jsx#L192) specifies the `layoutHandler` to the `<CommonCanvas>` object.  

## Customizing node colors and styles

The DOM elements that make up a node can be customized using CSS styles. This is done by assigning a class name to the group `<g>` element that is the container for all the node elements. The class can be applied to the group object is a number of different ways:

1. By specifying it in the `app_data.ui_data.class_name` field of the node in the pipeline flow document that is provided to common-canvas using `CanvasController.setPipelineFlow(pFlow)`
2. By specifying it using the following API methods: 
    * CanvasController.setNodeProperties(nodeId, properties, pipelineId)
    * CanvasController.setNodesClassName(nodeIds, newClassName, pipelineId)
3. By specifying a class name in the `className` field of the node layout properties in the canvas config. Like this
```
const canvasConfig = {
    enableNodeLayout: {
        className: "my-node-class"
    }
};
``` 
4. By specifying a class name in the `className` field of the node layout properties returned from the `layoutHandler`.


You can see the [svg-canvas-d3.scss file](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/src/common-canvas/svg-canvas-d3.scss) for full details about what elements in the node can be styled but here are a list of some basic parts of the node:

| Element               | DOM Element       | Class Name                   |
|-----------------------|-------------------|------------------------------|
| Group                 | `<g>`             | d3-node-group                |
| --> Body Shape        | `<path>`          | d3-node-body-outline         |
| --> Selection Outline | `<path>`          | d3-node-selection-highlight  |
| --> Label Container   | `<foreignobject>` | d3-foreign-object-node-label |
| -----> Label          | `<div>`           | d3-node-label                |

So for example if you want the node body (the rectangle) to be colored orange you would provide a class name to the group element using one of the techniques mentioned above and then put this in you CSS:

```
.my-node-class .d3-node-body-outline {
   fill: orange;
}
```
Note: You can use the [`enableParentClass`](2.1-Config-Objects.md#enableparentclass) canvas config field to make you CSS rulesets specific so your styles are picked up in preference to the common-canvas default styles.
