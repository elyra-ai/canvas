/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint global-require:0 */

// Modules

var path = require("path");
var webpack = require("webpack");
var babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
var constants = require("./lib/constants");
var HtmlWebpackPlugin = require("html-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

// Globals

// Entry & Output files ------------------------------------------------------------>

var entry = [
	"webpack-hot-middleware/client",
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

var rules = [
	{
		test: /\.js(x?)$/,
		loader: "babel-loader",
		exclude: /node_modules/,
		query: babelOptions
	},
	{
		test: /\.css$/,
		use: [
			{ loader: "style-loader" },
			{ loader: "css-loader" },
			{ loader: "postcss-loader", options: { plugins: [require("autoprefixer")] } }
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
var commonCanvas = "src/common-canvas.js";
var commonCanvasStyles = "src/common-canvas-styles.js";
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
