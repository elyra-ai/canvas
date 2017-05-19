#!/bin/bash
SCRIPTNAME=`basename "$0"`
echo "RUNNING SCRIPT: ${SCRIPTNAME}"

# Only post to slack for failures

SLACK_CHANNEL="#wdp-canvas-builds"
SLACK_URL=" https://hooks.slack.com/services/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 "
JENKINS_JOB_URL="${BUILD_URL}"
echo "---Error occured creating release branch."
echo "---Posting to slack channel ${SLACK_CHANNEL}. Specifying Jenkins job URL as ${JENKINS_JOB_URL}"

PRETEXT="Release branch creation failed in Jenkins"
COLOR="danger"
TEXT="*JENKINS JOB  URL*: ${JENKINS_JOB_URL}\n*Error*: Release branch failed to create.  Build wasn't pushed to Whitewater NPM."

curl -X POST --data-urlencode "payload={\"attachments\": [{\"pretext\": \"${PRETEXT}\",\"color\": \"${COLOR}\",\"title\": \"Details\",\"text\": \"${TEXT}\",\"mrkdwn_in\":[\"text\", \"pretext\"]}]}" $SLACK_URL
