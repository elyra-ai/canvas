/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const SassLintPlugin = require("sasslint-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;


module.exports = {
	context: __dirname,
	devtool: "source-map",
	entry: {
		"common-canvas": "./src/index.js",
		"common-canvas.css": "./assets/index.scss"
	},
	output: {
		library: "Common-Canvas",
		libraryTarget: "commonjs2",
		filename: "[name].js",
		path: path.join(__dirname, "/dist"),
		sourceMapFilename: "[file].map"
	},
	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				exclude: /node_modules\/intl-/,
				loader: "source-map-loader"
			},
			{
				test: /\.js(x?)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ["react", "es2015", "stage-1"]
				}
			},
			{
				test: /\.s*css$/,
				use: ExtractTextPlugin.extract(
					{
						use: [
							"css-loader",
							"sass-loader",
							"postcss-loader"
						]
					}
				)
			},
			{
				test: /\.(woff|woff2|ttf|svg|png|eot)$/,
				loader: "url-loader"
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": "'production'"
		}),
		// new SassLintPlugin({
		//	configFile: ".sass-lint.yml",
		//	context: "./assets",
		//	glob: "**/*.scss",
		//	quiet: false,
		//	failOnWarning: true,
		//	failOnError: true
		// }),
		new webpack.optimize.UglifyJsPlugin(), // minify everything
		new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
		new ExtractTextPlugin("common-canvas.css"),
		new ExtractTextPlugin("common-canvas.min.css"),
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.min.css$/g,
			cssProcessorOptions: { discardComments: { removeAll: true } }
		}),
		new BundleAnalyzerPlugin(
			{ generateStatsFile: true, openAnalyzer: false }),
		new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
	],
	resolve: {
		modules: ["node_modules"],
		extensions: [".js", ".jsx", ".json"]
	},
	externals: {
		"react": "react",
		"react-dom": "react-dom"
	}
};
