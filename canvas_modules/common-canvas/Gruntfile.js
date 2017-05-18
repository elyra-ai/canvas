/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint global-require: 0 */

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
		},
		webpack: {
			client: require("./webpack.config")
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");
	grunt.loadNpmTasks("grunt-webpack");

	var buildTasks = ["clean", "eslint", "jsonlint", "yamllint", "webpack"];

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);

};
