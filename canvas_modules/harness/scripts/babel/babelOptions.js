/*
 * Copyright 2017-2019 IBM Corporation
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

const assign = require("object-assign");

const babelBaseOptions = {
	babelrc: false, // required so webpack ignores the .babelrc file used for testing in root of project
	presets: ["react", "env"]
};

const babelClientOptions = assign({}, babelBaseOptions, {
	cacheDirectory: true,
	env: {
		development: {
			presets: ["react-hmre"]
		}
	}
});

const babelTestOptions = assign({}, babelBaseOptions, {
	env: {
		test: {
			plugins: [
				[
					"babel-plugin-webpack-loaders",
					{
						// The config path is relative to the root of the project
						config: "./webpack.config.test.js",
						verbose: false
					}
				]
			]
		}
	}
});

exports.babelBaseOptions = babelBaseOptions;
exports.babelTestOptions = babelTestOptions;
exports.babelClientOptions = babelClientOptions;
