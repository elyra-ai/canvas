#!/bin/bash

#-------------------------------------------------------------
# IBM Confidential
# OCO Source Materials

# (C) Copyright IBM Corp. 2017
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the U.S. Copyright Office.
#-------------------------------------------------------------

set -e

BRANCH="$1"
TAG="$2"

TAG_NAME=$BRANCH-$TAG

echo "Setting github tag $TAG_NAME"

git tag -f $TAG_NAME
git push origin $TAG_NAME -f
echo "$TAG_NAME tag set successfully"
