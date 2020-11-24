/*
 * Copyright 2017-2020 Elyra Authors
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

var codeCoverageDir = "reports/coverage";

module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			node: {
				src: ["Gruntfile.js", "__mocks__/**/*.js", "__tests__/**/*.js", "constants/**/*.js", "utils/**/*.js"]
			},
			browser: {
				files: {
					src: ["src/**/*.js", "src/**/*.jsx"]
				}
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
			coverage: {
				src: [
					codeCoverageDir
				]
			},
			build: {
				src: ["dist"]
			},
			postBuild: {
				src: ["dist/lib/*.css*", "dist/styles/*.js*", "dist/*.css*"]
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

	var buildTasks = ["clean", "eslint", "jsonlint", "yamllint", "webpack", "clean:postBuild"];

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);

};
