#!/bin/bash

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR
# Tag the release build before publishing
./tagBuild.sh

echo "Publishing common-canvas to NPM"
cd ../canvas_modules/common-canvas
# Don't publish to npm yet
#npm publish
npm config ls
cd ../../

echo "Publishing common-properties to NPM"
cd ../canvas_modules/common-properties
# Don't publish to npm yet
#npm publish
npm config ls

cd $WORKING_DIR
