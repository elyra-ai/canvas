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
/* eslint max-len: 0*/
/* eslint global-require:0 */

// Modules

const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin-legacy");
const babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
const SassLintPlugin = require("sasslint-webpack-plugin");
const constants = require("./lib/constants");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// Entry & Output files ------------------------------------------------------------>

const entry = {
	canvas: "./src/client/index.js",
	vendor: ["babel-polyfill", "react", "react-dom", "react-intl", "intl-messageformat", "intl-messageformat-parser"]
};

const output = {
	path: path.join(__dirname, ".build"),
	publicPath: constants.APP_PATH,
	filename: "js/[name].[hash].js",
	chunkFilename: "js/chunk.[name].[id].[chunkhash].js"
};


// Loaders ------------------------------------------------------------>

const rules = [
	{
		test: /\.js(x?)$/,
		loader: "babel-loader",
		exclude: (/node_modules|common-canvas/),
		query: babelOptions
	},
	{
		test: /\.s*css$/,
		use: ExtractTextPlugin.extract(
			{
				fallback: "style-loader",
				use: [
					{ loader: "css-loader" },
					{ loader: "postcss-loader", options: { plugins: [require("autoprefixer")] } },
					{ loader: "sass-loader", options: { includePaths: ["node_modules"] } }
				]
			}
		)
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
		loader: "file-loader?name=graphics/[hash].[ext]"
	}
];


// Plugins ------------------------------------------------------------>
const plugins = [
	new webpack.DefinePlugin({
		"process.env.NODE_ENV": "'production'"
	}),
	new SassLintPlugin({
		configFile: ".sass-lint.yml",
		context: "./src",
		glob: "**/*.scss",
		quiet: false,
		failOnWarning: true,
		failOnError: true
	}),
	new webpack.optimize.OccurrenceOrderPlugin(),
	new TerserPlugin(),
	new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
	new ExtractTextPlugin("styles/harness.css"),
	new webpack.optimize.CommonsChunkPlugin({
		name: "vendor"
	}),
	new webpack.NoEmitOnErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "index.html"
	}),
	new BundleAnalyzerPlugin(
		{ generateStatsFile: true, openAnalyzer: false })
];


// Exports ------------------------------------------------------------>


module.exports = {
	entry: entry,
	resolve: {
		modules: [
			__dirname,
			"web_modules",
			"node_modules"],
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/react-dom",
			"react-redux": "node_modules/react-redux",
			"react-intl": "node_modules/react-intl",
			"common-canvas": "src/common-canvas.js",
		},
		extensions: [".js", ".jsx", ".json"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins
};
