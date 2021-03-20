const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = (env, argv) => {
    let filename = process.env.npm_package_name + '_' + process.env.npm_package_version.replace(/\./g,'_');
    let target = 'dist';

    if (env && env.target) {
        target = env.target;
    }

    if (env && env.build) {
        filename = filename + '_' + env.build;
    }

    const config = {
        entry: process.env.npm_package_main,
        target: 'node',
        optimization: {
            minimize: false
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [/node_modules/, /generated/],
                    use: ['eslint-loader']
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(['dist']),
            new ZipPlugin({filename: filename})
        ],
        output: {
            filename: filename + '.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'commonjs2'
        }
    };

    if (argv) {
        switch (argv.mode) {
            case 'development':
                config.devtool = 'source-map';
                break;

            case 'production':
                config.devtool = 'inline-source-map';
                break;
        }
    }

    return config;
};