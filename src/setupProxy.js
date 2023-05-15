const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/orchestrator',
        createProxyMiddleware({
<<<<<<< HEAD
            target: 'http://13.82.136.173:31730/',
=======
            target: 'http://138.91.126.107:31660/',
>>>>>>> main
            changeOrigin: true,
            logLevel: 'info',
            secure: false,
        }),
    )
    app.use(
        '/grafana',
        createProxyMiddleware({
            target: 'http://demo.devtron.info:32080/',
            changeOrigin: true,
            logLevel: 'info',
            secure: false,
        }),
    )
}
