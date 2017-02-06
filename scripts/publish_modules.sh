#!/bin/bash

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR
# Tag the release build before publishing
./tagBuild.sh

cd ../canvas_modules/common-canvas
npm publish

cd $SCRIPT_DIR


cd ../canvas_modules/common-properties
npm publish

cd $WORKING_DIR
