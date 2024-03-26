# Canvas Config object

The canvas config object is optional. If it is not provided, or any of the properties within it are not provided, common-canvas will use reasonable defaults. Here's an example of a canvas config object:
```js
    const commonCanvasConfig = {
       "enableNodeFormatType": "Vertical",
       "enableLinkType": "Straight"
       }
    };
```
and this is how it is specified to common-canvas:
```js
    render() {
        return (
            <CommonCanvas
                canvasController={this.canvasController}
                config={commonCanvasConfig}
            />
        );
    }

```

## Canvas Config fields

#### **enableInteractionType**
This can be "Mouse", "Carbon" or "Trackpad". The default is "Mouse".
***"Trackpad" has been deprecated and will be removed in the future.***

* With this set to "Mouse" the following interaction is enabled:
    * Zoom canvas = Rotate mouse wheel.
(Can be simulated with a trackpad with two finger up and down scroll)
    * Pan canvas = Left mouse key down on canvas background + drag.
(Can be simulated with a trackpad with press down on trackpad and drag.)
    * Region select on canvas = Shift key + left mouse key down on canvas background + drag.
(Can be simulated with a trackpad with Shift + finger down on trackpad + drag across canvas background)

* With this set to "Carbon" the following interaction is enabled:
    * Zoom canvas = Rotate mouse wheel.
(Can be simulated with a trackpad with two finger up and down scroll)
    * Pan canvas = Press and hold space bar then left mouse key down on canvas background + drag.
(Can be simulated with a trackpad by press and hold space bar then press down on trackpad and drag.)
    * Region select on canvas = Left mouse key down on canvas background + drag.
(Can be simulated with a trackpad with press down on trackpad and drag.)

* **This setting is now deprecated** With this set to "Trackpad" the following interactions are enabled:
    * Zoom canvas = Two finger pinch or two finger spread gesture.
(Can be simulated with a mouse as follows: Ctrl + rotate mouse wheel.)
    * Pan canvas = Two finger horizontal or vertical scroll gesture.
(Can be simulated with a mouse as follows: Vertical pan is rotate mouse wheel; Horizontal pan is Shift + rotate mouse wheel)
    * Region select on canvas = Finger down + drag.
(Can be simulated with a mouse as follows: Left button down + drag on canvas background)

#### **enableNodeFormatType**
This can be "Horizontal" or "Vertical". "Horizontal" is the default. "Horizontal" will display a node with an image and the label to the right of the image. "Vertical" will display the node with the label underneath the image.See the section called [Customizing Node Layout Properties](2.7-Customizing-Node-Layout-Properties.md) for details on what this will do.

#### **enableLinkType**
This can be "Curve", "Elbow", or "Straight". "Curve" is the default. This will set the link style used to connect nodes.

#### **enableLinkDirection**
This can be "LeftRight", "TopBottom", or "BottomTop". "LeftRight" is the default. This will set the input and output port positions on nodes to facilitate links being drawn in the direction specified.

* For "LeftRight" output ports will be on the right and input ports will be on the left of the nodes
* For "TopBottom" output ports will be on the bottom and input ports will be on the top of the nodes
* For "BottomTop" output ports will be on the top and input ports will be on the bottom of the nodes

#### **enableLinkSelection**
This can be: "None", "LinkOnly", "Handles" or "Detachable". The default is "None". These have the following affect on the canvas:

* "None" - no selection of links is possible however user can right click on a link to get a context menu.
* "LinkOnly" - a link may be selected and added to the set of currently selected objects (nodes and/or comments).
* "Handles" - This includes the "LinkOnly" function. In addition, when a link is selected a handle (either a circle or an image) is displayed at the start and end of the link. The link handle can be dragged to a new node/port position to rewire the flow.
* "Detachable" - This includes the "LinkOnly" and "Handles" function. In addition, this option enables detachable links for the canvas. This means a link can exist either:
    * between a source node and an arbitrary point on the canvas (semi-detached) OR
    * between an arbitrary point on the canvas and a target node (semi-detached) OR
    * between two arbitrary points on the canvas (detached)

    Additionally, "Detachable" mode, allows:

    - semi-detached or fully-detached links to be stored in and retrieved from the pipeline flow document.
    - semi-detached or fully-detached links to be manipulated with link handles. The link handles can be used to drag the end of the link away from its connecting source or target nodes and onto the canvas. Or semi-detached or fully detached links can be reattached to nodes/ports.
    - a new detached link to be created by drawing out a new link from a node and dropping it onto the canvas.
    - palette and canvas nodes, when they are dragged, to be dropped onto the ends of detached links to automatically attach them to the node being dragged.

