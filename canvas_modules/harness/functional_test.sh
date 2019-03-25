#!/bin/bash

set -e

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

echo "cd $SCRIPT_DIR"
cd $SCRIPT_DIR

# start the test harness
echo "npm start"
export NODE_ENV=production
npm start &

# start running the test Cases
sleep 30
echo "npm test"
npm test -- --screenshotsOnError=false

echo "download coverage"
mkdir -p coverage
cd coverage
curl -L http://localhost:3001/coverage/download -o coverage.zip
unzip coverage.zip

echo "cd $WORKING_DIR"
cd $WORKING_DIR
