#!/bin/bash

#-------------------------------------------------------------
# IBM Confidential
# OCO Source Materials

# (C) Copyright IBM Corp. 2017
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the U.S. Copyright Office.
#-------------------------------------------------------------

# Add github to known hosts
# Note: ssh returns non-zero code because github doesn't support shell access.
# We don't care about this... but because we use -e option at the top
# of the script, it fails the script completely.
# This is a workaround so that this command doesnt hit the fail-on-error stuff.
# - Thought we could have used the other trick: <cmd> || true
set +e # Disable error checking
echo "Add github to known hosts"
ssh -o StrictHostKeyChecking=no -T git@github.ibm.com
set -e # Re-enable fail-on-error checking

SCRIPTNAME=`basename "$0"`
echo "RUNNING SCRIPT: ${SCRIPTNAME}"

echo "Setting local variables"
WORKING_DIR="$PWD"
GIT_ORG="NGP-TWC"
GIT_REPO="wdp-abstract-canvas"
GIT_DIRECTORY="${GIT_REPO}_repo"
RELEASE="release"
MASTER="master"
GIT_USER="Y9CTMV866"
GIT_USER_EMAIL="Y9CTMV866@nomail.relay.ibm.com"

git config --global user.name "${GIT_USER}"
git config --global user.email "${GIT_USER_EMAIL}"
echo "GIT user set as: Username: ${GIT_USER} # Email: ${GIT_USER_EMAIL}"

echo "Clone wdp-abstract-canvas"
git clone git@github.ibm.com:${GIT_ORG}/${GIT_REPO}.git ${GIT_DIRECTORY}

cd $WORKING_DIR/$GIT_DIRECTORY
git checkout ${RELEASE}
if [[ $(git diff --name-status ${MASTER}..${RELEASE}) ]]; then
	echo "Changes found between ${MASTER} and ${RELEASE}.  Merge branches."
	git checkout ${MASTER}
	git push origin HEAD:${RELEASE} --force
else
	echo "No changes found between ${MASTER} and ${RELEASE}"
	exit 0;
fi

cd $WORKING_DIR
