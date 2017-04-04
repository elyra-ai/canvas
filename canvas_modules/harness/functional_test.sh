#!/bin/bash

set -e

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

echo "cd $SCRIPT_DIR"
cd $SCRIPT_DIR

# start the test harness
echo "npm start"
npm start &

# start running the test Cases
sleep 2m
export UI_TEST_URL="http://localhost:3001"
echo "npm test"
npm test

echo "cd $WORKING_DIR"
cd $WORKING_DIR
