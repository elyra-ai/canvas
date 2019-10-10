#!/bin/bash

#
# Copyright 2017-2019 IBM Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

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
MASTER_TAG="master-last_success"
GIT_USER="Y9CTMV866"
GIT_USER_EMAIL="Y9CTMV866@nomail.relay.ibm.com"

git config --global user.name "${GIT_USER}"
git config --global user.email "${GIT_USER_EMAIL}"
echo "GIT user set as: Username: ${GIT_USER} # Email: ${GIT_USER_EMAIL}"

echo "Clone wdp-abstract-canvas"
git clone git@github.ibm.com:${GIT_ORG}/${GIT_REPO}.git ${GIT_DIRECTORY}

cd $WORKING_DIR/$GIT_DIRECTORY
git checkout ${RELEASE}
if [[ $(git diff --name-status ${MASTER_TAG}..${RELEASE}) ]]; then
	echo "Changes found between ${MASTER_TAG} and ${RELEASE}.  Merge branches."
	git checkout ${MASTER_TAG}
	git push origin HEAD:${RELEASE} --force
else
	echo "No changes found between ${MASTER_TAG} and ${RELEASE}"
	exit 0;
fi

cd $WORKING_DIR
