'use strict';

var WebPageTest  = require('webpagetest'),
    mongo        = require('mongojs'),
    config       = require('../config.json'),
    lockLocation = config.lockFile || '/tmp/wpt-chart.lock',
    lockfile     = require('lockfile'),
    wpt          = new WebPageTest(config.wptHost),
    db           = mongo(config.mongodb || 'localhost/wpt'),
    results      = db.collection('testResults');

wpt.getHistory(1, function(err, res) {
    console.log(res);
});
