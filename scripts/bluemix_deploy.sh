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

WORKING_DIR="$PWD"
RELEASE="release"

# Update package.json version on master only
if [[ ${TRAVIS_BRANCH} == ${RELEASE} ]]; then
	echo "Installing dap-deploy"
	# Install dap-deploy in parent directory to prevent failure when running npm install in harness directory
	npm install @dap/dap-deploy
	cd ./canvas_modules/harness
	echo "Deploying to Bluemix"
	./../../node_modules/@dap/dap-deploy/scripts/deploy-v2.sh -a api.stage1.ng.bluemix.net -o MokshaCanvasShaper -s dev -d wdp-common-canvas-dev.stage1.mybluemix.net -p ./scripts/deploy/deploy.properties
	cd $WORKING_DIR
fi
