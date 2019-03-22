## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

## Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See [here](https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas) for detailed API and event documentation.

2) `Test harness`  
See [here](https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/harness) for setting up local environment  
Demo link [https://wdp-common-canvas-dev.stage1.mybluemix.net/](https://wdp-common-canvas-dev.stage1.mybluemix.net/)

## Using local version of common-canvas and/or common-properties
Clone wdp-abstract-canvas
```sh
git clone git@github.ibm.com:NGP-TWC/wdp-abstract-canvas.git

# Build common-canvas and common-properties
./<wdp-abstract-canvas>/canvas_modules/common-canvas/build.sh
```
In your application's package.json replace  
```
"@wdp/common-canvas": "<verson>"  
```
with
```  
"@wdp/common-canvas": "file:<wdp-abstract-canvas>/canvas_modules/common-canvas"  
```

Delete @wdp/common-canvas from node_modules of your application

```sh
# Run npm install to get local copy of common-canvas and/or common-properties
npm install
```

## Development environment

### Atom
In atom, install the following plugins:

- linter-eslint
- linter-sass-lint

Other useful packages
- editorconfig
- cucumber
