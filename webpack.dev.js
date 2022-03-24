const path = require('path')
const common = require('./webpack.common')
const { merge }  = require('webpack-merge') 

module.exports = merge(common,{
    mode: "development",
    
    output:
    {
        filename: 'main.js',
        path: path.resolve(__dirname, './build'),
        // assetModuleFilename: 'assets/images/[name].[ext]'
    },
})
