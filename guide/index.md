# Welcome to the Elyra Canvas Documentation

The elyra-ai/canvas repo contains three main components:

* [Common Canvas](/2.0-Common-Canvas-Documentation/) - This contains canvas functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed on the NPM registry. It provides a way for an application to display a flow of data operations (shown as a set of nodes connected with links) defined in a pipeline flow JSON document, to the user and to allows the user to interact with the display to modify the flow. Common canvas is a react component which can be imported, and is assisted by a regular JavaScript class called `CanvasController` which provides an API and handles the internal data model of the flow. Common canvas is highly customizable where node shape and appearance, colors, styles layout etc can all be customized by your application code.

* [Common Properties](/3.0-Common-Properties-documentation/) - This contains properties functionality which is packaged into the [elyra/canvas NPM module](https://www.npmjs.com/package/@elyra/canvas) and deployed on the NPM registry. It provides a way to translate a JSON document, which describes a set of properties with UI hints, into working properties dialog panel. Common properties is a react component and has an associated properties controller object. 

* [Test Harness](https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness#test-harness) - This provides a node.js app which displays a UI which allows you to try out various features of the common canvas and common properties components. Bear in mind this is not supposed to be a fully functional app but is, as the name suggests, a framework for testing. To get select one of the sample applications or select `None` as the sample app and then select a test canvas file from the `Canvas Diagram` drop down list and a test palette from the `Canvas palette` drop down list.

## Installation

You'll need to build your application with Elyra Canvas.

* Elyra Canvas requires react, react-dom, react-intl, and react-redux libraries to be installed. See peerDependencies in package.json for versions requirements.

Use the command:
```sh
npm install @elyra/canvas --save-dev
```
or add this to your package.json file:

```
  "@elyra/canvas": "x.x.x"
```
where x.x.x is the latest build and then run:
```sh
npm install
```

## Localization
You must wrapper `<CommonCanvas>` and `<CommonProperties>` in an `<IntlProvider>` object.

If you want to display translated text, the sample code below shows how `<IntlProvider>` should be initialized. Your code can set `this.locale` to indicate which language should override the default which, in this sample code, is set to English `en`. The default locale will be used if `this.locale` is set to a language which is not currently supported.

If you want to provide translations for your own application's text you can import your own bundles and load them into the `this.messages` object along with the common canvas and common properties text. If you do this you will have to move `<IntlProvider/>` so that it wrappers your React objects as well as `<CommonCanvas/>` and/or `<CommonProperties>`.

```js
import { IntlProvider } from "react-intl";
import CommandActionsBundles from "@elyra/canvas/locales/command-actions/locales";
import CommonCanvasBundles from "@elyra/canvas/locales/common-canvas/locales";
import CommonPropsBundles from "@elyra/canvas/locales/common-properties/locales";
import PaletteBundles from "@elyra/canvas/locales/palette/locales";
import ToolbarBundles from "@elyra/canvas/locales/toolbar/locales";

class App extends React.Component {

constructor() {
    this.locale = "en";
    // Create messages object once (here in constructor) - do not create messages
    // in the render method, otherwise unnecessary renders inside
    // common-canvas/common-properties will be performed.
    this.messages = this._getMessages(
        this.locale,
        [CommandActionsBundles, CommonCanvasBundles, CommonPropsBundles,
         PaletteBundles, ToolbarBundles]
    );
}

_getMessages(locale, bundles) {
  const messages = {};
  for (const bundle of bundles) {
    Object.assign(messages, bundle[locale]);
  }
  return messages;
}

render() {
  <IntlProvider locale={this.locale} defaultLocale="en" messages={this.messages}>
    {Add your <CommonCanvas/> or <CommonProperties/> element here.}
  </IntlProvider>
}
```

## Notes
When building your application you will need to load fonts and override styles can be found here:
[Styling](./4.0-Styling)

## Testing
When testing your application with Jest, this error might show up: `crypto.getRandomValues() not supported`. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported for details. 

To fix, added this to your jest setup file:
```js
const cryptoJest = require("crypto");
Object.defineProperty(global.self, "crypto", {
	value: {
		getRandomValues: (arr) => cryptoJest.randomBytes(arr.length)
	}
});
```
