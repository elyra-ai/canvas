/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint global-require:0 */

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SassLintPlugin = require("sasslint-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const nodeExternals = require("webpack-node-externals");

module.exports = {
	context: __dirname,
	devtool: "source-map",
	entry: {
		"lib/properties": "./src/common-properties/common-properties.jsx",
		"lib/canvas": "./src/common-canvas/index.js",
		"common-canvas": "./src/index.js" // needs to be last to create correct combined css output
	},
	output: {
		libraryTarget: "commonjs2",
		filename: "[name].js",
		path: path.join(__dirname, "/dist")
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
						fallback: "style-loader",
						use: [
							{ loader: "css-loader" },
							{ loader: "postcss-loader", options: { ident: "postcss", plugins: [require("autoprefixer")] } },
							{ loader: "sass-loader", options: { includePaths: ["node_modules"] } }
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
		new SassLintPlugin({
			configFile: ".sass-lint.yml",
			context: "./src",
			glob: "**/*.scss",
			quiet: false,
			failOnWarning: true,
			failOnError: true
		}),
		new webpack.optimize.UglifyJsPlugin({ sourceMap: true }), // minify everything
		new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
		new ExtractTextPlugin("common-canvas.css"),
		new ExtractTextPlugin("common-canvas.min.css"),
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.min.css$/g,
			cssProcessorOptions: { discardComments: { removeAll: true }, postcssZindex: { disable: true } }
		}),
		new BundleAnalyzerPlugin(
			{ generateStatsFile: true, openAnalyzer: false }),
		new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
	],
	resolve: {
		modules: ["node_modules"],
		extensions: [".js", ".jsx", ".json"]
	},
	externals: [nodeExternals(
		{
			whitelist: [/^d3.*$/]
		})]
};
