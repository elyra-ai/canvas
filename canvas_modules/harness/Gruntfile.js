/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint global-require: 0 */
/* eslint quote-props: 0 */

var codeCoverageDir = "reports/coverage";

module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			node: {
				src: ["index.js", "Gruntfile.js", "controllers/**/*.js",
				"models/**/*.js", "lib/**/*.js", "tests/**/*.js", "src/**/*.js", "src/**/*.jsx"]
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
			client: require("./webpack.config.dev")
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");
	grunt.loadNpmTasks("grunt-sass-lint");
	grunt.loadNpmTasks("grunt-webpack");
	grunt.registerTask("lint", ["eslint", "jsonlint", "yamllint", "sasslint"]);

	var buildTasks = ["lint", "clean"];

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);
};
