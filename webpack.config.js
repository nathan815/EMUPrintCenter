const webpack = require('webpack');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const WebpackZipPlugin = require('webpack-zip-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Crx = require('crx-webpack-plugin');
const pkg = require('./package.json');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
    entry: {
        background: './src/js/background.js',
        attendant: './src/js/attendant/index.js',
        customer: './src/js/customer/index.js',
        vendor: Object.keys(pkg.dependencies)
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          'vue$': 'vue/dist/vue.runtime.esm.js',
          '@': path.resolve(__dirname, 'dist')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.resolve(__dirname, 'src/js')
            }
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    },
    plugins: [
        new webpack.DefinePlugin({ 
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) 
        }),
        new webpack.optimize.CommonsChunkPlugin({ 
            name: 'vendor', 
            filename: 'vendor.bundle.js' 
        }),
        new WebpackNotifierPlugin(),
        new CleanWebpackPlugin(['build', 'dist']),
        new CopyWebpackPlugin([
            { from: 'manifest.json', to: 'manifest.json' },
            { from: 'assets', to: 'assets' },
            { from: 'src/css', to: 'css' },
            { from: 'src/html', to: './' },
            { from: 'src/js/standalone', to: './' }
        ])
    ]
}; 

if(process.env.NODE_ENV === 'production') {
    console.log('PRODUCTION');
    /*config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            screw_ie8: true
        }
    }));*/
    config.plugins.push(new WebpackZipPlugin({
        frontShell: 'ls && pwd',
        initialFile: 'build',
        endPath: './dist',
        zipName: 'printcenter.zip'
    }));
    config.plugins.push(new Crx({
        keyFile: 'key.pem',
        contentPath: './build',
        outputPath: './dist',
        name: 'printcenter'
    }));
}
else {
    console.log('DEVELOPMENT');
    config.devtool = '#source-map';
}

module.exports = config;
