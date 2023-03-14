const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode : "production",
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new NodePolyfillPlugin()
    ],
};