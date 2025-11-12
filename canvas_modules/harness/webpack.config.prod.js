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
/* eslint max-len: 0*/
/* eslint global-require:0 */
"use strict";

// Modules

import path from "path";
import webpack from "webpack";
import { babelOptions } from "./scripts/babel/babelOptions";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { APP_PATH } from "./lib/constants";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import autoprefixer from "autoprefixer";
// Entry & Output files ------------------------------------------------------------>

const entry = {
	harness: ["@babel/polyfill", "./src/client/index.js"],
	vendor: ["react", "react-dom", "react-intl", "intl-messageformat"]
};

const output = {
	path: path.join(__dirname, ".build"),
	publicPath: APP_PATH,
	filename: "js/[name].[contenthash].js",
	chunkFilename: "js/chunk.[name].[id].[contenthash].js"
};


// Loaders ------------------------------------------------------------>

const rules = [
	{
		test: /\.js(x?)$/,
		loader: "babel-loader",
		exclude: (/node_modules|common-canvas/),
		options: babelOptions
	},
	{
		test: /\.tsx?$/, // Matches .ts and .tsx files
		use: "ts-loader",
		exclude: /node_modules/,
	},
	{
		test: /\.s*css$/,
		use: [
			{
				loader: MiniCssExtractPlugin.loader,
			},
			{ loader: "css-loader",
				options: {
					url: false
				}
			},
			{ loader: "postcss-loader",
				options: {
					postcssOptions: {
						plugins: [autoprefixer]
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
			"file-loader?name=graphics/[contenthash].[ext]"
		]
	}
];


// Plugins ------------------------------------------------------------>
const plugins = [
	new webpack.NoEmitOnErrorsPlugin(),
	new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
	new MiniCssExtractPlugin({
		filename: "harness.min.css"
	}),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "./index.html"
	})
];

if (process.env.BUNDLE_REPORT) {
	plugins.push(new BundleAnalyzerPlugin(
		{ openAnalyzer: true, generateStatsFile: true, analyzerPort: 9999, defaultSizes: "stat" }));
}

// Exports ------------------------------------------------------------>


export default {
	mode: "production",
	context: __dirname,
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
			"common-canvas": "src/common-canvas.js",
		},
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins
};
