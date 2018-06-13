#!/bin/bash

#-------------------------------------------------------------
# IBM Confidential
# OCO Source Materials

# (C) Copyright IBM Corp. 2017, 2018
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the U.S. Copyright Office.
#-------------------------------------------------------------

set -e

WORKING_DIR="$PWD"
RELEASE="release"

# Update package.json version on master only
if [[ ${TRAVIS_BRANCH} == ${RELEASE} ]]; then
	echo "Installing dap-deploy"
	# Install dap-deploy in parent directory to prevent failure when running npm install in harness directory
	npm install @dap/dap-deploy
	cd ./canvas_modules/harness
	echo "Deploying to Bluemix"
	./../../node_modules/@dap/dap-deploy/scripts/deploy-v2.sh -a api.stage1.ng.bluemix.net -o MokshaCanvasShaper -s dev -d wdp-common-canvas-dev.stage1.mybluemix.net -p ./scripts/deploy/deploy.properties
	cd $WORKING_DIR
fi
