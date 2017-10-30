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

printf "registry=https://npm-registry.whitewater.ibm.com/\n" >> .npmrc
printf "//npm-registry.whitewater.ibm.com/:_authToken=${PRIVATE_NPM_TOKEN}\n" >> .npmrc

cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/
