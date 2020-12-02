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

cd ./canvas_modules/common-canvas
RELEASE_BUILD=`node -p "require('./package.json').version"`
echo "Publishing common-canvas $RELEASE_BUILD to Artifactory NPM"
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > .npmrc
npm publish
