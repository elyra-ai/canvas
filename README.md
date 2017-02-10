## wdp-abstract-canvas[![Build Status](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas.svg?token=Th1rZzgdEHjwEFgN1ZmM&branch=master)](https://travis.ibm.com/NGP-TWC/wdp-abstract-canvas)

## Overview
The WDP Common Canvas tooling consists of two Node JS modules:

1) A `Common Canvas` for use in building canvas-like applications. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas for detailed API and event documentation.

2) A `Common Properties` editor that can be used to easily surface sophisticated property editors. See https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-properties for API and usage documentation.

3) Test harness
https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/harness for setting up local environment

## Creating "release" branch
  - Copy scripts/create_release.sh to an empty directory
  - Run ./create_release.sh <patch, minor, or major>
