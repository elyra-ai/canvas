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
import configs from "eslint-config-canvas";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import js from "@eslint/js";
import reactConfigs from "../eslint-config-canvas/react.js";
import reactPlugin from "eslint-plugin-react";

export default [
	importPlugin.flatConfigs.errors,
	...configs,
	...reactConfigs,
	{
		plugins: {
			react: reactPlugin
		},
		settings: {
			"import/resolver": {
				"node": {
					"extensions": [".js", ".jsx", ".json"]
				}
			}
		},
		rules: {
			...js.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
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
				...globals.node,
				...globals.browser,
				browser: false
			}
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
	// commonjs files
	{
		files: [
			"**/*.cjs"
		],
		languageOptions: {
			sourceType: "commonjs"
		}
	},
	// jest tests
	{
		files: [
			"__tests__/**/*.js"
		],
		rules: {
			// Disable strict warning on ES6 Components
			"sort-imports": "off",
			"react/jsx-indent-props": [2, "tab"],
			"no-unused-expressions": "off",
			"no-shadow": ["error", { "allow": ["expect"] }]
    	},
		languageOptions: {
			globals: {
				...globals.jest,
				global: "readonly",
				browser: true
			}
		}
	},
	// d3-zoom-extension
	{
		files: [ "src/common-canvas/d3-zoom-extension/**/*.js" ],
		rules: {
			// Allow snake_case, but only for object properties e.g. myObj.param_name
			"camelcase": [
				"error",
				{ "properties": "never" }
			],
			"max-len": "off",
			"id-length": ["error", { "min": 1 }],
			"indent": "off",
			"object-curly-spacing": "off",
			"no-shadow": "off",
			"no-invalid-this": "off",
			"consistent-this": "off",
			"no-nested-ternary": "off",
			"one-var": "off",
			"sort-vars": "off",
			"prefer-rest-params": "off",
			"no-eq-null": "off",
			"eqeqeq": "off",
			"newline-per-chained-call": "off",
			"one-var-declaration-per-line": "off",
			"no-param-reassign": "off",
			"no-implicit-coercion": "off",
			"brace-style": "off",
			"curly": "off",
			"no-unused-expressions": "off",
			"no-sequences": "off",
			"no-return-assign": "off",
			"prefer-spread": "off",
			"no-bitwise": "off",
			"sort-imports": "off",
			"no-undef": "off",
			"arrow-parens": "off",
			"quotes": "off"
		},
		languageOptions: {
			sourceType: "module",
			globals: {
				...globals.jest
			}
		}
	},
	// src
	{
		files: [ "src/**/*.js", "src/**/*.jsx" ],
		rules: {
			// Disable strict warning on ES6 Components
			"sort-imports": 0,
			"react/jsx-indent-props": [2, "tab"],
			"complexity": "off"
		},
		languageOptions: {
			globals: {
            	...globals.node,
				browser: true
			}
		}
	}
];
