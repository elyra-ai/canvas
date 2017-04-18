## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

### Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See [here](https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas) for detailed API and event documentation.

2) Test harness
See [here](https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/harness) for setting up local environment

### Using local version of common-canvas and/or common-properties
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
Delete @wdp from node_modules
```sh
# Run npm install to get local copy of common-canvas and/or common-properties
npm install
```

### Updating "release" branch (Weekly Jenkins Job: [link](https://analytics-canvas-jenkins.swg-devops.com/view/canvas_utils/job/Abstract-Canvas_Promote-Release))
  - Copy scripts/create_release.sh to an empty directory
  - Run ./create_release.sh <patch, minor, or major>

### Committing breaking changes
  - Increment the major version number in common-canvas/package.json ("version": "major.minor.patch")
  - Reset the patch version to "0"
  - In wml-canvas-ui make the required updates
  - Update the "major" version to match common-canvas. Leave patch version as "x"
