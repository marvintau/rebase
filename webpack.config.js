const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const serverConfigure = {
	resolve: {
		extensions: ['.js', '.json'],
	},

	entry: {
		filename: "./server-src/main.js"
	},
	output: {
		path: path.resolve(__dirname),
		filename: 'server.js'
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: [path.resolve(__dirname, 'node_modules')],
				options: {
					plugins: ['syntax-dynamic-import'],
					presets: ['@babel/preset-env']
				}
				
			},
		]
	},
	mode: "development",
	target: 'node',
	context: path.resolve(__dirname),
	node : {
		__dirname : true,
		__filename : true
	},
	externals: nodeExternals()
}

const clientConfigure = {

	resolve: {
		extensions: ['.js', '.json'],
		// alias: {
		//   "styled-components": path.resolve(__dirname, "node_modules", "formwell", "node_modules", "styled-components"),
		// }
	},

	entry: {
		filename: "./client-src/main.js"
	},
	output: {
		path: path.resolve(__dirname),
		filename: 'public/dist.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				// include: [path.resolve(__dirname, 'node_modules')],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ["css-loader", "style-loader"]
			},
	　　　　{
	　　　　　　test: /\.(png|jpg)$/,
	　　　　　　loader: 'url-loader?limit=8192'
	　　　　}						
		]
	},

	mode: 'development',

	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
				ecma: undefined,
				warnings: false,
				parse: {},
				compress: {},
				mangle: true,
				module: false,
				output: null,
				toplevel: false,
				nameCache: null,
				ie8: false,
				keep_classnames: undefined,
				keep_fnames: true, // change to true here
				safari10: false,
				},
			}),
		],
	},
};

module.exports = [clientConfigure, serverConfigure];
