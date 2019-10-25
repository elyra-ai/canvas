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

set -e

printf "registry=https://na.artifactory.swg-devops.com:443/artifactory/api/npm/wcp-wdp-npm-virtual/\n" >> .npmrc

printf "@ibm-analytics:registry=https://na.artifactory.swg-devops.com/artifactory/api/npm/hyc-design-npm-local/\n" >> .npmrc

curl -H "X-JFrog-Art-Api:${ARTIFACTORY_NPM_API_KEY}" -X GET https://na.artifactory.swg-devops.com/artifactory/api/npm/auth >> .npmrc

cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/

if [[ ( "$TRAVIS_BRANCH" = "master" ) ]]; then
	echo "Setting COVERAGE=true"
	# Disabled until we upgrade to babel 7.  istanbul has issues when compiling with the current version of babel
	# export COVERAGE=true
fi
