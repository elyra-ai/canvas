/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

/* eslint global-require: 0 */
/* eslint quote-props: 0 */
var codeCoverageDir = "reports/coverage";

module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			node: {
				src: ["index.js", "Gruntfile.js", "controllers/**/*.js", "lib/**/*.js"]
			}
		},
		jsonlint: {
			node: {
				src: [
					"config/**/*.json",
					"config/**/*.template",
					"package.json"
				]
			}
		},
		yamllint: {
			all: [
			]
		},
		clean: {
			coverage: {
				src: [
					codeCoverageDir
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");

	var buildTasks = ["clean", "eslint", "jsonlint", "yamllint"];

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);

};
