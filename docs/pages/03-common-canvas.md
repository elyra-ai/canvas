# Getting started with Common Canvas

## Hello Canvas!

Common Canvas is a React component. The `<CommonCanvas>` component is displayed in a `<div>` provided by your application. Here's some sample code to show the [minimum code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.tsx) needed to get a working canvas.

```
import { IntlProvider } from "react-intl";
import { CommonCanvas, CanvasController } from "@elyra/canvas";
import { useMemo } from "react";
import { Theme } from '@carbon/react';

import AllTypesCanvas from "../../test_resources/diagrams/allTypesCanvas.json";
import ModelerPalette from "../../test_resources/palettes/modelerPalette.json";

import "@carbon/styles/css/styles.min.css";
import "@elyra/canvas/dist/styles/common-canvas.min.css";

const TinyApp = () => {
	const canvasController = useMemo(() => {
		const cc = new CanvasController();
		cc.setPipelineFlow(AllTypesCanvas);
		cc.setPipelineFlowPalette(ModelerPalette);
		return cc;
	}, []);

	return (
		<Theme theme="g10">
			<div style={{ height: "100vh" }}>
				<IntlProvider locale="en">
					<CommonCanvas
						canvasController={canvasController}
					/>
				</IntlProvider>
			</div>
		</Theme>
	);
};

export default TinyApp;
```

Provided `allTypesCanvas.json` and `modelerPalette.json`resolve successfully, and the images they reference are deployed correctly, this code will display a fully functional canvas application.

In the ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny-ts), you can try:

* Dragging a node to a new position
* Editing a comment (by double clicking on it)
* Dragging a node from the palette
* Clicking a button on the toolbar
* Displaying an object's context menu with right-click (or clicking the ellipsis button)
* Zooming in and out using the scroll gesture
* And much more ...


For further investigation, Some sample code to look at is:

* The [Small App](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-small.js) application is a little more sophisticated than Tiny App and shows many of the options available to a Common Canvas developer such as configurations and callback handlers.

* You can also look at the [App.js](https://github.com/elyra-ai/canvas/blob/49ed634e3353d8f5c58eb8409ed8e1009f19c87a/canvas_modules/harness/src/client/App.js) file in the test harness section of this repo to see examples of code that uses the common-canvas component.

## Canvas Controller

The only mandatory prop for the `<CommonCanvas>` component is a regular JavaScript class called the [Canvas Controller](03.04-canvas-controller.md).

The Canvas Controller handles calls from the application and actions performed by the user. It then updates the internal object model which stores:

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
5. Operate other aspects of the UI like opening panels, zooming, etc, etc.

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

Next you'll need to populate the palette data.  This step is optional. Skip it if you don't want to use the palette.

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

This is an optional step. If you skip this step, Common Canvas will show an empty flow editor which allows the user to create a new flow by dragging nodes from the palette. Alternatively, if you want a previously saved flow to be shown in the flow editor, so the user can start to edit it, you will need to call the canvas controller with:

```js
    this.canvasController.setPipelineFlow(pipelineFlow);
```

The pipelineFlow object should conform to the JSON schema found here: <br />
https://github.com/elyra-ai/pipeline-schemas/tree/master/common-pipeline/pipeline-flow

Some examples of pipeline flow JSON files can be found here: <br />
https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness/test_resources/diagrams

!!! info "Images"
    If the pipeline flow references any images using a path you need those image files at the appropriate location.


### Step 6 : Display Common Canvas

Inside your object return the following JSX:

```js
        <div style={{ height: "100vh" }}>
            <IntlProvider>
                <CommonCanvas canvasController={this.canvasController} />
            </IntlProvider>
        </div>
```
The `<div>` should have the dimensions you want for your canvas to display in your page. For the `canvasController` prop, pass the instance of canvas controller created earlier. This is the only mandatory property. After providing this, and running your code, you will have a fully functioning canvas including: a palette; default toolbar; context menus; direct manipulation (move and resize) etc. To customize these behaviors and presentation continue with the sections below. If you want to display Common Canvas using one of the four Carbon styling themes you can wrapper the JSX with a `<Theme theme="g10">` tag where "g10" can also be set to "g100", "g90" or "white" (the default).

See the [Localization](02-set-up.md/#localization) section of the Initial Setup page to see how `<IntlProvider>` can be configured.

### Common Canvas customization
If you want to customize the behavior of Common Canvas you can specify any combination of the following **optional** settings:

#### Config objects
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
            >
            </CommonCanvas>
        </div>
    );
```

Common Canvas has five **optional** configuration objects. They are documented here: [Config Objects](03.02-configuration.md)

#### Handlers

```js
    return (
        <div>
            <CommonCanvas
                canvasController={this.canvasController}

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
            >
            </CommonCanvas>
        </div>
    );
```


There are ten **optional** handlers implemented as callback functions. They are documented here: [Common Canvas Callbacks](03.03-callbacks.md)

#### Panels

```js
    return (
        <div>
            <CommonCanvas
                canvasController={this.canvasController}

                showLeftFlyout={showLeftFlyout}
                leftFlyoutContent={leftFlyoutContent}

                showRightFlyout={showRightFlyout}
                rightFlyoutContent={rightFlyoutContent}

                showTopPanel={showTopPanel}
                topPanelContent={topPanelContent}

                showBottomPanel={showBottomPanel}
                bottomPanelContent={bottomPanelContent}
            >
            </CommonCanvas>
        </div>
    );
```

There are eight **optional** props that can be used to control the display of panels within the area where `<CommonCanvas>` is displayed.   They are documented here: [Panels customization](03.06.05-panels-customization.md)

