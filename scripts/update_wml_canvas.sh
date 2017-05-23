#!/bin/bash

set -e

WORKING_DIR="$PWD"
LATEST_BUILDNUM="$1"
echo "Setting local variables"
WORKING_DIR="$PWD"
GIT_ORG="mwhoward"
GIT_REPO="wml-canvas-ui"
GIT_DIRECTORY="${GIT_REPO}_repo"
MASTER="master"
GIT_USER="Y9CTMV866"
GIT_USER_EMAIL="Y9CTMV866@nomail.relay.ibm.com"

# clone wml-canvas-ui
#git config --global user.name "${GIT_USER}"
#git config --global user.email "${GIT_USER_EMAIL}"
echo "GIT user set as: Username: ${GIT_USER} # Email: ${GIT_USER_EMAIL}"

echo "Clone wml-canvas-ui"
git clone git@github.ibm.com:${GIT_ORG}/${GIT_REPO}.git ${GIT_DIRECTORY}

# find current build number
cd ./${GIT_DIRECTORY}/ui
# Get the build number from the package
CURRENT_BUILDNUM=`grep '@wdp/common-canvas' package.json | grep -oE '[0-9]+\.[0-9]+\.[^"]+'`
echo "Current build in wml-canvas-ui ${CURRENT_BUILDNUM}. Latest common-canvas build is ${LATEST_BUILDNUM}"

CURRENT_MJR_NUM=$(echo $CURRENT_BUILDNUM | cut -d'.' -f 1)
LATEST_MJR_NUM=$(echo $LATEST_BUILDNUM | cut -d'.' -f 1)

echo "Current major ${CURRENT_MJR_NUM}. Latest major ${LATEST_MJR_NUM}"

# check to see if major version has changed.
if [[ ${CURRENT_MJR_NUM} == ${LATEST_MJR_NUM} ]]; then
	# sed to update common-canvas version number
	sed -i '' 's|"@wdp/common-canvas.*|"@wdp/common-canvas": "'${LATEST_BUILDNUM}'",|g' package.json
	# commit single change to wml-canvas-ui
	git status
	git add package.json
	git commit -m "Update common-canvas version to ${LATEST_BUILDNUM}"
	echo "Push changes to master"
	git push origin ${MASTER}
else
	echo "Major version changed.  User needs to manually update package.json with ${LATEST_BUILDNUM}"
fi

cd $WORKING_DIR
