/*
 * Copyright 2017-2026 Elyra Authors
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

import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import scss from "rollup-plugin-scss";
import { terser } from "rollup-plugin-terser";
import url from "@rollup/plugin-url";
import { visualizer } from "rollup-plugin-visualizer";

const bundleReport = process.env.BUNDLE_REPORT;

// Packages listed in dependencies and peerDependencies that Rollup must treat as
// external so they are not bundled into the dist. This replicates what
// rollup-plugin-auto-external did via its array mode, but as a Set so we can combine
// it with the prefix-match for @babel/runtime subpaths below.
// Keep in sync with the dependencies/peerDependencies sections of package.json.
const externalPackages = new Set([
	"@babel/runtime",
	"@carbon/react",
	"@codemirror/autocomplete",
	"@codemirror/commands",
	"@codemirror/lang-javascript",
	"@codemirror/lang-json",
	"@codemirror/lang-python",
	"@codemirror/lang-sql",
	"@codemirror/language",
	"@codemirror/legacy-modes",
	"@codemirror/search",
	"@codemirror/state",
	"@codemirror/view",
	"@elyra/pipeline-schemas",
	"@ibm/telemetry-js",
	"@tanstack/react-table",
	"@tanstack/react-virtual",
	"d3",
	"dagre",
	"date-fns",
	"elkjs",
	"immutable",
	"jsonschema",
	"lodash",
	"markdown-it",
	"prop-types",
	"react",
	"react-dom",
	"react-draggable",
	"react-inlinesvg",
	"react-intl",
	"react-portal",
	"react-redux",
	"react-virtualized",
	"redux",
	"seedrandom",
	"uuid"
]);

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
	external: (id) => id.startsWith("@babel/runtime/") ||
		id === "react/jsx-runtime" ||
		id === "react/jsx-dev-runtime" ||
		id === "react-dom/client" ||
		externalPackages.has(id),
	onwarn(warning, warn) {
		// @babel/plugin-transform-runtime injects `import _readOnlyError from
		// "@babel/runtime/helpers/readOnlyError"` into some files as a precaution even
		// when the helper is never called. Rollup correctly reports it as unused; we
		// suppress it here to keep build output clean.
		if (warning.code === "UNUSED_EXTERNAL_IMPORT" &&
			warning.source === "@babel/runtime/helpers/readOnlyError") {
			return;
		}
		warn(warning);
	},
	output: [
		{
			entryFileNames: "[name].cjs",
			dir: "./dist",
			format: "cjs",
			sourcemap: true,
			exports: "auto"
		},
		{
			entryFileNames: "[name].js",
			dir: "./dist",
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [
		json(),
		url(),
		scss({ output: false }),
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
		resolve({
			extensions: [".js", ".jsx", ".json"]
		}),
		commonjs(),
		terser(),
		visualizer({ open: bundleReport })
	]
};
