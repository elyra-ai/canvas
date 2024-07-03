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
"use strict";

const babelOptions = {
	babelrc: false, // required so webpack ignores the .babelrc file used for testing in root of project
	presets: ["@babel/preset-react", "@babel/preset-env"],
	plugins: ["lodash", "@babel/plugin-proposal-class-properties", "@babel/plugin-transform-runtime", "istanbul"]
};

exports.babelOptions = babelOptions;
