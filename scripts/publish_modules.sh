#!/bin/bash

set -e


WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR
cd ../canvas_modules/common-canvas
# Get the build number from the package
BUILDNUM=node -p "require('./package.json').version"
# Tag the release build before publishing
cd $SCRIPT_DIR
./tagBuild.sh $BUILDNUM

echo "Publishing common-canvas $BUILDNUM to NPM"
cd ../canvas_modules/common-canvas
npm publish

cd ../

echo "Publishing common-properties $BUILDNUM to NPM"
cd ./common-properties
npm publish

cd $WORKING_DIR
