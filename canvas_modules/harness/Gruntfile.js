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

var IS_PRODUCTION = process.env.NODE_ENV === "production";
var codeCoverageDir = "reports/coverage";

module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			node: {
				src: ["index.js", "Gruntfile.js", "controllers/**/*.js",
					"models/**/*.js", "lib/**/*.js", "tests/**/*.js", "src/**/*.js", "src/**/*.jsx",
					"features/**/*.js", "scripts/**/*.js"]
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
			target: ["./src/**/*.scss"]
		},
		clean: {
			coverage: {
				src: [
					codeCoverageDir
				]
			},
			build: {
				src: [".build"]
			}
		},
		copy: {
			graphics: {
				files: [{
					expand: true,
					flatten: false,
					cwd: "./assets",
					src: [
						"images/**/*"
					],
					dest: ".build"
				}]
			},
			plexFonts: {
				files: [{
					expand: true,
					flatten: false,
					cwd: "./node_modules/carbon-components/src/globals/",
					src: ["fonts/**/*"],
					dest: ".build"
				}]
			},
			styleguide: {
				files: [{
					expand: true,
					flatten: false,
					cwd: "./node_modules/@wdp/common-canvas/dist",
					src: ["common-canvas*.css"],
					dest: ".build"
				},
				{
					expand: true,
					flatten: false,
					cwd: "./node_modules/codemirror/",
					src: ["lib/codemirror.css", "addon/hint/show-hint.css"],
					dest: ".build/codemirror"
				},
				{
					expand: true,
					flatten: false,
					cwd: "./node_modules/react-virtualized/",
					src: ["styles.css"],
					dest: ".build/react-virtualized"
				}]
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
	grunt.loadNpmTasks("grunt-sass-lint");
	grunt.loadNpmTasks("grunt-webpack");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.registerTask("lint", ["eslint", "jsonlint", "yamllint", "sasslint"]);

	var buildTasks = ["clean", "lint", "copy:graphics", "copy:styleguide", "copy:plexFonts"];
	if (IS_PRODUCTION) {
		buildTasks = buildTasks.concat(["webpack"]);
	}
	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);
};
