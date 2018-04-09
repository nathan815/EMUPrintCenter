const webpack = require('webpack');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const pkg = require('./package.json');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    devtool: 'cheap-eval-source-map',
    entry: {
        background: './src/js/background.js',
        attendant: './src/js/attendant/index.js',
        customer: './src/js/customer/index.js',
        vendor: Object.keys(pkg.dependencies)
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          'vue$': 'vue/dist/vue.esm.js',
          '@': path.resolve(__dirname, 'dist')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                //options: vueLoaderConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.resolve(__dirname, 'src/js')
                //include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
        new WebpackNotifierPlugin(),
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            { from: 'manifest.json', to: 'manifest.json' },
            { from: 'assets', to: 'assets' },
            { from: 'src/css', to: 'css' },
            { from: 'src/html', to: './' },
            { from: 'src/js/standalone', to: './' }
        ])
    ]
}; 
