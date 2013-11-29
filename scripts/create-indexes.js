'use strict';

var mongo     = require('mongojs'),
    config    = require('../config.json'),
    db        = mongo(config.mongodb || 'localhost/wpt'),
    results   = db.collection('testResults');

results.ensureIndex({
    testId: 1
});

results.ensureIndex({
    testUrl: 1,
    completed: -1
});

db.close();
