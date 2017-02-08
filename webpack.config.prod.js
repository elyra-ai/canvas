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
"use strict";

// Modules

var path = require("path");
var webpack = require("webpack");
var ManifestRevisionPlugin = require("manifest-revision-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var I18NPlugin = require("@dap/portal-common-i18n").I18nPlugin;
var babelOptions = require("./scripts/babel/babelOptions").babelClientOptions;
var SassLintPlugin = require("sasslint-webpack-plugin");
var locales = require("./config/nls");
var constants = require("./lib/constants");
var scope = require("./scripts/build/css-scope");

// Entry & Output files ------------------------------------------------------------>

var entry = {
};

function _getOutputs(locale) {
	return {
		path: path.join(__dirname, ".build"),
		publicPath: constants.APP_PATH,
		filename: "js/[name]." + locale + ".[hash].js",
		chunkFilename: "js/chunk.[name].[id]." + locale + ".[chunkhash].js"
	};
}

// Loaders ------------------------------------------------------------>

function _getLoaders(locale) {
	var loaders = [
		{
			test: /\.json$/,
			loader: "json-loader"
		},
		{
			test: /\.js(x?)$/,
			loader: "babel",
			exclude: /node_modules/,
			query: babelOptions
		},
		{
			test: /\.png$/,
			loaders: [
				"file?name=graphics/[hash].[ext]"
			]
		},
		{
			test: /\.svg$/,
			loaders: [
				"file?name=graphics/[hash].[ext]"
			]
		},
		{
			test: /\.gif$/,
			loaders: [
				"file?name=graphics/[hash].[ext]"
			]
		},
		{
			test: /\.jpg$/,
			loaders: [
				"file?name=graphics/[hash].[ext]"
			]
		},
		{
			test: /\.pdf$/,
			loaders: [
				"file?name=graphics/[hash].[ext]"
			]
		}
	];

	if (locale === "en") {
		loaders.push({
			test: /\.s*css$/,
			loader: ExtractTextPlugin.extract("style-loader",
				"css-loader?modules&localIdentName=" + scope.getCssScope() + "!sass-loader!postcss")
		});
	} else {
		loaders.push({
			test: /\.s*css$/,
			loaders: [
				"style",
				"css?modules&localIdentName=" + scope.getCssScope(),
				"sass",
				"postcss"
			]
		});
	}

	return loaders;
}

// Custom Plugins/functions  ------------------------------------->

function _parseFilename(filename) {
	var fileExt = filename.split(".").slice(-1)[0];
	var filePath = filename.split("/");
	filePath = filePath.splice(0, filePath.length - 1).join("/");
	return {
		path: filePath,
		ext: fileExt
	};
}

function _addFileResult(results, data, chunk, filename) {
	var file = _parseFilename(filename);
	var originalFileName = "/" + file.path + "/" + chunk + "." + file.ext;
	results[originalFileName] = "/" + filename;
}

function _manifestFileFormatter(locale, data) {
	var result = {};
	for (var chunk in data.assetsByChunkName) {
		if (data.assetsByChunkName.hasOwnProperty(chunk)) {
			var filename = data.assetsByChunkName[chunk];

			if (Array.isArray(filename)) {
				for (var idx = 0; idx < filename.length; idx++) {
					_addFileResult(result, data, chunk, filename[idx]);
				}
			} else {
				_addFileResult(result, data, chunk, filename);
			}
		}
	}

	/* English should be the default, fallback locale in the final manifest
	 * If not english, wrap results in locale-specific block
	 **/
	if (locale !== "en") {
		var childResult = {};
		childResult[locale] = result;
		result = childResult;
	}
	return result;
}

// Plugins ------------------------------------------------------------>

function _getPlugins(locale) {
	var plugins = [
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": "'production'"
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new I18NPlugin(locale),
		new SassLintPlugin({
			configFile: ".sass-lint.yml",
			context: "./src/components",
			glob: "**/*.scss",
			quiet: false,
			failOnWarning: true,
			failOnError: true
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor"
		}),
		new webpack.NoErrorsPlugin(),
		new ManifestRevisionPlugin("fingerprints-" + locale + "-webpack.json", {
			rootAssetPath: ".build",
			format: _manifestFileFormatter.bind(this, locale)
		})
	];

	if (locale === "en") {
		// We only want to run the ExtractTextPlugin and
		// CopyWebpackPlugin plugins once. Just do it while
		// we are processing the "en" locale
		var morePlugins = [
			new ExtractTextPlugin("css/[name].[hash].css", {
				allChunks: true
			})
		];
		return plugins.concat(morePlugins);
	}

	return plugins;
}

// Postcss ------------------------------------------------------------>

var postcss = [
	require("stylelint"),
	require("autoprefixer")
];

// Exports ------------------------------------------------------------>


module.exports = locales.map(function(locale) {
	return {
		entry: entry,
		// Uncomment this to see details of Webpack build failures
		// stats: {
		// 	errorDetails: true
		// },
		// Uncomment below to help debug a production build
		// debug: true,
		// devtool: "source-map",
		// devtoolModuleFilenameTemplate: "[resource]",
		resolve: {
			modulesDirectories: ["web_modules", "node_modules"]
		},
		output: _getOutputs(locale),
		module: {
			loaders: _getLoaders(locale)
		},
		plugins: _getPlugins(locale),
		postcss: postcss
	};
});
