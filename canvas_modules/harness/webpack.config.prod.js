/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-len: 0*/
/* eslint global-require:0 */

// Modules

var path = require("path");
var webpack = require("webpack");
var babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
var constants = require("./lib/constants");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CompressionPlugin = require("compression-webpack-plugin");

// Entry & Output files ------------------------------------------------------------>

var entry = {
	canvas: "./src/client/index.js",
	vendor: ["babel-polyfill", "react", "react-dom"]
};

var output = {
	path: path.join(__dirname, ".build"),
	publicPath: constants.APP_PATH,
	filename: "js/[name].[hash].js",
	chunkFilename: "js/chunk.[name].[id].[chunkhash].js"
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
		test: /\.s*css$/,
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


// Plugins ------------------------------------------------------------>
var plugins = [
	new webpack.DefinePlugin({
		"process.env.NODE_ENV": "'production'"
	}),
	new webpack.optimize.OccurrenceOrderPlugin(),
	new webpack.optimize.UglifyJsPlugin(), // minify everything
	new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
	new webpack.optimize.CommonsChunkPlugin({
		name: "vendor"
	}),
	new webpack.NoEmitOnErrorsPlugin(),
	// Generates an `index.html` file with the <script> injected.
	new HtmlWebpackPlugin({
		inject: true,
		template: "index.html"
	}),
	new CompressionPlugin({
		asset: "[path].gz[query]",
		algorithm: "gzip",
		test: /\.js$|\.css$|\.html$/,
		threshold: 10240,
		minRatio: 0.8
	})
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
			"common-canvas": "src/common-canvas.js",
			"common-canvas-styles": "src/common-canvas-styles.js"
		},
		extensions: [".js", ".jsx"]
	},
	output: output,
	module: {
		rules: rules
	},
	plugins: plugins
};
