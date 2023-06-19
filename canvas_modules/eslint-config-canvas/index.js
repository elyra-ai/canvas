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

module.exports = {
	"env": {
		"es6": true,
		"browser": false,
		"node": true
	},
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"extends": "eslint:recommended",
	"rules": {
		// Enforces getter/setter pairs in objects
		"accessor-pairs": "error",
		// Enforce spacing inside array brackets
		"array-bracket-spacing": [
			"error",
			"never"
		],
		"array-callback-return": "error",
		"arrow-body-style": "error",
		"arrow-parens": "error",
		"arrow-spacing": "error",
		"block-scoped-var": "error",
		"block-spacing": "error",
		"brace-style": [
			"error",
			"1tbs"
		],
		// Enforce return after a callback
		"callback-return": "error",
		// Require camelcase
		"camelcase": [
			"error",
			{
				"properties": "never"
			}
		],
		"comma-spacing": [
			"error",
			{
				"after": true,
				"before": false
			}
		],
		"comma-style": [
			"error",
			"last"
		],
		"complexity": "error",
		"computed-property-spacing": [
			"error",
			"never"
		],
		// Require return statements to either always or never specify values
		"consistent-return": "error",
		"consistent-this": "error",
		// Specify curly brace conventions for all control statements
		"curly": "error",
		"default-case": "error",
		// Enforce newline before and after dot (dot-location)
		"dot-location": [
			"error",
			"property"
		],
		"dot-notation": "error",
		"eol-last": "error",
		"eqeqeq": "error",
		// Require function expressions to have a name
		"func-names": "off",
		// Enforce use of function declarations or expressions
		"func-style": "off",
		"generator-star-spacing": "error",
		// Enforce require() on top-level module scope
		"global-require": "error",
		"guard-for-in": "error",
		"handle-callback-err": "error",
		"id-blacklist": "error",
		"id-length": "error",
		"id-match": "error",
		// Specify tab or space width for your code
		"indent": [
			"error",
			"tab"
		],
		// Enforce or disallow variable initializations at definition
		// TODO: Revisit
		"init-declarations": "off",
		"jsx-quotes": "error",
		// Enforce spacing between keys and values in object literal properties
		"key-spacing": [
			"error",
			{
				"beforeColon": false,
				"afterColon": true
			}
		],
		"keyword-spacing": [
			"error",
			{
				"after": true,
				"before": true
			}
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"lines-around-comment": "error",
		"max-depth": "error",
		"max-len": [
			"error",
			{
				"code": 120,
				"tabWidth": 4,
				"ignoreUrls": true
			}
		],
		"max-nested-callbacks": "error",
		// Limits the number of parameters that can be used in the function declaration
		// TODO: Revisit
		"max-params": "off",
		// Specify the maximum number of statement allowed in a function
		"max-statements": "off",
		"new-parens": "error",
		// Require or disallow an empty newline after variable declarations
		// TODO: Revisit
		"newline-after-var": "off",
		// Require newline before return statement
		// TODO: Revisit
		"newline-before-return": "off",
		"newline-per-chained-call": "error",
		"no-alert": "error",
		"no-array-constructor": "error",
		// Disallow use of bitwise operators
		"no-bitwise": "error",
		"no-caller": "error",
		"no-catch-shadow": "error",
		"no-confusing-arrow": "error",
		// Disallow use of console
		"no-console": [
			"error",
			{
				"allow": ["warn", "error"]
			}
		],
		// Disallow continue (no-continue)
		"no-continue": "off",
		"no-div-regex": "error",
		// Disallow else after a return in an if
		"no-else-return": "error",
		"no-empty-function": "error",
		"no-eq-null": "error",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-extra-label": "error",
		// Disallow unnecessary parentheses
		"no-extra-parens": [
			"error",
			"functions"
		],
		"no-floating-decimal": "error",
		"no-implicit-coercion": "error",
		"no-implicit-globals": "error",
		"no-implied-eval": "error",
		// Disallow comments inline after code
		"no-inline-comments": "off",
		"no-inner-declarations": [
			"error",
			"functions"
		],
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-label-var": "error",
		"no-labels": "error",
		"no-lone-blocks": "error",
		// Disallow if as the only statement in an else block
		"no-lonely-if": "error",
		"no-loop-func": "error",
		// Disallow the use of magic numbers
		// TODO: Revisit
		"no-magic-numbers": "off",
		"no-mixed-requires": "error",
		// Disallow use of multiple spaces
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-multiple-empty-lines": "error",
		"no-native-reassign": "error",
		// Disallow negated conditions
		"no-negated-condition": "off",
		"no-nested-ternary": "error",
		"no-new": "error",
		"no-new-func": "error",
		"no-new-object": "error",
		"no-new-require": "error",
		"no-new-wrappers": "error",
		"no-octal-escape": "error",
		// Disallow reassignment of function parameters
		"no-param-reassign": "error",
		"no-path-concat": "error",
		// Disallow use of unary operators, ++ and --
		"no-plusplus": "off",
		// Disallow use of process.env
		"no-process-env": "off",
		// Disallow process.exit()
		"no-process-exit": "error",
		"no-proto": "error",
		"no-restricted-globals": "error",
		"no-restricted-imports": "error",
		"no-restricted-modules": "error",
		"no-restricted-syntax": "error",
		"no-return-assign": "error",
		"no-script-url": "error",
		"no-self-compare": "error",
		"no-sequences": "error",
		// Disallow declaration of variables already declared in the outer scope
		"no-shadow": [
			"error",
			{
				"builtinGlobals": true,
				"hoist": "all"
			}
		],
		"no-shadow-restricted-names": "error",
		"no-spaced-func": "error",
		// Disallow use of synchronous methods
		"no-sync": "error",
		// Disallow the use of ternary operators
		"no-ternary": "off",
		"no-throw-literal": "error",
		// Disallow trailing whitespace at the end of lines
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-undefined": "error",
		// Disallow dangling underscores in identifiers
		"no-underscore-dangle": "off",
		"no-unmodified-loop-condition": "error",
		"no-unneeded-ternary": "error",
		"no-unused-expressions": "error",
		// Disallow declaration of variables that are not used in the code
		// TODO: Revisit
		"no-unused-vars": [
			"error",
			{
				"vars": "all",
				"args": "none"
			}
		],
		// Disallow use of variables before they are defined
		"no-use-before-define": "off",
		"no-useless-call": "error",
		// Disallow unnecessary concatenation of literals or template literals
		"no-useless-concat": "error",
		"no-useless-constructor": "error",
		// Require let or const instead of var
		// TODO: Revisit
		"no-var": "off",
		"no-void": "error",
		// Disallow usage of configurable warning terms in comments - e.g. TODO or FIXME
		"no-warning-comments": "off",
		"no-whitespace-before-property": "error",
		"no-with": "error",
		"object-curly-spacing": [
			"error",
			"always"
		],
		// Require method and property shorthand syntax for object literals
		// TODO: Revisit
		"object-shorthand": "off",
		// Require or disallow one variable declaration per function
		"one-var": [
			"error",
			"never"
		],
		"one-var-declaration-per-line": "error",
		"operator-assignment": [
			"error",
			"always"
		],
		"operator-linebreak": "error",
		// Enforce padding within blocks
		// TODO: Revisit
		"padded-blocks": "off",
		// Suggest using arrow functions as callbacks
		"prefer-arrow-callback": "off",
		"prefer-const": "error",
		// Suggest using Reflect methods where applicable
		"prefer-reflect": "off",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		// Suggest using template literals instead of strings concatenation
		// TODO: Revisit
		"prefer-template": "off",
		// Require quotes around object literal property names
		// TODO: Revisit
		"quote-props": [
			"error",
			"consistent"
		],
		"quotes": [
			"error",
			"double"
		],
		"radix": "error",
		// Require JSDoc comment
		"require-jsdoc": "off",
		"require-yield": "error",
		"semi": "error",
		"semi-spacing": "error",
		"sort-imports": "error",
		"sort-vars": "error",
		"space-before-blocks": "error",
		// Require or disallow a space before function parenthesis
		"space-before-function-paren": [
			"error",
			"never"
		],
		"space-in-parens": [
			"error",
			"never"
		],
		"space-infix-ops": "error",
		"space-unary-ops": "error",
		// Require or disallow a space immediately following the // or /* in a comment
		"spaced-comment": [
			"error",
			"always",
			{
				"block": {
					"exceptions": ["*"]
				}
			}
		],
		// Require or disallow strict mode directives
		"strict": [
			"error",
			"global"
		],
		"template-curly-spacing": "error",
		// Ensure JSDoc comments are valid
		// TODO: Revisit
		"valid-jsdoc": "off",
		// Require declaration of all vars at the top of their containing scope
		// TODO: Revisit
		"vars-on-top": "off",
		"wrap-iife": "error",
		"wrap-regex": "error",
		"yield-star-spacing": "error",
		"yoda": [
			"error",
			"never"
		]
	}
};

// Rule overrides only for "development" mode

if (process.env.NODE_ENV !== "production") {
	// Disallow use of console
	module.exports.rules["no-console"] = [
		1,
		{
			"allow": ["warn", "error"]
		}
	];
}
