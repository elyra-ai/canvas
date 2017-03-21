#!/bin/bash

set -e

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

echo "cd $SCRIPT_DIR"
cd $SCRIPT_DIR
rm -fR ./node_modules/@wdp
# install require modules
echo "npm install"
npm install

echo "cd $WORKING_DIR"
cd $WORKING_DIR
