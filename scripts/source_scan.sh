#!/bin/bash

#-------------------------------------------------------------
# IBM Confidential
# OCO Source Materials

# (C) Copyright IBM Corp. 2018, 2019
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the U.S. Copyright Office.
#-------------------------------------------------------------

# original https://github.ibm.com/NGP-TWC/WDP-Security/blob/master/automation/sourcescans/sonarqube/source_scan.sh

if [[ ( "$TRAVIS_PULL_REQUEST" = "false" && "$TRAVIS_BRANCH" = "master" ) ]]; then
	set -x
	VER_NUMBER=$TRAVIS_BUILD_NUMBER

	#check if JAVA_HOME is set. We will assume Travis' default JAVA_HOME will work for the Dependency check script.
	if [ -z "$JAVA_HOME" ] ; then
	   echo "JAVA_HOME not set"
	   exit 11
	fi

	#download the sonar-scanner
	wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.3.0.1492-linux.zip
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem with downloading the sonar-scanner program"
	    exit 1
	fi

	unzip sonar-scanner-cli-3.3.0.1492-linux.zip
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem extracting the sonar-scanner program"
	    exit 1
	fi

	#update scanner config
	sed -e "s#.*sonar.host.url.*#sonar.host.url=http://9.30.122.209:9000/sonarqube/#" sonar-scanner-3.3.0.1492-linux/conf/sonar-scanner.properties > /tmp/foo
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem updating the file, sonar-scanner.properties"
	    exit 1
	fi

	mv /tmp/foo sonar-scanner-3.3.0.1492-linux/conf/sonar-scanner.properties
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem moving the file, sonar-scanner.properties"
	    exit 1
	fi

	echo "sonar.projectKey=wdpCommonCanvas" > sonar-project.properties
	echo "sonar.projectName=WDP-Common-Canvas" >> sonar-project.properties
	echo "sonar.sources=./canvas_modules/common-canvas" >> sonar-project.properties
	echo "sonar.projectVersion=$TRAVIS_BUILD_NUMBER" >> sonar-project.properties
	echo "sonar.exclusions=**/__tests__/**,**/__mocks__/**, **/node_modules/**, **/common-canvas/dist/**, **/common-canvas/coverage/**" >> sonar-project.properties
	echo "sonar.coverage.exclusions=**/common-canvas/Gruntfile.js, **/common-canvas/postcss.config.js, **/common-canvas/webpack.config.js" >> sonar-project.properties
	echo "sonar.javascript.lcov.reportPaths=./canvas_modules/common-canvas/coverage/lcov.info, ./canvas_modules/harness/coverage/lcov.info" >> sonar-project.properties
	echo "sonar.sourceEncoding=UTF-8" >> sonar-project.properties
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem writing the file, sonar-scanner.properties"
	    exit 1
	fi

	#run the scanner
	sonar-scanner-3.3.0.1492-linux/bin/sonar-scanner
	if [ ! $? -eq 0 ]; then
	    echo "Error: Problem while running sonar-scanner"
	    exit 1
	fi
fi
