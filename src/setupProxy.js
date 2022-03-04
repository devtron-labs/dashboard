const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'http://54.210.45.17:32080/',
        changeOrigin: true,
        logLevel: 'info',
        secure: false,
    }))
    app.use("/grafana", createProxyMiddleware({
        target: 'http://demo1.devtron.info:32080/',
        changeOrigin: true,
        logLevel: 'info',
        secure: false,
    }))
}
