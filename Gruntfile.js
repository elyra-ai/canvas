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
var IS_PRODUCTION = process.env.NODE_ENV === "production";
var HMR_ENABLED = process.env.WDP_HMR === "true";

module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			node: {
				src: ["index.js", "Gruntfile.js", "controllers/**/*.js",
				"models/**/*.js", "lib/**/*.js", "tests/**/*.js"]
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
				".travis.yml",
				"manifest.yml"
			]
		},
		sasslint: {
			options: {
				configFile: ".sass-lint.yml"
			},
			target: ["./src/styles/*.scss", "./src/styles/analyze/*.scss",
				"./src/styles/home/*.scss", "./src/components/**/*.scss"]
		},
		clean: {
			coverage: {
				src: [
					codeCoverageDir
				]
			}
		},
		webpack: {
			client: IS_PRODUCTION ? require("./webpack.config.prod") : require("./webpack.config.dev")
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");
	grunt.loadNpmTasks("grunt-webpack");
	grunt.loadNpmTasks("grunt-sass-lint");
	grunt.registerTask("lint", ["eslint", "jsonlint", "yamllint", "sasslint"]);

	var buildTasks = ["lint", "clean"];
	if (IS_PRODUCTION) {
		buildTasks = buildTasks.concat(["webpack"]);
	} else if (!HMR_ENABLED) {
		buildTasks.push("webpack");
	}

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);
};
