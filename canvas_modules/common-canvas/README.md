<!--
{% comment %}
Copyright 2017-2023 Elyra Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
{% endcomment %}
-->

## elyra/canvas
Elyra Canvas is an open-source library providing **React** objects to enable applications to
**quickly** create a **fully functional flow editor** allowing the user to easily create and edit
flows of linked nodes.

<p>
	<img src="https://github.com/elyra-ai/canvas/assets/25124000/3e734200-75dc-4232-8d2d-430daba13061" width="800" height="400"/>
	<br />
	<em>Elyra Canvas in action in the SPSS Modeler UI, the flagship component of IBM Watsonx</em>
</p>

### Elyra Canvas Modules

The elyra-ai/canvas repo contains three main modules:

* [Common Canvas](03-common-canvas.md) - This contains canvas functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed to the NPM registry. It provides a way for an application to display a flow of data operations (shown as a set of nodes connected with links) to the user and to allows the user to interact with the display to modify the flow.

	Common Canvas is a React component and is assisted by a regular JavaScript class called `CanvasController` which provides an API and handles the internal data model of the flow. While Common Canvas will display a working flow editor with little initial development work, it is highly customizable, where node shape and appearance, colors, styles layout etc can all be customized by the application. Common Canvas handles flows parsed from, and serialized into, a pipeline flow JSON document. It's palette of available nodes is also customized by the application providing a JSON document that descibes groups of nodes.

* [Common Properties](04-common-properties.md) - This contains properties functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed to the NPM registry. It provides a way to translate a JSON document, which describes a set of properties with UI hints, into a working properties dialog panel.

	Common Properties is a React component and has an associated properties controller object.

* [Test Harness](https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness#test-harness) - This is a node.js application that wrappers `<CommonCanvas>` and `<CommonProperties>`. Although it is primarily for testing it does provides a UI that:
	* Displays a set of sample applications
	* Is a sandbox to try out different Elyra Canvas features.

### Elyra Canvas Components Overview
The Elyra Canvas package delivers two decoupled React objects: Common Canvas and Common Properties. Please refer to [this documentation](https://elyra-ai.github.io/canvas/01-canvas-components/) for more details.

### Try Elyra Canvas

The ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) is a demonstration application which is produced with only a [few lines of code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js). You can try: dragging a node, editing a comment (double click on it), drag a node from the palette, click a button on the toolbar, zoom in and out using the scroll gesture.

## Getting started
To install `@elyra/canvas` in your project, you will need to run the following command using [npm](https://www.npmjs.com/):

```
npm install @elyra/canvas --save-dev
```

or add this to your package.json file:
```
"@elyra/canvas": "x.x.x"
```

where x.x.x is the latest build and then run:
```
npm install
```

Elyra Canvas requires react, react-dom, react-intl, and react-redux libraries to be installed. See `peerDependencies` in [package.json](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/package.json) for versions requirements.

Please refer to [Elyra Canvas Initial Setup](https://elyra-ai.github.io/canvas/02-set-up/).

Please refer to [Getting started with Common Canvas](https://elyra-ai.github.io/canvas/03-common-canvas/#getting-started-with-common-canvas).

Please refer to [Getting started with Common Properties](https://elyra-ai.github.io/canvas/04-common-properties/#getting-started-with-common-properties).


## 📖 Documentation

If you're looking for `@elyra/canvas` documentation, check out:
- [Documentation](https://elyra-ai.github.io/canvas/)
- [Test Harness Playground](https://ibm.biz/elyra-canvas-test-harness)

## 🙌 Contributing
We're always looking for contributors to help us fix bugs, build new features, or help us improve the project documentation. If you're interested, definitely check out our [Contributing Guide](https://elyra-ai.github.io/canvas/06-contributing/)!

## 📝 License
Licensed under the **Apache-2.0**