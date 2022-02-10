const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'http://demo1.devtron.info:32080/',
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
