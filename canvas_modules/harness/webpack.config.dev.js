/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint global-require:0 */
"use strict";

// Modules

var path = require("path");
var webpack = require("webpack");
var I18NPlugin = require("@dap/portal-common-i18n").I18nPlugin;
var babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
var SassLintPlugin = require("sasslint-webpack-plugin");
var constants = require("./lib/constants");

// possibly not needed after removing html
var HtmlWebpackPlugin = require("html-webpack-plugin");

// Globals

// Entry & Output files ------------------------------------------------------------>

var entry = [
	"babel-polyfill",
	"./src/client/index.js"
];

var output = {
	path: path.join(__dirname, ".build"),
	publicPath: constants.APP_PATH,
	filename: "js/canvasharness.js",
	chunkFilename: "js/canvasharness.chunk.[id].js",
	sourceMapFilename: "[file].map",
	devtoolModuleFilenameTemplate: "[resource]",
	pathinfo: true
};


// Loaders ------------------------------------------------------------>

var loaders = [
	{
		test: /\.json$/,
		loader: "json-loader"
	},
	{
		test: /\.js(x?)$/,
		loader: "babel-loader",
		exclude: /node_modules/,
		query: babelOptions
	},
	{
		test: /\.s*css$/,
		loaders: [
			"style-loader",
			"css-loader",
			"sass-loader",
			"postcss-loader"
		]
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
		loaders: [
			"file-loader?name=graphics/[hash].[ext]"
		]
	},
	{
		test: /common-canvas*\.js$/,
		loader: "source-map-loader",
		enforce: "pre"
	}
];

// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

var plugins = [
	new webpack.optimize.OccurrenceOrderPlugin(),
	new SassLintPlugin({
		configFile: ".sass-lint.yml",
		context: "./src/components",
		glob: "**/*.scss",
		quiet: false,
		failOnWarning: true,
		failOnError: true
	}),
	new I18NPlugin("en"),
	new webpack.NoErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "index.html"
	}),
	new webpack.HotModuleReplacementPlugin()
];

// Postcss ------------------------------------------------------------>

var postcss = [
	require("stylelint"),
	require("autoprefixer")
];

// Exports ------------------------------------------------------------>

module.exports = {
	entry: entry,
	resolve: {
		modulesDirectories: ["web_modules", "node_modules"],
		alias: {
			"react": path.join(__dirname, "node_modules", "react"),
			"react-dom": path.join(__dirname, "node_modules", "react-dom")
		},
		extensions: ["", ".js", ".jsx"]
	},
	output: output,
	module: {
		loaders: loaders
	},
	plugins: plugins,
	postcss: postcss,
	debug: true,
	devtool: "inline-source-map"
};
