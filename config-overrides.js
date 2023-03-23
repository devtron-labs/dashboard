const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = []
    }
    // below lets it work in dev mode too
    if (config.devServer === undefined) {
        config.devServer = {
            writeToDisk: true,
        }
    } else {
        config.devServer.writeToDisk = true
    }
    config.plugins.push(
        new MonacoWebpackPlugin({
            languages: ['yaml', 'json', 'shell'],
        }),
        new CopyPlugin({
            patterns: [{ from: 'node_modules/@devtron-labs/*/dist/assets/*', to: '[name].[ext]' }],
        }),
    )
    return config
}
