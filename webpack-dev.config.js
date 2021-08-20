/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack-common.config');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        hot: true,
        compress: true,
        port: 4000,
        host: '0.0.0.0',
        historyApiFallback: true
    },
    output: {
        /** allows you use breakpoints in vscode debugger */
        devtoolModuleFilenameTemplate: ((x) => path.resolve(x.absoluteResourcePath).replace(/\\/g, '/'))
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ]
});
