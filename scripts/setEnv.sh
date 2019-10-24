#!/bin/bash

#-------------------------------------------------------------
# IBM Confidential
# OCO Source Materials

# (C) Copyright IBM Corp. 2017, 2019
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the U.S. Copyright Office.
#-------------------------------------------------------------

set -e

printf "registry=https://registry.npmjs.com/\n" >> .npmrc

cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/

if [[ ( "$TRAVIS_BRANCH" = "master" ) ]]; then
	echo "Setting COVERAGE=true"
	export COVERAGE=true
fi
