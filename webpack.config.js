const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const HtmlWebpackPlugin = require('html-webpack-plugin');

let serverConfigure = {
	resolve: {
		extensions: ['.js', '.json'],
	},

	entry: {
		filename: './server-src/main.js'
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

let clientConfigure = {

	resolve: {
		extensions: ['.js', '.json'],
	},

	entry: {
		filename: './client-src/main.js'
	},

	output: {
		publicPath: './',
		path: path.resolve(__dirname, 'public'),
		filename: 'dist.js'
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
				use: ["style-loader", "css-loader"]
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

	plugins: [
		new BundleAnalyzerPlugin(),
		new HtmlWebpackPlugin({
			template: './client-src/page/index.html',
			filename: 'index.html'
		})
	],

	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'reactstrap': 'Reactstrap',
	},

	mode: 'development',

	optimization: {
		// splitChunks: {
		// 	chunks: "all",
		// 	maxInitialRequests: Infinity,

		// 	cacheGroups: {
		// 	  vendor: {
		// 		test: /[\\/]node_modules[\\/]/,
		// 		name(module) {
		// 		  // get the name. E.g. node_modules/packageName/not/this/part.js
		// 		  // or node_modules/packageName
		// 		  const packageName = module.context.match(
		// 			/[\\/]node_modules[\\/](.*?)([\\/]|$)/
		// 		  )[1];
	
		// 		  // npm package names are URL-safe, but some servers don't like @ symbols
		// 		  return `npm.${packageName.replace("@", "")}`;
		// 		}
		// 	  }
		// 	},
		// 	name: false
		// },
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
				keep_classnames: true,
				keep_fnames: true,
				safari10: false,

				},
			}),
		],
	},
};

module.exports = [serverConfigure, clientConfigure]