#### **enableLinkReplaceOnNewConnection**
This can be true or false. The default is false. If set to true, the user can drag a new connection to a target node, and if the input port on the target node has a maximum cardinality of one AND there is currently a connection to that port, the existing connection will be removed and the new connection is created; essentially this gesture replaces the existing link with the new one. If set to false the new connection will not be completed and the existing link will remain in place.

When set to true and a link is replaced, common-canvas will call the `beforeEditActionHandler` the `editActionHandler` callback functions, if either are provided by the host application, with a `data` object parameter with the `editType` field set to `"linkNodesAndReplace"`.

#### **enableParentClass**
This is a string which is a class name. The default is empty string. If a class name is provided it is applied to the top-most DOM element for common-canvas. This can be used to make you CSS override rules more specific which means they will be used in preference to any default styles. For example, if you specify "my-app-styles" for this field then CSS like this:
```css
    .my-app-styles .d3-node-body-outline {
        fill: orange;
    }
```
will override the style from the common-canvas CSS
```css
    .d3-node-body-outline {
        fill: white;
    }
```

#### **enableImageDisplay**

This can be set to: "SVGInline", "LoadSVGToDefs" or "SVGAsImage". The default is "SVGInline". This field controls the display of SVG image files (that is, files with a `.svg` extension) on the canvas, such as those displayed for node icons or decoration images. This option can be useful to improve performance when images are repeated a large number of times on the canvas and particularly when the browser cache is disabled. Note: this does not affect the display behavior of non-SVG files which are always displayed inside an `<image>` tag. The behavior for SVG image files is as follows:

* "SVGInline" - This is the default. With this setting, the image file is read in -- from the server or cache (if available) -- and the SVG tags within the file displayed in-line in the DOM. This means elements within the SVG can be customized using CSS on a node-by-node basis.
* "LoadSVGToDefs" - With this option, each unique SVG file is read from the server (or cache) and written into a `<symbol>` element within the `<defs>` element of the canvas SVG area. A `<use>` element is then written to the place in the DOM for each place where the image should be displayed. Using this option means the SVG file for each image is only read once which should improve performance if images are repeated a lot on the canvas. However, it does limit the customization possibilities for the images on a node-by-node basis. Customization colors can be passed into the images using CSS inheritance, or the `currentColor` keyword, provided there are no internal classes applied to the elements in the SVG.
* "SVGAsImage" - This option causes the SVG file to be displayed within an `<image>` element in the DOM. The file loading is handled internally by the browser. Again, with this option customization capabilities on a node-by-node basis are limited. Customization colors can be passed into the images using CSS inheritance, or the `currentColor` keyword, provided there are no internal classes applied to the elements in the SVG.

#### **enableInternalObjectModel**
This is a boolean. The default is `true`. You should use `true` for this all the time. If you set this to `false` your code will be responsible for handling the object model, which is NOT recommended. When `false`, changes are not set into the object model, and consumers are expected to listen to events and update the internal object model themselves (again, *not* recommended).

#### **enablePaletteLayout**
This can be: "Modal" or "Flyout" or "None". The default is "Flyout". "Flyout" displays a panel on the left side of the canvas containing the palette icons and "Modal" shows the palette icons in a dialog window. "None" stops the palette from appearing.

