const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'https://demo1.devtron.info:32443',
        changeOrigin: true,
        logLevel: 'info',
        secure: false,
    }))
}