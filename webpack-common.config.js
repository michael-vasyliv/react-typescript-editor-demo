/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './index.tsx',
    target: 'web',
    stats: {
        modules: false
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        plugins: [new TsconfigPathsPlugin()]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: { loader: 'babel-loader' },
                exclude: [/node_modules/]
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: '@svgr/webpack'
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime-${entrypoint.name}`
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html')
        }),
        new CopyPlugin({
            patterns: [
                { from: `${__dirname}/public`, to: './' }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env': Object.keys(process.env).reduce((result, key) => {
                // eslint-disable-next-line no-param-reassign
                result[key] = JSON.stringify(process.env[key]);
                return result;
            }, {})
        })
    ]
};
