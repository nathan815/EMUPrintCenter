const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    devtool: 'cheap-eval-source-map',
    entry: {
        background: './src/js/background.js',
        attendant: './src/js/attendant.js',
        customer: './src/js/customer.js'
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
            },
            {
                test: /\.css$/,
                loader: 'css-loader'
            },
            {
                 test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                 use: [{
                   loader: 'file-loader',
                   options: {
                     name: '[name].[ext]',
                     outputPath: 'fonts/',    // where the fonts will go
                     publicPath: '../'       // override the default path
                   }
                 }]
            },
        ]
    },
    plugins: [
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