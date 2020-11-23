/*
 * Copyright 2017-2020 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint global-require:0 */

const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const babelPlugins = ["lodash", "@babel/plugin-proposal-class-properties", "@babel/plugin-transform-runtime"];
if (process.env.COVERAGE) {
	babelPlugins.push("istanbul");
}

var plugins = [
	new webpack.optimize.AggressiveMergingPlugin(), // Merge chunk
	new webpack.NoEmitOnErrorsPlugin(),
	new MiniCssExtractPlugin({
		filename: "[name].min.css"
	}),
	new OptimizeCssAssetsPlugin({
		assetNameRegExp: /\styles.min.css$/g,
		cssProcessorOptions: { discardComments: { removeAll: true }, postcssZindex: { disable: true } }
	}),
	new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
];

if (process.env.BUNDLE_REPORT) {
	plugins.push(new BundleAnalyzerPlugin(
		{ openAnalyzer: true, generateStatsFile: true, analyzerPort: 9999, defaultSizes: "stat" }));
}

module.exports = {
	mode: "production",
	context: __dirname,
	devtool: "source-map",
	entry: {
		"lib/properties": "./src/common-properties/index.js",
		"lib/properties/field-picker": "./src/common-properties/components/field-picker/index.js",
		"lib/properties/flexible-table": "./src/common-properties/components/flexible-table/index.js",
		"lib/context-menu": "./src/context-menu/context-menu-wrapper.jsx",
		"lib/command-stack": "./src/command-stack/command-stack.js",
		"lib/canvas": "./src/common-canvas/index.js",
		"common-canvas": "./src/index.js",
		"styles/common-canvas": "./src/themes/light.scss"
	},
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "/dist"),
		library: "[name]",
		libraryTarget: "commonjs2"
	},
	module: {
		rules: [
			{
				test: /\.js(x?)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					babelrc: false,
					presets: ["@babel/preset-react", ["@babel/preset-env", { modules: false }]],
					plugins: babelPlugins
				}
			},
			{
				test: /\.s*css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{ loader: "css-loader", options: { url: false } },
					{ loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [require("autoprefixer")]
							}
						}
					},
					{ loader: "sass-loader",
						options: {
							sassOptions: {
								includePaths: [".", "node_modules"]
							}
						}
					}
				]
			},
			{
				test: /\.(woff|woff2|ttf|svg|png|eot)$/,
				loader: "url-loader"
			}
		]
	},
	resolve: {
		modules: ["node_modules"],
		extensions: [".js", ".jsx", ".json"]
	},
	plugins: plugins,
	performance: {
		hints: "error",
		maxAssetSize: 2000000,
		maxEntrypointSize: 2000000
	},
	externals: {
		"react-intl": "react-intl",
		"react": "react",
		"react-redux": "react-redux",
		"react-dom": "react-dom"
	}
};
