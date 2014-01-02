'use strict';

var httpProxy = require('http-proxy'),
    config    = require('./config');

exports.Api   = require('./api');
exports.Front = require('./frontend');

httpProxy.createServer(function(req, res, proxy) {
    proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: req.url.indexOf('/api') === 0 ?
                config.apiPort      || 1337 :
                config.frontendPort || 7000
    });
}).listen(config.proxyPort || 8000);