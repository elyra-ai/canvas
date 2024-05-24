<!--
{% comment %}
Copyright 2017-2024 Elyra Authors

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

Elyra Canvas is an open-source library, which provides **React** objects that enable applications to **quickly** create a **fully functional flow editor**. Users can easily create and edit the flows of linked nodes by using the **flow editor**.

<p>
	<img src="https://github.com/elyra-ai/canvas/assets/25124000/3e734200-75dc-4232-8d2d-430daba13061" width="800" height="400"/>
	<br />
	<em>Elyra Canvas in action in the SPSS Modeler UI, the flagship component of IBM Watsonx</em>
</p>

### Elyra Canvas Modules

The elyra-ai/canvas repo contains three main modules: Common Canvas, Common Properties and Test Harness. For more details, see [this documentation](https://elyra-ai.github.io/canvas/#elyra-canvas-modules).

### Elyra Canvas Components Overview

The Elyra Canvas package delivers two decoupled React objects: Common Canvas and Common Properties. For more details, see [this documentation](https://elyra-ai.github.io/canvas/01-canvas-components/).

### Try Elyra Canvas

The ["Tiny App"](https://elyra-canvas-test-harness.u20youmx4sm.us-south.codeengine.appdomain.cloud/#/app-tiny) is a demonstration application that is produced with only a [few lines of code](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/client/app-tiny.js). You can use it to try these features of Elyra Canvas: 
- Dragging a node
- Editing a comment (by double clicking on it)
- Dragging a node from the palette
- Clicking a button on the toolbar
- Zooming in and out using the scroll gesture


## Getting started

Elyra Canvas requires react, react-dom, react-intl, and react-redux libraries to be installed. For versions requirements, see `peerDependencies` in [package.json](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/package.json).

To install `@elyra/canvas` in your project, run the following command using [npm](https://www.npmjs.com/):
```
npm install @elyra/canvas --save-dev
```

For more details about installation and getting started in Elyra Canvas, check out:
- [Elyra Canvas Initial Setup](https://elyra-ai.github.io/canvas/02-set-up/)
- [Getting started with Common Canvas](https://elyra-ai.github.io/canvas/03-common-canvas/#getting-started-with-common-canvas)
- [Getting started with Common Properties](https://elyra-ai.github.io/canvas/04-common-properties/#getting-started-with-common-properties)


## 📖 Documentation

If you're looking for `@elyra/canvas` documentation, check out:
- [Documentation](https://elyra-ai.github.io/canvas/)
- [Test Harness Playground](https://ibm.biz/elyra-canvas-test-harness)
