/*
 * Copyright 2017-2025 Elyra Authors
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


const codeCoverageDir = "reports/coverage";
const autoprefixer = require("autoprefixer");

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
			}
		},
		sass: {
			dist: {
				options: {
					loadPath: [".", "node_modules"],
					style: "compressed",
				},
				files: {
					"dist/styles/common-canvas.min.css": "src/themes/light.scss"
				}
			}
		},
		postcss: {
			options: {
				processors: [
					autoprefixer() // add vendor prefixes
				]
			},
			dist: {
				src: "dist/styles/*.css"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-postcss");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-yamllint");

	const buildTasks = ["clean", "eslint", "jsonlint", "yamllint", "sass", "postcss"];

	grunt.registerTask("build", buildTasks);
	grunt.registerTask("default", ["build"]);

};
