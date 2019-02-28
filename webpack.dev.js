const webpack = require('webpack');
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
				
			}
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
	},

	entry: {
		filename: "./client-src/main.js"
	},
	output: {
		path: path.resolve(__dirname),
		filename: '[name]/dist.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, 'node_modules')],
				loader: 'babel-loader',

				options: {
					plugins: ['syntax-dynamic-import'],
					presets: ['@babel/preset-env']
				}
				
			},
			{
				test: /\.css$/,

				use: ["css-loader", "style-loader"]
			}
		]
	},

	mode: 'development',

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	}
};

module.exports = [clientConfigure, serverConfigure];
