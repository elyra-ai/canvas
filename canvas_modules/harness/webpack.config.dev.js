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
var I18NPlugin = require("@dap/portal-common-i18n").I18nPlugin;
var babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
var constants = require("./lib/constants");

// possibly not needed after removing html
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
		test: /\.css$/,
		loaders: [
			"style-loader",
			"css-loader",
			"postcss-loader"
		]
	},
	{
		test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
		loaders: [
			"file-loader?name=graphics/[hash].[ext]"
		]
	}
];

if (!isDev) {
	loaders.push({
		test: /common-canvas*\.js$/,
		loader: "source-map-loader",
		enforce: "pre"
	});
}
// Custom functions (for plugins) ------------------------------------->


// Plugins ------------------------------------------------------------>

var plugins = [
	new webpack.optimize.OccurrenceOrderPlugin(),
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
//	require("stylelint"),
	require("autoprefixer")
];

// Exports ------------------------------------------------------------>
var commonCanvas = "src/common-canvas.js";
if (isDev) {
	commonCanvas = "src/common-canvas-dev.js";
}

module.exports = {
	entry: entry,
	resolve: {
		modulesDirectories: ["web_modules", "node_modules"],
		root: path.resolve(__dirname),
		alias: {
			"react": "node_modules/react",
			"react-dom": "node_modules/react-dom",
			"common-canvas": commonCanvas
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
