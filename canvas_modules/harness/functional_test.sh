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
SCRIPT_DIR=$(dirname "$0")

echo "cd $SCRIPT_DIR"
cd $SCRIPT_DIR

# start the test harness
echo "npm start"
export NODE_ENV=production
npm run start-prod &

# start running the test Cases
sleep 30
echo "Cypress version"
npx cypress --version
echo "Starting cypress electron tests"
npx cypress run --headed --browser electron

echo "cd $WORKING_DIR"
cd $WORKING_DIR
