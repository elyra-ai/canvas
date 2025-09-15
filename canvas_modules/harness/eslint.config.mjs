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

import globals from "globals";
import configs from "eslint-config-canvas";
import importPlugin from "eslint-plugin-import";
import reactConfigs from "eslint-config-canvas/react";
import pluginCypress from "eslint-plugin-cypress";

export default [
	importPlugin.flatConfigs.errors,
	...configs,
	...reactConfigs,
	{
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
		languageOptions: {
			globals: {
				...globals.jasmine,
				...globals.jest
			}
		}
	},
	// commonjs files
	{
		files: [
			"**/*.cjs"
		],
		languageOptions: {
			sourceType: "commonjs"
		}
	},
	// ESM files
	{
		files: [
			"**/*.js",
			"**/*.mjs"
		],
		languageOptions: {
			sourceType: "module"
		}
	},
	// src
	{
		// ...configs, // TODO: Do we need this??
		// ...reactConfigs, // TODO: Do we need this??
		files: ["src/**/*.js", "src/**/*.jsx"],
		rules: {
			// Disable strict warning on ES6 Components
			"strict": 0,
			"global-require": 0,
			"sort-imports": 0,
			"react/jsx-indent-props": [2, "tab"],
			"max-len": [2, 180, 4],
		},
		languageOptions: {
			sourceType: "module",
			globals: {
				...globals.browser,
			}
		}
	},
	// cypress
	{
		// ...configs, // TODO: Do we need this??
		// ...reactConfigs, // TODO: Do we need this??
		files: ["cypress/**/*.js"],
		 plugins: {
			cypress: pluginCypress.configs.recommended,
		},
		rules: {
			"no-unused-expressions": "off",
			"cypress/no-unnecessary-waiting": "off"
		},
		languageOptions: {
			sourceType: "module"
		}
	}
];
