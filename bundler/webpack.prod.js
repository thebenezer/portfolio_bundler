const path = require('path')
const common = require('./webpack.common')
const { merge }  = require('webpack-merge') 
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');



module.exports = merge(common,{
    mode: "production",

    output:
    {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, '../build'),
        assetModuleFilename: 'assets/images/[name][hash][ext]'
    },
    optimization: {
        minimizer: [
          // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
          `...`,
          new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCSSExtractPlugin({filename: '[name][hash].css'})
    ],
    module:
    {
        rules:
        [
            // CSS
            {
                test: /\.css$/,
                use:[ MiniCSSExtractPlugin.loader,'css-loader' ]
            },
        ]
    }
 
})
