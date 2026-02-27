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
/* eslint global-require:0 */
"use strict";

// Modules

const path = require("path");
const webpack = require("webpack");
const babelOptions = require("./scripts/babel/babelOptions.cjs");
const constants = import("./lib/constants.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

// Globals

// Entry & Output files ------------------------------------------------------------>

const entry = [
	"webpack-hot-middleware/client",
	"@babel/polyfill",
	"./src/client/index.js",
	"../common-canvas/src/index.scss",
	"./assets/styles/harness.scss"
];


const output = {
	path: path.join(__dirname, ".build"),
	publicPath: constants.APP_PATH,
	filename: "js/canvasharness.js",
	chunkFilename: "js/canvasharness.chunk.[id].js",
	sourceMapFilename: "[file].map",
	devtoolModuleFilenameTemplate: "[resource]",
	pathinfo: true
};


const rules = [
	{
		test: /\.js(x?)$/u,
		loader: "babel-loader",
		exclude: /node_modules/u,
		options: babelOptions
	},
	{
		test: /\.tsx?$/, // Matches .ts and .tsx files
		use: "ts-loader",
		exclude: /node_modules/,
	},
	{
		test: /\.m?js$/u, // Apply to .js and .mjs files
		resolve: {
			fullySpecified: false // Allows omitting extensions for these files
		}
	},
	{
		test: /\.s*css$/u,
		use: [
			{
				loader: "style-loader",
				options: {
					esModule: false
				}
			},
			{
				loader: "css-loader",
				options: {
					sourceMap: true,
					url: false
				}
			},
			{
				loader: "postcss-loader",
				options: {
					sourceMap: true,
					postcssOptions: {
						plugins: [
							require("autoprefixer")
						]
					}
				}
			},
			{
				loader: "sass-loader",
				options: {
					sassOptions: {
						includePaths: [".", "node_modules"]
					}
				}
			}
		]
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/u,
		use: [
			"file-loader?name=graphics/[contenthash].[ext]",
		],
	}
];

// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

const plugins = [
	new webpack.NoEmitOnErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "./index-dev.html"
	}),
	new webpack.HotModuleReplacementPlugin(),
	// generates the source maps used for debugging.  Used instead of `devtool` option
	new webpack.SourceMapDevToolPlugin({
		module: true,
		columns: false
	}),
	new ReactRefreshWebpackPlugin(),
];

// Exports ------------------------------------------------------------>

module.exports = {
	mode: "development",
	devtool: false,
	entry: entry,
	resolve: {
		modules: [
			__dirname,
			"node_modules"
		],
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/react-dom",
			"react-redux": "node_modules/react-redux",
			"react-intl": "node_modules/react-intl",
			"common-canvas": "src/common-canvas-dev.js"
		},
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins
};
