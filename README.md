## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

## Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas for detailed API and event documentation.

2) A `Common Properties` editor that can be used to easily surface sophisticated property editors. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-properties for API and usage documentation.


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
