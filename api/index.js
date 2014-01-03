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
    server     = restify.createServer(),
    apiPath    = '/api';

server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

// Common aggregator based on number of tests
function getAggregatorForKey(key) {
    return [
        {
            '$group': {
                _id: '$' + key,
                tests: { $sum: 1 }
            }
        }, {
            '$sort': {
                tests: -1
            }
        }
    ];
}

server.get('/', function(req, res) {
    res.send({ 'msg': 'you hit the api' });
});

server.get(apiPath + '/chart', function(req, res) {
    var urls     = req.params.url || [],
        sets     = [],
        metrics  = req.params.metric || ['loadTime'],
        type     = req.params.type || 'median',
        labels   = req.params.label || [],
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
    }

    // Prepare database queries
    var projection  = { completed: 1, testId: 1 },
        callbacks   = {}, x, i, key;

    // Define projections
    for (i = 0; i < metrics.length; i++) {
        for (x = 0; x < views.length; x++) {
            projection[[type, views[x], metrics[i]].join('.')] = 1;
        }
    }

    // Define the query runner
    var queryRunner = function(callback) {
        results.find(this.query, projection).sort({ _id: 1 }, callback);
    };

    // Define base query
    var baseQuery = {
        'completed': {
            '$gte': from,
            '$lte': to
        }
    };

    if (location) {
        baseQuery.location = location;
    }

    // Define each callback with a logical key
    for (i = 0; i < urls.length; i++) {
        for (x = 0; x < labels.length; x++) {
            key = urls[i] + '-' + labels[x];
            callbacks[key] = queryRunner.bind({
                query: _.merge({}, baseQuery, {
                    testUrl: urls[i],
                    label: labels[x]
                })
            });
        }
    }

    // Run the queries in parallel
    async.parallel(callbacks, function(err, results) {
        res.send(charter(results, type, metrics));
    });
});

server.get(apiPath + '/locations', function(req, res) {
    results.aggregate(getAggregatorForKey('location'), function(err, locations) {
        res.send(_.pluck(locations || [], '_id'));
    });
});

server.get(apiPath + '/labels', function(req, res) {
    results.aggregate(getAggregatorForKey('label'), function(err, labels) {
        labels = _.chain(labels || [])
            .pluck('_id')
            .compact()
            .value();

        res.send(labels);
    });
});

server.get(apiPath + '/urls', function(req, res) {
    var minTests = req.params.minTests || 5;
    results.aggregate(getAggregatorForKey('testUrl'), function(err, urls) {
        urls = _.filter(urls, function(url) { return url.tests >= minTests; });
        res.send(_.pluck(urls || [], '_id'));
    });
});

server.get(apiPath + '/metrics', function(req, res) {
    res.send(metricsMap);
});

server.get(apiPath + '/test-result/:testId', function(req, res) {
    res.header('Location', (
        config.wptHost.replace(/\/$/, '') +
        '/result/' + req.params.testId + '/'
    ));
    res.send(302);
});

server.on('uncaughtException', function(req, res, route, err) {
    console.log(err.stack);
    res.send(500, 'Internal server error');
});

server.listen(config.apiPort);

module.exports = server;
