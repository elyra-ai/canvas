#!/bin/bash

#
# Copyright 2017-2025 Elyra Authors
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

# only create the release if this is a travis cron job.
if [ ${TRAVIS_EVENT_TYPE} != "cron" ]; then
  exit 0;
fi

echo "Add github to known hosts"
ssh -o StrictHostKeyChecking=no -T git@github.com
set -e # Re-enable fail-on-error checking

SCRIPTNAME=`basename "$0"`
echo "RUNNING SCRIPT: ${SCRIPTNAME}"

echo "Setting local variables"
WORKING_DIR="$PWD"
GIT_DIRECTORY="canvas_repo"
RELEASE="release"
MAIN_TAG="main-last_success"
GIT_USER="automated_user"
GIT_USER_EMAIL="automated_user.com"

git config --global user.name "${GIT_USER}"
git config --global user.email "${GIT_USER_EMAIL}"
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
echo "GIT user set as: Username: ${GIT_USER} # Email: ${GIT_USER_EMAIL}"

echo "Clone canvas repo"
git clone https://$GITHUB_TOKEN@github.com/${GIT_ORG}/canvas ${GIT_DIRECTORY}

cd $WORKING_DIR/$GIT_DIRECTORY
git checkout ${RELEASE}
if [[ $(git diff --name-status ${MAIN_TAG}..${RELEASE}) ]]; then
	echo "Changes found between ${MAIN_TAG} and ${RELEASE}.  Merge branches."
	git checkout ${MAIN_TAG}
	git push https://$GITHUB_TOKEN@github.com/${GIT_ORG}/canvas HEAD:${RELEASE} --force
else
	echo "No changes found between ${MAIN_TAG} and ${RELEASE}"
	exit 0;
fi

cd $WORKING_DIR
