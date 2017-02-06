#!/bin/bash

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

# Increment version in package.json for common-canvas and common-prop-editor
# patch, minor, or major

echo "Update $UPDATE_TYPE in common-canvas"
cd ./canvas_modules/common-canvas
npm version $UPDATE_TYPE
cd $WORKING_DIR

echo "Update $UPDATE_TYPE in common-properties"
cd ./canvas_modules/common-properties
npm version $UPDATE_TYPE
cd $WORKING_DIR

# commit change back to git
git commit

# create/update release branch
