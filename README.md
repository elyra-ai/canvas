<!--
{% comment %}
Copyright 2017-2020 IBM Corporation

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

## Overview
The Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See [detailed API and event documentation](https://github.com/elyra-ai/canvas/tree/master/canvas_modules/common-canvas).

2) `Test harness`  
See [here](https://github.com/elyra-ai/canvas/tree/master/canvas_modules/harness) for setting up local environment

## Using local version of common-canvas and/or common-properties
Clone elyra/canvas
```sh
git clone git@github.com:elyra/canvas.git

# Build common-canvas and common-properties
./<elyra/canvas>/canvas_modules/common-canvas/build.sh
```
In your application's package.json replace  
```
"@elyra/canvas": "<verson>"
```
with
```  
"@elyra/canvas": "file:<elyra/canvas>/canvas_modules/common-canvas"
```

Delete @elyra/canvas from node_modules of your application

```sh
# Run npm install to get local copy of common-canvas and/or common-properties
npm install
```
