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

module.exports = {
	context: path.join(__dirname, "/src/"),
	devtool: "source-map",
	entry: {
		lib: "./index.js"
	},
	output: {
		library: "Common-Properties",
		libraryTarget: "commonjs2",
		filename: "common-properties.js",
		path: path.join(__dirname, "/dist"),
		sourceMapFilename: "[file].map",
	},
	module: {
		loaders: [
			{
				test: /\.js(x?)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ["react", "es2015","stage-1"]
				}
			},
			{
				test: /\.(woff|svg|png)$/,
				loader: "url-loader"
			},
			{
        test: /\.css$/,
        loaders: [
					"style-loader",
					"css-loader"
				]
      },
			{
				test: /\.(?:png|jpg|svg|woff|ttf|woff2|eot)$/,
				loaders: [
					"file-loader?name=graphics/[hash].[ext]"
				]
			}
		]
	},
	resolve: {
		extensions: [".js", ".jsx"]
	},
	externals: {
		"react": "react",
		"react-dom": "react-dom"
	}
};
