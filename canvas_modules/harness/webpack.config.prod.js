/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-len: 0*/
/* eslint global-require:0 */

// Modules

const path = require("path");
const webpack = require("webpack");
const babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
const SassLintPlugin = require("sasslint-webpack-plugin");
const constants = require("./lib/constants");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// Entry & Output files ------------------------------------------------------------>

const entry = {
	canvas: "./src/client/index.js",
	vendor: ["babel-polyfill", "react", "react-dom"]
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
		exclude: /node_modules/,
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
					{ loader: "sass-loader" }
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
	new webpack.optimize.UglifyJsPlugin(), // minify everything
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
	new CompressionPlugin({
		asset: "[path].gz[query]",
		algorithm: "gzip",
		test: /\.js$|\.css$|\.html$/,
		threshold: 10240,
		minRatio: 0.8
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
