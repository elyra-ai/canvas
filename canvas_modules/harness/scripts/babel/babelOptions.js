/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const assign = require("object-assign");

const babelBaseOptions = {
	babelrc: false, // required so webpack ignores the .babelrc file used for testing in root of project
	presets: ["react", "env"]
};

const babelClientOptions = assign({}, babelBaseOptions, {
	cacheDirectory: true,
	env: {
		development: {
			presets: ["react-hmre"]
		}
	}
});

const babelTestOptions = assign({}, babelBaseOptions, {
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
