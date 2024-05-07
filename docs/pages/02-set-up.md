# Installation

## NPM Install

You'll need to build your application with Elyra Canvas.

* Elyra Canvas requires react, react-dom, react-intl, and react-redux libraries to be installed. See peerDependencies in [package.json](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/common-canvas/package.json) for versions requirements.

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

If you want to see text displayed by Elyra Canvas components in different languages you must wrapper `<CommonCanvas>` and `<CommonProperties>`in an `<IntlProvider>` object.

The sample code below shows how `<IntlProvider>` should be imported and initialized. Your code can set `this.locale` to indicate which language should override the default which, in this sample code, is set to English `en`. The default locale will be used if `this.locale` is set to a language which is not currently supported.

If you want to provide translations for your own application's text you can import your own bundles and load them into the `this.messages` object along with the common-canvas and common-properties text. If you do this you will have to move `<IntlProvider/>` so that it wrappers your React objects as well as `<CommonCanvas/>` and/or `<CommonProperties>`.

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

## Overriding Styles and Color Themes

When building your application you will need to load fonts and override styles:

### CSS styling for quick start


If you just want to get up and running and don't care about scss then import these regular CSS files:

  - @elyra/canvas/dist/styles/common-canvas.min.css
    - version 8.x and older @elyra/canvas/dist/common-canvas.min.css

More information about carbon components can be found here https://carbondesignsystem.com/developing/frameworks/react#getting-started


### SCSS styling (recommended)

If you want to use the full power of scss styling with variable overrides etc then include these imports in your main SCSS file:
```
@use "@carbon/react"; // Bring in all the styles for Carbon in your root/global stylesheet
@import "@elyra/canvas/src/index.scss";
```

  - use `autoprefixer` when building
  - if using webpack under the `sass-loader` and make sure to include

```js
options: { includePaths: ["node_modules"] }
```

Again, you can refer to the test harness [harness.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/harness.scss) and [common.scss](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss) files for sample code.


### Loading Fonts
You may find that there is a pause in common-canvas behavior, such as when the context menu is first displayed, which is caused by fonts being loaded. This can be fixed by adding the following to the `.scss` file for your application:
```
@use "@carbon/react" as * with (
	$font-path: "/fonts"
);
```
The fonts will need to be imported from carbon before carbon styles and placed in a public `/fonts` directory.
You can see an example of this in the Elyra Canvas Test Harness (which is the equivalent of a host application) in this repo. That is, the [common.scss file](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/assets/styles/common.scss) contains the lines above and the grunt build files ensures the fonts are copied from `/node_modules/@ibm/plex` to the `<carbon fonts folder>` directory. We added following config in [Gruntfile](https://github.com/elyra-ai/canvas/blob/main/canvas_modules/harness/Gruntfile.js#L64) for copying fonts -
```
copy: {
	fonts: {
		files: [{
			expand: true,
			flatten: false,
			cwd: "./node_modules/@ibm/plex",
			src: ["IBM-Plex*/**"],
			dest: ".build/fonts"
		}]
	}
}

var buildTasks = ["copy:fonts"];
```

### 3rd party styling

If you are using Common Properties then also include the react-virtualized styles:
  - react-virtualized/styles.css





