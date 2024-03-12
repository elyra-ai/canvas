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
/* eslint global-require:0 */
"use strict";

// Modules

const path = require("path");
const webpack = require("webpack");
const babelOptions = require("./scripts/babel/babelOptions").babelOptions;
const constants = require("./lib/constants");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Globals

// Entry & Output files ------------------------------------------------------------>

const entry = [
	"react-hot-loader/patch",
	"webpack-hot-middleware/client",
	"@babel/polyfill",
	"./src/client/index.js",
	"../common-canvas/src/themes/light.scss",
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


// Loaders ------------------------------------------------------------>
babelOptions.plugins.push("react-hot-loader/babel"); // needed for HMR support

const rules = [
	{
		test: /\.js(x?)$/,
		loader: "babel-loader",
		exclude: /node_modules/,
		options: babelOptions
	},
	{
		test: /\.s*css$/,
		use: [
			{ loader: "style-loader" },
			{ loader: "css-loader", options: { sourceMap: true, url: false } },
			{ loader: "postcss-loader",
				options: {
					postcssOptions: {
						sourceMap: true,
						plugins: [require("autoprefixer")]
					}
				}
			},
			{ loader: "sass-loader",
				options: {
					sassOptions: {
						includePaths: [".", "node_modules"]
					}
				}
			}
		]
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
		use: [
			"file-loader?name=graphics/[contenthash].[ext]",
		],
	}
];

// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

const plugins = [
	new webpack.NoEmitOnErrorsPlugin(),
	new webpack.HotModuleReplacementPlugin(),
	// generates the source maps used for debugging.  Used instead of `devtool` option
	new webpack.SourceMapDevToolPlugin({
		module: true,
		columns: false
	}),
	// Work around for Buffer is undefined:
	// https://github.com/webpack/changelog-v5/issues/10
	new webpack.ProvidePlugin({
		Buffer: ["buffer", "Buffer"],
	}),
	new webpack.ProvidePlugin({
		process: "process"
	}),
	new HtmlWebpackPlugin({
		inject: true,
		template: "./index-dev.html"
	})
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
		fallback: {
			path: require.resolve("path-browserify"),
			stream: require.resolve("stream-browserify"),
			util: require.resolve("util"),
			buffer: require.resolve("buffer"),
			url: false,
			process: false
		},
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/react-dom",
			"react-redux": "node_modules/react-redux",
			"react-intl": "node_modules/react-intl",
			"common-canvas": "src/common-canvas-dev.js"
		},
		extensions: [".js", ".jsx", ".json"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins
};
