#!/bin/bash
SCRIPTNAME=`basename "$0"`
echo "RUNNING SCRIPT: ${SCRIPTNAME}"

echo "Add github to known hosts"
ssh -o StrictHostKeyChecking=no -T git@github.ibm.com


echo "Setting local variables"
WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")
GIT_ORG="NGP-TWC"
GIT_REPO="wdp-abstract-canvas"
GIT_DIRECTORY="${GIT_REPO}_repo"
RELEASE_BRANCH="release"
MASTER="master"
GIT_USER="Y9CTMV866"
GIT_USER_EMAIL="Y9CTMV866@nomail.relay.ibm.com"

git config --global user.name "${GIT_USER}"
git config --global user.email "${GIT_USER_EMAIL}"
echo "GIT user set as: Username: ${GIT_USER} # Email: ${GIT_USER_EMAIL}"

echo "Clone wdp-abstract-canvas"
git clone git@github.ibm.com:${GIT_ORG}/${GIT_REPO}.git ${GIT_DIRECTORY}

cd $WORKING_DIR/$GIT_DIRECTORY
git checkout ${RELEASE_BRANCH}
if [[ $(git diff --name-status ${MASTER}..${RELEASE_BRANCH}) ]]; then
	echo "Changes found between ${MASTER} and ${RELEASE_BRANCH}.  Merge branches."
	git checkout ${MASTER}
	git push origin HEAD:${RELEASE_BRANCH} --force
else
	echo "No changes found between ${MASTER} and ${RELEASE_BRANCH}"
	exit 0;
fi

cd $WORKING_DIR
