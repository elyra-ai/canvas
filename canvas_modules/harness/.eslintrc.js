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

"use strict";

module.exports = {
	extends: "eslint-config-canvas",
	plugins: [
		"import"
	],
	settings: {
		"import/resolver": {
			"node": {
				"extensions": [".js", ".jsx", ".json"]
			}
		}
	},
	rules: {
		// Allow snake_case, but only for object properties e.g. myObj.param_name
		"camelcase": [
			"error",
			{ "properties": "never" }
		],
		"import/no-unresolved": [2, { commonjs: true, amd: true }],
		"max-len": [2, 180, 4],
		"id-length": ["error", { "min": 1 }]
	},
	env: {
		jasmine: true,
		jest: true
	},
	parserOptions: {
		"sourceType": "script"
	}
};
