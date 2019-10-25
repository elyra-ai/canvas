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

SCRIPTNAME=`basename "$0"`
echo "RUNNING SCRIPT: ${SCRIPTNAME}"

# Only post to slack for failures

SLACK_CHANNEL="#wdp-canvas-builds"
SLACK_URL=" https://hooks.slack.com/services/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 " # pragma: whitelist secret
JENKINS_JOB_URL="${BUILD_URL}"
echo "---Error occured creating release branch."
echo "---Posting to slack channel ${SLACK_CHANNEL}. Specifying Jenkins job URL as ${JENKINS_JOB_URL}"

PRETEXT="Release branch creation failed in Jenkins"
COLOR="danger"
TEXT="*JENKINS JOB  URL*: ${JENKINS_JOB_URL}\n*Error*: Release branch failed to create.  Build wasn't pushed to Artifactory NPM."

curl -X POST --data-urlencode "payload={\"attachments\": [{\"pretext\": \"${PRETEXT}\",\"color\": \"${COLOR}\",\"title\": \"Details\",\"text\": \"${TEXT}\",\"mrkdwn_in\":[\"text\", \"pretext\"]}]}" $SLACK_URL
