# Getting started with Common Canvas

## Hello Canvas!

Common Canvas is a React component. The `<CommonCanvas>` component is displayed in a `<div>` provided by your application. Here's some sample code to show the [minimum code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js) needed to get a working canvas.

```
import React from "react";
import AllTypesCanvas from "../../test_resources/diagrams/allTypesCanvas.json";
import ModelerPalette from "../../test_resources/palettes/modelerPalette.json";
import { CommonCanvas, CanvasController } from "@elyra/canvas";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(AllTypesCanvas);
		this.canvasController.setPipelineFlowPalette(ModelerPalette);
	}

	render() {
		return (
			<div id="harness-app-container">
				<CommonCanvas
					canvasController={this.canvasController}
				/>
			</div>
		);
	}
}
```

This code will display this:

<img src="../assets/cc-app-tiny.png" width="800" />


The ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) is available as part of the test harness function. Click [here](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) to see the app running. You can try: dragging a node, editing a comment (double click on it), drag a node from the palette, click a button on the toolbar, zoom in and out using the scroll gesture.

Some sample code to look at:

* This is the source code for [app-tiny.js](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js).

* This app [app-small.js](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-small.js), is more sophisticated and shows many of the options available to a Common Canvas developer such as configurations and callback handlers.

* You can also look at the [App.js](https://github.com/elyra-ai/canvas/blob/49ed634e3353d8f5c58eb8409ed8e1009f19c87a/canvas_modules/harness/src/client/App.js) file in the test harness section of this repo to see examples of code that uses the common-canvas component.

## Canvas Controller

The only mandatory prop for the `<CommonCanvas>` component is a regular JavaScript class called the [Canvas Controller](03.04-canvas-controller.md).

The Canvas Controller handles calls from the host application and actions performed by the user. It then updates the internal object model which stores:

1. The data that describes the flow of nodes, links and comments (called a pipelineFlow);
2. The data that describes the definition of the palette which contains node templates that can dragged to add nodes to the canvas;
3. The set of currently selected objects.
4. Notification messages
5. Breadcrumbs that indicate which sub-flow is being viewed
6. Layout information
7. And more ...

The [Canvas Controller](03.04-canvas-controller.md) provides an API which allows the application to:

1. Set a new Pipeline Flow
2. Get the current pipelineFlow (after the user has edited it)
3. Update and edit objects in the canvas (for example, add node, delete link etc.)
4. Set the node definition data (for display of nodes in the palette)
5. Operate other aspets of the UI like opening panels, zooming, etc, etc.

## Getting started

To use Common Canvas in your React application complete the following steps:

### Step 1 : Setup

Complete the setup steps documented in the [Initial Setup](02-set-up.md) page.

### Step 2 : Import Common Canvas

Import the Common Canvas and Canvas Controller from the Elyra Canvas library. Elyra Canvas produces both esm and cjs outputs. By default esm will be used when webpack is used to build the application.

```js
    import { CommonCanvas, CanvasController } from "@elyra/canvas";
```
**Common Canvas Only**

To import only Common Canvas functionality in `cjs` format use:

```js
    import { CommonCanvas, CanvasController } from "@elyra/canvas/dist/lib/canvas";
```

### Step 3 : Create an instance of the canvas controller

To control the canvas you'll need an instance of the canvas controller. Create an instance like this (probably in the constructor of your object).
```js
    this.canvasController = new CanvasController();
```

### Step 4 : Set the palette data

Next you'll need to populate the palette data.  This step is optional if you don't want to use the palette and just want to display a flow (step 5) instead.

The palette data will specify the nodes (split into categories) that will appear in the palette. This is done by calling the canvas controller with:

```js
    this.canvasController.setPipelineFlowPalette(pipelineFlowPalette);
```

The pipelineFlowPalette object should conform to the JSON schema found here: <br />
https://github.com/elyra-ai/pipeline-schemas/tree/master/common-canvas/palette

Some examples of palette JSON files can be found here: <br />
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/test_resources/palettes

!!! info "Images"
    If the palette file references any images using a path you need those image files at the appropriate location.

### Step 5 : (Optional) Set the flow data

This is an optional step. If you want a previously saved flow to be shown in the flow editor, so the user can start to edit it, you will need to call the canvas controller with:

```js
    this.canvasController.setPipelineFlow(pipelineFlow);
```

The pipelineFlow object should conform to the JSON schema found here: <br />
https://github.com/elyra-ai/pipeline-schemas/tree/master/common-pipeline/pipeline-flow

Some examples of pipeline flow JSON files can be found here: <br />
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/test_resources/diagrams

!!! info "Images"
    If the palette file references any images using a path you need those image files at the appropriate location.


### Step 6 : Display the canvas

Inside your render code, add the following:

```js
    return (
        <div>
            <IntlProvider>
                <CommonCanvas canvasController={this.canvasController} />
            </IntlProvider>
        </div>
    );
```
The `<div>` should have the dimensions you want for your canvas to display in your page. For the `canvasController` prop, pass the instance of canvas controller created earlier. This is the only mandatory property. After providing this, and running your code, you will have a fully functioning canvas including: a palette; default toolbar; context menus; direct manipulation (move and resize) etc. To customize these behaviors and presentation continue with the sections below.

See the [Localization](02-set-up.md/#localization) section of the Initial Setup page to see how `<IntlProvider>` can be configured.

### Common Canvas customization
If you want to customize the behavior of Common Canvas you can specify any combination of the following optional settings:
```js
    return (
        <div>
            <CommonCanvas
                canvasController={this.canvasController}

                config={this.canvasConfig}
                toolbarConfig={this.toolbarConfig}
                notificationConfig={this.notificationConfig}
                contextMenuConfig={this.contextMenuConfig}
                keyboardConfig={this.keyboardConfig}

                contextMenuHandler={this.contextMenuHandler}
                beforeEditActionHandler={this.beforeEditActionHandler}
                editActionHandler={this.editActionHandler}
                clickActionHandler={this.clickActionHandler}
                decorationActionHandler={this.decorationActionHandler}
                layoutHandler={this.layoutHandler}
                tipHandler={this.tipHandler}
                idGeneratorHandler={this.idGeneratorHandler}
                selectionChangeHandler={this.selectionChangeHandler}
                actionLabelHandler={this.actionLabelHandler}

                showRightFlyout={showRightFlyout}
                rightFlyoutContent={rightFlyoutContent}

                showBottomPanel={showBottomPanel}
                bottomPanelContent={bottomPanelContent}

                showTopPanel={showTopPanel}
                topPanelContent={topPanelContent}
            >
            </CommonCanvas>
        </div>
    );
```

#### Config objects
Common Canvas has five **optional** configuration objects. They are documented here: [Config Objects](03.02-configuration.md)

#### Handlers
There are several **optional** handlers implemented as callback functions. They are documented here: [Common Canvas Callbacks](03.03-callbacks.md)

#### Right-flyout panel parameters
The right flyout panel appears on the right of the canvas area. You can add whatever content you like to this panel. Typically, it is used to display properties of nodes on the canvas. There are two **optional** parameters to let you manage the right flyout panel These are:

- showRightFlyout: This can be true or false to indicate whether the flyout panel is shown or not. The default is false.
- rightFlyoutContent: content to display in the right flyout which is a JSX object. Nothing is displayed by default.

#### Bottom panel parameters
The bottom panel appears below the canvas area and between the palette and the right flyout panel. You can add whatever content you like to this panel. There are two **optional** parameters to let you manage the bottom panel. These are:

- showBottomPanel: This can be true or false to indicate whether the bottom panel is shown or not. The default is false.
- bottomPanelContent: content to display in the bottom panel which is a JSX object. Nothing is displayed by default.

#### Top panel parameters
The top panel appears below the toolbar and between the palette and the right flyout panel. You can add whatever content you like to this panel. There are two **optional** parameters to let you manage the top panel. These are:

- showTopPanel: This can be true or false to indicate whether the top panel is shown or not. The default is false.
- topPanelContent: content to display in the top panel which is a JSX object. Nothing is displayed by default.
