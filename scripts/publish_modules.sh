#!/bin/bash

#
# Copyright 2017-2023 Elyra Authors
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

cd ./canvas_modules/common-canvas
release=$(echo $GITHUB_REF_NAME | cut -d'v' -f2)
echo "Release is set to $release"
npm version $release
NPM_VERSION=`node -p "require('./package.json').version"`
echo "Updated $GITHUB_REF_NAME build $NPM_VERSION"

if [[ "$GITHUB_REF_NAME" =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    major_version="v${BASH_REMATCH[1]}"
    minor_version="${BASH_REMATCH[2]}"
    patch_version="v${BASH_REMATCH[3]}"
    echo "Major version: $major_version"
    echo "Minor version: $minor_version"
    echo "Patch version: $patch_version"
else
    echo "Invalid semantic version format"
fi

echo "Publishing Elyra Canvas $NPM_VERSION to Artifactory NPM"
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ~/.npmrc
# Set to v12 dist tag to override latest tag
if [[ "$major_version" == "v12" ]]; then
    echo "v12 tag found, publishing under v12"
    npm publish --tag v12 --userconfig=~/.npmrc --registry=https://registry.npmjs.org
else
    echo "publishing under latest"
    npm publish --userconfig=~/.npmrc --registry=https://registry.npmjs.org
fi
