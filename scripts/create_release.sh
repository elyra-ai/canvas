#!/bin/bash
set -e

UPDATE_TYPE="$1"
WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")
GIT_ORG="NGP-TWC"
GIT_REPO="wdp-abstract-canvas"
GIT_DIRECTORY="${GIT_REPO}_repo"
RELEASE_BRANCH="release"
MASTER="master"

if [[ ! -z "${2}" && ! -z "${3}" ]]; then
	git config --global user.name ${2}
	git config --global user.email ${3}
	echo "GIT user set as: Username: ${2} # Email: ${3}"
fi

if [[ "${UPDATE_TYPE}" != "patch" && "${UPDATE_TYPE}" != "minor" && "${UPDATE_TYPE}" != "major" ]]; then
	echo "Invalid argument entered for update type.  Enter major, minor, or patch"
	exit 1;
fi

echo "Clone wdp-abstract-canvas"
git clone git@github.ibm.com:${GIT_ORG}/${GIT_REPO}.git ${GIT_DIRECTORY}

cd $WORKING_DIR/$GIT_DIRECTORY
git checkout ${RELEASE_BRANCH}
if [[ $(git diff --name-status ${MASTER}..${RELEASE_BRANCH}) ]]; then
	echo "Changes found between master and ${RELEASE_BRANCH}"
	git checkout ${MASTER}
	git branch -d ${RELEASE_BRANCH}
else
	echo "No changes found between master and ${RELEASE_BRANCH}"
	exit 0;
fi

# Increment version in package.json for common-canvas and common-prop-editor
# patch, minor, or major
echo "Update $UPDATE_TYPE in common-canvas"
cd ./canvas_modules/common-canvas
npm version $UPDATE_TYPE
cd ../../
git commit -m "Update $UPDATE_TYPE version for common-canvas" ./canvas_modules/common-canvas/package.json

#echo "Update $UPDATE_TYPE in common-properties"
#cd ./canvas_modules/common-properties
#npm version $UPDATE_TYPE
#cd ../../
#git commit -m "Update $UPDATE_TYPE version for common-properties [ci skip]" ./canvas_modules/common-properties/package.json

echo "Push changes to master"
git push origin ${MASTER}

echo "Create a release branch"
# create/update release branch
git checkout -b "${RELEASE_BRANCH}"
git push origin "${RELEASE_BRANCH}" --force

cd $WORKING_DIR
