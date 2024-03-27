# Installation

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

## Overriding Styles and Color Themes

When building your application you will need to load fonts and override styles:

### CSS styling for quick start


If you just want to get up and running and don't care about scss then import these regular css files:

  - carbon-components/css/carbon-components.min.css
  - @elyra/canvas/dist/styles/common-canvas.min.css
    - version 8.x and older @elyra/canvas/dist/common-canvas.min.css

More information about carbon components can be found here http://www.carbondesignsystem.com/getting-started/developers


### SCSS styling (recommended)

If you want to use the full power of scss styling with variable overrides etc then include these imports in your main scss file:
```sass
@import "carbon-components/scss/globals/scss/styles";
@import "@elyra/canvas/src/index.scss";
```

  - use `autoprefixer` when building
  - if using webpack under the `sass-loader` and make sure to include

```js
options: { includePaths: ["node_modules"] }
```

Again, you can refer to the test harness [index.scss file](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/styles/index.scss) for sample code.


### Loading Fonts
You may find that there is a pause in common canvas behavior, such as when the context menu is first displayed, which is caused by fonts being loaded. This can be fixed by adding the following to the `.scss` file for your application:
```
$font-path: "/fonts";
@import "carbon-components/scss/globals/scss/styles";
```
The fonts will need to be imported from carbon before carbon styles and placed in a public `/fonts` directory.
You can see an example of this in the common-canvas test harness (which is the equivalent of a host application) in this repo. That is, the [index.scss file](https://github.com/elyra-ai/canvas/blob/master/canvas_modules/harness/src/styles/index.scss) contains the lines above and the grunt build files ensures the fonts are copied from`node_modules/carbon-components/src/globals/` to the `<carbon fonts folder>` directory.


### 3rd party styling

If you are using common-properties then also include the react-virtualized styles:
  - react-virtualized/styles.css





