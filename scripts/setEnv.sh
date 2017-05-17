#!/bin/bash
set -e

printf "@wdp:registry=https://na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/\n" > .npmrc
printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:_password=${ARTIFACTORY_NPM_TOKEN}\n" >> .npmrc
printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:username=${ARTIFACTORY_NPM_USERNAME}\n" >> .npmrc
printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:email=${ARTIFACTORY_USER_EMAIL}\n" >> .npmrc
printf "//na.artifactory.swg-devops.com/artifactory/api/npm/analytics-canvas-npm-local/:always-auth=true\n" >> .npmrc
printf "registry=https://npm-registry.whitewater.ibm.com/\n" >> .npmrc
printf "//npm-registry.whitewater.ibm.com/:_authToken=${PRIVATE_NPM_TOKEN}\n" >> .npmrc

cp .npmrc ./canvas_modules/common-canvas/
cp .npmrc ./canvas_modules/harness/
