const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/orchestrator',
        createProxyMiddleware({
            target: 'https://demo.devtron.info/',
            changeOrigin: true,
            logLevel: 'info',
            secure: false,
        }),
    )
    app.use(
        '/grafana',
        createProxyMiddleware({
            target: 'https://demo.devtron.info/',
            changeOrigin: true,
            logLevel: 'info',
            secure: false,
        }),
    )
}
