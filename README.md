<!--
{% comment %}
Copyright 2017-2023 Elyra Authors

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
The Elyra Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See [detailed API and event documentation](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/common-canvas).

2) `Test harness`
See [here](https://github.com/elyra-ai/canvas/tree/main/canvas_modules/harness) for setting up local environment

## Documentation
* Elyra canvas documentation - https://elyra-ai.github.io/canvas/
* Elyra canvas playground (Test harness) - https://ibm.biz/elyra-canvas-test-harness

## Using local version of common-canvas and/or common-properties
Clone elyra/canvas
```sh
# Clone the repo
git clone git@github.com:elyra-ai/canvas.git

# Install global libraries for building
npm install -g grunt-cli sass

# Build common-canvas and common-properties
./<elyra/canvas>/canvas_modules/common-canvas/build.sh
```
In your application's package.json replace
```
"@elyra/canvas": "<version>"
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

### Contribute to the Elyra Canvas documentation (mkdocs)
1. Python v3 needs to be available.

2. Go to canvas/docs directory.

3. Install required mkdocs packages using pip3.
```
pip3 install -r requirements.txt
pip3 install mike
```

4. Run below commands to use `mike` to deploy multiple versions of docs.
```sh
# Initially delete everything from gh-pages branch to start creating version folders.
mike delete --all 

# If above command throws an error please run below mkdocs command and then run mike deploy
mkdocs gh-deploy --force

# This command will create a folder named as v13 in gh-pages branch.
mike deploy --push --update-aliases v13 latest
mike set-default v13

# This command will create a folder named as v12.x in gh-pages branch.
mike deploy --push --update-aliases v12.x

# Test changes in local.
mike serve

# If above command doesn't reflect any changes made to docs please run below mkdocs command
mkdocs serve
```

5. When complete, open the browser: http://127.0.0.1:8000/
