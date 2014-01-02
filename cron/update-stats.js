'use strict';

var WebPageTest  = require('webpagetest'),
    mongo        = require('mongojs'),
    config       = require('../config.json'),
    lockLocation = config.lockFile || '/tmp/wpt-chart.lock',
    lockfile     = require('lockfile'),
    wpt          = new WebPageTest(config.wptHost),
    db           = mongo(config.mongodb || 'localhost/wpt'),
    results      = db.collection('testResults'),
    testLabels   = {},
    newTests     = 0,
    processed    = 0;

function debugLog(msg) {
    if (config.debug) {
        console.log(msg);
    }
}

function incrementProcessedCount() {
    if (++processed === newTests) {
        // All done, close database handle
        db.close();
        console.log('Database handle closed');

        // Release lock
        lockfile.unlock(lockLocation, function() {
            console.log('Lockfile removed');
        });
    }

    return processed;
}

function processTestInfo(info) {
    info.completed = new Date(info.completed);

    return info;
}

function onTestInfoResponse(err, info) {
    if (err) {
        return console.log('TestInfo fail: ', err);
    } else if (!info.response || !info.response.data.testId) {
        debugLog('Item did not contain testId, skipping');
        incrementProcessedCount();
        return;
    }

    var data = info.response.data, testId = data.testId;
    if (testLabels[testId]) {
        data.label = testLabels[testId];
    }

    results.update(
        { 'testId': testId },
        processTestInfo(data),
        { 'upsert': true }
    );

    debugLog('Inserted/updated test result');
    incrementProcessedCount();
}

function onTestStatusResponse(err, status) {
    if (err) {
        return console.log('TestStatus fail: ', err);
    } else if (status.data.statusCode !== 200) {
        // Test is not yet done
        debugLog('Found ongoing result (' + status.data.statusCode + '), waiting for it to finish');
        incrementProcessedCount();
        return;
    }

    wpt.getTestResults(status.data.testId, onTestInfoResponse);
}

function getTestStatus(testId) {
    wpt.getTestStatus(testId, onTestStatusResponse);
}

function getTestStatusIfNew(testId) {
    results.findOne({
        'testId': testId
    }, function(err, doc) {
        if (err) {
            return console.log('Database fail: ', err);
        } else if (!doc || config.updateOld) {
            getTestStatus(testId);
        } else {
            // Document already exists and we're not gonna update
            debugLog('Test already exists in database, skipping!');
            incrementProcessedCount();
        }
    });
}

function onHistoryResponse(err, data) {
    if (err) {
        return console.log('History fail: ', err);
    }

    newTests = data.length;
    var key, test, testId;
    for (key in data) {
        test   = data[key];
        testId = test['Test ID'];

        testLabels[testId] = test.Label;
        getTestStatusIfNew(testId);
    }
}

lockfile.lock(lockLocation, { wait: 5000 }, function (err) {
    if (err) {
        console.log('Lock error: ' + err);
        return;
    }

    wpt.getHistory(1, onHistoryResponse);
});
