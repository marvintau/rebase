const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let serverConfigure = {
	resolve: {
		extensions: ['.js', '.json'],
	},

	entry: {},

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

let clientConfigure = {

	resolve: {
		extensions: ['.js', '.json'],
	},

	entry: {},

	output: {
		path: path.resolve(__dirname),
		filename: 'public/dist.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ["css-loader", "style-loader"]
			},
	　　　　{
	　　　　　　test: /\.(png|jpg)$/,
	　　　　　　loader: 'url-loader?limit=8192'
	　　　　},
			{
				test: /\.txt$/i,
				use: 'raw-loader',
			},				
		]
	},

	mode: 'production',

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

module.exports = (env, argv) => {
	if (argv.deploy === 'remote') {
		serverConfigure.entry.filename = './server-src/main-remote.js';
		clientConfigure.entry.filename = './client-src/main-remote.js';
		return [serverConfigure, clientConfigure];
	} else if (argv.deploy === 'local'){
		serverConfigure.entry.filename = './server-src/main-local.js';
		clientConfigure.entry.filename = './client-src/main-local.js';
		return [serverConfigure, clientConfigure];
	} else {
		console.log('<b>您必须得指明部署的位置，即在使用webpack时添加 "--deploy=<site>"，其中site可以是"local"或"remote"');
		return []
	}
}
