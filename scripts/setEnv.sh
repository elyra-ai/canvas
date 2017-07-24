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

# only set when deploying to Artifactory.
if [[ ${TRAVIS_BRANCH} == ${MASTER} ]]; then
	printf "@wdp:registry=https://na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/\n" > .npmrc
	printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:_password=${ARTIFACTORY_NPM_TOKEN}\n" >> .npmrc
	printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:username=${ARTIFACTORY_NPM_USERNAME}\n" >> .npmrc
	printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:email=${ARTIFACTORY_USER_EMAIL}\n" >> .npmrc
	printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:always-auth=true\n" >> .npmrc
fi
printf "registry=https://npm-registry.whitewater.ibm.com/\n" >> .npmrc
printf "//npm-registry.whitewater.ibm.com/:_authToken=${PRIVATE_NPM_TOKEN}\n" >> .npmrc

cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/
