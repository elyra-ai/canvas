#!/bin/bash

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR
# Tag the release build before publishing
./tagBuild.sh

echo "Publishing common-canvas to NPM"
cd ../canvas_modules/common-canvas
npm publish

cd $SCRIPT_DIR

echo "Publishing common-properties to NPM"
cd ../canvas_modules/common-properties
npm publish

cd $WORKING_DIR
