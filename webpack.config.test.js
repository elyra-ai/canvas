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

var scope = require("./scripts/build/css-scope");

/**
 * This webpack configuration file is used as configuration for the
 * `babel-plugin-webpack-loaders` plugin in order to leverage css modules in
 * the browser.
 */
module.exports = {
	output: {
		// The library target must be set as commonjs2
		libraryTarget: "commonjs2"
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loaders: [
					"style",
					"css?modules&importLoaders=1&localIdentName=" + scope.getCssScope(),
					"postcss"
				]
			}
		]
	},
	postcss: [
		require("autoprefixer")
	]
};
