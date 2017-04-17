/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	context: path.join(__dirname, "/src/"),
	devtool: "source-map",
	entry: {
		lib: "./index.js"
	},
	output: {
		library: "Common-Canvas",
		libraryTarget: "commonjs2",
		filename: "common-canvas.js",
		path: path.join(__dirname, "/dist"),
		sourceMapFilename: "[file].map",
	},
	module: {
		rules: [
			{
				test: /\.js(x?)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ["react", "es2015","stage-1"]
				}
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract(
					{
						use: [
							"css-loader",
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
    new ExtractTextPlugin('common-canvas.css')
  ],
	resolve: {
		extensions: [".js", ".jsx"]
	},
	externals: {
		"react": "react",
		"react-dom": "react-dom"
	}
};
