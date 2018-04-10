/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint global-require:0 */

// Modules

const path = require("path");
const webpack = require("webpack");
const babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
const constants = require("./lib/constants");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SassLintPlugin = require("sasslint-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

// Globals

// Entry & Output files ------------------------------------------------------------>

const entry = [
	"webpack-hot-middleware/client",
	"babel-polyfill",
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

const rules = [
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
		use: [
			{ loader: "style-loader", options: { sourceMap: true } },
			{ loader: "css-loader", options: { sourceMap: true } },
			{ loader: "postcss-loader", options: { ident: "postcss", sourceMap: true, plugins: [require("autoprefixer")] } },
			{ loader: "sass-loader", options: { sourceMap: true } }
		]
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
		loader: "file-loader?name=graphics/[hash].[ext]"
	}
];

if (!isDev) {
	rules.push({
		test: /common-canvas*\.js$/,
		loader: "source-map-loader",
		enforce: "pre"
	});
}
// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

var plugins = [
	new SassLintPlugin({
		configFile: ".sass-lint.yml",
		context: "./src",
		glob: "**/*.scss",
		quiet: false,
		failOnWarning: true,
		failOnError: true
	}),
	new webpack.optimize.OccurrenceOrderPlugin(),
	new webpack.NoEmitOnErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "index.html"
	}),
	new webpack.HotModuleReplacementPlugin()
];

// Exports ------------------------------------------------------------>
let commonCanvas = "src/common-canvas.js";
let commonCanvasStyles = "src/common-canvas-styles.js";
if (isDev) {
	commonCanvas = "src/common-canvas-dev.js";
	commonCanvasStyles = "src/common-canvas-styles-dev.js";
}

module.exports = {
	entry: entry,
	resolve: {
		modules: [
			__dirname,
			"node_modules",
			"web_modules"
		],
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/react-dom",
			"common-canvas": commonCanvas,
			"common-canvas-styles": commonCanvasStyles
		},
		extensions: [".js", ".jsx", ".json"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins,
	devtool: "eval-source-map"
};

// devtool: "inline-source-map"
