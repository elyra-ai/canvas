#!/bin/bash

#
# Copyright 2017-2020 Elyra Authors
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

set -e

WORKING_DIR="$PWD"
MASTER="master"

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
	git push https://$GIT_TOKEN@github.com/${GITHUB_REPOSITORY}/canvas $1
}

setup_git_branch()
{
		# needed since travis only clones a single branch
		git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
		git fetch
}

setup_git_branch
checkout_branch ${MASTER}

cd ./canvas_modules/common-canvas
npm version patch
NPM_VERSION=`node -p "require('./package.json').version"`
echo "Updated master build $NPM_VERSION"
commit_changes ${MASTER} "Update common-canvas to version ${NPM_VERSION} [skip ci]"

echo "Publishing common-canvas $NPM_VERSION to Artifactory NPM"
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc
# npm publish
