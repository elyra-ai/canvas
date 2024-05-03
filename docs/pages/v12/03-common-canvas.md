# Getting started with Common Canvas

## Common Canvas React Object
   Common-canvas is a react component that can be used in your react application to display a fully-functional canvas user interface. The `<CommonCanvas>` component is displayed in a `<div>` provided by your application. Here's some sample code to show the [minimum code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js) needed to get a working canvas.

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


The ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) is available as part of the test harness funciton. Click here to begin and try: dragging a node, editing a comment (double click on it), drag a node from the palette, click a button on the toolbar, zoom in using the scroll gesture.


## Canvas Controller

The only mandatory parameter for the `<CommonCanvas>` component is a regular JavaScript object called the [CanvasController](03.04-canvas-controller.md).

The CanvasController handles calls from the host application and actions performed by the user. It then updates the internal object model which stores:

1. the data that describes the flow of nodes, links and comments (called a pipelineFlow);
2. the data that describes the definition of the palette which contains node templates that can dragged to add nodes to the canvas;
3. the set of currently selected objects.
4. notification messages
5. breadcrumbs that indicate which sub-flow is being viewed
6. layout information

The [CanvasController](03.04-canvas-controller.md) provides an API which allows your code to:

1. set a new pipelineFlow;
2. get the current pipelineFlow (after the user has edited it);
3. update and edit objects in the canvas (for example, add node, delete link etc.);
4. set the node definition data (for display of nodes in the palette)

## Getting started

### Hello Canvas!
  You can start by looking at these two 'hello  world' examples for using common canvas:

* This first one called [app-tiny.js](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js) has the bare minimum necessary to get a fully functioning common-canvas to appear including all the basic functionality, a palette and a flow of nodes and links.
* The second, called [app-small.js](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-small.js), shows many of the options available to a common-canvas developer such as configurations and callback handlers.

You can also look at the [App.js](https://github.com/elyra-ai/canvas/blob/49ed634e3353d8f5c58eb8409ed8e1009f19c87a/canvas_modules/harness/src/client/App.js) file in the test harness section of this repo to see examples of code that uses the common canvas component.

   Now let's walk through the different steps to get common-canvas working:


### Step 1 : Install Elyra Canvas NPM module

Enter:
```
     npm install @elyra/canvas
```

### Step 2 : Import Common-canvas

To use common canvas in your react application you need to do the following. First import the CommonCanvas react component and CanvasController class from the Elyra Canvas library.  Elyra Canvas produces both `esm` and `cjs` outputs.  By default `esm` will be used when webpack is used to build the consuming application.

**All Components**
```js
    import { CommonCanvas, CanvasController } from "@elyra/canvas";
```
**Canvas only**

 To import only canvas functionality in `cjs` format use:
```js
    import { CommonCanvas, CanvasController } from "@elyra/canvas/dist/lib/canvas";
```

In addition you'll need to import `<IntlProvider>` from the `react-intl` library.
```js
    import { IntlProvider } from "react-intl";
```

### Step 3 : Pull in the CSS
Check this section to find info on what CSS to include in your application's CSS. [Styling](02-set-up.md#overriding-styles-and-color-themes).


### Step 4 : Create an instance of the canvas controller
To control the canvas you'll need an instance of the canvas controller so create an instance of it like this (probably in the constructor of your object).
```js
    this.canvasController = new CanvasController();
```
### Step 5 : Set the palette data
Next you'll need to populate the palette data. This will specify the nodes (split into categories) that will appear in the palette. The user can drag them from the palette to build their flow. This is done by calling CanvasController with:
```js
    this.canvasController.setPipelineFlowPalette(pipelineFlowPalette);
```
The pipelineFlowPalette object should conform to the JSON schema found here:
https://github.com/elyra-ai/pipeline-schemas/tree/master/common-canvas/palette

Some examples of palette JSON files can be found here:
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/test_resources/palettes

### Step 6 : (Optional) Set the flow data
This is an optional step. If you want a previously saved flow to be shown in the canvas editor so the user can start to edit it, you will need to call the CanvasController with:
```js
    this.canvasController.setPipelineFlow(pipelineFlow);
```

The pipelineFlow object should conform to the JSON schema found here:
https://github.com/elyra-ai/pipeline-schemas/tree/master/common-pipeline/pipeline-flow

Some examples of pipeline flow JSON files can be found here:
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/test_resources/diagrams


### Step 7 : Display the canvas

Finally you'll need to display the canvas object inside an `<IntlProvider>` object. Inside your render code, add the following:
```html
    <div>
        <IntlProvider>
            <CommonCanvas canvasController={this.canvasController} />
        </IntlProvider>
    </div>
```
The div should have the dimensions you want for your canvas to display in your page. For the canvasController property, pass the instance of canvas controller you created earlier. This is the only mandatory property. After providing this and running your code you will have a fully functioning canvas including: a palette; default toolbar; context menus; direct manipulation (move and resize) etc. To customize these behaviors and presentation continue with the sections below.

### Common Canvas customization
If you want to customize the behavior of common canvas you can specify any combination of the following optional settings:
```html
    <div>
        <CommonCanvas
            canvasController={this.canvasController}

            config={this.commonCanvasConfig}
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
```

#### Config objects
Common canvas has five **optional** configuration objects: config, toolbarConfig, notificationConfig, contextMenuConfig and keyboardConfig.
They are documented here:
[Config Objects](03.02.01-canvas-config.md)

#### Handlers
There are several **optional** handlers implemented as callback functions. They are contextMenuHandler, editActionHandler, beforeEditActionHandler, clickActionHandler, decorationActionHandler, layoutHandler, tipHandler, idGeneratorHandler, selectionChangeHandler and actionLabelHandler. They are documented here:
[Common Canvas Callback](03.03-callbacks.md)

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

#### Localization
You can customize `<CommonCanvas>` using the `<IntlProvider>` object to [display translated text](#localization)
