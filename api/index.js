'use strict';

var mongo     = require('mongojs'),
    config    = require('../config.json'),
    charter   = require('./charter'),
    async     = require('async'),
    db        = mongo(config.mongodb || 'localhost/wpt'),
    results   = db.collection('testResults'),
    restify   = require('restify'),
    server    = restify.createServer();

server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

server.get('/urls', function(req, res) {
    results.distinct('testUrl', function(err, urls) {
        res.json(urls || []);
    });
});

server.get('/chart', function(req, res) {
    var urls    = req.params.url,
        metrics = req.params.metric || ['loadTime'],
        type    = req.params.type,
        views   = ['firstView', 'repeatView'],
        from    = new Date(req.params.from || Date.now() - (1000 * 60 * 60 * 24 * 30)),
        to      = new Date(req.params.to   || Date.now());

    if (!isFinite(from) || !isFinite(to)) {
        return res.json({
            error: 'From/to-date invalid. Must be unix-timestamp in milliseconds.'
        });
    } else if (['average', 'median'].indexOf(type) === -1) {
        return res.json({
            error: 'Invalid type - valid values: "average", "median"'
        });
    }

    // Prepare database queries
    var projection  = { completed: 1 },
        callbacks   = {};

    // Define projections
    for (var i = 0; i < metrics.length; i++) {
        for (var x = 0; x < views.length; x++) {
            projection[[type, views[x], metrics[i]].join('.')] = 1;
        }
    }

    // Define the query runner
    var queryRunner = function(callback) {
        results.find(this.query, projection).sort({ _id: 1 }, callback);
    };

    // Define each callback with a logical key
    for (i = 0; i < urls.length; i++) {
        callbacks[urls[i]] = queryRunner.bind({ url: urls[i] });
    }

    // Run the queries in parallel
    async.parallel(callbacks, function(err, results) {
        res.json(charter(results, type, metrics));
    });
});

server.on('uncaughtException', function(req, res, route, err) {
    console.log(err.stack);
    res.send(500, 'Internal server error');
});

server.listen(config.apiPort);