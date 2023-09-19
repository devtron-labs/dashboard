const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/orchestrator',
        createProxyMiddleware({
            // target: 'http://localhost:8080/',
            target: 'http://ashishsonam.devtron.info:31102/',
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
