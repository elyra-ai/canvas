/*
 * Copyright 2017-2020 IBM Corporation
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
	"webpack-hot-middleware/client",
	"@babel/polyfill",
	"./src/client/index.js"
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
		query: babelOptions
	},
	{
		test: /\.s*css$/,
		use: [
			{ loader: "style-loader" },
			{ loader: "css-loader", options: { sourceMap: true } },
			{ loader: "postcss-loader", options: { ident: "postcss", sourceMap: true, plugins: [require("autoprefixer")] } },
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
		loader: "file-loader?name=graphics/[hash].[ext]"
	}
];

// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

var plugins = [
	new webpack.optimize.OccurrenceOrderPlugin(),
	new webpack.NoEmitOnErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "./index-dev.html"
	}),
	new webpack.HotModuleReplacementPlugin()
];

// Exports ------------------------------------------------------------>

module.exports = {
	mode: "development",
	entry: entry,
	resolve: {
		modules: [
			__dirname,
			"node_modules"
		],
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/@hot-loader/react-dom",
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
	plugins: plugins,
	devtool: "source-map"
};
