/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
		rules: [
			{
				test: /\.s*css$/,
				use: [
					"style",
					"css",
					"scss",
					"postcss"
				]
			}
		]
	},
};
