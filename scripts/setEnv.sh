#!/bin/bash
set -e

RELEASE_BRANCH="release"

if [[ ${TRAVIS_BRANCH} == ${RELEASE_BRANCH} ]]; then
	printf "registry=https://npm-registry.whitewater.ibm.com/\n//npm-registry.whitewater.ibm.com/:_authToken=${PRIVATE_NPM_TOKEN}" > .npmrc
else
	#assume master branch
	printf "registry=${ARTIFACTORY_NPM_REPO}\n_auth=${ARTIFACTORY_NPM_TOKEN}\nalways-auth=true\nemail=${BUILD_USER_EMAIL}" > .npmrc
fi
cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/
