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

// This file was added to d3-zoom-extension because the original d3-zoom code
// does not comply with the Elyra canvas lint rules. Rather than changing all
// the d3-zoom code to comply with those rules, this file overrules the Elyra
// canvas lint rules so no lint errors occur for the d3-zoom code.
module.exports = {
	extends: "eslint-config-canvas",
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
	env: {
		jest: true
	},
	parserOptions: {
		"sourceType": "module"
	}
};
