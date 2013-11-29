'use strict';

var WebPageTest = require('webpagetest'),
    mongo     = require('mongojs'),
    config    = require('../config.json'),
    wpt       = new WebPageTest(config.wptHost),
    db        = mongo(config.mongodb || 'localhost/wpt'),
    results   = db.collection('testResults'),
    newTests  = 0,
    processed = 0;

function debugLog(msg) {
    if (config.debug) {
        console.log(msg);
    }
}

function incrementProcessedCount() {
    if (++processed === newTests) {
        // All done, close database handle
        db.close();
        console.log('Done!');
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
    } else if (!info.testId) {
        debugLog('Item did not contain testId, skipping');
        incrementProcessedCount();
        return;
    }

    results.insert(
        processTestInfo(info.response.data)
    );

    debugLog('Inserted a new result!');
    incrementProcessedCount();
}

function onTestStatusResponse(err, status) {
    if (err) {
        return console.log('TestStatus fail: ', err);
    } else if (status.data.statusCode !== 200) {
        // Test is not yet done
        debugLog('Found ongoing result, waiting for it to finish');
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
        } else if (!doc) {
            getTestStatus(testId);
        } else {
            // Document already exists
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
    for (var key in data) {
        getTestStatusIfNew(data[key]['Test ID']);
    }
}

wpt.getHistory(1, onHistoryResponse);