#!/bin/bash

set -e

WORKING_DIR="$PWD"
RELEASE_BRANCH="release"
MASTER="master"

if [[ ! -z "${BUILD_USER}" && ! -z "${BUILD_USER_EMAIL}" ]]; then
	git config --global user.name ${BUILD_USER}
	git config --global user.email ${BUILD_USER_EMAIL}
	echo "GIT user set as: Username: ${BUILD_USER} # Email: ${BUILD_USER_EMAIL}"
fi

# Update package.json version on master only
if [[ ${TRAVIS_BRANCH} == ${MASTER} ]]; then
	# Increment version in package.json for common-canvas.  Defaults to patch
	echo "Update patch version of common-canvas"
	cd ./canvas_modules/common-canvas
	npm version patch
	cd ../../
	git commit -m "Update $UPDATE_TYPE version for common-canvas [skip ci]" ./canvas_modules/common-canvas/package.json

	echo "Push changes to master"
	git push origin ${MASTER}
fi

# Only tag release builds
if [[ ${TRAVIS_BRANCH} == ${RELEASE_BRANCH} ]]; then
	cd ./canvas_modules/common-canvas
	# Get the build number from the package
	BUILDNUM=`node -p "require('./package.json').version"`
	# Tag the release build before publishing
	cd ../../scripts
	./tagBuild.sh $BUILDNUM
	cd ../
fi

echo "Publishing common-canvas $BUILDNUM to NPM"
cd ./canvas_modules/common-canvas
if [[ ${TRAVIS_BRANCH} == ${MASTER} ]]; then
	#Update npm repository for master builds
	sed -i '' 's|"registry":.*|"registry": "'${ARTIFACTORY_NPM_REPO}'"|g' package.json
fi
npm publish

cd $WORKING_DIR
