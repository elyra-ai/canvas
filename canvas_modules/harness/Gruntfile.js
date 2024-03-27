/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint global-require: 0 */
/* eslint quote-props: 0 */

"use strict";

var IS_PRODUCTION = process.env.NODE_ENV === "production";

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
		clean: {
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
			styleguide: {
				files: [{
					expand: true,
					flatten: false,
					cwd: "./node_modules/@elyra/canvas/dist/styles",
					src: ["common-canvas*.css"],
					dest: ".build/css/common-canvas"
				},
				{
					expand: true,
					flatten: false,
					cwd: "./node_modules/react-virtualized/",
					src: ["styles.css"],
					dest: ".build/css/react-virtualized"
				},
				{
					expand: true,
					flatten: false,
					cwd: "./node_modules/@carbon/charts-react/dist",
					src: ["styles.min.css"],
					dest: ".build/css/@carbon/charts-react"
				}]
			}
		},
		sass: {
			dist: {
				options: {
					loadPath: [".", "node_modules"],
					style: "compressed"
				},
				files: [{
					expand: true,
					cwd: "./assets/styles",
					src: ["*.scss"],
					dest: ".build/css",
					ext: ".css",
					noCache: true
				}]
			}
		},
		webpack: {
			client: IS_PRODUCTION ? require("./webpack.config.prod") : require("./webpack.config.dev")
		}
	});

	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");
	grunt.loadNpmTasks("grunt-webpack");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.registerTask("lint", ["eslint", "jsonlint", "yamllint"]);

	var buildTasks = ["clean", "lint", "sass", "copy:graphics", "copy:styleguide"];
	if (IS_PRODUCTION) {
		buildTasks = buildTasks.concat(["webpack"]);
	}
	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);
};
