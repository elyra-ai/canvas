#!/bin/bash

set -e

BUILDNUM="$1"

TAG_NAME=$TRAVIS_BRANCH-$BUILDNUM

echo "Setting github tag $TAG_NAME"
git config --global user.email "builds@travis-ci.ibm.com"
git config --global user.name "Travis CI"
git tag -f $TAG_NAME
git push origin $TAG_NAME -f
echo "$TAG_NAME tag set successfully"
