## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

## Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. The canvas is driven by an application-agnostic _Diagram JSON_ (https://ibm.ent.box.com/folder/17889516178), and fires UI events to the consuming application for document management.

2) A `Common Properties` editor that can be used to easily surface sophisticated property editors. Driven by _Flow JSON_ (https://ibm.ent.box.com/folder/17889566513), the Properties editor supports tabs, grouping, and other UI hints that allow the definition of complex UIs via simple JSON documents.

## Common Canvas API
_[TBD]_

### Functions
_[TBD]_
```
• renderDiagram() - Renders a valid _diagram JSON_ document in the canvas.
  See the canvas diagram JSON schema.
• setEventCallback() - Sets the callback function to be used for event notifications.
• setPaletteItems() - Uses _Palette JSON_ (https://ibm.ent.box.com/folder/17889547923)
  to set the array of operations available in the canvas palette.
```

### Events
_[TBD]_
```
a) Node editing initiated
b) Node added/deleted
c) Link added/deleted
d) Node moved
e) Selection/deselection of canvas elements
f) Node context menu event
g) Zoom change
h) Scroll change
```

## Common Properties API
_[TBD]_

### Functions
_[TBD]_

### Events
(none)


## Developer Tools
### Atom
- Optional packages
  - react
  - linter-eslint

## Environment setup

Link common canvas modules to test project:
```sh
cd <base dir>
npm link canvas_modules/common-properties
npm link canvas_modules/common-canvas
```
Use [this page](https://docs.npmjs.com/getting-started/fixing-npm-permissions) to fix node setup if installed as root.

```sh
npm install
npm start
```
Connect to canvas:
```
http://localhost:3300
```

## Creating "release" branch
  - Copy scripts/create_release.sh to an empty directory
  - Run ./create_release.sh <patch, minor, or major>
