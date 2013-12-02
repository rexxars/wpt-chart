'use strict';

var _          = require('lodash'),
    mongo      = require('mongojs'),
    config     = require('../config.json'),
    charter    = require('./charter'),
    metricsMap = require('./metrics-map'),
    async      = require('async'),
    db         = mongo(config.mongodb || 'localhost/wpt'),
    results    = db.collection('testResults'),
    restify    = require('restify'),
    server     = restify.createServer();

server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

server.get('/urls', function(req, res) {
    var minTests = req.params.minTests || 5;
    results.aggregate([
        {
            '$group': {
                _id: '$testUrl',
                tests: { $sum: 1 }
            }
        }, {
            '$sort': {
                tests: -1
            }
        }
    ], function(err, urls) {
        urls = _.filter(urls, function(url) { return url.tests >= minTests; });
        res.send(_.pluck(urls || [], '_id'));
    });
});

server.get('/chart', function(req, res) {
    var urls     = req.params.url || [],
        metrics  = req.params.metric || ['loadTime'],
        type     = req.params.type,
        location = req.params.location,
        views    = ['firstView', 'repeatView'],
        from     = new Date(req.params.from || Date.now() - (1000 * 60 * 60 * 24 * 30)),
        to       = new Date(req.params.to   || Date.now());

    if (!isFinite(from) || !isFinite(to)) {
        return res.send({
            error: 'From/to-date invalid. Must be unix-timestamp in milliseconds.'
        });
    } else if (['average', 'median'].indexOf(type) === -1) {
        return res.send({
            error: 'Invalid type - valid values: "average", "median"'
        });
    } else if (!urls.length) {
        return res.send({
            error: 'Missing URL(s) - needs at least one URL to fetch data for'
        });
    } else if (!location) {
        return res.send({
            error: 'Missing location'
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
        callbacks[urls[i]] = queryRunner.bind({ query: {
            testUrl: urls[i],
            location: location
        }});
    }

    // Run the queries in parallel
    async.parallel(callbacks, function(err, results) {
        res.send(charter(results, type, metrics));
    });
});

server.get('/metrics', function(req, res) {
    res.send(metricsMap);
});

server.on('uncaughtException', function(req, res, route, err) {
    console.log(err.stack);
    res.send(500, 'Internal server error');
});

server.listen(config.apiPort);
