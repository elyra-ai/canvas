#!/bin/bash

#
# Copyright 2017-2022 Elyra Authors
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
MAIN="main"

checkout_branch()
{
	echo "Checkout $1"
	git checkout $1
	git fetch origin
	git pull
}

commit_changes()
{
	pushd $WORKING_DIR
	git config --global user.email "elyra-canvas@users.noreply.github.com"
	git config --global user.name "Automated build"
	git add ./canvas_modules/common-canvas/package.json
	git status
	git commit -m "$2"
	echo "Push changes to $1"
	git push
	popd
}

setup_git_branch()
{
		git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
		git fetch
}

setup_git_branch
checkout_branch ${MAIN}

cd ./canvas_modules/common-canvas
npm version minor
NPM_VERSION=`node -p "require('./package.json').version"`
echo "Updated main build $NPM_VERSION"
commit_changes ${MAIN} "Update Elyra Canvas to version ${NPM_VERSION} [skip ci]"

echo "Publishing Elyra Canvas $NPM_VERSION to Artifactory NPM"
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ~/.npmrc
npm publish --userconfig=~/.npmrc --registry=https://registry.npmjs.org
