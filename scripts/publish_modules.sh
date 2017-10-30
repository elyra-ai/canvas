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

WORKING_DIR="$PWD"
RELEASE="release"
MASTER="master"
SKIP_CI="[skip ci]"

checkout_branch()
{
	echo "Checkout $1"
	git checkout $1
	git fetch origin
	git pull
}

commit_changes()
{
	cd $WORKING_DIR
	git add ./canvas_modules/common-canvas/package.json
	git status
	git commit -m "$2"
	echo "Push changes to $1"
	git push origin $1
}

setup_git_branch()
{
		# needed since travis only clones a single branch
		git config --replace-all remote.origin.fetch +refs/heads/master:refs/remotes/origin/master
		git fetch
}
# Update package.json version on release and master if they are the same major and minor versions
if [[ ${TRAVIS_BRANCH} == ${RELEASE} ]]; then
	# In Travis the build uses a branch.  Switch to release to update package.json
	setup_git_branch
	checkout_branch ${RELEASE}

	echo "Update patch version of common-canvas"
	cd ./canvas_modules/common-canvas
	npm version patch
	RELEASE_BUILD=`node -p "require('./package.json').version"`
	echo "Release build $RELEASE_BUILD"
  # Need to skip release build otherwise builds will be into a loop
	commit_changes ${RELEASE} "Update version for common-canvas to version ${RELEASE_BUILD} ${SKIP_CI}"
	# Tag release build
	cd ./scripts
	./tagBuild.sh ${RELEASE} ${RELEASE_BUILD}
	cd $WORKING_DIR

	checkout_branch ${MASTER}
	cd ./canvas_modules/common-canvas
	MASTER_BUILD=`node -p "require('./package.json').version"`
	echo "Current master build $MASTER_BUILD"
	RELEASE_NUM=$(echo $RELEASE_BUILD | cut -d'.' -f1-2)
	MASTER_NUM=$(echo $MASTER_BUILD | cut -d'.' -f1-2)

	echo "Release major.minor build ${RELEASE_NUM}. Master major.minor build ${MASTER_NUM}"
	if [[ ${RELEASE_NUM} == ${MASTER_NUM} ]]; then
		npm version patch
		MASTER_BUILD=`node -p "require('./package.json').version"`
		echo "Updated master build $MASTER_BUILD"
		# Need to run build so master can be at the same code base as release
		commit_changes ${MASTER} "Update version for common-canvas to version ${MASTER_BUILD}"
	fi
	cd $WORKING_DIR
	checkout_branch ${RELEASE}

	echo "Publishing common-canvas $RELEASE_BUILD to Whitewater NPM"
	cd ./canvas_modules/common-canvas
	npm publish --registry https://npm-registry.whitewater.ibm.com/
	cd $WORKING_DIR
fi
