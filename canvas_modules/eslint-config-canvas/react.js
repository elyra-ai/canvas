/*
 * Copyright 2017-2022 Elyra Authors
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

module.exports = {
    "env": {
        "es6": true,
        "browser": false,
        "node": true
    },
	"plugins": [
		"react"
	],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
  	// View link below for react rules documentation
  	// https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
	"rules": {
		// Prevent missing displayName in a React component definition
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/display-name.md
		"react/display-name": [0, { "ignoreTranspilerName": false }],
		// Forbid certain propTypes (any, array, object)
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-prop-types.md
		"react/forbid-prop-types": [0, { "forbid": ["any", "array", "object"] }],
		// Enforce boolean attributes notation in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
		"react/jsx-boolean-value": [2, "never"],
		// Validate closing bracket location in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md
		"react/jsx-closing-bracket-location": [2, "line-aligned"],
		// Enforce or disallow spaces inside of curly braces in JSX attributes
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-spacing.md
		"react/jsx-curly-spacing": [0, "never", { "allowMultiline": true }],
		// Enforce event handler naming conventions in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md
		"react/jsx-handler-names": [0, {
		  "eventHandlerPrefix": "handle",
		  "eventHandlerPropPrefix": "on",
		}],
		// Validate props indentation in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent-props.md
		"react/jsx-indent-props": [2, "tab"],
		// Validate JSX has key prop when in array or iterator
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
		"react/jsx-key": 0,
		// Limit maximum of props on a single line in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-max-props-per-line.md
		"react/jsx-max-props-per-line": [0, { "maximum": 1 }],
		// Allow calling bind() in JSX
		// We need this to get around the change in auto-binding behaviour in React.Component class
		// See: https://facebook.github.io/react/docs/reusable-components.html#no-autobinding
		// See https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding
		// See:
		// Use of arrow functions as class members is what is proposed by Facebook, but it's part of the
		// proposal spec and we should avoid it. See:
		// See: https://github.com/eslint/eslint/issues/4683
		"react/jsx-no-bind": 0,
		// Prevent duplicate props in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
		"react/jsx-no-duplicate-props": [0, { "ignoreCase": false }],
		// Prevent usage of unwrapped JSX strings
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md
		"react/jsx-no-literals": 0,
		// Disallow undeclared variables in JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
		"react/jsx-no-undef": 2,
		// Enforce PascalCase for user-defined JSX components
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
		"react/jsx-pascal-case": 0,
		// Enforce propTypes declarations alphabetical sorting
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/sort-prop-types.md
		"react/sort-prop-types": [0, {
		  "ignoreCase": false,
		  "callbacksLast": false,
		}],
		// Enforce props alphabetical sorting
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md
		"react/jsx-sort-props": [0, {
		  "ignoreCase": false,
		  "callbacksLast": false,
		}],
		// Prevent React to be incorrectly marked as unused
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
		"react/jsx-uses-react": 2,
		// Prevent variables used in JSX to be incorrectly marked as unused
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md
		"react/jsx-uses-vars": 2,
		// Prevent usage of dangerous JSX properties
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger.md
		"react/no-danger": 0,
		// Prevent usage of deprecated methods
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md
		"react/no-deprecated": 1,
		// Prevent usage of setState in componentDidMount
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-did-mount-set-state.md
		"react/no-did-mount-set-state": 2,
		// Prevent usage of setState in componentDidUpdate
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-did-update-set-state.md
		"react/no-did-update-set-state": 2,
		// Prevent direct mutation of this.state
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-direct-mutation-state.md
		"react/no-direct-mutation-state": 0,
		// Prevent usage of isMounted
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-is-mounted.md
		"react/no-is-mounted": 2,
		// Prevent multiple component definition per file
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md
		"react/no-multi-comp": [2, { "ignoreStateless": true }],
		// Prevent usage of setState
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-set-state.md
		"react/no-set-state": 0,
		// Prevent using string references
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md
		"react/no-string-refs": 0,
		// Prevent usage of unknown DOM property
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
		"react/no-unknown-property": 2,
		// Require ES6 class declarations over React.createClass
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-es6-class.md
		"react/prefer-es6-class": [2, "always"],
		// Prevent missing props validation in a React component definition
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
		"react/prop-types": [2, { "ignore": [], customValidators: [] }],
		// Prevent missing React when using JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md
		"react/react-in-jsx-scope": 2,
		// Restrict file extensions that may be required
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/require-extension.md
		"react/require-extension": [0, { "extensions": [".jsx"] }],
		// Prevent extra closing tags for components without children
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
		"react/self-closing-comp": 2,

		"react/jsx-tag-spacing": [2, { "beforeSelfClosing": "always" }],

		// Enforce component methods order
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/sort-comp.md
		"react/sort-comp": [2, {
		  "order": [
			"static-methods",
			"lifecycle",
			"/^on.+$/",
			"/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/",
			"everything-else",
			"/^render.+$/",
			"render"
		  ]
		}],
		// Prevent missing parentheses around multilines JSX
		// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/wrap-multilines.md
		"react/jsx-wrap-multilines": [2, {
		  declaration: true,
		  assignment: true,
		  return: true
		}],
	}
};