#### **enableToolbarLayout**
This can be: "Top" or "None". The default is "Top". "Top" displays a toolbar at the top of the canvas area. See the [toolbar configuration object docs](2.1-Config-Objects.md#toolbar-config-object) for details on how to customize the toolbar. "None" stops the toolbar from appearing.

#### **enableResizableNodes**
This can be true or false. The default is false. If set to true, the user can resize nodes by dragging the edges of the node to increase or decrease the width and/or height of the node. When hovering the mouse cursor over the edge of the node the user will see a sizing cursor to indicate the resize function is available. This option works best when the node has a background rectangle that shows the extent of the sizing area.

#### **enableInsertNodeDroppedOnLink**
This can be true or false. The default is false. If set to true, the user can drag nodes from the palette or from the canvas and drop them onto existing links in the flow. This causes the dropped node to be inserted between the two nodes joined by the link, meaning new links are created that join the new node to the previously joined nodes and the old link is removed. When the user performs the drop common-canvas will call the editActionHandler with one of two possible commands:

* "createNodeOnLink" - when a node is being dragged from the palette leading to node creation & insertion
* "insertNodeIntoLink" - when an existing node is dragged from the canvas leading to insertion of the existing node into the link

#### **enableRightFlyoutUnderToolbar**
This can be true or false. The default is false. If set to true the right flyout panel, when opened, will appear below the toolbar and will not cause the toolbar to compress. The default behavior is that the right flyout panel, when opened, will appear at the side of the toolbar and will compress the space available for the toolbar to be displayed. Warning: the notifications panel which is tied to the notifications icon in the toolbar will appear over the top of the right-side flyout with this option set to true.

#### **enablePositionNodeOnRightFlyoutOpen**
This can be a boolean or an object. The default is false. If set to true, when the right-side flyout is open the currently selected node (assuming there is one) will be automatically positioned in the center of the viewport (canvas area). Instead of true this field can also be set to a simple JavaScript object like this `{ x: 30, y: 40 }` where x and y indicate the position where the node will be positioned as a percentage of the width and height of the viewport respectively.

#### **enableHighlightNodeOnNewLinkDrag**
This can be true or false. The default is false. If set to true common-canvas will add the "data-new-link-over" attribute to the node's group `<g>` element, when the end of a new link is dragged to be close to and over a target node. This allows applications to alter the appearance of the target node as a new link is dragged towards it.

#### **enableHighlightUnavailableNodes**
This can be true or false. The default is false. If set to true, when the user begins to drag a new link line, common-canvas will add a new class called `d3-node-unavailable` to all nodes which cannot accept the link as input. The class will be applied to each node's group `<g>` element in the DOM. This class can be used for styling the unavailable nodes as desired using CSS. The default styling will 'gray out' the node label, node outline rectangle (if there is one) and the node icon (provided it is an SVG image). These styles can be overridden in the applications CSS if different styling is needed. This behavior also applies if the end of a partially or fully detached link is dragged.

#### **enableRaiseNodesToTopOnHover**
This can be true or false. The default is true. If set to false the nodes will be left in their original place in the DOM. If set to true, when the user moves the mouse cursor over a node, that node will be moved in the DOM so that the node appears on top of all other nodes. This is only really noticeable if nodes, or parts of nodes, overlap other nodes. It can be useful if your nodes have protruding ports or decorations and your users sometimes position nodes very close to one another. Note: the 'true' setting can adversely affect the behavior of scroll areas in a node that are displayed using a React object (using the `nodeExternalObject` node layout option) because when the node is moved in the DOM the scroll area gets reset to its initial position. Set this to false if you are displaying nodes using React objects.


#### **enableAutoLinkOnlyFromSelNodes**
This can be true or false. The default is false. When set to true the auto-add function (where double clicking a node in the palette automatically adds it to the canvas) will only link up nodes when a node is already selected on the canvas and then, only if the selected node can be linked to the node that was double clicked. If false, the auto-add function will make a best guess at which node the double-clicked node should be added to.

#### **enableMoveNodesOnSupernodeResize**
This can be true or false. The default is true. If true, nodes surrounding a supernode will be moved when the supernode is expanded or manually resized so that the supernode does not overlay them. When set to false, the nodes surrounding a supernode will stay in their current positions when the supernode is expanded or manually resized. This may result in the nodes being overlaid by the supernode.

#### **enableExternalPipelineFlows**
This can be true or false. The default is false. If true, the context menu will include a `Create External Supernode` option when a set of objects are selected from which a supernode can be created.

Waring: The host application must implement some of the common-canvas callbacks for external pipeline flow support to work correctly. See the Wiki section on [external pipeline flow support](2.9-External-Subflows-support.md) for more details.

#### **enableDisplayFullLabelOnHover**
This can be true or false. The default is false. If set to true, any abbreviated node label will be displayed in full when the pointer hovers over the label. If set to false, abbreviated node labels will remain the same when the pointer hovers over them.

#### **enableSingleOutputPortDisplay**
This can be true or false. The default is false. If set to true, only the last of the ports from the array of output ports will be displayed for each node. This config property is only applicable to applications with very specialized styling and handling of ports. If set to true with regular applications, it may result in a confusing display to the user. The single port is displayed at a position specified by outputPortRightPosX and outputPortRightPosY layout properties. For exmaple:
```js
config = {
    enableSingleOutputPortDisplay: true,
    enableNodeLayout: {
      outputPortRightPosX: 0,
      outputPortRightPosY: 20
};
```
#### **enableDragWithoutSelect**
This can be either true or false. The default is false. If set to true, the user can drag and drop a single node or a single comment without that gesture removing selection on any other nodes or comments. If the node being dragged was selected prior to the drag gesture then it and any other objects that are currently selected will be moved. With this parameter set to false (or missing) a drag and drop gesture will select the node or comment being dragged and will deselect any currently selected objects.

#### **enableMarkdownInComments**
This can be true or false. The default is false. When set to true the user may enter markdown syntax into comments on the canvas when in edit mode for the comment. When the editing ends, the comment is shown in presentation mode and the markdown syntax is converted to HTML which is displayed in the comment and is styled by CSS.

#### **enableStateTag**
This can be either "None", "Locked" or "ReadOnly". The default is "None". When set to either "Locked" or "ReadOnly", a 'state tag' object will be shown permanently over the top of the canvas. The state tag will be positioned in the center and towards the top of the canvas. The state tag consists of a black background rectangle with rounded corners overlaid with an icon and a text label. A tooltip is displayed when the mouse pointer is hovered over the state tag. The icon, label and default tooltip will be set appropriately based on the value ("Locked" or "ReadOnly") for this setting. The host application can override the tooltip by implementing the [tipHandler callback](2.2-Common-Canvas-callbacks.md#tiphandler).

#### **enableEditingActions**
This can be true or false. The default is true. If set to false, various editing actions on the canvas will be prevented, as follows:

1. Nodes cannot be created on the canvas using any of the following:

    (a) dragging and dropping a node template from the palette onto the canvas or

    (b) dragging and dropping an object onto the canvas from outside the canvas area, such as a file being dragged from the computer desktop onto the canvas (see note below), or

    (c) double clicking a node in the palette to create a node

    Note: It is not possible for common-canvas to prevent an object being dragged from the computer desktop to the canvas so it is recommended the drop zone (which provides visual feedback about the drop) should be switched off by setting the [enableDropZoneOnExternalDrag](2.1-Config-Objects.md#enabledropzoneonexternaldrag) config field to `false`.

2. Nodes and comments cannot be dragged and moved.
3. The end points of Links, when [enableLinkSelection](2.1-Config-Objects.md#enablelinkselection) is set to `"Detachable"` or `"Handles"`, cannot be dragged and moved.
4. Links from nodes and comments cannot be created by dragging from the port object on the source node or comment to the target node.
5. Comments, node labels and text decorations cannot be edited, neither by clicking the edit icon (which does not appear) nor by double clicking the text.
6. Context menu options that alter the canvas objects will be removed from the context menu before it is displayed by common-canvas. The options that will be removed are:

    |Option Text|Action Identifier|
    |---|---|
    |New Comment|createComment|
    |Disconnect|disconnectNode|
    |Edit->Cut|cut|
    |Edit->Copy|copy|
    |Edit-Paste|paste|
    |Undo|undo|
    |Redo|redo|
    |Delete|deleteSelectedObjects|
    |Create supernode|createSuperNode|
    |Create external supernode|createSuperNodeExternal|
    |Deconstruct supernode|deconstructSuperNode|
    |Collapse supernode|collapseSuperNodeInPlace|
    |Expand supernode|expandSuperNodeInPlace|
    |Convert external to local|convertSuperNodeExternalToLocal|
    |Convert local to external |convertSupernodeLocalToExternal|
    |Delete|deleteLink|
    |Save to palette|saveToPalette|

    If your application adds its own editing actions to the context menu your code must remove them if they are not needed in some situations (e.g. you are displaying a read-only canvas).

7. Any default toolbar actions (tools) that alter the canvas objects will be disabled regardless of their specified enablement status. These actions are:

    |Default Tooltip|Action|
    |---|---|
    |Undo|undo|
    |Redo|redo|
    |Cut|cut|
    |Copy|copy|
    |Paste|paste|
    |Delete|deleteSelectedObjects|
    |New comment|createAutoComment|
    |Arrange Horizontally|arrangeHorizontally|
    |Arrange Vertically|arrangeVertically|

8. Keyboard shortcuts that alter the canvas will not work. These are:

    |Shortcut|Action|
    |---|---|
    |delete|delete|
    |Ctrl/Cmd + x|cut|
    |Ctrl/Cmd + c|copy|
    |Ctrl/Cmd + v|paste|
    |Ctrl/Cmd + z|undo|
    |Ctrl/Cmd + Shift + z|redo|
    |Ctrl/Cmd + y|redo|

9. The browser's Edit menu options (cut, copy, paste) will not work with the canvas objects regardless of the setting for [enableBrowserEditMenu](2.1-Config-Objects.md#enablebrowsereditmenu).

#### **enableDropZoneOnExternalDrag**
This can be true or false. The default is false. If set to true a graphic overlay will be displayed over the canvas when a data object icon is dragged from the desktop over the canvas. The default graphic overlay will be an image and a  message saying: "Drop to add to canvas and project" unless the `dropZoneCanvasContent` configuration parameter is provided.

See the [Dragging an object from the desktop](2.3-Enabling-node-creation-from-external-object.md#dragging-object-from-the-desktop-or-another-application) section of the Wiki for details on how to handle the drop of an external object onto the canvas.

#### **enableNodeLayout**
This is a simple Javascript object, the properties of which override the default node layout properties. For more details see: [Customizing Node Layout Properties](2.7-Customizing-Node-Layout-Properties.md)

#### **enableSaveZoom**
This can be: "None", "LocalStorage" or "Pipelineflow". The default is "None".

* "None" - When the canvas is zoomed, the zoom (scale and x/y pan) are not saved anywhere so if the canvas is closed and reopened it reopens with the default zoom which is a scale of 1 and x/y pan values of 0.
* "LocalStorage" - The zoom for the canvas is stored in the browser's local storage and will be reapplied to the canvas each time that canvas is shown in that browser. This applies to sub-flows, when the user displays them full-screen, as well as the primary flow. Sub-flows and the primary flow each have their own zoom amounts stored in local storage. Note: Zoom amounts stored in local storage can be cleared from storage by calling the `canvasController.clearSavedZoomValues()` API method.
* "Pipelineflow" - The zoom is serialized into the pipeline flow document and when a pipeline flow document is provided to common canvas through the API the zoom will be applied to the canvas display. Zoom amounts can be stored for both primary and sub pipelines. (See the pipelineFlow schema specification).

#### **enablePanIntoViewOnOpen**
This can be either true or false. The default is false. If set to true, the canvas will be panned so as much of the canvas area (the area containing the nodes and comments) is visible in the viewport as possible. This will only happen when enableSaveZoom === "None" or if there is no saved zoom available either in local storage (when enableSaveZoom === "LocalStorage") or in the pipelineFlow (when enableSaveZoom === "Pipelineflow").

#### **enableZoomIntoSubFlows**
This is a boolean. The default is false. When set to true, common-canvas will override the maximum zoom extent value which, by default is used for the entire canvas, to allow the user to zoom in on in-place sub-flows further than they can do on containing flows. This means the user can zoom in on multi-nested sub-flows so they are easier to view. To see this effect, the user must position the mouse pointer over the sub-flow before performing the zoom gesture.

#### **enableContextToolbar**
This is a boolean. The default is false. When set to true, common-canvas will display a context toolbar instead of a context menu for performing actions on canvas objects. A context toolbar is a small toolbar that appears above nodes, links and comments as the mouse cursor is hovered over them. The toolbar shows icons for actions the user is most likely to want to perform on the object. An overflow icon is displayed which, when clicked, shows a menu of additional actions. A context toolbar for the canvas background can also be displayed by right-clicking on the background. Common-canvas will display default context toolbars for nodes, links comments and the canvas background however the default actions can be customized by implementing the [`contextMenuHanlder`](2.2-Common-Canvas-callbacks.md#contextmenuhandler) callback.

#### **enableSnapToGridType**
This can be: "None", "During" or "After". The default is "None".

* "None" - there is no snap to grid and objects can be moved to any position on the canvas.
* "During" - when nodes or comments are moved or sized, the objects snap to an imaginary grid while the objects are being dragged or sized. This gives a somewhat jerky effect as the move or size is happening but has the advantage of telling the user exactly where the object will be when they release the mouse button to end the action.
* "After" - nodes or comments snap to a grid when the drag or size event ends. This gives a smooth dragging and sizing effect but the user does not see the final position until they release the mouse button at the end of the action. By default the canvas uses reasonable values for the grid increments.

#### **enableSnapToGridX**
This optional value overrides the default horizontal increment of the snap-to-grid grid. It can be either a numeric value which is a number of pixels or it can be a numeric value followed by a % sign (e.g. "25%") which indicates the grid will be a percentage of the default node width. Its default is dependent on whatever is set for enableNodeFormatType. That is for "Horizontal" it will be "20%" and for "Vertical" it will be "25%".

#### **enableSnapToGridY**
This optional value overrides the default vertical increment of the snap-to-grid grid. It can be either a numeric value which is a number of pixels or it can be a numeric value followed by a % sign (e.g. "25%") which indicates the grid will be a percentage of the default node height. Its default is dependent on whatever is set for enableNodeFormatType. That is for "Horizontal" it will be "33.33%" and for "Vertical" it will be "20%".

#### **enableAutoLayoutVerticalSpacing**
This is the spacing in pixels which is used to separate nodes vertically when either the vertical or horizontal auto layout action is used.

#### **enableAutoLayoutHorizontalSpacing**
This is the spacing in pixels which is used to separate nodes horizontally when either the vertical or horizontal auto layout action is used. For horizontal auto layout, common-canvas may override this value if it decides that more space is needed to prevent connecting lines from doubling back on themselves.

#### **enableAssocLinkCreation**
This is a Boolean. The default is `false`. If set to `true` it changes the nature of links that are created between nodes as follows:

- The user is able to pull out a link from either port on the node and drag it to another node
- When a link is completed an `association` link is created rather than the regular data flow link that is created when this field is set to `true`. Association links describe an association between pairs of nodes and do not indicate any kind of data flow between those nodes.

#### **enableAssocLinkType**
This can be "Straight" or "RightSideCurve". The default it "Straight". This field changes the way association links are drawn on the canvas.

#### **enableBrowserEditMenu**
This can be true or false.  true is the default.  If true, the Cut/Copy/Paste items in the Browser's `Edit` menu, including keyboard input for those actions, can be used for performing those actions on objects (e.g. Nodes) in the canvas. When false, those items in the Browser's edit menu, including keyboard input for those actions, will not work for objects in the canvas. This will not prevent those actions working in the canvas when, say, invoked with the toolbar or canvas context menus, but this property can be used if the keyboard input for those actions into the canvas is disabled for common-canvas using the [keyboard config](2.1-Config-Objects.md#keyboard-config-object) object.

#### **enableNarrowPalette**
This can be true or false.  true is the default.  If true when the palette is closed the narrow palette will be shown.  When false the palette completely closes.

#### **paletteInitialState**
Deprecated -- This option is deprecated and will be removed soon.  Use `CanvasController.openPalette()` to display an opened palette at start-up. This `openPalette()` can be called immediately after creating the canvas controller.

paletteInitialState can be true or false. false is the default. If set to true the palette will be opened when common canvas first appears to its full (non-narrow) state.

#### **emptyCanvasContent**
This is a JSX or HTML snippet that contains some text or any elements (such as an image) that you want to display when the canvas is empty, that is, when it doesn't have any nodes or comments. The default behavior if this config parameter is not provided is that common canvas will display an image and message saying: "Your flow is empty!".

#### **dropZoneCanvasContent**
This is a JSX or HTML snippet that contains some text or any elements (such as an image) that you want to display when a data object is dragged from the desktop over the canvas. The default behavior if this config parameter is not provided is that common canvas will display an image and a  message saying: "Drop to add to canvas and project". The content will not be displayed unless the `enableDropZoneOnExternalDrag` configuration parameter (see above) is set to true.

#### **schemaValidation**
This can be true or false. false is the default. It tells common canvas whether you want pipleineFlow and palette objects to be validated against the schema files when they are submitted to the canvas controller, using the `setPipelineFlow(pFlow)` or `setPipelineFlowPalette(palette)` methods. If any validation errors are found messages are displayed in the browser console. It is recommended this option be set to true during development and testing but switched off in production since schema validation can be somewhat slow for large objects.

#### **tipConfig**
This is a simple JavaScript object that configures whether tips for palette items, nodes, ports, links, decorations or the state tag are enabled (value set to true) or disabled (value set to false). By default, all tips are enabled. The following would switch off tips for ports and links.
```js
       "tipConfig": {
           "palette": true,
           "nodes": true,
           "ports": false,
           "links": false,
           "decorations": true,
           "stateTag": true
       }
```
The tips displayed by the palette can be further refined. For example, this would prevent tips for palette categories from being displayed, but would still display tips for node templates in the categories:
```js
       "tipConfig": {
           "palette": {
              "categories": false,
              "nodeTemplates": true
           },
           "nodes": true,
           "ports": false,
           "links": false,
           "decorations": true,
           "stateTag": true
       }
```

Note: The default content of tips can be overwritten by implementing the [tipHandler callback](2.2-Common-Canvas-callbacks.md#tiphandler).
