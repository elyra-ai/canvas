<!--
{% comment %}
Copyright 2017-2019 IBM Corporation

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

## @ai-workspace/canvas [![Build Status](https://api.travis-ci.com/ai-workspace/canvas.svg?token=fxs6hCoNazkbbJ2xVkfD&branch=master)](https://travis-ci.com/ai-workspace/canvas)

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
