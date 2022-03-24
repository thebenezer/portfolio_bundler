const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, './src/js/script.js'),

    plugins: [new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/index.html'),
        // minify: true
    })],

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
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },

            // CSS
            {
                test: /\.css$/,
                use:[ 'style-loader','css-loader' ]
                // use:[ MiniCSSExtractPlugin.loader,'css-loader' ]
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/resource',
                generator:
                {
                    filename: 'assets/images/[name][hash][ext]'
                }
            },
            // mp3
            {
                test: /\.mp3$/,
                // loader: 'file-loader',
                type: 'asset/resource',
                generator:{
                    filename: 'assets/[name][ext]'
                }
            },
            // glb
            {
                test: /\.(glb|gltf)$/,
                loader: 'file-loader',
                // type: 'asset/resource',
                generator:{
                    filename: 'assets/models/[name][ext]'
                }
            },
        ]
    }
}
