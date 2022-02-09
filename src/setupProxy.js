const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'http://54.91.92.100:32080/',
        changeOrigin: true,
        logLevel: 'info',
        secure: false,
    }))
    app.use("/grafana", createProxyMiddleware({
        target: 'http://demo.devtron.info:32080/',
        changeOrigin: true,
        logLevel: 'info',
        secure: false,
    }))
}
