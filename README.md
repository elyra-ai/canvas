## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

### Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas for detailed API and event documentation.

2) A `Common Properties` editor that can be used to easily surface sophisticated property editors. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-properties for API and usage documentation.

3) Test harness
https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/harness for setting up local environment

### Using local version of common-canvas and/or common-properties
Clone wdp-abstract-canvas
```sh
git clone git@github.ibm.com:NGP-TWC/wdp-abstract-canvas.git
# Build common-canvas and common-properties
./<wdp-abstract-canvas>/canvas_modules/common-canvas/build.sh
./<wdp-abstract-canvas>/canvas_modules/common-properties/build.sh
```
In your application's package.json replace  
```
"@wdp/common-canvas": "<verson>"  
"@wdp/common-properties": "<version>"  
```
with
```  
"@wdp/common-canvas": "file:<wdp-abstract-canvas>/canvas_modules/common-canvas"  
"@wdp/common-properties": "file:<wdp-abstract-canvas>/canvas_modules/common-properties"  
```
Delete @wdp from node_modules
```sh
# Run npm install to get local copy of common-canvas and/or common-properties
npm install
```

### Creating "release" branch
  - Copy scripts/create_release.sh to an empty directory
  - Run ./create_release.sh <patch, minor, or major>
