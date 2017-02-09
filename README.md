## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

## Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. The canvas is driven by an application-agnostic _Diagram JSON_, and fires UI events to the consuming application for document management.

2) A `Common Properties` editor that can be used to easily surface sophisticated property editors. Driven by _Flow JSON_, the Properties editor supports tabs, grouping, and other UI hints that allow the definition of complex UIs via JSON documents.

## Common Canvas API
_[TBD]_

### Functions
_[TBD]_

### Events
_[TBD]_

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
