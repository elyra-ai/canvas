# Welcome to Elyra Canvas

Elyra Canvas is an open-source library providing **React** objects to enable applications to
**quickly** create a **fully functional flow editor** allowing the user to easily create and edit
flows of linked nodes.

<p>
	<img src="assets/spss-modeler.gif" width="800" height="400"/>
	<br />
	<em>Elyra Canvas in action in the SPSS Modeler UI, the flagship component of IBM Watsonx</em>
</p>

## Elyra Canvas Features

Elyra Canvas:

* Provides a **comprehensive set of out-of-the-box UI components** needed to build
an application such as: flow editor, palette, toolbar, context menu, tooltips, command stack,
clipboard support, notifications area, side panels and more!
* Is a UI-centric library and is therefore **back-end and run-time agnositc**, meaning the flow can
display connected nodes representing any kind of operations.
* Is fast to get running - and **easy to customize**  - with extensive customization capability.
* Delivers a JSON powered **properties management** component to allow easy, no-code handling of
mulltiple properties windows - for when you have a multitude of node types each with their own range of properties.
* Conforms to the [**IBM Carbon**](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/) visual design language - and therefore plugs in easily to any application wishing to follow the Carbon standards including dark mode and light mode themes.
* Delivers built-in **accessibility** so there's no need to worry about keyboard navigation, accessible colors, screen reader integration, etc.
* Is translated into **12 languages**.
* Is the mainstay of several IBM products/applications.
* Is delivered as a package from the [**NPM registry**](https://www.npmjs.com/package/@elyra/canvas)

## Try Elyra Canvas

The ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) is a demonstration application which is produced with only a [few lines of code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js). You can try: dragging a node, editing a comment (double click on it), drag a node from the palette, click a button on the toolbar, zoom in and out using the scroll gesture.

## Elyra Canvas Modules

The elyra-ai/canvas repo contains three main modules:

* [Common Canvas](03-common-canvas.md) - This contains canvas functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed to the NPM registry. It provides a way for an application to display a flow of data operations (shown as a set of nodes connected with links) to the user and to allows the user to interact with the display to modify the flow.

	Common Canvas is a React component and is assisted by a regular JavaScript class called `CanvasController` which provides an API and handles the internal data model of the flow. While Common Canvas will display a working flow editor with little initial development work, it is highly customizable, where node shape and appearance, colors, styles layout etc can all be customized by the application. Common Canvas handles flows parsed from, and serialized into, a pipeline flow JSON document. It's palette of available nodes is also customized by the application providing a JSON document that descibes groups of nodes.

* [Common Properties](04-common-properties.md) - This contains properties functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed to the NPM registry. It provides a way to translate a JSON document, which describes a set of properties with UI hints, into a working properties dialog panel.

	Common Properties is a React component and has an associated properties controller object.

* [Test Harness](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/) - This is a node.js application that wrappers `<CommonCanvas>` and `<CommonProperties>`. Although it is primarily for testing it does provides a UI that:
	* Displays a set of sample applications
	* Is a sandbox to try out different Elyra Canvas features.


