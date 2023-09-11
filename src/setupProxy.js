const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/orchestrator',
        createProxyMiddleware({
            target: 'http://20.121.37.240:30553',
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
