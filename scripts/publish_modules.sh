#!/bin/bash

set -e

WORKING_DIR="$PWD"
RELEASE_BRANCH="release"
MASTER="master"

# Update package.json version on master only
if [[ ${TRAVIS_BRANCH} == ${MASTER} ]]; then
	# In Travis the build uses a branch.  Switch to master to update package.json
	git checkout ${MASTER}
	git fetch origin
	git pull
	# Increment version in package.json for common-canvas.  Defaults to patch
	echo "Update patch version of common-canvas"
	cd ./canvas_modules/common-canvas
	npm version patch
	cd $WORKING_DIR
	git status
	git add ./canvas_modules/common-canvas/package.json
	git commit -m "Update $UPDATE_TYPE version for common-canvas [skip ci]"

	echo "Push changes to master"
	git push origin ${MASTER}
fi


cd ./canvas_modules/common-canvas
# Get the build number from the package
BUILDNUM=`node -p "require('./package.json').version"`
cd $WORKING_DIR

# Only tag release builds
if [[ ${TRAVIS_BRANCH} == ${RELEASE_BRANCH} ]]; then
	# Tag the release build before publishing
	cd ./scripts
	./tagBuild.sh $BUILDNUM
	cd $WORKING_DIR
fi

echo "Publishing common-canvas $BUILDNUM to NPM"
cd ./canvas_modules/common-canvas
if [[ ${TRAVIS_BRANCH} == ${MASTER} ]]; then
	# Update Artifactory npm repository for master builds
	npm publish --registry ${ARTIFACTORY_NPM_REPO}
elif [[ ${TRAVIS_BRANCH} == ${RELEASE_BRANCH} ]]; then
	# Update Whitewater npm repository for master builds
	npm publish --registry https://npm-registry.whitewater.ibm.com/
fi

cd $WORKING_DIR
