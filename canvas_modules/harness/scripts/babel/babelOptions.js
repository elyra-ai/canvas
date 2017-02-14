/**
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
"use strict";

var HMR_ENABLED = process.env.DAP_HMR === "true";

var assign = require("object-assign");

var babelBaseOptions = {
	presets: ["react", "es2015"]
};

var babelClientOptions = assign({}, babelBaseOptions, {
	cacheDirectory: true,
	env: {
		development: {
			presets: HMR_ENABLED ? ["react-hmre"] : []
		}
	}
});

var babelTestOptions = assign({}, babelBaseOptions, {
	env: {
		test: {
			plugins: [
				[
					"babel-plugin-webpack-loaders",
					{
						// The config path is relative to the root of the project
						config: "./webpack.config.test.js",
						verbose: false
					}
				]
			]
		}
	}
});

exports.babelBaseOptions = babelBaseOptions;
exports.babelTestOptions = babelTestOptions;
exports.babelClientOptions = babelClientOptions;
