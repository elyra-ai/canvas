#!/bin/bash

set -e

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR
# Tag the release build before publishing
./tagBuild.sh

echo "Publishing common-canvas to NPM"
cd ../canvas_modules/common-canvas
npm publish

cd ../

echo "Publishing common-properties to NPM"
cd ./common-properties
npm publish

cd $WORKING_DIR
