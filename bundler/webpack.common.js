const path = require('path')

module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/js/script.js'),
        character: path.resolve(__dirname, '../src/js/characterController.js'),
        joystick:path.resolve(__dirname, '../src/js/touchControls.js'),
        // vendor:{
        //     import: path.resolve(__dirname, '../src/js/vendor.js'),
        // } 
    },
    // devtool: 'source-map',

    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },
            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        ['@babel/preset-env']
                      ]
                    }
                }
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
