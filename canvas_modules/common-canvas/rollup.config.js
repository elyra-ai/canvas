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

import autoExternal from "rollup-plugin-auto-external";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import scss from "rollup-plugin-scss";
import { terser } from "rollup-plugin-terser";
import url from "@rollup/plugin-url";
import { visualizer } from "rollup-plugin-visualizer";

const bundleReport = process.env.BUNDLE_REPORT;

export default {
	input: {
		"lib/properties": "./src/common-properties/index.js",
		"lib/properties/field-picker": "./src/common-properties/components/field-picker/index.js",
		"lib/properties/flexible-table": "./src/common-properties/components/flexible-table/index.js",
		"lib/properties/clem": "./src/common-properties/controls/expression/languages/CLEM-hint.js",
		"lib/properties/getPythonHints": "./src/common-properties/controls/expression/languages/python-hint.js",
		"lib/context-menu": "./src/context-menu/context-menu-wrapper.jsx",
		"lib/command-stack": "./src/command-stack/command-stack.js",
		"lib/tooltip": "./src/tooltip/tooltip.jsx",
		"lib/canvas": "./src/common-canvas/index.js",
		"lib/canvas-controller": "./src/common-canvas/canvas-controller.js",
		"common-canvas": "./src/index.js"
	},
	output: [
		{
			entryFileNames: "[name].js",
			dir: "./dist",
			format: "cjs",
			sourcemap: true,
			exports: "auto"
		},
		{
			entryFileNames: "[name].[format].js",
			dir: "./dist",
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [
		autoExternal(),
		json(),
		url(),
		scss({ output: false }),
		resolve(
			{
				extensions: [".js", ".jsx", ".json"]
			}
		),
		babel({
			babelHelpers: "runtime",
			exclude: "**/node_modules/**",
			presets: [
				"@babel/preset-react",
				["@babel/env", { modules: false }]
			],
			plugins: [
				"lodash",
				"@babel/plugin-proposal-class-properties",
				"@babel/plugin-transform-runtime",
				"@babel/plugin-proposal-export-default-from",
				["transform-react-remove-prop-types", { removeImport: true }]
			]
		}),
		terser(),
		commonjs(),
		visualizer({ open: bundleReport })
	]
};
