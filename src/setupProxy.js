const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'http://demo.devtron.info:32443',
        changeOrigin: true,
        logLevel: 'info'
    }))
}