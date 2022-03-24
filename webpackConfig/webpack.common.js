const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, '../src/js/script.js'),

    plugins: [new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../src/index.html'),
        // minify: true
    })],

    // mode: "development"
    // devtool: 'source-map',
    // plugins:
    // [
    //     new CopyWebpackPlugin({
    //         patterns: [
    //             { from: path.resolve(__dirname, '../static') }
    //         ]
    //     }),
    //     new HtmlWebpackPlugin({
    //         template: path.resolve(__dirname, '../src/index.html'),
    //         minify: true
    //     }),
    //     new MiniCSSExtractPlugin()
    // ],
    module:
    {
        rules:
        [
            // // HTML
            // {
            //     test: /\.(html)$/,
            //     use: ['html-loader']
            // },

            // // JS
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use:
            //     [
            //         'babel-loader'
            //     ]
            // },

            // CSS
            {
                test: /\.css$/,
                use:[ 'style-loader','css-loader' ]
                // use:[ MiniCSSExtractPlugin.loader,'css-loader' ]
            },

            // // Images
            // {
            //     test: /\.(jpg|png|gif|svg)$/,
            //     type: 'asset/resource',

            //     use:
            //     [
            //         {
            //             loader: 'file-loader',
            //             options:
            //             {
            //                 // name: '[name].[ext]',
            //                 outputPath: 'assets/images/',
            //                 publicPath: 'assets/images/'
            //             }
            //         }
            //     ]
            // },
            // // FILES
            // {
            //     test: /\.(mp3|png|gif|svg)$/,
            //     use:
            //     [
            //         {
            //             loader: 'file-loader',
            //             options:
            //             {
            //                 outputPath: 'assets/'
            //             }
            //         }
            //     ]
            // },

            // // Fonts
            // {
            //     test: /\.(ttf|eot|woff|woff2)$/,
            //     use:
            //     [
            //         {
            //             loader: 'file-loader',
            //             options:
            //             {
            //                 outputPath: 'assets/fonts/'
            //             }
            //         }
            //     ]
            // },

            // // Shaders
            // {
            //     test: /\.(glsl|vs|fs|vert|frag)$/,
            //     exclude: /node_modules/,
            //     use: [
            //         'raw-loader',
            //         'glslify-loader'
            //     ]
            // }
        ]
    }
}
